import React, { useEffect, useState } from "react";
import CreateBlogPostForm from "@/components/forms/CreateBlogPostForm";
import { useRouter } from "next/router";

export default function CreateBlogPostPage() {
  const [tags, setTags] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [showCreateForm, setShowCreateForm ] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const router = useRouter();


  const handleCloseReportForm = () => { 
    setShowCreateForm(false);
    router.back();
  }

  useEffect(() => {
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
  }, []);

  if (error) {
    alert(`Error ${error}`);
    setError("");
  }

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen ">
      {showCreateForm && (<CreateBlogPostForm availableTags={tags} availableTemplates={templates} closeForm={handleCloseReportForm} /> )}
    </div>
  );
}
