import React from "react";

interface UserAvatarProps {
  userId: number; 
  avatarUrl: string;
  username: string;
  // TODO: add an onClick prop to navigate to the user's profile
}

const UserAvatar: React.FC<UserAvatarProps> = ({ userId, avatarUrl, username }) => {
  return (
    <div className="flex items-center space-x-4">
      <img
        src={avatarUrl}
        alt={`${username}'s avatar`}
        className="w-12 h-12 rounded-full object-cover border border-gray-300"
      />
      <span className="text-gray-700">{username}</span>
    </div>
  );
};

export default UserAvatar;