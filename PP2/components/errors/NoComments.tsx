import React from 'react';

const NoComments: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg p-10 mt-8">
            <h2 className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
                No Comments Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 text-center">
                Be the first to share your thoughts on this post! Start the conversation.
            </p>
        </div>
    );
};

export default NoComments;
