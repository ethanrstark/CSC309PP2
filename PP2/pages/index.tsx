import { useState } from 'react';
import Sidebar from './../components/sidebar/Sidebar';
import Image from 'next/image';
import logo from '../public/logo.jpg';

export default function Home() {
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <div className="flex h-screen bg-gray-900">

      <div
        className={`bg-gray-800 text-white w-64 min-h-screen p-6 fixed top-0 left-0 transition-all duration-400 ${
          sidebarVisible ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar />
      </div>


      <main
        className={`p-6 transition-all duration-400 ${
          sidebarVisible ? 'flex-1 ml-64' : 'flex-1 ml-0'
        }`}
      >
        <button
          onClick={toggleSidebar}
          className="bg-gray-800 text-white p-2 mb-4"
        >
          {sidebarVisible ? '☰' : '☰'}
        </button>
        <div className="justify-center text-center">
          <h1 className="text-2xl font-bold mb-4">Home Page</h1>
          <div className="flex flex-row justify-center items-center space-x-4">
            <h1>Welcome to Scriptorium!</h1>
            <Image src={logo} alt="Logo" className="h-12 w-12 rounded-lg"/>
          </div>

        </div>

      </main>


    </div>
  );
}