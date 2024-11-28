import "@/styles/globals.css";
import type { AppProps } from "next/app";
import 'monaco-editor/min/vs/editor/editor.main.css';
import { useState, useEffect } from 'react';
import Sidebar from './../components/sidebar/Sidebar';
import '@/styles/globals.css'; // Import your global styles here if needed

export default function App({ Component, pageProps }: AppProps) {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    if (accessToken && refreshToken) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <div className="flex h-screen w-screen bg-gray-900">
      <div
        className={`bg-gray-800 text-white w-64 min-h-screen p-6 fixed top-0 left-0 transition-transform duration-300 ${
          sidebarVisible ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar />
      </div>

      <main
        className={`transition-all duration-300 ${
          sidebarVisible ? 'ml-64' : 'ml-0'
        } flex-1 p-6`}
      >
        <button
          onClick={toggleSidebar}
          className="bg-gray-800 text-white p-2 mb-4"
        >
          {sidebarVisible ? '☰ Hide' : '☰ Show'}
        </button>
        <Component {...pageProps} />
      </main>
    </div>
  );
}
