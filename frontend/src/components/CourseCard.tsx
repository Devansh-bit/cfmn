// components/CourseCard.tsx
import React from 'react';
import { Download, ThumbsUp, ThumbsDown, MoreVertical } from 'lucide-react';
import type {CourseCardProps} from '../types';

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
    const handleDownload = (): void => {
        // Handle download logic
        console.log(`Downloading notes for ${course.name}`);
    };

    const handleLike = (): void => {
        // Handle like logic
        console.log(`Liked notes for ${course.name}`);
    };

    const handleDislike = (): void => {
        // Handle dislike logic
        console.log(`Disliked notes for ${course.name}`);
    };

    const handleMoreOptions = (): void => {
        // Handle more options
        console.log(`More options for ${course.name}`);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow w-full">
            {/* Header */}
            <div className="p-4 bg-purple-50 relative">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center">
                            <span className="text-purple-700 font-semibold">A</span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">{course.name}</h3>
                            <p className="text-sm text-gray-600">{course.code}</p>
                        </div>
                    </div>
                    <button
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={handleMoreOptions}
                        aria-label="More options"
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>

                {/* Placeholder icons */}
                <div className="flex items-center gap-4 mt-6 justify-center opacity-30">
                    <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
                    <div className="w-6 h-6 bg-gray-400 rounded"></div>
                    <div className="w-6 h-6 bg-gray-400 rounded"></div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="mb-3">
                    <p className="font-medium text-gray-900">{course.professor}</p>
                    <p className="text-sm text-blue-600">{course.uploadedBy}</p>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                    <span className="font-medium">{course.helpfulCount}</span> people found this helpful
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors p-1"
                            onClick={handleLike}
                            aria-label="Like this note"
                        >
                            <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button
                            className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition-colors p-1"
                            onClick={handleDislike}
                            aria-label="Dislike this note"
                        >
                            <ThumbsDown className="w-4 h-4" />
                        </button>
                    </div>
                    <button
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
                        onClick={handleDownload}
                    >
                        <Download className="w-4 h-4" />
                        Download
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CourseCard;