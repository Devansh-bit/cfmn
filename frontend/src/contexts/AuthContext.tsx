// AuthContext.tsx - Fixed version to prevent logout on refresh
import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AuthUser, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

declare global {
    interface Window {
        google: {
            accounts: {
                id: {
                    initialize: (config: any) => void;
                    prompt: (callback?: (notification: any) => void) => void;
                    renderButton: (element: HTMLElement, config: any) => void;
                    disableAutoSelect: () => void;
                    cancel: () => void;
                };
            };
        };
        googleAuthReady?: boolean;
    }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [googleInitialized, setGoogleInitialized] = useState(false);
    const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);
    const isAuthenticated = !!user;

    // Check authentication status on mount - with better error handling
    useEffect(() => {
        let isMounted = true;

        const runAuthCheck = async () => {
            if (isMounted) {
                await checkAuthStatus();
            }
        };

        runAuthCheck();

        return () => {
            isMounted = false;
        };
    }, []);

    // Initialize Google OAuth - only once per session
    useEffect(() => {
        let isMounted = true;
        let scriptCleanup: (() => void) | null = null;

        // Check if Google script is already loaded to avoid reloading
        if (window.google && window.googleAuthReady) {
            setGoogleScriptLoaded(true);
            setGoogleInitialized(true);
            return;
        }

        const initializeGoogleAuth = () => {
            if (window.google && GOOGLE_CLIENT_ID && !googleInitialized && isMounted) {
                try {
                    console.log('Initializing Google Auth with client ID:', GOOGLE_CLIENT_ID);

                    window.google.accounts.id.initialize({
                        client_id: GOOGLE_CLIENT_ID,
                        callback: handleCredentialResponse,
                        auto_select: false,
                        cancel_on_tap_outside: true,
                        use_fedcm_for_prompt: false,
                        ux_mode: 'popup',
                        context: 'signin',
                    });

                    // Only disable auto-select if user is not already authenticated
                    if (!user) {
                        window.google.accounts.id.disableAutoSelect();
                    }

                    if (isMounted) {
                        setGoogleInitialized(true);
                        window.googleAuthReady = true;
                        console.log('Google Auth initialized successfully');
                        window.dispatchEvent(new CustomEvent('googleAuthReady'));
                    }
                } catch (error) {
                    console.error('Failed to initialize Google Auth:', error);
                }
            }
        };

        const loadGoogleScript = () => {
            if (!isMounted) return null;

            const existingScript = document.querySelector('script[src*="gsi/client"]');
            if (existingScript) {
                console.log('Google script already loaded');
                if (isMounted) {
                    setGoogleScriptLoaded(true);
                    initializeGoogleAuth();
                }
                return null;
            }

            console.log('Loading Google Identity Services script');
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;

            script.onload = () => {
                console.log('Google script loaded successfully');
                if (isMounted) {
                    setGoogleScriptLoaded(true);
                    setTimeout(() => {
                        if (isMounted) {
                            initializeGoogleAuth();
                        }
                    }, 200);
                }
            };

            script.onerror = (error) => {
                console.error('Failed to load Google Identity Services:', error);
                if (isMounted) {
                    setGoogleScriptLoaded(false);
                }
            };

            document.head.appendChild(script);

            return () => {
                // Only cleanup if we're actually unmounting, not on refresh
                if (document.readyState === 'complete' && !isMounted) {
                    try {
                        const scriptToRemove = document.querySelector('script[src*="gsi/client"]');
                        if (scriptToRemove && scriptToRemove.parentNode) {
                            scriptToRemove.parentNode.removeChild(scriptToRemove);
                        }
                        window.googleAuthReady = false;
                    } catch (error) {
                        console.warn('Failed to cleanup Google script:', error);
                    }
                }
            };
        };

        scriptCleanup = loadGoogleScript();

        return () => {
            isMounted = false;
            if (scriptCleanup) {
                scriptCleanup();
            }
        };
    }, [googleInitialized, user]);

    const handleCredentialResponse = async (response: any) => {
        if (!response.credential) {
            console.error('No credential received from Google');
            return;
        }

        try {
            setIsLoading(true);
            console.log('Processing Google credential...');

            const result = await fetch(`${API_BASE_URL}/api/auth/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: response.credential
                }),
            });

            if (result.ok) {
                const data = await result.json();

                if (data.token && data.user) {
                    localStorage.setItem('auth_token', data.token);
                    setUser(data.user);
                    console.log('Authentication successful:', data.user);
                } else {
                    throw new Error('Invalid response format from server');
                }
            } else {
                const errorText = await result.text();
                console.error('Authentication failed:', result.status, errorText);
                throw new Error(`Authentication failed: ${result.status}`);
            }
        } catch (error) {
            console.error('Authentication error:', error);
            // Don't immediately clear user state - let checkAuthStatus handle it
        } finally {
            setIsLoading(false);
        }
    };

    const checkAuthStatus = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                setUser(null);
                setIsLoading(false);
                return;
            }

            console.log('Checking authentication status...', API_BASE_URL);

            // Validate API_BASE_URL
            if (!API_BASE_URL) {
                console.error('API_BASE_URL is not defined');
                setIsLoading(false);
                return;
            }

            // Add timeout to prevent hanging requests
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                console.log('User authenticated:', userData);
            } else if (response.status === 401 || response.status === 403) {
                // Only clear auth on actual authentication failures
                console.log('Token invalid or expired, clearing auth state');
                localStorage.removeItem('auth_token');
                setUser(null);
            } else if (response.status === 404) {
                // 404 likely means backend is down or endpoint doesn't exist
                console.error('Auth endpoint not found (404). Check if backend is running and endpoint exists.');
                // Keep token for now, but clear user state
                setUser(null);
            } else {
                // For other server errors, keep existing state but log error
                console.warn('Auth check failed with status:', response.status);
                // Don't clear user state on server errors
            }
        } catch (error) {
            console.error('Auth check failed:', error);

            // Only clear auth state if it's a definitive authentication error
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                console.warn('Network error during auth check - keeping existing state');
            } else if (error.name === 'AbortError') {
                console.warn('Auth check timed out - keeping existing state');
            } else {
                // Clear state only for non-network errors
                localStorage.removeItem('auth_token');
                setUser(null);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const signIn = async (): Promise<void> => {
        console.log('Sign-in should be triggered through Google Sign-In button');
        throw new Error('Please use the Google Sign-In button to authenticate');
    };

    const signOut = (): void => {
        try {
            localStorage.removeItem('auth_token');
            setUser(null);

            if (window.google && googleInitialized) {
                window.google.accounts.id.disableAutoSelect();
            }

            console.log('Signed out successfully');
        } catch (error) {
            console.error('Sign out error:', error);
            localStorage.removeItem('auth_token');
            setUser(null);
        }
    };

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated,
        signIn,
        signOut,
        googleInitialized,
        googleScriptLoaded,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};