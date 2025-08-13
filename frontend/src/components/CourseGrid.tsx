// components/CourseGrid.tsx
import React from 'react';
import CourseCard from './CourseCard';
import type {Course} from '../types';

interface CourseGridProps {
    courses: Course[];
}

const CourseGrid: React.FC<CourseGridProps> = ({ courses }) => {
    return (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16 max-w-full overflow-hidden">
            {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
            ))}
        </div>
    );
};

export default CourseGrid;