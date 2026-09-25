import React from 'react';
import { Link } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';

const Navbar = () => {
  const { profile } = useUserProfile();

  const displayName = profile
    ? `${profile.first_name ?? profile.firstname ?? ''} ${profile.last_name ?? profile.lastname ?? ''}`.trim() || profile.email
    : '';
  const initials = displayName
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || '?';

  return (
    <nav className="w-full flex items-center justify-between gap-2">
      <span className="font-display text-[15px] font-semibold text-slate-200 tracking-tight truncate">
        Learnly <span className="text-luminous-primary">AI</span>
      </span>
      <Link
        to="/profile"
        title={displayName || 'Profile'}
        className="flex items-center gap-2 rounded-xl px-1.5 py-1 hover:bg-white/5 transition-colors shrink-0"
      >
        <span className="hidden sm:block text-sm text-slate-400 max-w-[140px] truncate">{displayName}</span>
        <span className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-300">
          {initials}
        </span>
      </Link>
    </nav>
  );
};

export default Navbar;
