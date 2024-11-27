// pages/blog/[id].tsx
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { jwtDecode } from 'jwt-decode';
import { ChatBubbleLeftEllipsisIcon, FlagIcon } from '@heroicons/react/24/outline';
import Pagination from "@/components/Pagination";
import UserAvatar from '@/components/blog/UserAvatar';
import ReportForm from '@/components/forms/ReportForm';
import CommentCard from '@/components/blog/CommentCard';
import NoComments from '@/components/errors/NoComments';
import RatingForm from '@/components/forms/RatingForm';
import CommentForm from '@/components/blog/CommentForm';
import EllipsisDropdownButton from "@/components/buttons/EllipsisDropdownButton";
import { COMMENT_LIMIT } from "@/constants";

const validSortOrders = ["asc", "desc"] as const;
const validSortByFields = ["createdAt", "updatedAt", "upvoteCount", "downvoteCount"] as const;

interface Author {
  id: number;
  userName: string;
  avatar: string;
  role: string;
};

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
} // TODO maybe add indent level?

// Type for the Comment API Response
interface CommentResponse {
  comments: Comment[]; // List of comments
  commentCount: number; // Total number of comments
}


const BlogPostDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(null);
  const [commentData, setCommentData] = useState<CommentResponse>({ comments: [], commentCount: 0 });
  const [upvoteTotal, setUpvoteTotal] = useState<number>(0);
  const [downvoteTotal, setDownvoteTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [showReportForm, setShowReportForm] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [sortBy, setSortBy] = useState<string>("upvoteCount");
  const [sortOrder, setSortOrder] = useState<string>("desc");
   
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

  const handleUpdate = () => {
    console.log("Update blog post logic here!");
  }; //TODO

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
              router.push(`/blog`);
              return;
            } else {
              throw new Error(`${retriedResponse.status}: ${retriedResponse.statusText}`);
            }
          } else {
            router.push('/login');
            return;
          }
        } else if (response.ok) {
          router.push(`/blog`);
          return;
        } else {
          throw new Error(`${response.status}: ${response.statusText}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      }
  };
};

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "sortBy") {
      setSortBy(value);
      router.push({
        pathname: `/blog`,
        query: { ...router.query, sortBy: value },
      });
    }
    if (name === "sortOrder") {
      setSortOrder(value);
      router.push({
        pathname: `/blog/${id}`,
        query: { ...router.query, sortOrder: value },
      });
    }
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

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        setIsLoading(true); // Start loading
        setError(""); // Reset error state
  
        try {
          if (!router.isReady) return; // Wait until the router is ready
          
          // Check if the user is logged in
          const token = localStorage.getItem("accessToken");
          if (token !== null) {
            try {
              const decodedToken = jwtDecode<{ id: number }>(token);
              setUserId(decodedToken.id); // Save the userId from the decoded token
            } catch (error) {
              throw new Error("Invalid access token");
            }
          }
          // Fetch multiple endpoints concurrently
          const [postResponse, voteResponse, commentsResponse] = await Promise.all([
            fetch(`/api/blog/${id}`, {cache: "no-store"}),  // Fetch blog post
            fetch(`/api/blog/${id}/userRated`, 
              {
                headers: { authorization: `Bearer ${token}` },
                cache: "no-store",
              }
            ), // Fetch the user's vote
            fetch(`/api/blog/${id}/comments?page=${router.query.page || 1}&limit=${router.query.limit || COMMENT_LIMIT}&sortBy=${router.query.sortBy || "upvoteCount"}&sortOrder=${router.query.sortOrder || "desc"}&countComments=true`,
              {
                headers: { authorization: `Bearer ${token}` },
                cache: "no-store",
              }
            ), // Fetch comments
          ]); 
          // TODO may have to handle token more gracefully
          

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
            setUserVote(voteData.hasRated ? 
                      voteData.isUpvote ? "upvote" : "downvote" 
                      : null);
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
        } finally {
          setIsLoading(false); // Stop loading
        }
      };
      fetchData();
    }
  }, [router.isReady, router.query, id]);

  // If loading, show a spinner or placeholder
  if (isLoading) {
    return <p>Loading...</p>;
  }

  // If there was an error, show an error message
  if (error) {
    alert(`Error ${error}`);
    setError(""); // Reset error state
  }

  if (!post) {
    return <p>Post not found</p>;
  }

  if (post.isHidden && (!userId || userId !== post.author.id)) {
    // TODO add a flag for hiding
  }

  const dateFormat = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    timeZoneName: "short",
  });
  const createdDate = dateFormat.format(new Date(post.createdAt));
  const updatedDate = dateFormat.format(new Date(post.updatedAt));

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
        response = await fetch(`/api/blog/${id}/rate`, {
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
        response = await fetch(`/api/blog/${id}/rate`, {
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
          router.push(`/blog/${id}`);
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

  return (
    <div className="blog-post-detail">
      <div className="flex items-center justify-between">
        <h1>{post.title}</h1>
        {userId === post.author.id && 
        <EllipsisDropdownButton onUpdate={handleUpdate} onDelete={handleDelete} />}
      </div>
      <UserAvatar
        userId={post.author.id}
        avatarUrl={post.author.avatar}
        username={post.author.userName}
      />
  
      <p>{post.description}</p>
      
      <div className="text-sm font-medium">
        <p>Author: {post.author.userName}</p>
        <p>Upvotes: {post.upvoteCount}</p>
        <p>Downvotes: {post.downvoteCount}</p>
      </div>
  
      <RatingForm upvoteCount={upvoteTotal} downvoteCount={downvoteTotal} userVote={userVote} onVoteChange={handleVote} />
  
      <div className="mt-4">
        <p>Created At: {createdDate}</p>
        <p>Updated At: {updatedDate}</p>
      </div>
  
      <div className="mt-6">
        <h2 className="text-lg font-semibold">Tags:</h2>
        <ul>
          {post.tags.map((tag) => (
            <li key={tag.id}>{tag.name}</li>
          ))}
        </ul>
      </div>
  
      <div className="mt-6">
        <h2 className="text-lg font-semibold">Templates:</h2>
        <ul>
          {post.templates.map((template) => (
            <li key={template.id}>
              <Link href={`/template/${template.id}`}> {/* TODO: Update with correct template link */}
                {template.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <button
           onClick={handleOpenReportForm}
           className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
         >
           <FlagIcon className="h-5 w-5 mr-2" />
         </button>
         <button
           onClick={handleOpenCommentForm}
           className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
         >
           <ChatBubbleLeftEllipsisIcon className="h-5 w-5 mr-2" />
         </button>
   
         {showReportForm && (
           <ReportForm
             targetId={post.id}
             targetType="post"
             onClose={handleCloseReportForm}
           />
         )}
         {showCommentForm && (
           <CommentForm postId={post.id} onClose={handleCloseCommentForm} onSubmit={handleCommentSubmit} />
         )}
         <div className="flex space-x-4 mb-4">
        <select
          name="sortBy"
          value={sortBy}
          onChange={handleSortChange}
          className="p-2 border rounded-md bg-white shadow text-gray-900"
        >
          <option disabled value="">
            Sort by
          </option>
          {validSortByFields.map((field) => (
            <option key={field} value={field}>
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </option>
          ))}
        </select>

        <select
          name="sortOrder"
          value={sortOrder}
          onChange={handleSortChange}
          className="p-2 border rounded-md bg-white shadow text-gray-900"
        >
          <option disabled value="">
            Order
          </option>
          {validSortOrders.map((order) => (
            <option key={order} value={order}>
              {order.toUpperCase()}
            </option>
          ))}
        </select>
      </div>
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
          />
        ))
      )} 
      <Pagination
        currentPage={router.query.page ? parseInt(router.query.page as string) : 1}
        totalPages={Math.ceil(commentData.commentCount / (router.query.limit ? parseInt(router.query.limit as string) : COMMENT_LIMIT))}
        onPageChange={(page: number) =>
          router.push({
            pathname: `/blog/${id}`,
            query: { ...router.query, page },
          })
        }
      />
      {/* TODO make a setter function which handles indent level by show replies button */}
      {/* TODO add a reply button under this template for comments */}
    </div>
  );  
};


export default BlogPostDetail;

{/*
// TODO add a flag for deleting
// TODO add a flag for editing
// TODO add a flag for creating
// TODO add a flag for upvoting
// TODO add a flag for downvoting
// TODO add a flag for hiding
// TODO add a flag for showing
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

   
 
   
    
   
   

