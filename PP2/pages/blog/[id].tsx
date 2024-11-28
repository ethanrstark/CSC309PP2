// pages/blog/[id].tsx

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode';
import { ChatBubbleLeftEllipsisIcon, FlagIcon } from '@heroicons/react/24/outline';

import Pagination from '@/components/Pagination';
import UserAvatar from '@/components/blog/BlogAvatar';
import ReportForm from '@/components/forms/ReportForm';
import CommentCard from '@/components/blog/CommentCard';
import NoComments from '@/components/errors/NoComments';
import NoBlogPosts from '@/components/errors/NoBlogPosts';
import RatingForm from '@/components/forms/RatingForm';
import CommentForm from '@/components/forms/CommentForm';
import EllipsisDropdownButton from '@/components/buttons/EllipsisDropdownButton';

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
            headers: { authorization: `Bearer ${localStorage.getItem('refreshToken')}` },
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
          headers: { authorization: `Bearer ${localStorage.getItem('refreshToken')}` },
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
          fetch(`/api/blog/${id}`),
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
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-semibold text-white">{post.title}</h1>
        {userId === post.author.id && (
          <EllipsisDropdownButton onUpdate={handleUpdate} onDelete={handleDelete} />
        )}
      </div>
    
      <div className="flex items-center mb-4">
        <UserAvatar
          userId={post.author.id}
          avatarUrl={post.author.avatar}
          username={post.author.userName}
        />
        <div className="ml-4 text-sm text-gray-400">
          <p className="font-medium text-gray-300">Author: {post.author.userName}</p>
          <p className="text-gray-500">Created At: {formattedDate(post.createdAt)}</p>
          <p className="text-gray-500">Updated At: {formattedDate(post.updatedAt)}</p>
        </div>
      </div>
    
      <p className="text-gray-300 mb-4">{post.description}</p>
    
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
              className="tag inline-block px-3 py-1 mr-2 mb-2 text-xs font-medium bg-gray-700 text-gray-300 rounded-full"
            >
              {tag.name}
            </span>
          ))}
        </div>
      </div>
    
      <div className="mt-4">
        <h2 className="text-lg font-semibold text-white">Templates:</h2>
        <ul>
          {post.templates.map((template) => (
            <li key={template.id}>
              <Link href={`/ViewTemplate/${template.id}`}>
                <a className="text-sm text-gray-300 hover:text-gray-200">
                  {template.title}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    
      <div className="mt-4">
        <button
          onClick={handleOpenReportForm}
          className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <FlagIcon className="h-5 w-5 mr-2" />
          Report Post
        </button>
        <button
          onClick={handleOpenCommentForm}
          className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 ml-4"
        >
          <ChatBubbleLeftEllipsisIcon className="h-5 w-5 mr-2" />
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
        <Pagination
          currentPage={router.query.page ? parseInt(router.query.page as string) : 1}
          totalPages={Math.ceil(commentData.commentCount / (router.query.limit ? parseInt(router.query.limit as string) : COMMENT_LIMIT))}
          onPageChange={(page: number) => router.push({ pathname: `/blog/${id}`, query: { ...router.query, page } })}
        />
      )}
    </div>
    

    );
};


export default BlogPostDetail;

{/*
// TODO add a flag for deleting
// TODO add a flag for editing
// TODO add a flag for creating
// TODO add a flag for adding tags
// TODO add a flag for adding templates
// TODO if this post is hidden add a flag and disable the button for editing
*/}
{/** TODO should I indluce hidden and hidden reason for admins to see? */}

{/*
  
        <Pagination
          currentPage={data.pageNum}
          totalPages={Math.ceil(data.postCount / data.pageLimit)}
          onPageChange={(page) =>
            router.push({
              pathname: "/blog",
              query: { ...router.query, page },
            })
          }
        />
        */}
   {/* TODO: Create comment section with pagination and cards */}

   
 
   
    
   
   

