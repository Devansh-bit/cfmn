// CourseCard.tsx - Updated with light purple background placeholder
import React, { useState } from 'react';
import { Download, ThumbsUp, ThumbsDown, Edit, FileText } from 'lucide-react';
import { useSignInFlow } from '../hooks/useSignInFlow';
import SignInModal from './SignInModal';
import type { CourseCardProps } from '../types';
import { notesApi } from '../api/notesApi';
import { useAuth } from '../contexts/AuthContext';

const CourseCard: React.FC<CourseCardProps> = ({ note }) => {
    const { isAuthenticated, user } = useAuth();
    const {
        showSignInModal,
        triggerSignIn,
        handleSignInSuccess,
        handleSignInClose,
        modalOptions
    } = useSignInFlow();

    const [isLiked, setIsLiked] = useState(false);
    const [isDisliked, setIsDisliked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [imageError, setImageError] = useState(false);

    const isOwner = user && note.uploader_user.id === user.id;

    const requireAuth = (actionName: string, action: () => void) => {
        if (!isAuthenticated) {
            triggerSignIn(
                action,
                {
                    title: `Sign In to ${actionName.charAt(0).toUpperCase() + actionName.slice(1)}`,
                    message: `Please sign in to ${actionName} this content.`,
                    actionContext: actionName
                }
            );
            return;
        }
        action();
    };

    // Truncate description to specified length
    const truncateText = (text: string, maxLength: number = 120): string => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    };

    // Get visible tags and count of remaining
    const getVisibleTags = (tags: string[], maxTags: number = 3) => {
        if (!tags || tags.length === 0) return { visibleTags: [], remainingCount: 0 };

        const visibleTags = tags.slice(0, maxTags);
        const remainingCount = Math.max(0, tags.length - maxTags);

        return { visibleTags, remainingCount };
    };

    const handleDownload = () => requireAuth('download', () => {
        try {
            notesApi.downloadNote(note);
            console.log(`Downloading notes for ${note.course_name}`);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download file. Please try again.');
        }
    });

    const handleLike = () => requireAuth('like', () => {
        if (isLiked) {
            setIsLiked(false);
            setLikeCount(prev => prev - 1);
        } else {
            setIsLiked(true);
            setIsDisliked(false);
            setLikeCount(prev => prev + 1);
        }
        console.log(`${isLiked ? 'Unliked' : 'Liked'} notes for ${note.course_name}`);
    });

    const handleDislike = () => requireAuth('dislike', () => {
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
    });

    const handleEdit = () => requireAuth('edit', () => {
        console.log(`Editing notes for ${note.course_name}`);
    });

    const handleImageError = () => {
        setImageError(true);
    };

    const { visibleTags, remainingCount } = getVisibleTags(note.tags, 3);

    // Check if we should show placeholder (no image or image failed to load)
    const shouldShowPlaceholder = !note.preview_image_url || imageError;

    return (
        <>
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                {/* Preview Image with Light Purple Placeholder */}
                <div className="relative w-full h-48">
                    {shouldShowPlaceholder ? (
                        // Light purple placeholder background
                        <div className="w-full h-full bg-purple-100 flex flex-col items-center justify-center">
                            <FileText className="text-purple-300 mb-2" size={32} />
                            <span className="text-purple-400 text-sm font-medium">Notes Preview</span>
                        </div>
                    ) : (
                        // Actual image
                        <img
                            src={note.preview_image_url}
                            alt={`${note.course_name} preview`}
                            className="w-full h-full object-cover"
                            onError={handleImageError}
                        />
                    )}

                    {isOwner && (
                        <button
                            onClick={handleEdit}
                            className="absolute top-3 right-3 bg-white bg-opacity-90 text-gray-600 hover:text-purple-600 p-2 rounded-full shadow-md transition-colors duration-200"
                        >
                            <Edit size={16} />
                        </button>
                    )}
                </div>

                {/* Card Content */}
                <div className="p-5">
                    {/* Header */}
                    <div className="mb-3">
            <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide bg-purple-50 px-2 py-1 rounded">
              {note.course_code}
            </span>
                        <h3 className="text-lg font-semibold text-gray-900 mt-2 leading-tight">
                            {note.course_name}
                        </h3>
                    </div>

                    {/* Description with Truncation */}
                    <div className="mb-4">
                        {note.description ? (
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {truncateText(note.description, 100)}
                            </p>
                        ) : (
                            <p className="text-gray-400 text-sm italic">
                                No description provided
                            </p>
                        )}
                    </div>

                    {/* Tags with Overflow Handling - Always show something */}
                    <div className="mb-3">
                        {note.tags && note.tags.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                                {visibleTags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                                    >
          {tag}
        </span>
                                ))}
                                {remainingCount > 0 && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
          +{remainingCount} more
        </span>
                                )}
                            </div>
                        ) : (
                            <span className="text-gray-400 text-xs italic">No tags provided</span>
                        )}
                    </div>

                    {/* Professor Names */}
                    {note.professor_names && note.professor_names.length > 0 && (
                        <p className="text-sm text-gray-500 mb-4 flex items-center">
                            <span className="text-gray-400 mr-1">Prof:</span>
                            <span className="truncate">
                {note.professor_names.join(', ')}
              </span>
                        </p>
                    )}

                    {/* Actions Bar */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleLike}
                                className={`flex items-center space-x-1 transition-colors duration-200 ${
                                    isLiked
                                        ? 'text-purple-600'
                                        : 'text-gray-500 hover:text-purple-600'
                                }`}
                            >
                                <ThumbsUp size={16} fill={isLiked ? 'currentColor' : 'none'} />
                                <span className="text-sm font-medium">{likeCount}</span>
                            </button>

                            <button
                                onClick={handleDislike}
                                className={`transition-colors duration-200 ${
                                    isDisliked
                                        ? 'text-red-600'
                                        : 'text-gray-500 hover:text-red-600'
                                }`}
                            >
                                <ThumbsDown size={16} fill={isDisliked ? 'currentColor' : 'none'} />
                            </button>
                        </div>

                        <button
                            onClick={handleDownload}
                            className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm font-medium shadow-sm"
                        >
                            <Download size={14} />
                            <span>Download</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Flexible Sign-In Modal */}
            <SignInModal
                isOpen={showSignInModal}
                onClose={handleSignInClose}
                onSuccess={handleSignInSuccess}
                title={modalOptions.title}
                message={modalOptions.message}
                actionContext={modalOptions.actionContext}
            />
        </>
    );
};

export default CourseCard;
