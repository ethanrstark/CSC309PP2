import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Select from 'react-select'; // To handle multi-select for tags
import { components } from 'react-select';
import { title } from 'process';
import { BLOG_POST_LIMIT } from '@/constants';
import BlogPostCard from '@/components/blog/BlogPostCard';
// Custom components for react-select to allow for tag creation
const customSingleValue = ({ data }: any) => <div>{data.label}</div>;

interface Author {
  id: number;
  userName: string;
  avatar: string;
}

interface Tag {
  id: number;
  name: string;
}

interface BlogPost {
  isHidden: boolean;
  hiddenReason: string | undefined;
  id: number;
  title: string;
  description: string;
  author: Author;
  createdAt: string;
  upvoteCount: number;
  downvoteCount: number;
  tags: Tag[];
}

interface CodeTemplate {
  id: number;
  title: string;
  explanation: string;
  code: string;
  updatedAt: string;
  user: { userName: string };
  tags: Tag[];
}

interface TemplateData {
  template: CodeTemplate;
  blogPosts: BlogPost[];

}
export default function SingleTemplate() {
  const router = useRouter();
  //Stores all the templates from db
  const [template, setTemplate] = useState<CodeTemplate|null>(null);
  //Whether there are templates or not
 const [noTemplate,setNoTemplate]=useState<boolean>(false)
 
  
  //Paginated blog posts
  const [blogPage, setblogPage] = useState<number>(1);
  const [totalBlogPages, setTotalBlogPages] = useState<number>(1);
  const [blogPosts,setBlogPosts]=useState<BlogPost[]>([])

  // Function to fetch code templates based on filters
  const fetchTemplate = async () => {
   
   let url = `/api/CodeTemplate/${router.query.id}`;

    try{
         const res = await fetch(url,
    
    {
        method: 'GET',
        cache: 'no-store', 
      }
 
   
);
console.log(res)
    

     const data = await res.json();
     console.log(data)
     //console.log(data.pagedTemplates.length)
     if (res.ok){
        //if(data.paged_templates && data.paged_templates.length>0){
       
        setTemplate(data)
        console.log(data.tags)
        setNoTemplate(false)
        //pagination for blog posts
        setTotalBlogPages(Math.ceil(data.blogPosts.length/BLOG_POST_LIMIT))
        const paginatedPosts=data.blogPosts.slice(BLOG_POST_LIMIT*(blogPage-1),BLOG_POST_LIMIT*blogPage)
        setBlogPosts(paginatedPosts)
   
    }else{
     setNoTemplate(true)
        
    }

     
     
       
    //console.log(templates)
    }catch(err:any){
        console.error(err)
    }
  
    
   
  };

  

  const handlePageChange = (newPage: number) => {
    setblogPage(newPage);
  };

    
  useEffect(() => {
    if (router.isReady) {
  
   console.log(router.query)
   fetchTemplate()
  
   }
     }, [router.isReady,blogPage,router.query.id]);
  

     if (noTemplate) {
      return (
        <div className="text-center p-4 text-white">
          <p className="text-lg text-gray-500">Template Not Found</p>
        </div>
      );
    }
  
    if (!template) {
      return (
        <div className="text-center p-4 text-white">
          <p className="text-lg text-gray-500">Loading...</p>
        </div>
      );
    }
  
    return (
      <div className="min-h-screen flex flex-col bg-gray-800 text-white">
        <link
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
  rel="stylesheet"
/>
        <div className="container mx-auto px-4 py-6 flex-grow">
          {/* Template Info Table */}
          <div className="mb-8 overflow-x-auto">
            <h1 className="text-3xl font-bold mb-4 sm:text-2xl md:text-3xl lg:text-4xl">Code Template Details</h1>
            <table className="min-w-full table-auto bg-gray-900 text-white">
              <thead>
                <tr className="text-left">
                  <th className="px-4 py-2">Title</th>
                  <th className="px-4 py-2">Description</th>
                  <th className="px-4 py-2">Owner</th>
                  <th className="px-4 py-2">Last Modified</th>
                  <th className="px-4 py-2">Tags</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-700">
                  <td className="px-4 py-2">{template.title}</td>
                  <td className="px-4 py-2">{template.explanation}</td>
                  <td className="px-4 py-2">{template.user.userName}</td>
                  <td className="px-4 py-2">{new Date(template.updatedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2">
                    {template.tags && template.tags.length > 0 ? (
                      template.tags.map((tag: any) => (
                        <span key={tag.id} className="bg-gray-600 text-gray-100 px-3 py-1 rounded-full text-sm">
                          {tag.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">No Tags</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button className="text-green-500 hover:text-green-700">
                      <i className="fas fa-play-circle"></i> {/* Use the play icon */}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
  
          <div className="blog-post-list">
      <h2>Blog Posts</h2>
      {blogPosts.length>0 ? (
        blogPosts.map((post) => (
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
          tags={post.tags && Array.isArray(post.tags) ? post.tags.map((tag) => tag.name) : []}
          isHidden={post.isHidden}
          hiddenReason={post.hiddenReason}
        />
      ))):(
        <span className="text-grey-500">No Tags</span>
      )}

  </div>
          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => handlePageChange(blogPage - 1)}
              disabled={blogPage === 1}
              className="bg-gray-600 text-gray-200 px-4 py-2 rounded-md hover:bg-gray-500 disabled:opacity-50"
            >
              Previous
            </button>
  
            <span className="text-gray-200">
              Page {blogPage} of {totalBlogPages}
            </span>
  
            <button
              onClick={() => handlePageChange(blogPage + 1)}
              disabled={blogPage === totalBlogPages}
              className="bg-gray-600 text-gray-200 px-4 py-2 rounded-md hover:bg-gray-500 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      
    );
}
