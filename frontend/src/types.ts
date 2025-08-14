import type {ReactNode} from 'react';

export interface ResponseUser {
    id: string;
    google_id: string;
    email: string;
    full_name: string;
    reputation: number;
    created_at: string;
}

export interface ResponseNote {
    id: string;
    course_name: string;
    course_code: string;
    description?: string;
    professor_names?: string[];
    tags: string[];
    is_public: boolean;
    preview_image_url?: string;
    file_url: string;
    uploader_user: ResponseUser;
    created_at: string;
}

// Keep existing types for component props
export interface SearchBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export interface CourseCardProps {
    note: ResponseNote; // Changed from course to note
}

export interface CourseGridProps {
    notes: ResponseNote[]; // Changed from courses to notes
}

export interface FooterProps {
    children?: ReactNode;
}

// API response types
export interface NotesResponse {
    notes: ResponseNote[];
    total: number;
}

export interface AuthUser {
    id: string;
    google_id: string;
    email: string;
    full_name: string;
    reputation: number;
    created_at: string;
}

// types.ts - Update the AuthContextType interface
export interface AuthContextType {
    user: AuthUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    signIn: () => Promise<void>;
    signOut: () => void;
    promptSignIn?: () => void; // Add this optional method
    googleInitialized: boolean; // Add this
    googleScriptLoaded: boolean; // Add this
}