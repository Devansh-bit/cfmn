// components/SearchBar.tsx
import React from 'react';
import { Search } from 'lucide-react';
import type {SearchBarProps} from '../types';

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, onSearchChange }) => {
    return (
        <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-dark-text mb-6">
                Can't find notes?
            </h2>

            <div className="max-w-3xl mx-auto relative">
                <div className="flex items-center bg-dark-surface border border-gray-700 rounded-lg overflow-hidden shadow-sm">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="flex-1 px-3 py-3 text-dark-text bg-dark-surface focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-inset"
                        placeholder="Search for courses..."
                    />
                    <button className="p-3 text-dark-text-secondary hover:text-dark-text transition-colors">
                        <Search className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SearchBar;