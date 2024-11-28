import {ExclamationCircleIcon } from '@heroicons/react/24/outline'; 
import React from 'react';

interface HiddenProps {
    hiddenReason: string;
    type: string;
}

const Hidden: React.FC<HiddenProps> = ({ hiddenReason, type }) => {
    return (
        <div className="flex items-center space-x-2 bg-red-100 text-red-700 p-1 rounded-lg mb-2 border border-red-300 shadow-sm">
            <ExclamationCircleIcon className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium">This {type} is hidden: {hiddenReason}</span>
        </div>
    );
};

export default Hidden;