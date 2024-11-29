// components/blog/CommentCard.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import UserAvatar from "@/components/blog/CommentAvatar";
import ReportForm from '@/components/forms/ReportForm';
import RatingForm from '@/components/forms/RatingForm';
import CommentForm from '@/components/forms/CommentForm';
import { FlagIcon } from "@heroicons/react/24/outline";
import Hidden from '@/components/errors/Hidden';
import { REPLIES_LIMIT } from '@/constants';

type CommentCardProps = {
  commentId: number;
  parentId: number | null;
  blogPostId: number;
  content: string;
  authorId: number;
  authorUsername: string;
  authorAvatarUrl: string;
  createdAt: string;
  upvoteCount: number;
  downvoteCount: number;
  indentLevel: number;
  isHidden?: boolean; // To handle hidden comments for admins
  hiddenReason?: string; // To provide the reason for hidden comments (only visible to admins)
};

const CommentCard: React.FC<CommentCardProps> = ({
  commentId,
  parentId,
  blogPostId,
  content,
  authorId,
  authorUsername,
  authorAvatarUrl,
  createdAt,
  upvoteCount,
  downvoteCount,
  indentLevel,
  isHidden,
  hiddenReason,
}) => {
    const router = useRouter();
    const [showReplies, setShowReplies] = useState(false);
    const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(null);
    const [upvoteTotal, setUpvoteTotal] = useState<number>(upvoteCount);
    const [downvoteTotal, setDownvoteTotal] = useState<number>(downvoteCount);
    const [replies, setReplies] = useState<CommentCardProps[]>([]);
    const [showReportForm, setShowReportForm] = useState(false);
    const [error, setError] = useState<string>("");
    const [showCommentForm, setShowCommentForm] = useState(false);

    const formattedCreationDate = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        timeZoneName: "short",
    }).format(new Date(createdAt));

    const handleOpenReportForm = async () => {
        setShowReportForm(true);  
      };
    
    const handleCloseReportForm = () => {
      setShowReportForm(false);
    };

    const handleOpenCommentForm = async () => {
      setShowCommentForm(true);  
    };
  
    const handleCloseCommentForm = () => {
      setShowCommentForm(false);
    };

    const handleCommentSubmit = async (content: string, postId: number, parentId?: number) => {
      try {
        const response = await fetch(`/api/blog/${postId}/comments/create`, {
          method: 'POST',
          headers: {
            authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            "Content-Type": 'application/json',
          },
          body: JSON.stringify({
            content,
            parentId,
          }),
        });
  
        if (response.status === 401 || response.status === 403) {
          const refreshResp = await fetch('/api/User/Refresh', {
            headers: { authorization: `Bearer ${localStorage.getItem('refreshToken')}` },
          });
  
          if (refreshResp.ok) {
            const data = await refreshResp.json();
            localStorage.setItem('accessToken', data.accessToken);
            const retriedResponse = await fetch(`/api/blog/${postId}/comments/create`, {
              method: 'POST',
              headers: {
                authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                "Content-Type": 'application/json',
              },
              body: JSON.stringify({
                content,
                parentId,
              }),
            });
  
            if (retriedResponse.status === 401 || retriedResponse.status === 403) {
              router.push('/login');
              return;
            } else if (retriedResponse.ok) {
              return;
            } else {
              throw new Error(`${retriedResponse.status}: ${retriedResponse.statusText}`);
            }
          } else {
            router.push('/login');
            return;
          }
        } else if (response.ok) {
          return;
        } else {
          throw new Error(`${response.status}: ${response.statusText}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      }
    };

    const updateVoteCount = (voted: boolean, newVote: "upvote" | "downvote") => {
      if (newVote === "upvote") {
        setUpvoteTotal(upvoteTotal + 1);
        if (voted) {
          setDownvoteTotal(downvoteTotal - 1);
        }
      } else {
        setDownvoteTotal(downvoteTotal + 1);
        if (voted) {
          setUpvoteTotal(upvoteTotal - 1);
        }
      }
    };

    async function handleVote(votedYet: boolean, newVote: "upvote" | "downvote"): Promise<void> {
      try {
        let response;
        if (votedYet) {
          response = await fetch(`/api/blog/${blogPostId}/comments/${commentId}/rate`, {
            method: 'PUT',
            headers: {
              authorization: `Bearer ${localStorage.getItem('accessToken')}`,
              "Content-Type": 'application/json',
            },
            body: JSON.stringify({
              isUpvote: newVote === "upvote",
            }),
          });
        } else {
          response = await fetch(`/api/blog/${blogPostId}/comments/${commentId}/rate`, {
            method: 'POST',
            headers: {
              authorization: `Bearer ${localStorage.getItem('accessToken')}`,
              "Content-Type": 'application/json',
            },
            body: JSON.stringify({
              isUpvote: newVote === "upvote",
            }),
          });
        }
  
        if (response.status === 401 || response.status === 403) {
          const refreshResp = await fetch('/api/User/Refresh', {
            headers: { authorization: `Bearer ${localStorage.getItem('refreshToken')}` },
          });
  
          if (refreshResp.ok) {
            const data = await refreshResp.json();
            localStorage.setItem('accessToken', data.accessToken);
            setUserVote(newVote);
            updateVoteCount(votedYet, newVote);
            router.push(`/blog/${blogPostId}`);
            return;
          } else {
            router.push('/login');
            return;
          }
        } else if (response.ok) {
          setUserVote(newVote);
          updateVoteCount(votedYet, newVote);
          return;
        } else {
          throw new Error(`${response.status}: ${response.statusText}`);
        }
      } catch (err) {
          setError(err instanceof Error ? err.message : "An unknown error occurred");
          return;
      }
    };

    const fetchReplies = async () => {
      if (showReplies) {
        setShowReplies(false);
        return; // Prevent re-fetching if already shown
      }
      try {
        const response = await fetch(`/api/blog/${blogPostId}/comments?page=${router.query.page || 1}&limit=${router.query.limit || REPLIES_LIMIT}&sortBy=${router.query.sortBy || "upvoteCount"}&sortOrder=${router.query.sortOrder || "desc"}&countComments=true&parentId=${commentId}`);
        if (response.ok) {
          const data = await response.json();
          setReplies(
            data.comments.map((reply: any) => ({
              commentId: reply.id,
              parentId: reply.parentId,
              blogPostId,
              content: reply.content,
              authorId: reply.author.id,
              authorUsername: reply.author.userName,
              authorAvatarUrl: reply.author.avatar,
              createdAt: reply.createdAt,
              upvoteCount: reply.upvoteCount,
              downvoteCount: reply.downvoteCount,
              indentLevel: indentLevel + 1,
            }))
          );
        } else {
          throw new Error(`${response.status}: ${response.statusText}`);
        }
      } catch (error: any) {
        setError(error.message);
      } finally {
        setShowReplies(true);
      }
    };

    useEffect(() => {
      const fetchUserVote = async () => {
          const response = await fetch(`/api/blog/${blogPostId}/comments/${commentId}/userRated`, {
            headers: { authorization: `Bearer ${localStorage.getItem("accessToken")}` },
            cache: "no-store",
          });
          if (response.ok) {
            const voteData = await response.json();
            setUserVote(voteData.hasRated ? 
                      voteData.isUpvote ? "upvote" : "downvote" 
                      : null);
          } else {
            setUserVote(null);
          }
      };
      fetchUserVote();
    }, [blogPostId, commentId]);



    if (error) {
      alert(`Error ${error}`);
      setError(""); // Reset error state
    }


  return (
    
    <div className="comment p-6 border border-gray-700 rounded-lg bg-gray-800 mb-6 mx-1 mt-6" style={{ marginLeft: `${indentLevel * 2}rem` }}>
      {showReportForm && (
        <ReportForm targetId={commentId} targetType="comment" onClose={handleCloseReportForm} />
      )}
      {showCommentForm && (
           <CommentForm postId={blogPostId} parentId={commentId} onClose={handleCloseCommentForm} onSubmit={handleCommentSubmit} />
      )}
      {isHidden && (<Hidden type="comment" hiddenReason={hiddenReason || "No reason provided"} />)}
      <div className='w-fit'>
        <UserAvatar
            userId={authorId}
            avatarUrl={authorAvatarUrl}
            username={authorUsername}
          />
      </div>
        <p className="flex flex-wrap mt-4 mb-3 text-md text-gray-300">{content}</p>
        <div className='flex space-x-4'>
        <RatingForm upvoteCount={upvoteTotal} downvoteCount={downvoteTotal} userVote={userVote} onVoteChange={handleVote} />
        <span className="text-sm text-gray-300">{formattedCreationDate}</span>
        </div>
        <div className="flex items-center space-x-6">
        <button
          onClick={handleOpenReportForm}
          className="flex items-center text-gray-500 hover:text-gray-200"
        >
          <FlagIcon className="h-6 w-6" />
        </button>
        <button
            className="mt-3 text-md text-blue-500 hover:underline"
            onClick={handleOpenCommentForm}
          >
            Reply
        </button>
        <button onClick={fetchReplies} className="mt-3 text-md text-blue-500 hover:underline">
        {showReplies ? "Hide Replies" : "Show Replies"}
      </button>
      </div>
      {showReplies && replies.map((reply) => <CommentCard key={reply.commentId} {...reply} />)}
    </div>
  );
};

export default CommentCard;
