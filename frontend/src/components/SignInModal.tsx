// components/SignInModal.tsx
import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SignInModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    title?: string;
    message?: string;
    actionContext?: string; // e.g., "upload", "like", "download"
}

const SignInModal: React.FC<SignInModalProps> = ({
                                                     isOpen,
                                                     onClose,
                                                     onSuccess,
                                                     title = "Sign In Required",
                                                     message,
                                                     actionContext = "continue"
                                                 }) => {
    const { user } = useAuth();
    const buttonRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    // Auto-generate contextual message if not provided
    const defaultMessage = message || `Please sign in to ${actionContext === "continue" ? "continue" : actionContext}.`;

    // Handle successful authentication
    useEffect(() => {
        if (user && onSuccess) {
            onSuccess();
        }
    }, [user, onSuccess]);

    // Render Google Sign-In button when modal opens
    useEffect(() => {
        if (isOpen && window.google && buttonRef.current && !user) {
            // Clear existing button content
            buttonRef.current.innerHTML = '';

            try {
                window.google.accounts.id.renderButton(buttonRef.current, {
                    text: 'signin_with',
                    size: 'large',
                    theme: 'outline',
                    shape: 'rectangular',
                    click_listener: () => {
                        console.log('Google Sign-In button clicked from modal');
                    }
                });
            } catch (error) {
                console.error('Failed to render Google Sign-In button:', error);
            }
        }
    }, [isOpen, user]);

    // Handle ESC key and outside click
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        const handleClickOutside = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div
                ref={modalRef}
                className="bg-dark-surface rounded-xl shadow-xl w-full max-w-md mx-auto"
                role="dialog"
                aria-modal="true"
                aria-labelledby="signin-modal-title"
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-700">
                    <h2 id="signin-modal-title" className="text-xl font-semibold text-dark-text">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-dark-text-secondary mb-6 text-center">
                        {defaultMessage}
                    </p>

                    {/* Google Sign-In Button Container */}
                    <div className="flex justify-center mb-4">
                        <div ref={buttonRef} className="w-full max-w-xs">
                            {/* Fallback button if Google Services don't load */}
                            <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-700 rounded-lg shadow-sm bg-dark-surface text-dark-text hover:bg-gray-800 transition-colors font-medium">
                                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                Sign in with Google
                            </button>
                        </div>
                    </div>

                    {/* Help Text */}
                    <div className="text-center">
                        <p className="text-sm text-gray-500">
                            We'll redirect you to Google's secure sign-in page
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-900 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 text-dark-text-secondary hover:text-white font-medium transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignInModal;