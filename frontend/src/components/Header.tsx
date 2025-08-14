// Header.tsx - Updated to use useSignInFlow
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSignInFlow } from '../hooks/useSignInFlow';
import SignInModal from './SignInModal';
import UploadModal from './UploadModal';
import { LogOut, Upload, Plus } from 'lucide-react';
import type { ResponseNote } from '../types';

interface HeaderProps {
    onNoteUploaded?: (note: ResponseNote) => void;
}

const Header: React.FC<HeaderProps> = ({ onNoteUploaded }) => {
    const { user, isAuthenticated, isLoading, signOut } = useAuth();
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    // Use the new sign-in flow hook
    const {
        showSignInModal,
        triggerSignIn,
        handleSignInSuccess,
        handleSignInClose,
        modalOptions
    } = useSignInFlow();

    const handleUploadClick = () => {
        if (!isAuthenticated) {
            // Trigger sign-in with upload as the success action
            triggerSignIn(
                () => setIsUploadModalOpen(true),
                {
                    title: "Sign In to Upload",
                    message: "Please sign in to upload your notes and share them with the community.",
                    actionContext: "upload notes"
                }
            );
            return;
        }
        setIsUploadModalOpen(true);
    };

    const handleDirectSignIn = () => {
        // Trigger sign-in without any specific success action
        triggerSignIn(
            undefined, // No specific action after sign-in
            {
                title: "Welcome to CFMN",
                message: "Please sign in to access all features and connect with the community.",
                actionContext: "continue"
            }
        );
    };

    const handleUploadSuccess = (note: ResponseNote) => {
        console.log('Note uploaded successfully:', note);
        if (onNoteUploaded) {
            onNoteUploaded(note);
        }
    };

    return (
        <>
            <header className="bg-white shadow-md sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center space-x-2">
                        <h1 className="text-2xl font-bold text-purple-600">CFMN</h1>
                    </div>

                    {/* Navigation Actions */}
                    <div className="flex items-center space-x-4">
                        {isLoading ? (
                            <div className="animate-pulse">
                                <div className="h-8 w-20 bg-gray-200 rounded"></div>
                            </div>
                        ) : isAuthenticated ? (
                            <>
                                {/* Upload Button */}
                                <button
                                    onClick={handleUploadClick}
                                    className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    <Upload size={18} />
                                    <span>Upload</span>
                                </button>

                                {/* User Menu */}
                                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    Welcome, {user?.full_name?.split(' ')[0]}
                  </span>
                                    <button
                                        onClick={signOut}
                                        className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
                                    >
                                        <LogOut size={18} />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-3">
                                {/* Upload Button - triggers sign-in */}
                                <button
                                    onClick={handleUploadClick}
                                    className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    <Plus size={18} />
                                    <span>Upload</span>
                                </button>

                                {/* Direct Sign In Button */}
                                <button
                                    onClick={handleDirectSignIn}
                                    className="flex items-center space-x-2 border border-purple-600 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors"
                                >
                                    <span>Sign In</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Flexible Sign-In Modal */}
            <SignInModal
                isOpen={showSignInModal}
                onClose={handleSignInClose}
                onSuccess={handleSignInSuccess}
                title={modalOptions.title}
                message={modalOptions.message}
                actionContext={modalOptions.actionContext}
            />

            {/* Upload Modal */}
            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onSuccess={handleUploadSuccess}
            />
        </>
    );
};

export default Header;
