// pages/blog/[id].tsx

import React, { cache, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode';
import { ChatBubbleLeftEllipsisIcon, FlagIcon, XMarkIcon } from '@heroicons/react/24/outline';

import Pagination from '@/components/Pagination';
import UserAvatar from '@/components/blog/BlogAvatar';
import ReportForm from '@/components/forms/ReportForm';
import CommentCard from '@/components/blog/CommentCard';
import NoComments from '@/components/errors/NoComments';
import NoBlogPosts from '@/components/errors/NoBlogPosts';
import RatingForm from '@/components/forms/RatingForm';
import CommentForm from '@/components/forms/CommentForm';
import Hidden from '@/components/errors/Hidden';

import { COMMENT_LIMIT } from '@/constants';

// Interfaces
interface Author {
  id: number;
  userName: string;
  avatar: string;
  role: string;
}

interface BlogPost {
  id: number;
  title: string;
  description: string;
  isHidden: boolean;
  hiddenReason?: string;
  createdAt: string;
  updatedAt: string;
  upvoteCount: number;
  downvoteCount: number;
  author: Author;
  tags: { id: number; name: string }[];
  templates: { id: number; title: string }[];
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  parentId: number | null;
  author: Author;
  upvoteCount: number;
  downvoteCount: number;
  isHidden: boolean;
  hiddenReason?: string;
}

interface CommentResponse {
  comments: Comment[];
  commentCount: number;
}

// Component
const BlogPostDetail = () => {
  const router = useRouter();
  const { id } = router.query;

  // State Management
  const [post, setPost] = useState<BlogPost | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(null);
  const [commentData, setCommentData] = useState<CommentResponse>({ comments: [], commentCount: 0 });
  const [upvoteTotal, setUpvoteTotal] = useState<number>(0);
  const [downvoteTotal, setDownvoteTotal] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [showReportForm, setShowReportForm] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);

  // Handlers
  const handleOpenReportForm = () => setShowReportForm(true);
  const handleCloseReportForm = () => setShowReportForm(false);
  const handleOpenCommentForm = () => setShowCommentForm(true);
  const handleCloseCommentForm = () => setShowCommentForm(false);

  const handleUpdate = () => router.push(`/blog/${id}/edit`); // TODO
  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this blog post?")) {
      try {
        const response = await fetch(`/api/blog/${id}/delete`, {
          method: 'DELETE',
          headers: {
            authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });

        if (response.status === 401 || response.status === 403) {
          const refreshResp = await fetch('/api/User/Refresh', {
            headers: { authorization: `Bearer ${localStorage.getItem('refreshToken')}` }, cache: 'no-store',
          });

          if (refreshResp.ok) {
            const data = await refreshResp.json();
            localStorage.setItem('accessToken', data.accessToken);
            const retriedResponse = await fetch(`/api/blog/${id}/delete`, {
              method: 'DELETE',
              headers: {
                authorization: `Bearer ${localStorage.getItem('accessToken')}`,
              },
            });

            if (retriedResponse.status === 401 || retriedResponse.status === 403) {
              router.push('/login');
              return;
            } else if (retriedResponse.ok) {
              router.push("/blog");
              return;
            } else {
              throw new Error(`${retriedResponse.status}: ${retriedResponse.statusText}`);
            }
          } else {
            router.push('/login');
            return;
          }
        } else if (response.ok) {
          router.push("/blog");
          return;
        } else {
          throw new Error(`${response.status}: ${response.statusText}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      }
  };
};


  const handleVote = async (votedYet: boolean, newVote: "upvote" | "downvote") => {
    try {
      const method = votedYet ? 'PUT' : 'POST';
      const response = await fetch(`/api/blog/${id}/rate`, {
        method,
        headers: {
          authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isUpvote: newVote === 'upvote' }),
      });

      if (response.status === 401 || response.status === 403) {
        const refreshResp = await fetch('/api/User/Refresh', {
          headers: { authorization: `Bearer ${localStorage.getItem('refreshToken')}` }, cache: 'no-store',
        });

        if (refreshResp.ok) {
          const data = await refreshResp.json();
          localStorage.setItem('accessToken', data.accessToken);
          const retriedResponse = await fetch(`/api/blog/${id}/rate`, {
            method,
            headers: {
              authorization: `Bearer ${localStorage.getItem('accessToken')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ isUpvote: newVote === 'upvote' }),
          });
          if (retriedResponse.status === 401 || retriedResponse.status === 403) {
            router.push('/login');
            return;
          } else if (retriedResponse.ok) {
            setUserVote(newVote);
            updateVoteCount(votedYet, newVote);
            router.push({pathname: `/blog/${id}`, query: router.query});
            return;
          } else {
            throw new Error(`${retriedResponse.status}: ${retriedResponse.statusText}`);
          }
        } else {
          router.push('/login');
          return;
        }
      } else if (response.ok) {
        setUserVote(newVote);
        updateVoteCount(votedYet, newVote);
        router.push({pathname: `/blog/${id}`, query: router.query});
        return;
      } else {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    }
  };

  const handleCommentSubmit = async (content: string, postId: number, parentId?: number) => {
    try {
      const response = await fetch(`/api/blog/${postId}/comments/create`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, parentId }),
      });

      if (response.status === 401 || response.status === 403) {
        const refreshResp = await fetch('/api/User/Refresh', {
          headers: { authorization: `Bearer ${localStorage.getItem('refreshToken')}` }, cache: 'no-store',
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
            body: JSON.stringify({ content, parentId }),
          });

          if (retriedResponse.status === 401 || retriedResponse.status === 403) {
            router.push('/login');
            return;
          } else if (retriedResponse.ok) {
            router.push({pathname: `/blog/${postId}`, query: router.query});
            return;
          } else {
            throw new Error(`${retriedResponse.status}: ${retriedResponse.statusText}`);
          }
        } else {
          router.push('/login');
          return;
        }
      } else if (response.ok) {
        router.push({pathname: `/blog/${postId}`, query: router.query});
        return;
      } else {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    }
  };

  // Vote Count Update
  const updateVoteCount = (voted: boolean, newVote: "upvote" | "downvote") => {
    if (newVote === "upvote") {
      setUpvoteTotal(upvoteTotal + 1);
      if (voted) setDownvoteTotal(downvoteTotal - 1);
    } else {
      setDownvoteTotal(downvoteTotal + 1);
      if (voted) setUpvoteTotal(upvoteTotal - 1);
    }
  };

  // Fetch Blog Details
  useEffect(() => {
    const fetchData = async () => {
      if (!id || !router.isReady) return;
      try {
        const token = localStorage.getItem("accessToken");
        if (token !== null) {
          const decodedToken = jwtDecode<{ id: number }>(token);
          setUserId(decodedToken.id);
        }
        const [postResponse, voteResponse, commentsResponse] = await Promise.all([
          fetch(`/api/blog/${id}`,{ cache: "no-store"}),
          fetch(`/api/blog/${id}/userRated`, { headers: { authorization: `Bearer ${token}` } }),
          fetch(`/api/blog/${id}/comments?page=${router.query.page || 1}&limit=${COMMENT_LIMIT}&countComments=true`, { headers: { authorization: `Bearer ${token}` }, cache: "no-store" }),
        ]);
        
        if (postResponse.ok) {
          const postData = await postResponse.json();
          setPost(postData);
          setUpvoteTotal(postData.upvoteCount);
          setDownvoteTotal(postData.downvoteCount);
        } else {
          throw new Error(`${postResponse.status}: ${postResponse.statusText}`);
        }

        if (voteResponse.ok) {
          const voteData = await voteResponse.json();
          setUserVote(voteData.hasRated ? (voteData.isUpvote ? "upvote" : "downvote") : null);
        } else {
          setUserVote(null);
        }

        if (commentsResponse.ok) {
          const commentsData = await commentsResponse.json();
          setCommentData(commentsData);
        } else {
          throw new Error(`${commentsResponse.status}: ${commentsResponse.statusText}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      }
    };
    fetchData();
  }, [id, router.isReady]);


   // If there was an error, show an error message
   if (error) {
    alert(`Error ${error}`);
    setError(""); // Reset error state
  }

  // Render
  if (!post) return <NoBlogPosts />;
  if (post.isHidden && (!userId || userId !== post.author.id)) return <NoBlogPosts />;

  const formattedDate = (date: string) => new Intl.DateTimeFormat("en-US", {
    year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric",
  }).format(new Date(date));

    return (
      <div className="blog-post-detail p-6 border border-gray-300 rounded-lg bg-gray-800 mb-6 mx-4">
        {post.isHidden && userId === post.author.id && (
          <Hidden type="post" hiddenReason={post.hiddenReason || "No reason provided"} />
        )}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-4xl font-semibold text-white">{post.title}</h1>
        <UserAvatar
          userId={post.author.id}
          avatarUrl={post.author.avatar}
          username={post.author.userName}
        />
      </div>
      <p className="text-gray-300 mb-4">{post.description}</p>
      <div className="mt-6">
  <h2 className="text-2xl font-semibold text-white mb-2">Templates</h2>
  <ul>
    {post.templates.map((template) => (
      <li key={template.id} className="mb-2">
        <Link href={`/ViewTemplate/${template.id}`}>
          <div className="p-3 border border-gray-500 rounded-lg bg-gray-900 text-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-300">
            {template.title}
          </div>
        </Link>
      </li>
    ))}
  </ul>
</div>

    
    <div className="flex items-center space-x-6 text-sm text-gray-400 mb-4">
        <RatingForm
          upvoteCount={upvoteTotal}
          downvoteCount={downvoteTotal}
          userVote={userVote}
          onVoteChange={handleVote}
        />
        <div className="flex flex-wrap mt-2">
          {post.tags.map((tag) => (
            <span
              key={tag.id}
              className="tag flex items-center inline-block px-4 py-2 mr-1 mb-1 text-sm font-medium bg-gray-700 text-gray-300 rounded-full"
            >
              {tag.name}
              <button
                type="button"
                onClick={() => router.push({ pathname: '/blog', query: { tag: tag.name } })}
                >
                <XMarkIcon className="h-4 w-4 ml-1 text-gray-500 hover:text-red-500 transition" />
              </button>
            </span>
          ))}
        </div>
      </div>
      <div className='flex space-x-4 mt-4'>
        <p className="text-md text-gray-300">Created At: {formattedDate(post.createdAt)}</p>
        <p className="text-md text-gray-300">Updated At: {formattedDate(post.updatedAt)}</p>
      </div>
      
    
      <div className="flex space-x-6 mt-4">
        <button
          onClick={handleOpenReportForm}
          className="flex items-center text-md font-medium text-gray-500 hover:text-gray-200"
        >
          <FlagIcon className="h-7 w-7 mr-2" />
          Report Post
        </button>
        <button
          onClick={handleOpenCommentForm}
          className="flex items-center text-md font-medium text-gray-500 hover:text-gray-200"
        >
          <ChatBubbleLeftEllipsisIcon className="h-7 w-7 mr-2" />
          Comment
        </button>
      </div>
    
      {showReportForm && (
        <ReportForm targetId={post.id} targetType="post" onClose={handleCloseReportForm} />
      )}
    
      {showCommentForm && (
        <CommentForm postId={post.id} onClose={handleCloseCommentForm} onSubmit={handleCommentSubmit} />
      )}
    
      {commentData.comments.length === 0 ? (
        <NoComments />
      ) : (
        commentData.comments.map((comment) => (
          <CommentCard
            key={comment.id}
            commentId={comment.id}
            parentId={comment.parentId}
            blogPostId={post.id}
            content={comment.content}
            authorId={comment.author.id}
            authorUsername={comment.author.userName}
            authorAvatarUrl={comment.author.avatar}
            createdAt={comment.createdAt}
            upvoteCount={comment.upvoteCount}
            downvoteCount={comment.downvoteCount}
            indentLevel={0}
            isHidden={comment.isHidden}
            hiddenReason={comment.hiddenReason}
          />
        ))
      )}
    
      {commentData.comments.length > 0 && (
        <div className='flex justify-center'>
          <Pagination
          currentPage={router.query.page ? parseInt(router.query.page as string) : 1}
          totalPages={Math.ceil(commentData.commentCount / (router.query.limit ? parseInt(router.query.limit as string) : COMMENT_LIMIT))}
          onPageChange={(page: number) => router.push({ pathname: `/blog/${id}`, query: { ...router.query, page } })}
        />
        </div>
        
      )}
    </div>
    

    );
};


export default BlogPostDetail;

{/* TODO
change to trash can and edit pencil if is hidden then disable edit
{userId === post.author.id && (
  <EllipsisDropdownButton onUpdate={handleUpdate} onDelete={handleDelete} />
)}
*/}

    
   
   

