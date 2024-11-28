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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <button onClick={onClose} className="absolute top-3 right-3">
          <XMarkIcon className="h-6 w-6 text-gray-500 hover:text-red-500" />
        </button>
        <h2 className="text-lg font-semibold">Leave a Comment</h2>
        <p>Note: Make sure you are logged in before submitting your comment or else you will be redirected to the login page</p>
        <textarea
          className="w-full mt-4 p-2 border rounded-md resize-none h-32 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Write your comment here..."
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setError("");
          }}
        ></textarea>
        <div className="mt-4 flex justify-end space-x-3">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentForm;

