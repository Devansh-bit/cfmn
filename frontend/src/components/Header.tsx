// components/Header.tsx
import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 w-full">
            <div className="w-full max-w-full flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">CFMN</h1>
                <div className="flex items-center gap-4">
                    <button className="text-gray-600 hover:text-gray-900 transition-colors">
                        Leaderboard
                    </button>
                    <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">
                        Sign In
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;