export interface Note {
    id: string;
    title: string;
    description: string;
    subject: string;
    uploader: User;
    uploadDate: string;
    upvotes: number;
    downvotes: number;
    fileUrl: string;
    previewUrl?: string;
    tags: string[];
}

export interface User {
    id: string;
    email: string;
    name: string;
    reputation: number;
    profilePicture?: string;
}

export interface AuthContextType {
    user: User | null;
    login: () => void;
    logout: () => void;
    isLoading: boolean;
}

export interface VoteType {
    type: 'upvote' | 'downvote' | 'remove';
}