import React from "react";

interface BlogAvatarProps {
  userId: number; 
  avatarUrl: string;
  username: string;
  // TODO: add an onClick prop to navigate to the user's profile
}

const BlogAvatar: React.FC<BlogAvatarProps> = ({ userId, avatarUrl, username }) => {
  return (
    <div className="flex items-center space-x-4 p-2 bg-gray-700 rounded-lg shadow-lg">
      <span className="text-white font-semibold">{username}</span>
      <img
      src={avatarUrl}
      alt={`${username}'s avatar`}
      className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
      />
    </div>
  );
};

export default BlogAvatar;