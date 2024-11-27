import React, { useState } from "react";
import { useRouter } from "next/router";
import Pagination from "../Pagination";
import { XMarkIcon } from "@heroicons/react/24/outline";

const TAG_LIMIT = 5;
const CODE_TEMPLATE_LIMIT = 5;

interface CreateBlogPostFormProps {
  availableTags: { id: number; name: string }[];
  availableTemplates: { id: number; title: string }[];
  closeForm: () => void;
}

const CreateBlogPostForm: React.FC<CreateBlogPostFormProps> = ({ availableTags, availableTemplates, closeForm }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<number[] | null>(null);
  const [selectedTemplates, setSelectedTemplates] = useState<number[] | null>(null);
  const [tagPage, setTagPage] = useState(1);
  const [templatePage, setTemplatePage] = useState(1);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleTagPageChange = (page: number) => {
    setTagPage(page);
  }

  const handleTemplatePageChange = (page: number) => {
      setTemplatePage(page);
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newPost = { title, description, tags: selectedTags, templates: selectedTemplates };

    try {
        if (!title || !description) {
            throw new Error("400: Title and description are required");
        }
      const response = await fetch("/api/blog/create", {
        method: "POST",
        headers: {
          authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPost),
      });

      if (response.status === 401 || response.status === 403) {
        const refreshResp = await fetch('/api/User/Refresh', {
          headers: { authorization: `Bearer ${localStorage.getItem('refreshToken')}` },
        });

        if (refreshResp.ok) {
          const data = await refreshResp.json();
          localStorage.setItem('accessToken', data.accessToken);
          const retriedResponse = await fetch("/api/blog/create", {
            method: "POST",
            headers: {
              authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newPost),
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
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-lg">
        <div className="flex justify-between">
        <h2 className="text-2xl font-bold mb-4">Create New Blog Post</h2>
        <button
        type="button"
        onClick={closeForm}
        className="text-gray-500 hover:text-red-500"
      >
        <XMarkIcon className="h-6 w-6"/>
      </button>
        </div>
      
      

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 p-2 w-full border rounded-md"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="mt-1 p-2 w-full border rounded-md"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Tags</label>
        <div className="flex flex-wrap gap-2">
          {availableTags.slice((tagPage - 1) * TAG_LIMIT, tagPage * TAG_LIMIT).map((tag) => (
            <label key={tag.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                value={tag.id}
                onChange={() => handleTagChange(tag.id)}
              />
              <span>{tag.name}</span>
            </label>
          ))}
          <Pagination currentPage={tagPage} totalPages={Math.ceil(availableTags.length / TAG_LIMIT)} onPageChange={handleTagPageChange} />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Templates</label>
        <div className="flex flex-wrap gap-2">
          {availableTemplates.slice((templatePage - 1) * CODE_TEMPLATE_LIMIT, templatePage * CODE_TEMPLATE_LIMIT).map((template) => (
            <label key={template.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                value={template.id}
                onChange={() => handleTemplateChange(template.id)}
              />
              <span>{template.title}</span>
            </label>
          ))}
          <Pagination currentPage={templatePage} totalPages={Math.ceil(availableTemplates.length / CODE_TEMPLATE_LIMIT)} onPageChange={handleTemplatePageChange} />

        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
      >
        Create Post
      </button>
    </form>
  );
};

export default CreateBlogPostForm;
