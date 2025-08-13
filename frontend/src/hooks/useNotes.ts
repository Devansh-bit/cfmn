import { useState, useEffect } from 'react';
import type { Note } from '../types';
import { notesApi } from '../utils/api';

export const useRecentNotes = (count: number = 10) => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                setLoading(true);
                const response = await notesApi.getRecentNotes(count);
                setNotes(response.data.notes);
            } catch (err) {
                setError('Failed to fetch notes');
            } finally {
                setLoading(false);
            }
        };

        fetchNotes();
    }, [count]);

    return { notes, loading, error, refetch: () => fetchNotes() };
};

export const useSearchNotes = () => {
    const [results, setResults] = useState<Note[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchNotes = async (query: string) => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await notesApi.searchNotes(query);
            setResults(response.data.notes);
        } catch (err) {
            setError('Search failed');
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    return { results, loading, error, searchNotes };
};