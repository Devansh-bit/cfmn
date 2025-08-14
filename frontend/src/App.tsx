// App.tsx - Updated to handle new uploads
import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import CourseGrid from './components/CourseGrid';
import Footer from './components/Footer';
import { notesApi } from './api/notesApi';
import type { ResponseNote } from './types';

const AppContent: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [notes, setNotes] = useState<ResponseNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load initial notes
    useEffect(() => {
        const loadNotes = async () => {
            try {
                setLoading(true);
                setError(null);
                const fetchedNotes = await notesApi.getNotes(12);
                setNotes(fetchedNotes);
            } catch (err) {
                setError('Failed to load notes. Please try again later.');
                console.error('Failed to load notes:', err);
            } finally {
                setLoading(false);
            }
        };

        loadNotes();
    }, []);

    // Handle search
    const handleSearchChange = async (query: string): Promise<void> => {
        setSearchQuery(query);
        try {
            setLoading(true);
            setError(null);
            if (query.trim() === '') {
                const fetchedNotes = await notesApi.getNotes(12);
                setNotes(fetchedNotes);
            } else {
                const searchResults = await notesApi.searchNotes(query);
                setNotes(searchResults);
            }
        } catch (err) {
            setError('Search failed. Please try again.');
            console.error('Search failed:', err);
        } finally {
            setLoading(false);
        }
    };

    // Handle new note upload
    const handleNoteUploaded = (newNote: ResponseNote) => {
        // Add the new note to the beginning of the list
        setNotes(prevNotes => [newNote, ...prevNotes]);
        // Clear search query to show all notes including the new one
        setSearchQuery('');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header onNoteUploaded={handleNoteUploaded} />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <SearchBar searchQuery={searchQuery} onSearchChange={handleSearchChange} />
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-3 text-gray-600">Loading notes...</span>
                    </div>
                ) : (
                    <CourseGrid notes={notes} />
                )}
            </main>

            <Footer />
        </div>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;
