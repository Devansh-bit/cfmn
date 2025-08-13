// types.ts
export interface Course {
    id: number;
    name: string;
    code: string;
    professor: string;
    uploadedBy: string;
    helpfulCount: string;
}

export interface CourseCardProps {
    course: Course;
}

export interface TopicLinkProps {
    children: React.ReactNode;
}

export interface SearchBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
}