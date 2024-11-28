import { useState,useEffect } from 'react';

import Link from 'next/link';
import SignOutButton from "@/components/SignOutButton";
const Sidebar: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn]=useState<boolean>(false)

    useEffect(() =>{
        const accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");
    
        if (accessToken && refreshToken) {
          setIsLoggedIn(true)
          //setUserAvatar()
      }},[])

        // Function to handle sign-out
  const handleSignOut = () => {
    setIsLoggedIn(false); // Update the state to false when signed out
  };

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

                {isLoggedIn && (
                <Link href="/edit_profile" className="block px-4 py-2 hover:bg-gray-700">
                Profile
                </Link>
                )}

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

                <Link href="/reports" className="block px-4 py-2 hover:bg-gray-700">
                    Reports
                </Link>

                {isLoggedIn && (
                
                    <SignOutButton onSignOut={handleSignOut}/> 
                
                    )}
            </div>
        </nav>
       
        
      
    </div>
  );
};

export default Sidebar;