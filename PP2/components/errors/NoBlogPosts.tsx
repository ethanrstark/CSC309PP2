import React from 'react';

const NoComments: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mt-8">
            <h2 className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
                No Blog Posts Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 text-center">
                Start writing and sharing your thoughts with the world!
            </p>
        </div>
    );
};

export default NoComments;