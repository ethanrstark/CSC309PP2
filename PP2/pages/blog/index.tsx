// pages/blog/index.tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import BlogPostCard from "@/components/blog/BlogPostCard";
import Pagination from "@/components/Pagination";
import { BLOG_POST_LIMIT } from "@/constants";
import NoBlogPosts from "@/components/errors/NoBlogPosts";
import { validSortByFields, validSortOrders } from "@/constants";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import SearchForm from "@/components/forms/SearchForm";

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
  const [showSearchForm, setShowSearchForm] = useState<boolean>(false);

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

  const fetchPosts = async () => {
    setIsLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Missing authorization token");
      }

      // Build base API endpoint
      let endpoint = `/api/blog`;
      const queryParams: Record<string, string> = {
        page: (router.query.page as string) || "1",
        limit: (router.query.limit as string) || BLOG_POST_LIMIT.toString(),
        sortBy: (router.query.sortBy as string) || "upvoteCount",
        sortOrder: (router.query.sortOrder as string) || "desc",
        countPosts: "true",
      };

      // Add search parameters if they exist
        queryParams.title = encodeURIComponent(router.query.title as string || "");
        queryParams.description = encodeURIComponent(router.query.description as string || "");
        queryParams.tags = encodeURIComponent(router.query.tags as string || "");
        queryParams.templates = encodeURIComponent(router.query.templates as string || "");

      // Construct full query string
      const queryString = Object.entries(queryParams)
        .map(([key, value]) => `${key}=${value}`)
        .join("&");

      const response = await fetch(`${endpoint}?${queryString}`, {
        headers: { authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!router.isReady) return; // Wait until the router is ready
    fetchPosts();
  }, [router.isReady, router.query]);

  const handleSearchSubmit = () => {
    // You can handle any additional logic here, like updating state or UI

    // Example: Set the page to the first page of the results after searching
    if (router.query.page !== "1") {
      router.push({
        pathname: "/blog",
        query: { ...router.query, page: "1" }, // Reset to first page after search
      });
    }

    // Optionally fetch data again based on search criteria
    fetchPosts();
  };

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
      <div className="flex items-center justify-between mb-4">
        <h2 className='text-4xl font-semibold'>Blog Posts</h2>
        <div className="flex items-center space-x-4 mr-4">
          <p className="text-xl">Sort Controls:</p>
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
      </div>
      {showSearchForm && <SearchForm handleSearchSubmit={handleSearchSubmit} onClose={() => setShowSearchForm(false)} />}
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
      isHidden={post.isHidden}
      hiddenReason={post.hiddenReason}
    />
  ))}

          <Pagination
        currentPage={router.query.page ? parseInt(router.query.page as string) : 1}
        totalPages={Math.ceil(data.postCount / BLOG_POST_LIMIT)}
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
  