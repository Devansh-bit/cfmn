// AuthContext.tsx
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
    }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [googleInitialized, setGoogleInitialized] = useState(false);
    const isAuthenticated = !!user;

    // Check authentication status on mount
    useEffect(() => {
        checkAuthStatus();
    }, []);

    // Initialize Google OAuth
    useEffect(() => {
        let scriptCleanup: (() => void) | null = null;

        const initializeGoogleAuth = () => {
            if (window.google && GOOGLE_CLIENT_ID && !googleInitialized) {
                try {
                    console.log('Initializing Google Auth with client ID:', GOOGLE_CLIENT_ID);

                    window.google.accounts.id.initialize({
                        client_id: GOOGLE_CLIENT_ID,
                        callback: handleCredentialResponse,
                        auto_select: false,
                        cancel_on_tap_outside: true,
                        use_fedcm_for_prompt: false, // Disable FedCM to avoid issues
                    });

                    setGoogleInitialized(true);
                    console.log('Google Auth initialized successfully');
                } catch (error) {
                    console.error('Failed to initialize Google Auth:', error);
                }
            }
        };

        const loadGoogleScript = () => {
            // Check if script already exists
            const existingScript = document.querySelector('script[src*="gsi/client"]');
            if (existingScript) {
                console.log('Google script already loaded');
                initializeGoogleAuth();
                return null;
            }

            console.log('Loading Google Identity Services script');
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;

            script.onload = () => {
                console.log('Google script loaded successfully');
                // Add a small delay to ensure Google services are ready
                setTimeout(initializeGoogleAuth, 100);
            };

            script.onerror = (error) => {
                console.error('Failed to load Google Identity Services:', error);
            };

            document.head.appendChild(script);

            // Return cleanup function
            return () => {
                try {
                    const scriptToRemove = document.querySelector('script[src*="gsi/client"]');
                    if (scriptToRemove && scriptToRemove.parentNode) {
                        scriptToRemove.parentNode.removeChild(scriptToRemove);
                    }
                } catch (error) {
                    console.warn('Failed to cleanup Google script:', error);
                }
            };
        };

        scriptCleanup = loadGoogleScript();

        // Cleanup function
        return () => {
            if (scriptCleanup) {
                scriptCleanup();
            }
        };
    }, [googleInitialized]);

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
            // Don't show alert immediately, let the user retry
            setUser(null);
            localStorage.removeItem('auth_token');
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

            console.log('Checking authentication status...');
            const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                console.log('User authenticated:', userData);
            } else {
                console.log('Token invalid or expired, clearing auth state');
                localStorage.removeItem('auth_token');
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('auth_token');
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

// AuthContext.tsx - Remove problematic signIn method
    const signIn = async (): Promise<void> => {
        // Do not call prompt() programmatically
        // The sign-in should only happen through the rendered Google button
        console.log('Sign-in should be triggered through Google Sign-In button');
        throw new Error('Please use the Google Sign-In button to authenticate');
    };


    const signOut = (): void => {
        try {
            // Clear the token from localStorage
            localStorage.removeItem('auth_token');
            setUser(null);

            // Disable Google auto-select for this session
            if (window.google && googleInitialized) {
                window.google.accounts.id.disableAutoSelect();
            }

            console.log('Signed out successfully');
        } catch (error) {
            console.error('Sign out error:', error);
            // Even if there's an error, clear local state
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
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
