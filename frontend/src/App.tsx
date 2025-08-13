// App.tsx
import React, { useState } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import CourseGrid from './components/CourseGrid';
import Footer from './components/Footer';
import type {Course} from './types';

const App: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');

    const courses: Course[] = [
        {
            id: 1,
            name: "Course Name",
            code: "Course Code",
            professor: "Professor Name",
            uploadedBy: "Uploaded By",
            helpfulCount: "x%"
        },
        {
            id: 2,
            name: "Course Name",
            code: "Course Code",
            professor: "Professor Name",
            uploadedBy: "Uploaded By",
            helpfulCount: "x%"
        },
        {
            id: 3,
            name: "Course Name",
            code: "Course Code",
            professor: "Professor Name",
            uploadedBy: "Uploaded By",
            helpfulCount: "x%"
        },
        {
            id: 4,
            name: "Course Name",
            code: "Course Code",
            professor: "Professor Name",
            uploadedBy: "Uploaded By",
            helpfulCount: "x%"
        },
        {
            id: 5,
            name: "Course Name",
            code: "Course Code",
            professor: "Professor Name",
            uploadedBy: "Uploaded By",
            helpfulCount: "x%"
        },
        {
            id: 6,
            name: "Course Name",
            code: "Course Code",
            professor: "Professor Name",
            uploadedBy: "Uploaded By",
            helpfulCount: "x%"
        }
    ];

    const handleSearchChange = (query: string): void => {
        setSearchQuery(query);
        console.log('Searching for:', query);
    };

    return (
        <div className="min-h-screen bg-gray-50 overflow-x-hidden">
            <Header />

            <main className="w-full px-4 lg:px-6 py-8 max-w-full">
                <SearchBar
                    searchQuery={searchQuery}
                    onSearchChange={handleSearchChange}
                />

                <CourseGrid courses={courses} />

                <Footer />
            </main>
        </div>
    );
};

export default App;