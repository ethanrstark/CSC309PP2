// pages/blog/index.tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import BlogPostCard from "@/components/blog/BlogPostCard";
import Pagination from "@/components/Pagination";
import { BLOG_POST_LIMIT } from "@/constants";
import NoBlogPosts from "@/components/errors/NoBlogPosts";
import { validSortByFields, validSortOrders } from "@/constants";

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

const BlogPostList = () => {
  const router = useRouter();

  const [data, setData] = useState<BlogPostListResponse>({blogPosts: [], postCount: 0});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("upvoteCount");
  const [sortOrder, setSortOrder] = useState<string>("desc");

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "sortBy") {
      setSortBy(value);
      router.push({
        pathname: "/blog",
        query: { ...router.query, sortBy: value },
      });
    }
    if (name === "sortOrder") {
      setSortOrder(value);
      router.push({
        pathname: "/blog",
        query: { ...router.query, sortOrder: value },
      });
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {

      try {
        if (!router.isReady) return; // Wait until the router is ready
        const token = localStorage.getItem("accessToken");
        const response = 
        await fetch(
          `/api/blog?page=${router.query.page || 1}&limit=${router.query.limit || BLOG_POST_LIMIT}&sortBy=${router.query.sortBy || "upvoteCount"}&sortOrder=${router.query.sortOrder || "desc"}&countPosts=true`,
          {
            headers: { authorization: `Bearer ${token}` },
            cache: "no-store",
          }
        );

        if (response.ok) {
          const result = await response.json();
          setData(result); // Save data
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
  if (isLoading) {
    return <p>Loading...</p>;
  }

  // If there was an error, show an error message
  if (error) {
    alert(`Error ${error}`);
    setError("");
  }

  if (data.blogPosts.length === 0) {
    return <NoBlogPosts />;
  }

  // If there's data, render the blog posts
  return (
    <div className="blog-post-list">
      <h2>Blog Posts</h2>
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
            pathname: "/blog",
            query: { ...router.query, page },
          })
        }
      />
    </div>
  );
};

export default BlogPostList;
  