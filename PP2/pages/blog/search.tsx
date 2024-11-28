// pages/search.tsx
import React, { useState } from 'react';
import BlogPostCard from '@/components/blog/BlogPostCard';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch(`/api/blog/search?query=${query}`);
    const data = await response.json();
    setResults(data.posts);
  };

  return (
    <div className="search-page">
      <h1>Search Blog Posts</h1>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search by title, content, or tags"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      {results.map((post) => (
        <BlogPostCard
          key={post.id}
          title={post.title}
          content={post.content}
          authorUsername={post.author.userName}
          authorAvatar={post.author.avatar}
        />
      ))}
    </div>
  );
};

export default Search;