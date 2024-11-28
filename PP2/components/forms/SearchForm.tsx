import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { on } from "events";

interface SearchFormProps {
  onClose: () => void;
  handleSearchSubmit: () => void;
}

const SearchForm = ({ onClose, handleSearchSubmit }: SearchFormProps) => {
  const router = useRouter();
  const [searchTitle, setSearchTitle] = useState<string>("");
  const [searchDescription, setSearchDescription] = useState<string>("");
  const [searchTags, setSearchTags] = useState<string>("");
  const [searchTemplates, setSearchTemplates] = useState<string>("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "searchTitle") setSearchTitle(value);
    if (name === "searchDescription") setSearchDescription(value);
    if (name === "searchTags") setSearchTags(value);
    if (name === "searchTemplates") setSearchTemplates(value);
  };

  const search = async () => {
    const query = {
      ...router.query,
      title: searchTitle,
      description: searchDescription,
      tags: searchTags,
      templates: searchTemplates,
    };

    router.push({
      pathname: "/blog",
      query,
    });
    handleSearchSubmit();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h3 className="text-xl font-semibold mb-4">Search Blog Posts</h3>
        <form onSubmit={search} className="space-y-4">
          <div>
            <label htmlFor="searchTitle" className="block text-sm font-semibold text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="searchTitle"
              name="searchTitle"
              value={searchTitle}
              onChange={handleSearchChange}
              className="mt-1 p-2 w-full border rounded-md"
              placeholder="Enter title"
            />
          </div>

          <div>
            <label htmlFor="searchDescription" className="block text-sm font-semibold text-gray-700">
              Description
            </label>
            <textarea
              id="searchDescription"
              name="searchDescription"
              value={searchDescription}
              onChange={handleSearchChange}
              className="mt-1 p-2 w-full border rounded-md"
              placeholder="Enter description"
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="searchTags" className="block text-sm font-semibold text-gray-700">
              Tags (comma separated without spaces)
            </label>
            <input
              type="text"
              id="searchTags"
              name="searchTags"
              value={searchTags}
              onChange={handleSearchChange}
              className="mt-1 p-2 w-full border rounded-md"
              placeholder="Enter tags"
            />
          </div>

          <div>
            <label htmlFor="searchTemplates" className="block text-sm font-semibold text-gray-700">
              Templates (comma separated without spaces)
            </label>
            <input
              type="text"
              id="searchTemplates"
              name="searchTemplates"
              value={searchTemplates}
              onChange={handleSearchChange}
              className="mt-1 p-2 w-full border rounded-md"
              placeholder="Enter templates"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Search
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SearchForm;
