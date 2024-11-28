// pages/edit/[id].tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const EditBlogPost = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('');

  useEffect(() => {
    // Fetch blog post data by id when component mounts
    if (id) {
      const fetchPost = async () => {
        const response = await fetch(`/api/blog/${id}`);
        const data = await response.json();
        setTitle(data.title);
        setDescription(data.description);
        setTag(data.tag);
      };
      fetchPost();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Send updated data to API for updating the blog post
    console.log({ id, title, description, tag });
  };

  return (
    <div className="edit-blog-post">
      <h1>Edit Blog Post</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Tag"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
        />
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default EditBlogPost;






import { useRouter } from "next/router";
import EditBlogPostForm from "@/components/EditBlogPostForm";

const EditBlogPage = ({ postData }) => {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return <EditBlogPostForm initialPostData={postData} />;
};

export async function getServerSideProps(context) {
  const { blogPostId } = context.params;

  // Fetch initial blog post data for pre-filling the form
  const post = await fetch(`https://your-backend-api-url/api/blog/${blogPostId}`).then((res) =>
    res.json()
  );

  if (!post) {
    return { notFound: true };
  }

  return { props: { postData: post } };
}

export default EditBlogPage;
