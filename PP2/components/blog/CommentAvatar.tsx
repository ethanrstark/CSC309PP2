import React from "react";

interface CommentAvatarProps {
  userId: number; 
  avatarUrl: string;
  username: string;
  // TODO: add an onClick prop to navigate to the user's profile
}

const CommentAvatar: React.FC<CommentAvatarProps> = ({ userId, avatarUrl, username }) => {
  return (
    <div className="flex items-center space-x-2 p-1 bg-gray-700 rounded-lg shadow-lg">
      <img
      src={avatarUrl}
      alt={`${username}'s avatar`}
      className="w-8 h-8 rounded-full object-cover border-2 border-gray-600"
      />
      <span className="text-white font-semibold text-sm">{username}</span>
    </div>
  );
};

export default CommentAvatar;