import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface CommentFormProps {
  postId: number;
  parentId?: number; // Optional for replies
  onClose: () => void;
  onSubmit: (content: string, postId: number, parentId?: number) => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ postId, parentId, onClose, onSubmit }) => {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!content.trim()) {
      setError("Comment content cannot be empty.");
      return;
    }
    onSubmit(content, postId, parentId);
    setContent("");
    onClose();
  };

  // If there was an error, show an error message
  if (error) {
    alert(`Error ${error}`);
    setError(""); // Reset error state
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
  <form
    onSubmit={handleSubmit}
    className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg space-y-4"
  >
    {/* Header */}
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-semibold text-gray-800">Leave a Comment</h2>
      <button
        type="button"
        onClick={onClose}
        className="text-gray-400 hover:text-red-500 transition"
      >
        <XMarkIcon className="h-8 w-8" />
      </button>
    </div>

    {/* Warning */}
    <p className="text-md text-gray-600">
      Note: Make sure you are logged in before submitting your comment or else you will be redirected to the login page.
    </p>

    {/* Form Content */}
    <div>
      <label
        htmlFor="content"
        className="block text-md font-medium text-gray-700 mb-2"
      >
        Comment:
      </label>
      <textarea
        id="content"
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setError("");
        }}
        required
        placeholder="Write your comment here..."
        className="w-full h-28 border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 text-md text-gray-700"
      />
    </div>

    {/* Actions */}
    <div className="flex justify-center space-x-3">
      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Submit
      </button>
    </div>
  </form>
</div>

  );
};

export default CommentForm;

