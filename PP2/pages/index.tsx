import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);




  //Function to toggle the sidebar that contains nav
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };


  return (
    <div className="flex">
      {sidebarVisible && (
        <nav className="bg-[#585858] text-white w-64 min-h-screen p-6 fixed top-0 left-0">

          <div className="mt-2 ">

            <Link href="/login" className="block px-4 py-2 hover:bg-[#363636]">
              Login
            </Link>
            
            <Link href="/my_templates" className="block px-4 py-2 hover:bg-[#363636]">
              My Templates
            </Link>

            <Link href="/templates_all" className="block px-4 py-2 hover:bg-[#363636]">
              All Templates
            </Link>

            <Link href="/editor" className="block px-4 py-2 hover:bg-[#363636]">
              Code Editor
            </Link>
            {/* Add more links to other pages as needed */}
          </div>
          
        </nav>
      )}
      <main className={`p-6 w-full ${sidebarVisible ? 'ml-64' : ''}`}>
        <button
          onClick={toggleSidebar}
          className="bg-[#363636] text-white px-4 py-2 rounded-md focus:outline-none mb-4"
        >
          {sidebarVisible ? '☰' : '☰'}
        </button>
        <h1 className="text-2xl font-bold mb-4">Home Page</h1>
        <p>Welcome to the home page. Use the menu to navigate to other pages.</p>
      </main>
    </div>
  );
}