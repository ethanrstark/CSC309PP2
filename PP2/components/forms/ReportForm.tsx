import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import { on } from 'events';

interface ReportFormProps {
  targetId: number; // Can represent either postId or commentId
  targetType: 'post' | 'comment'; // Specify the type of report
  onClose: () => void; // Callback to close the popup
}

const ReportForm: React.FC<ReportFormProps> = ({ targetId, targetType, onClose }) => {
  const [reason, setReason] = useState('');
  const router = useRouter();
  const [error, setError] = useState<string>("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch(`/api/User/report`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          "Content-Type": 'application/json',
        },
        body: JSON.stringify({
          [`${targetType}Id`]: targetId,
          reason,
        }),
      });

      if (response.status === 409) {
        alert("Error 409: You have already reported this post or comment");
        onClose();
        return;
      } else if (response.status === 401 || response.status === 403) {
        const refreshResp = await fetch('/api/User/Refresh', {
          headers: { authorization: `Bearer ${localStorage.getItem('refreshToken')}` },
        });

        if (refreshResp.ok) {
          const data = await refreshResp.json();
          localStorage.setItem('accessToken', data.accessToken);
          const retriedResponse = await fetch(`/api/User/report`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              [`${targetType}Id`]: targetId,
              reason,
            }),
          });

            if (retriedResponse.ok) {
                onClose();
                return;
            } else if (retriedResponse.status === 409) {
              alert("Error 409: You have already reported this post or comment");
              onClose();
              return;
            } else {
                throw new Error(`${retriedResponse.status}: ${retriedResponse.statusText}`);
            }
        } else {
          router.push('/login');
          return;
        }
      } else if (response.ok) {
        onClose();
        return;
      } else {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
    } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        return;
    }
  };


  // If there was an error, show an error message
  if (error) {
    alert(`Error ${error}`);
    setError("");
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg space-y-4"
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">
            Report {targetType.charAt(0).toUpperCase() + targetType.slice(1)}
          </h2>
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
          Ensure you are logged in before submitting the report. If redirected to the login page, your report data will be lost.
        </p>

        {/* Form Content */}
        <div>
          <label
            htmlFor="reason"
            className="block text-md font-medium text-gray-700 mb-2"
          >
            Report Details:
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            placeholder="Provide details about the issue..."
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

export default ReportForm;

