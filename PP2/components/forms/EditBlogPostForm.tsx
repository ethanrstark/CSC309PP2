import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const EditBlogPostForm = ({ initialPostData }) => {
  const router = useRouter();
  const { blogPostId } = router.query;

  const [title, setTitle] = useState(initialPostData?.title || "");
  const [description, setDescription] = useState(initialPostData?.description || "");
  const [newTags, setNewTags] = useState<number[]>([]);
  const [removedTags, setRemovedTags] = useState<number[]>([]);
  const [newTemplates, setNewTemplates] = useState<number[]>([]);
  const [removedTemplates, setRemovedTemplates] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/blog/${blogPostId}/edit`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          newTags,
          removedTags,
          newTemplates,
          removedTemplates,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "An error occurred");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/blog/${blogPostId}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Edit Blog Post</h1>

      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-500">Blog post updated successfully!</div>}

      <div>
        <label className="block text-sm font-medium">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded"
        ></textarea>
      </div>

      <div>
        <label className="block text-sm font-medium">New Tags</label>
        <input
          type="text"
          placeholder="Enter tag IDs separated by commas"
          onChange={(e) => setNewTags(e.target.value.split(",").map(Number))}
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Remove Tags</label>
        <input
          type="text"
          placeholder="Enter tag IDs separated by commas"
          onChange={(e) => setRemovedTags(e.target.value.split(",").map(Number))}
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">New Templates</label>
        <input
          type="text"
          placeholder="Enter template IDs separated by commas"
          onChange={(e) => setNewTemplates(e.target.value.split(",").map(Number))}
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Remove Templates</label>
        <input
          type="text"
          placeholder="Enter template IDs separated by commas"
          onChange={(e) => setRemovedTemplates(e.target.value.split(",").map(Number))}
          className="w-full p-2 border rounded"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isSubmitting ? "Updating..." : "Update Blog Post"}
      </button>
    </form>
  );
};

export default EditBlogPostForm;
