// pages/blog/index.tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import BlogPostCard from "@/components/blog/BlogPostCard";
import Pagination from "@/components/Pagination";
import NoBlogPosts from "@/components/errors/NoBlogPosts";
import { BLOG_POST_LIMIT } from "@/constants";

// Type for the Author
interface BlogPostAuthor {
    id: number;
    userName: string;
    avatar: string;
    role: string;
  }
  
  // Type for Tags
  interface BlogPostTag {
    id: number;
    name: string;
  }
  
  // Type for Code Templates
  interface BlogPostTemplate {
    id: number;
    title: string;
  }
  
  // Main BlogPost Type
  interface BlogPost {
    id: number;
    title: string;
    description: string;
    isHidden: boolean;
    hiddenReason?: string; // Optional as it can be null
    createdAt: string; // DateTime as an ISO string
    updatedAt: string; // DateTime as an ISO string
    upvoteCount: number;
    downvoteCount: number;
  
    // Relations
    author: BlogPostAuthor;
    tags: BlogPostTag[];
    templates: BlogPostTemplate[];
  }
  
  // Type for the API Response
  interface BlogPostListResponse {
    blogPosts: BlogPost[]; // List of blog posts
    postCount: number; // Total number of posts
  }

const UserBlogPostList = () => {
  const router = useRouter();
  const [data, setData] = useState<BlogPostListResponse>({blogPosts: [], postCount: 0});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchPosts = async () => {

      try {
        if (!router.isReady) return; // Wait until the router is ready
        const response = 
        await fetch(
          `/api/blog/user?page=${router.query.page || 1}&limit=${router.query.limit || BLOG_POST_LIMIT}&sortBy=${router.query.sortBy || "upvoteCount"}&sortOrder=${router.query.sortOrder || "desc"}&countPosts=true&userId=${router.query.userId}`,
          {
            cache: "no-store",
          }
        );

        if (response.ok) {
          const result = await response.json();
          setData(result); // Save data
          return;
        } else {
          throw new Error(`${response.status}: ${response.statusText}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false); // Stop loading
      }
    };

    fetchPosts();
  }, [router.isReady, router.query]);

  // If loading, show a spinner or placeholder
  if (isLoading ) {
    return <p>Loading...</p>;
  }

  // If there was an error, show an error message
  if (error) {
    alert(`Error ${error}`);
    setError(""); // Reset error state
  }

  if (data.blogPosts.length === 0) {
    return <NoBlogPosts />;
  }

  // If there's data, render the blog posts
  return (
    <div className="user-blog-post-list">
      <h2>Blog Posts</h2>
      {data.blogPosts.map((post) => (
        <BlogPostCard
          key={post.id}
          id={post.id}
          title={post.title}
          description={post.description}
          authorId={post.author.id}
          authorUsername={post.author.userName}
          authorAvatarUrl={post.author.avatar}
          createdAt={post.createdAt}
          upvoteCount={post.upvoteCount}
          downvoteCount={post.downvoteCount}
          tags={post.tags.map((tag) => tag.name)}
        />
      ))}

      <Pagination
        currentPage={router.query.page ? parseInt(router.query.page as string) : 1}
        totalPages={Math.ceil(data.postCount / (router.query.limit ? parseInt(router.query.limit as string) : BLOG_POST_LIMIT))}
        onPageChange={(page: number) =>
          router.push({
            pathname: `/user/blog/${router.query.userId}`,
            query: { ...router.query , page },
          })
        }
      />
    </div>
  );
};

export default UserBlogPostList;
