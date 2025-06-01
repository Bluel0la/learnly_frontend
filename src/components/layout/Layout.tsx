
import React from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  if (isAuthPage) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 z-50 bg-white">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <Navbar />
            </div>
          </header>
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
         { /*<Footer />*/}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
