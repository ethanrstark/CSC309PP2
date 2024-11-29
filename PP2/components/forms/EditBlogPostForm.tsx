import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { XMarkIcon } from "@heroicons/react/24/outline";

const TAG_LIMIT = 10;
const CODE_TEMPLATE_LIMIT = 5;

interface EditBlogPostFormProps {
  prevTitle: string;
  prevDescription: string;
  availableTags: { id: number; name: string }[];
  availableTemplates: { id: number; title: string }[];
  blogPostId: number;
  closeForm: () => void;
}

const EditBlogPostForm: React.FC<EditBlogPostFormProps> = ({
  prevTitle,
  prevDescription,
  availableTags,
  availableTemplates,
  blogPostId,
  closeForm,
}) => {
  const [title, setTitle] = useState(prevTitle);
  const [description, setDescription] = useState(prevDescription);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [tagPage, setTagPage] = useState(1);
  const [templatePage, setTemplatePage] = useState(1);
  const [newTagName, setNewTagName] = useState("");
  const router = useRouter();


  const handleNewTagSave = async () => {
    if (!newTagName.trim()) return;

    try {
      const response = await fetch("/api/tag/create", {
        method: "POST",
        headers: {
          authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newTagName }),
      });

      if (response.ok) {
        const newTag = await response.json();
        if (!selectedTags) {
          setSelectedTags([newTag.id]);
        } else {
          setSelectedTags([...selectedTags, newTag.id]);
        }
        availableTags.push(newTag);
        setNewTagName("");
      } else {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleTagChange = (tagId: number) => {
    setSelectedTags((prevTags) =>
      (prevTags || []).includes(tagId) ? (prevTags || []).filter((id) => id !== tagId) : [...(prevTags || []), tagId]
    );
  };

const handleTemplateChange = (templateId: number) => {
  setSelectedTemplates((prevTemplates) =>
    (prevTemplates || []).includes(templateId)
      ? (prevTemplates || []).filter((id) => id !== templateId)
      : [...(prevTemplates || []), templateId]
  );
};

  const handleTagPageChange = (page: number) => {
    setTagPage(page);
  };

  const handleTemplatePageChange = (page: number) => {
    setTemplatePage(page);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedPost = {
      title,
      description,
      newTags: selectedTags,
      newTemplates: selectedTemplates,
    };

    try {
      if (!title || !description) {
        throw new Error("400: Title and description are required");
      }
      const response = await fetch(`/api/blog/${blogPostId}/edit`, {
        method: "PUT",
        headers: {
          authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedPost),
      });

      if (response.status === 401 || response.status === 403) {
        const refreshResp = await fetch('/api/User/Refresh', {
          headers: { authorization: `Bearer ${localStorage.getItem('refreshToken')}` },
        });

        if (refreshResp.ok) {
          const data = await refreshResp.json();
          localStorage.setItem('accessToken', data.accessToken);
          const retriedResponse = await fetch(`/api/blog/${blogPostId}/edit`, {
            method: "PUT",
            headers: {
              authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedPost),
          });

          if (retriedResponse.status === 401 || retriedResponse.status === 403) {
            router.push('/login');
            return;
          } else if (retriedResponse.ok) {
            closeForm();
            return;
          } else {
            throw new Error(`${retriedResponse.status}: ${retriedResponse.statusText}`);
          }
        } else {
          router.push('/login');
          return;
        }
      } else if (response.ok) {
        closeForm();
        return;
      } else {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };


  if (error) {
    alert(`Error: ${error}`);
    setError("");
  }

  return (
    <form onSubmit={handleSubmit} className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg space-y-6 overflow-y-auto max-h-[80vh]">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">Edit Blog Post</h2>
          <button
            type="button"
            onClick={closeForm}
            className="text-gray-400 hover:text-red-500 transition"
          >
            <XMarkIcon className="h-8 w-8" />
          </button>
        </div>

        {/* Error message */}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Title Input */}
        <div className="mb-4">
          <label htmlFor="title" className="block text-md font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 text-md text-gray-700"
          />
        </div>

        {/* Description Input */}
        <div className="mb-4">
          <label htmlFor="description" className="block text-md font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full h-28 border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 text-md text-gray-700"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Add new tag"
            className="flex-1 text-gray-700 border p-2 rounded"
          />
          <button
            type="button"
            onClick={handleNewTagSave}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Tag
          </button>
        </div>

        {/* Tags Section */}
              <div className="mb-4">
                <label className="block text-md font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.slice((tagPage - 1) * TAG_LIMIT, tagPage * TAG_LIMIT).map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagChange(tag.id)}
                      className={`px-3 py-1 text-center text-sm rounded-lg focus:outline-none ${
                        selectedTags?.includes(tag.id) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                      } hover:bg-blue-300 transition`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-center space-x-4 mt-6">
            {/* Previous Button */}
            <button
              type="button"
              onClick={() => handleTagPageChange(tagPage - 1)}
              disabled={tagPage === 1}
              className={`px-4 py-2 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                tagPage === 1
                  ? "cursor-not-allowed text-gray-500 bg-gray-200"
                  : "hover:bg-blue-500 text-gray-700 hover:text-white bg-gray-100"
              }`}
            >
              Previous
            </button>

            <p className="text-sm text-gray-700">
              Page {tagPage} of {Math.ceil(availableTags.length / TAG_LIMIT)}
            </p>

            {/* Next Button */}
            <button
              type="button"
              onClick={() => handleTagPageChange(tagPage + 1)}
              disabled={tagPage === Math.ceil(availableTags.length / TAG_LIMIT)}
              className={`px-4 py-2 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                tagPage === Math.ceil(availableTags.length / TAG_LIMIT)
                  ? "cursor-not-allowed text-gray-500 bg-gray-200"
                  : "hover:bg-blue-500 text-gray-700 hover:text-white bg-gray-100"
              }`}
            >
              Next
            </button>
            </div>

              </div>

        {/* Templates Section */}
            <div className="mb-4">
              <label className="block text-md font-medium text-gray-700 mb-2">Templates</label>
              <div className="grid grid-cols-1 gap-2">
                {availableTemplates.slice((templatePage - 1) * CODE_TEMPLATE_LIMIT, templatePage * CODE_TEMPLATE_LIMIT).map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleTemplateChange(template.id)}
                    className={`w-full py-2 px-4 text-center rounded-lg focus:outline-none ${
                      selectedTemplates?.includes(template.id) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                    } hover:bg-blue-300 transition`}
                  >
                    {template.title}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-center space-x-4 mt-6">
          {/* Previous Button */}
          <button
            type="button"
            onClick={() => handleTemplatePageChange(templatePage - 1)}
            disabled={templatePage === 1}
            className={`px-4 py-2 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              templatePage === 1
                ? "cursor-not-allowed text-gray-500 bg-gray-200"
                : "hover:bg-blue-500 text-gray-700 hover:text-white bg-gray-100"
            }`}
          >
            Previous
          </button>

          <p className="text-sm text-gray-700">
            Page {templatePage} of {Math.ceil(availableTemplates.length / CODE_TEMPLATE_LIMIT)}
          </p>

          {/* Next Button */}
          <button
            type="button"
            onClick={() => handleTemplatePageChange(templatePage + 1)}
            disabled={templatePage === Math.ceil(availableTemplates.length / CODE_TEMPLATE_LIMIT)}
            className={`px-4 py-2 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              templatePage === Math.ceil(availableTemplates.length / CODE_TEMPLATE_LIMIT)
                ? "cursor-not-allowed text-gray-500 bg-gray-200"
                : "hover:bg-blue-500 text-gray-700 hover:text-white bg-gray-100"
            }`}
          >
            Next
          </button>
          </div>

            </div>

        {/* Action Buttons */}
        <div className="flex justify-center items-center">
          <button
            type="button"
            onClick={closeForm}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 focus:outline-none"
          >
            Save Changes
          </button>
        </div>
      </div>
    </form>
  );
};

export default EditBlogPostForm;
