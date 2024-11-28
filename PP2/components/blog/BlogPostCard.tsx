import React from "react";
import Link from "next/link";
import UserAvatar from "./BlogAvatar";
import RatingForm from "@/components/forms/RatingForm";
import Hidden from "../errors/Hidden";

interface BlogPostCardProps {
    id: number;
    title: string;
    description: string;
    authorId: number;
    authorUsername: string;
    authorAvatarUrl: string;
    createdAt: string;
    upvoteCount: number;
    downvoteCount: number;
    tags: string[];
    isHidden: boolean;
    hiddenReason?: string;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({
    id,
    title,
    description,
    authorId,
    authorUsername,
    authorAvatarUrl,
    createdAt,
    upvoteCount,
    downvoteCount,
    tags,
    isHidden,
    hiddenReason,
}) => {
    const date = new Date(createdAt);
    const formattedCreationDate = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        timeZoneName: "short",
    }).format(date);

    return (
        <Link href={`/blog/${id}`} passHref>
  <div className="blog-post-card cursor-pointer p-6 border border-gray-300 rounded-lg bg-gray-800 mb-6 mx-4 hover:bg-gray-700">
    {isHidden && (
      <Hidden type="post" hiddenReason={hiddenReason || "No reason provided"} />
    )}
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-2xl font-semibold mb-2 text-white">{title}</h3>
      <div className="flex-shrink-0 ml-4">
        <UserAvatar
          userId={authorId}
          avatarUrl={authorAvatarUrl}
          username={authorUsername}
        />
      </div>
    </div>
    <p className="text-gray-300 mb-4">{description}</p> {/* TODO: truncate description */}
    
    <div className="flex items-center space-x-6 text-sm text-gray-400 mb-4">
      <div className="flex items-center space-x-2">
        <RatingForm
          upvoteCount={upvoteCount}
          downvoteCount={downvoteCount}
          userVote={null}
          onVoteChange={() => {}}
        />
      </div>
      <div className="flex flex-wrap mt-2">
        {tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="tag inline-block px-3 py-1 mr-2 mb-2 text-xs font-medium bg-gray-700 text-gray-300 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
    <div className="text-sm font-medium text-gray-300 mt-4">
      Created At: {formattedCreationDate}
    </div>
  </div>
</Link>

      
    );
};

export default BlogPostCard;
