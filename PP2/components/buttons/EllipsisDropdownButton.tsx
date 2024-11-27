import React, { useState, useRef, useEffect } from "react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";

interface EllipsisDropdownButtonProps {
  onUpdate: () => void;
  onDelete: () => void;
}

const EllipsisDropdownButton: React.FC<EllipsisDropdownButtonProps> = ({
  onUpdate,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-2 rounded-md hover:bg-gray-100 focus:outline-none"
      >
        <EllipsisVerticalIcon className="w-6 h-6 text-gray-600" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-white shadow-lg rounded-md z-50">
          <button
            onClick={onUpdate}
            className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Update Blog
          </button>
          <button
            onClick={onDelete}
            className="block w-full px-4 py-2 text-sm text-red-600 hover:bg-red-100"
          >
            Delete Blog
          </button>
        </div>
      )}
    </div>
  );
};

export default EllipsisDropdownButton;
