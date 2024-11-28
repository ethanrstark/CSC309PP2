import React from "react";
import Link from "next/link";
import UserAvatar from "./UserAvatar";
import RatingForm from "@/components/forms/RatingForm";

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
            <div className="blog-post-card cursor-pointer p-4 border rounded-lg hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                    {" "}
                    {/* TODO maybe make this responsive by adding flex-wrap */}
                    <h3 className="text-xl font-bold mb-2">{title}</h3>
                    <UserAvatar
                        userId={authorId}
                        avatarUrl={authorAvatarUrl}
                        username={authorUsername}
                    />
                </div>
                {isHidden && (
                    <div className="bg-red-100 text-red-700 p-2 rounded-md mb-4">
                        This post is hidden: {hiddenReason}
                    </div>
                )}
                <p className="text-gray-700 mb-4">{description}</p>{" "}
                {/* TODO: truncate description*/}
                <div className="text-sm text-gray-500 mb-2">
                    {tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="tag border-white">
                            {tag}
                        </span>
                    ))}
                </div>
                <RatingForm upvoteCount={upvoteCount} downvoteCount={downvoteCount} userVote={null} onVoteChange={() => {}} />
                <div className="text-sm font-medium"> Created At: {formattedCreationDate}</div>
                <span></span>
            </div>
        </Link>
    );
};

export default BlogPostCard;
