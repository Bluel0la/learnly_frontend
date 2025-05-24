
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

type LayoutProps = {
  children: React.ReactNode;
  requireAuth?: boolean;
};

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const isAuth = location.pathname === '/login' || location.pathname === '/signup';
  const [isMobileLayout, setIsMobileLayout] = React.useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileLayout(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Don't show sidebar and regular layout for auth pages
  if (isAuth) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {!isMobileLayout && <Sidebar />}
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
