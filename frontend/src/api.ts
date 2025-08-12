const API_BASE_URL = "http://localhost:3000/api";

export interface User {
    id: string;
    username: string;
    reputation: number;
    created_at: string;
}

export interface Note {
    id: string;
    title: string;
    description: string | null;
    professor_names: string[] | null;
    course_names: string[] | null;
    tags: string[];
    file_path: string;
    uploader_id: string;
    created_at: string;
}

export const registerUser = async (username: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to register user");
    }
    return response.json();
};

export const getNotes = async (): Promise<Note[]> => {
    const response = await fetch(`${API_BASE_URL}/notes`);
    if (!response.ok) {
        throw new Error("Failed to fetch notes");
    }
    return response.json();
};

export const searchNotes = async (query: string): Promise<Note[]> => {
    const response = await fetch(`${API_BASE_URL}/notes/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) {
        throw new Error("Failed to search notes");
    }
    return response.json();
};


export const uploadNote = async (formData: FormData): Promise<Note> => {
    const response = await fetch(`${API_BASE_URL}/notes/upload`, {
        method: 'POST',
        body: formData,
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload note");
    }
    return response.json();
};
