// Header.tsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import GoogleSignInButton from './GoogleSignInButton';
import UploadModal from './UploadModal';
import { LogOut, Upload, Plus } from 'lucide-react';
import type { ResponseNote } from '../types';

interface HeaderProps {
    onNoteUploaded?: (note: ResponseNote) => void;
}

const Header: React.FC<HeaderProps> = ({ onNoteUploaded }) => {
    const { user, isAuthenticated, isLoading, signOut } = useAuth();
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [showSignInModal, setShowSignInModal] = useState(false);

    const handleUploadClick = () => {
        if (!isAuthenticated) {
            setShowSignInModal(true);
            return;
        }
        setIsUploadModalOpen(true);
    };

    const handleSignInSuccess = () => {
        setShowSignInModal(false);
        setIsUploadModalOpen(true);
    };

    const handleUploadSuccess = (note: ResponseNote) => {
        console.log('Note uploaded successfully:', note);
        if (onNoteUploaded) {
            onNoteUploaded(note);
        }
    };

    return (
        <>
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex-shrink-0">
                            <h1 className="text-2xl font-bold text-purple-600">CFMN</h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleUploadClick}
                                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
                            >
                                <Upload size={18} />
                                <Plus size={16} />
                                <span>Upload</span>
                            </button>

                            {isLoading ? (
                                <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : isAuthenticated && user ? (
                                <div className="flex items-center space-x-3">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-medium text-sm">
                        {user.full_name.charAt(0).toUpperCase()}
                      </span>
                                        </div>
                                        <span className="text-gray-700 font-medium">{user.full_name}</span>
                                    </div>
                                    <button
                                        onClick={signOut}
                                        className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                                    >
                                        <LogOut size={16} />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            ) : (
                                <GoogleSignInButton />
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Sign-In Modal for Upload */}
            {showSignInModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-sm mx-4">
                        <h3 className="text-lg font-semibold mb-4">Sign In Required</h3>
                        <p className="text-gray-600 mb-6">Please sign in to upload notes.</p>
                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => setShowSignInModal(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <div className="ml-4">
                                <GoogleSignInButton onSuccess={handleSignInSuccess} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
