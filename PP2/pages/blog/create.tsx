import React, { useEffect, useState } from "react";
import CreateBlogPostForm from "@/components/forms/CreateBlogPostForm";

export default function CreateBlogPostPage() {
  const [tags, setTags] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [ showCreateForm, setShowCreateForm ] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");


  const handleCloseReportForm = () => { 
    setShowCreateForm(false);
  }

  useEffect(() => {
    setIsLoading(true);
    const fetchTags = async () => {
      try {
        const response = await fetch(`/api/tag/getAll`, {cache: "no-cache"});
        if (!response.ok) throw new Error("Failed to fetch tags");
        const res = await response.json();
        setTags(res);
      } catch (error: any) {
        setError(error.message);
      } 
    };

    const fetchTemplates = async () => {
      try {
        const response = await fetch(`/api/CodeTemplate/getAll`, {cache: "no-cache"});
        if (!response.ok) throw new Error("Failed to fetch templates");
        const res = await response.json();
        setTemplates(res);
      } catch (error: any) {
        setError(error.message);
      } 
    };

    fetchTags();
    fetchTemplates();
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    alert(`Error ${error}`);
    setError("");
  }

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen ">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => setShowCreateForm(true)}> Create </button>
      {showCreateForm && <CreateBlogPostForm availableTags={tags} availableTemplates={templates} closeForm={handleCloseReportForm} />}
    </div>
  );
}
