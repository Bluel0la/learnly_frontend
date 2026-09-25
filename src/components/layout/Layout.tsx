import React from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';
import Navbar from './Navbar';
import MobileNav from './MobileNav';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const isLandingPage = location.pathname === '/';

  // Render landing page without sidebar and navigation
  if (isLandingPage) {
    return <>{children}</>;
  }

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full luminous-shell">
        {/* shadcn Sidebar handles the mobile drawer (offcanvas) itself */}
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1 min-h-screen max-h-screen bg-[#051424]">
          <header className="flex h-14 md:h-16 shrink-0 items-center gap-2 px-3 md:px-4 luminous-topbar sticky top-0 z-10">
            <SidebarTrigger className="-ml-1 text-slate-400 hover:text-white hover:bg-white/5" />
            <div className="flex-1 min-w-0">
              <Navbar />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto pb-16 md:pb-0 luminous-scroll">
            <div className="h-full min-h-0">
              {children}
            </div>
          </main>
          {/* Show bottom nav only on mobile and authenticated pages */}
          <MobileNav />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
