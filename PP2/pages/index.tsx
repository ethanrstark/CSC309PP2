import { useRouter } from 'next/router';
import Image from 'next/image';
import logo from '../public/logo.jpg'; 

const Home = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      {/* Header Section */}
      <div className="flex flex-col items-center justify-center p-6">
        <h1 className="text-4xl font-bold mb-4">Home Page</h1>
        <div className="flex flex-row justify-center items-center space-x-4">
          <h2 className="text-xl">Welcome to Scriptorium!</h2>
          <Image src={logo} alt="Logo" className="h-12 w-12 rounded-lg" />
        </div>
      </div>

      {/* Card Section */}
      <div className="flex-grow flex flex-col items-center justify-center space-y-8 p-6">
        {/* Blog Post Card */}
        <div className="bg-gray-800 shadow-lg rounded-lg p-8 w-full max-w-2xl flex flex-col items-center">
          <h2 className="text-2xl font-semibold mb-4">Create a Blog Post</h2>
          <p className="text-center mb-6">
            Share your knowledge, ideas, or stories with the community by creating a new blog post.
          </p>
          <button
            onClick={() => router.push('/blog/create')}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
          >
            Create Blog Post
          </button>
        </div>

        {/* Code Template Card */}
        <div className="bg-gray-800 shadow-lg rounded-lg p-8 w-full max-w-2xl flex flex-col items-center">
          <h2 className="text-2xl font-semibold mb-4">Create a Code Template</h2>
          <p className="text-center mb-6">
            Contribute reusable code snippets or templates to help others with their projects.
          </p>
          <button
            onClick={() => router.push('/editor')}
            className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700"
          >
            Create Code Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
