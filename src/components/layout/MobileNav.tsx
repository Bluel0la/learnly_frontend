import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, BookOpen, HelpCircle, Library, User } from 'lucide-react';

const ITEMS = [
  { path: '/chat', label: 'Chat', icon: MessageSquare },
  { path: '/flashcards', label: 'Cards', icon: BookOpen },
  { path: '/quizzes', label: 'Quizzes', icon: HelpCircle },
  { path: '/resources', label: 'Resources', icon: Library },
  { path: '/profile', label: 'Profile', icon: User },
];

const MobileNav = () => {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 z-40 w-full md:hidden flex justify-evenly bg-[#010f1f]/95 backdrop-blur-md border-t border-white/[0.07] shadow-[0_-8px_24px_rgba(0,0,0,0.4)] pb-[env(safe-area-inset-bottom)]">
      {ITEMS.map(({ path, label, icon: Icon }) => {
        const active = path === '/chat' ? pathname === '/chat' || pathname === '/' : pathname.startsWith(path);
        return (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center gap-0.5 px-3 py-2.5 text-[11px] font-medium transition-colors ${
              active ? 'text-luminous-primary' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Icon className="w-6 h-6" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileNav;
