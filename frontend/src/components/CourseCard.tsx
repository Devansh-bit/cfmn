// CourseCard.tsx
import React, { useState } from 'react';
import { Download, ThumbsUp, ThumbsDown, Edit } from 'lucide-react';
import GoogleSignInButton from './GoogleSignInButton';
import type { CourseCardProps } from '../types';
import { notesApi } from '../api/notesApi';
import { useAuth } from '../contexts/AuthContext';

const CourseCard: React.FC<CourseCardProps> = ({ note }) => {
    const { isAuthenticated, user } = useAuth();
    const [showSignInModal, setShowSignInModal] = useState(false);
    const [pendingAction, setPendingAction] = useState<string | null>(null);
    const [isLiked, setIsLiked] = useState(false);
    const [isDisliked, setIsDisliked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    const isOwner = user && note.uploader_user.id === user.id;

    const requireAuth = (actionName: string, action: () => void) => {
        if (!isAuthenticated) {
            setPendingAction(actionName);
            setShowSignInModal(true);
            return;
        }
        action();
    };

    const handleSignInSuccess = () => {
        setShowSignInModal(false);
        // Execute the pending action after successful sign-in
        if (pendingAction === 'download') handleDownloadAction();
        else if (pendingAction === 'like') handleLikeAction();
        else if (pendingAction === 'dislike') handleDislikeAction();
        else if (pendingAction === 'edit') handleEditAction();

        setPendingAction(null);
    };

    const handleDownload = () => requireAuth('download', handleDownloadAction);
    const handleLike = () => requireAuth('like', handleLikeAction);
    const handleDislike = () => requireAuth('dislike', handleDislikeAction);
    const handleEdit = () => requireAuth('edit', handleEditAction);

    const handleDownloadAction = () => {
        try {
            notesApi.downloadNote(note);
            console.log(`Downloading notes for ${note.course_name}`);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download file. Please try again.');
        }
    };

    const handleLikeAction = () => {
        if (isLiked) {
            setIsLiked(false);
            setLikeCount(prev => prev - 1);
        } else {
            setIsLiked(true);
            setIsDisliked(false);
            setLikeCount(prev => prev + 1);
        }
        console.log(`${isLiked ? 'Unliked' : 'Liked'} notes for ${note.course_name}`);
    };

    const handleDislikeAction = () => {
        if (isDisliked) {
            setIsDisliked(false);
        } else {
            setIsDisliked(true);
            if (isLiked) {
                setIsLiked(false);
                setLikeCount(prev => prev - 1);
            }
        }
        console.log(`${isDisliked ? 'Removed dislike' : 'Disliked'} notes for ${note.course_name}`);
    };

    const handleEditAction = () => {
        console.log(`Editing notes for ${note.course_name}`);
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                {/* Your existing CourseCard content */}

                {/* Preview Image */}
                {note.preview_image_url && (
                    <div className="h-48 bg-gray-200 overflow-hidden">
                        <img
                            src={note.preview_image_url}
                            alt={`${note.course_name} preview`}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                {note.course_code}
                            </h3>
                            <p className="text-gray-600 font-medium">{note.course_name}</p>
                        </div>

                        {isOwner && (
                            <button
                                onClick={handleEdit}
                                className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                                title="Edit note"
                            >
                                <Edit size={18} />
                            </button>
                        )}
                    </div>

                    {/* Description, Professor names, Tags, Uploader info - your existing code */}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleLike}
                                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors duration-200 ${
                                    isLiked
                                        ? 'text-purple-600 bg-purple-50'
                                        : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                                }`}
                            >
                                <ThumbsUp size={16} fill={isLiked ? 'currentColor' : 'none'} />
                                <span className="text-sm">{likeCount}</span>
                            </button>

                            <button
                                onClick={handleDislike}
                                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors duration-200 ${
                                    isDisliked
                                        ? 'text-red-600 bg-red-50'
                                        : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                                }`}
                            >
                                <ThumbsDown size={16} fill={isDisliked ? 'currentColor' : 'none'} />
                            </button>
                        </div>

                        <button
                            onClick={handleDownload}
                            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                        >
                            <Download size={16} />
                            <span className="text-sm">Download</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Sign-In Modal */}
            {showSignInModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-sm mx-4">
                        <h3 className="text-lg font-semibold mb-4">Sign In Required</h3>
                        <p className="text-gray-600 mb-6">
                            Please sign in to {pendingAction} this note.
                        </p>
                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => {
                                    setShowSignInModal(false);
                                    setPendingAction(null);
                                }}
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
        </>
    );
};

export default CourseCard;
