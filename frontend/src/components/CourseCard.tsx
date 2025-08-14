// CourseCard.tsx - Fixed with proper boolean/null vote handling
import React, { useState } from 'react';
import { Download, ThumbsUp, ThumbsDown, Edit, FileText } from 'lucide-react';
import { useSignInFlow } from '../hooks/useSignInFlow';
import SignInModal from './SignInModal';
import type { CourseCardProps, VoteType } from '../types';
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

    // Convert boolean vote to string format for internal state
    // note.user_vote: true = upvote, false = downvote, null = no vote
    const convertVoteToString = (vote: boolean | null): 'upvote' | 'downvote' | null => {
        if (vote === true) return 'upvote';
        if (vote === false) return 'downvote';
        return null;
    };

    // Vote states - properly handle boolean from API
    const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(
        convertVoteToString(note.user_vote)
    );
    const [upvoteCount, setUpvoteCount] = useState(note.upvotes || 0);
    const [downvoteCount, setDownvoteCount] = useState(note.downvotes || 0);
    const [downloadCount, setDownloadCount] = useState(note.downloads || 0);
    const [isVoting, setIsVoting] = useState(false);
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

    // Updated voting function with proper boolean handling
    const handleVote = async (voteType: 'upvote' | 'downvote') => {
        if (isVoting) return;

        requireAuth(voteType, async () => {
            setIsVoting(true);

            // Store previous state for rollback BEFORE try block
            const previousVote = userVote;
            const previousUpvoteCount = upvoteCount;
            const previousDownvoteCount = downvoteCount;

            try {
                let actualVoteType: VoteType;

                // Determine the actual vote type to send
                if (userVote === voteType) {
                    // User is clicking the same vote - remove it
                    actualVoteType = 'remove';
                } else {
                    // User is voting or changing vote
                    actualVoteType = voteType;
                }

                // Update UI optimistically
                if (actualVoteType === 'remove') {
                    setUserVote(null);
                    if (previousVote === 'upvote') {
                        setUpvoteCount(prev => Math.max(0, prev - 1));
                    } else if (previousVote === 'downvote') {
                        setDownvoteCount(prev => Math.max(0, prev - 1));
                    }
                } else if (actualVoteType === 'upvote') {
                    setUserVote('upvote');
                    setUpvoteCount(prev => prev + 1);
                    if (previousVote === 'downvote') {
                        setDownvoteCount(prev => Math.max(0, prev - 1));
                    }
                } else if (actualVoteType === 'downvote') {
                    setUserVote('downvote');
                    setDownvoteCount(prev => prev + 1);
                    if (previousVote === 'upvote') {
                        setUpvoteCount(prev => Math.max(0, prev - 1));
                    }
                }

                // Make API call
                await notesApi.voteOnNote(note.id, actualVoteType);

                console.log(`${actualVoteType === 'remove' ? 'Removed vote' : actualVoteType} for ${note.course_name}`);

            } catch (error) {
                // Rollback optimistic update on error
                setUserVote(previousVote);
                setUpvoteCount(previousUpvoteCount);
                setDownvoteCount(previousDownvoteCount);

                console.error('Vote failed:', error);
                alert('Failed to vote. Please try again.');
            } finally {
                setIsVoting(false);
            }
        });
    };

    const handleDownload = async () => {
        try {
            await notesApi.downloadNote(note);
            setDownloadCount(prev => prev + 1);
            console.log(`Downloading notes for ${note.course_name}`);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download file. Please try again.');
        }
    };

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
                    <div className="mb-4 h-5">
                        {note.professor_names && note.professor_names.length > 0 ? (
                            <p className="text-sm text-gray-500 flex items-center">
                                <span className="text-gray-400 mr-1">Prof:</span>
                                <span className="truncate">
                                    {note.professor_names.join(', ')}
                                </span>
                            </p>
                        ) : (
                            <p className="text-sm text-gray-400 italic">
                                No professors were specified
                            </p>
                        )}
                    </div>

                    {/* Actions Bar - Updated with proper voting */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center space-x-4">
                            {/* Upvote Button */}
                            <button
                                onClick={() => handleVote('upvote')}
                                disabled={isVoting}
                                className={`flex items-center space-x-1 px-3 py-1.5 rounded-md transition-colors text-sm font-medium ${
                                    userVote === 'upvote'
                                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                        : 'text-gray-500 hover:text-green-600 hover:bg-gray-100'
                                } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title="Upvote"
                            >
                                <ThumbsUp
                                    size={16}
                                    fill={userVote === 'upvote' ? 'currentColor' : 'none'}
                                />
                                <span>{upvoteCount}</span>
                            </button>

                            {/* Downvote Button */}
                            <button
                                onClick={() => handleVote('downvote')}
                                disabled={isVoting}
                                className={`flex items-center space-x-1 px-3 py-1.5 rounded-md transition-colors text-sm font-medium ${
                                    userVote === 'downvote'
                                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                        : 'text-gray-500 hover:text-red-600 hover:bg-gray-100'
                                } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title="Downvote"
                            >
                                <ThumbsDown
                                    size={16}
                                    fill={userVote === 'downvote' ? 'currentColor' : 'none'}
                                />
                                <span>{downvoteCount}</span>
                            </button>
                        </div>

                        <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1 text-gray-500">
                                <Download size={14} />
                                <span>{downloadCount}</span>
                            </div>
                            <button
                                onClick={handleDownload}
                                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm font-medium shadow-sm"
                            >
                                <span>View PDF</span>
                            </button>
                        </div>
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