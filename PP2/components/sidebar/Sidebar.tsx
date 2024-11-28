
import Link from 'next/link';

const Sidebar: React.FC = () => {


  return (
    <div className="flex">


        
        <nav
          className={`bg-gray-800 text-white min-h-screen p-6 fixed top-0 left-0 transition-width`}
        >

            <div className="mt-2">
                <Link href="/" className="block px-4 py-2 hover:bg-gray-700">
                    Home
                </Link>
                <Link href="/login" className="block px-4 py-2 hover:bg-gray-700">
                    Login
                </Link>
                <Link href="/my_templates" className="block px-4 py-2 hover:bg-gray-700">
                    My Templates
                </Link>
                <Link href="/templates_all" className="block px-4 py-2 hover:bg-gray-700">
                    All Templates
                </Link>
                <Link href="/editor" className="block px-4 py-2 hover:bg-gray-700">
                    Code Editor
                </Link>
                <Link href="/blog" className="block px-4 py-2 hover:bg-gray-700">
                    Blog Posts
                </Link>
            </div>
        </nav>
       
        
      
    </div>
  );
};

export default Sidebar;