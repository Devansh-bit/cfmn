import axios from 'axios';

const API_BASE = process.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
});

export const notesApi = {
    getRecentNotes: (n: number = 10) =>
        api.get(`/api/notes?n=${n}`),

    searchNotes: (query: string) =>
        api.get(`/api/notes/search?query=${encodeURIComponent(query)}`),

    getNoteById: (noteId: string) =>
        api.get(`/api/notes/${noteId}`),

    uploadNote: (formData: FormData) =>
        api.post('/api/notes/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),

    voteOnNote: (noteId: string, type: 'upvote' | 'downvote' | 'remove') =>
        api.post(`/api/notes/${noteId}/vote?type=${type}`),
};

export const authApi = {
    googleLogin: () => {
        window.location.href = `${API_BASE}/api/auth/google`;
    },

    logout: () =>
        api.post('/api/auth/logout'),

    getCurrentUser: () =>
        api.get('/api/auth/me'),
};