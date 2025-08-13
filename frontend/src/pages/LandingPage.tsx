// src/pages/LandingPage.tsx
import React from 'react';
import SearchBar from '../components/SearchBar.tsx';
import NoteCard from '../components/notes/NoteCard.tsx';
import { useRecentNotes } from '../hooks/useNotes';
import { BookOpen, Users, Star } from 'lucide-react';

const LandingPage: React.FC = () => {
    const { notes, loading, error, refetch } = useRecentNotes(20);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        Can't Find My Notes?
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 text-blue-100">
                        Share and discover study materials with your fellow IIT KGP students
                    </p>

                    <div className="max-w-3xl mx-auto">
                        <SearchBar />
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="flex flex-col items-center">
                            <BookOpen className="text-blue-600 mb-2" size={48} />
                            <h3 className="text-2xl font-semibold text-gray-900">Study Notes</h3>
                            <p className="text-gray-600">High-quality notes from your peers</p>
                        </div>

                        <div className="flex flex-col items-center">
                            <Users className="text-blue-600 mb-2" size={48} />
                            <h3 className="text-2xl font-semibold text-gray-900">Community Driven</h3>
                            <p className="text-gray-600">Built by students, for students</p>
                        </div>

                        <div className="flex flex-col items-center">
                            <Star className="text-blue-600 mb-2" size={48} />
                            <h3 className="text-2xl font-semibold text-gray-900">Quality Assured</h3>
                            <p className="text-gray-600">Upvote system ensures best content rises</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Recent Notes Section */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">Recent Notes</h2>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-600 py-8">
                            Error loading notes. Please try again.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {notes.map((note) => (
                                <NoteCard key={note.id} note={note} onVoteChange={refetch} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
