import React, { useEffect, useState } from 'react';
import {
  Search, BookOpen, Calculator, FileText, MessageSquare, Library,
  HelpCircle, Plus, Trash2, LogOut, User as UserIcon, PanelLeftClose, SquarePen,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChatSession, chatApi, authApi } from '@/services/api';
import { useUserProfile } from '@/hooks/useUserProfile';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarInput,
  useSidebar,
} from '@/components/ui/sidebar';
import DeleteChatDialog from '@/components/chat/DeleteChatDialog';

const NAV_ITEMS = [
  { path: '/chat', label: 'Chat', icon: MessageSquare },
  { path: '/flashcards', label: 'Flashcards', icon: BookOpen },
  { path: '/quizzes', label: 'Quizzes', icon: HelpCircle },
  { path: '/resources', label: 'Resources', icon: Library },
  { path: '/profile', label: 'Profile', icon: UserIcon },
];

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startOfToday.getTime() - startOfDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays <= 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

const AppSidebar = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleSidebar, state } = useSidebar();
  const { profile } = useUserProfile();
  const isCollapsed = state === 'collapsed';

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    sessionId: string;
    sessionTitle: string;
  }>({
    open: false,
    sessionId: '',
    sessionTitle: ''
  });

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setIsLoading(true);
        const userSessions = await chatApi.getSessions();
        setSessions(userSessions);
      } catch (error) {
        console.error('Error fetching sessions:', error);
        toast({
          title: "Error",
          description: "Failed to load chat sessions",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [toast]);

  // Refresh the list whenever the route changes (e.g. after sending a first message).
  useEffect(() => {
    chatApi.getSessions().then(setSessions).catch(() => undefined);
  }, [location.pathname]);

  const filteredSessions = sessions
    .filter(session =>
      searchQuery === '' ||
      session.chat_title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const getSessionIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('math') || lowerTitle.includes('calc') || lowerTitle.includes('equation')) {
      return <Calculator className="h-4 w-4 text-emerald-400 shrink-0" />;
    } else if (lowerTitle.includes('summary') || lowerTitle.includes('explain')) {
      return <FileText className="h-4 w-4 text-sky-400 shrink-0" />;
    } else if (lowerTitle.includes('flash') || lowerTitle.includes('card')) {
      return <BookOpen className="h-4 w-4 text-luminous-primary shrink-0" />;
    } else {
      return <MessageSquare className="h-4 w-4 text-slate-500 shrink-0" />;
    }
  };

  const isActive = (path: string) => {
    if (path === "/chat") {
      return location.pathname === "/chat" || location.pathname === "/";
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const isSessionActive = (id: string) => {
    return location.pathname === `/chat/${id}`;
  };

  const handleNewChat = () => {
    navigate('/chat');
  };

  const handleDeleteSession = (sessionId: string, sessionTitle: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteDialog({
      open: true,
      sessionId,
      sessionTitle
    });
  };

  const confirmDelete = async () => {
    try {
      await chatApi.deleteSession(deleteDialog.sessionId);
      setSessions(sessions.filter(session => session.chat_id !== deleteDialog.sessionId));

      // If we're currently viewing the deleted session, navigate to chat home
      if (location.pathname === `/chat/${deleteDialog.sessionId}`) {
        navigate('/chat');
      }

      toast({
        title: "Chat deleted",
        description: "The chat session has been deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: "Error",
        description: "Failed to delete chat session",
        variant: "destructive"
      });
    } finally {
      setDeleteDialog({ open: false, sessionId: '', sessionTitle: '' });
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authApi.logout();
      toast({ title: 'Signed out', description: 'See you soon!' });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const displayName = profile
    ? `${profile.first_name ?? profile.firstname ?? ''} ${profile.last_name ?? profile.lastname ?? ''}`.trim() || profile.email
    : '…';
  const initials = displayName
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || '?';

  const expandAndFocusSearch = () => {
    toggleSidebar();
    // Wait for the expand animation, then focus the search field.
    window.setTimeout(() => {
      document.getElementById('sidebar-search')?.focus();
    }, 250);
  };

  // Icon rail (collapsed state) — ChatGPT-style: logo, new chat, search,
  // nav icons, avatar + logout pinned to the bottom.
  if (isCollapsed) {
    const railBtn =
      'w-10 h-10 rounded-xl flex items-center justify-center transition-colors';
    const railIdle = 'text-slate-400 hover:text-white hover:bg-white/5';
    const railActive = 'text-luminous-primary bg-luminous-primary-container/20 border border-luminous-primary/30 luminous-shadow-glow-purple';
    return (
      <>
        <Sidebar collapsible="icon" className="luminous-sidebar border-r border-white/[0.07]">
          <SidebarContent className="flex flex-col items-center py-4 gap-1.5 overflow-hidden">
            <button
              onClick={toggleSidebar}
              title="Expand sidebar"
              className="w-10 h-10 rounded-xl bg-luminous-primary-container flex items-center justify-center text-white luminous-shadow-glow-purple hover:scale-105 transition-transform mb-3"
            >
              <BookOpen className="h-5 w-5" />
            </button>
            <button onClick={handleNewChat} title="New chat" className={`${railBtn} ${railIdle}`}>
              <SquarePen className="h-5 w-5" />
            </button>
            <button onClick={expandAndFocusSearch} title="Search sessions" className={`${railBtn} ${railIdle}`}>
              <Search className="h-5 w-5" />
            </button>
            <Link
              to="/chat"
              title="Chat"
              className={`${railBtn} ${location.pathname.startsWith('/chat') ? railActive : railIdle}`}
            >
              <MessageSquare className="h-5 w-5" />
            </Link>
            {NAV_ITEMS.filter((n) => n.path !== '/chat').map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                title={label}
                className={`${railBtn} ${isActive(path) ? railActive : railIdle}`}
              >
                <Icon className="h-5 w-5" />
              </Link>
            ))}
            <div className="flex-1" />
            <Link
              to="/profile"
              title={displayName || 'Profile'}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-luminous-primary-container to-luminous-secondary-container flex items-center justify-center text-midnight-950 text-xs font-bold mb-1 hover:scale-105 transition-transform"
            >
              {initials}
            </Link>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              title="Sign out"
              className={`${railBtn} ${railIdle} disabled:opacity-50`}
            >
              <LogOut className="h-5 w-5" />
            </button>
          </SidebarContent>
        </Sidebar>

        <DeleteChatDialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
          onConfirm={confirmDelete}
          chatTitle={deleteDialog.sessionTitle}
        />
      </>
    );
  }

  return (
    <>
      <Sidebar collapsible="icon" className="luminous-sidebar border-r border-white/[0.07]">
        <SidebarHeader className="p-3">
          <div className="h-12 px-1 flex items-center justify-between">
            <Link to="/chat" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-luminous-primary-container flex items-center justify-center text-white luminous-shadow-glow-purple group-hover:scale-105 transition-transform">
                <BookOpen className="h-4 w-4" />
              </div>
              <span className="font-display text-[17px] font-bold text-white tracking-tight">Learnly</span>
            </Link>
            <button
              onClick={toggleSidebar}
              title="Close sidebar"
              className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
            >
              <PanelLeftClose className="h-5 w-5" />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            className="mt-1 w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-white/10 hover:border-luminous-primary/40 bg-white/[0.03] hover:bg-white/[0.06] transition-all text-white group"
          >
            <span className="flex items-center gap-2.5 text-sm font-medium">
              <Plus className="h-[18px] w-[18px] text-luminous-primary group-hover:rotate-90 transition-transform" />
              <span>New chat</span>
            </span>
            <span className="luminous-kbd">⌘K</span>
          </button>

          <div className="mt-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <SidebarInput
              id="sidebar-search"
              type="text"
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-sm h-9 bg-white/[0.03] border-white/10 text-slate-200 placeholder:text-slate-500 focus:border-luminous-primary-container/60"
            />
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2 luminous-scroll">
          {/* Navigation Section */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
                  <SidebarMenuItem key={path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(path)}
                      className="luminous-nav-item h-9 text-sm rounded-xl"
                      data-active={isActive(path)}
                    >
                      <Link to={path}>
                        <Icon className={`h-5 w-5 ${isActive(path) ? 'text-luminous-primary' : ''}`} />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Recent Sessions Section */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-[11px] font-luminous-mono uppercase tracking-wider text-slate-500 font-bold">
              Recent Chats
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <div className="h-4 w-4 border-2 border-t-transparent border-slate-500 rounded-full animate-spin"></div>
                </div>
              ) : (
                <SidebarMenu>
                  {filteredSessions.map((session) => (
                    <SidebarMenuItem key={session.chat_id}>
                      <div className="group relative">
                        <SidebarMenuButton
                          asChild
                          isActive={isSessionActive(session.chat_id)}
                          className="luminous-nav-item h-auto py-2 pr-8 rounded-lg"
                          data-active={isSessionActive(session.chat_id)}
                        >
                          <Link to={`/chat/${session.chat_id}`}>
                            {getSessionIcon(session.chat_title)}
                            <div className="flex flex-col items-start overflow-hidden min-w-0 flex-1">
                              <span className="text-sm font-medium truncate w-full">{session.chat_title}</span>
                              <span className="text-[11px] text-slate-500">
                                {formatDate(session.created_at)}
                              </span>
                            </div>
                          </Link>
                        </SidebarMenuButton>
                        <button
                          onClick={(e) => handleDeleteSession(session.chat_id, session.chat_title, e)}
                          title="Delete chat"
                          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1 hover:bg-rose-500/10 rounded"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                        </button>
                      </div>
                    </SidebarMenuItem>
                  ))}

                  {filteredSessions.length === 0 && !isLoading && (
                    <div className="text-center p-3 text-slate-500 text-xs">
                      {searchQuery ? 'No matching sessions' : 'No chat sessions yet'}
                    </div>
                  )}
                </SidebarMenu>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-3 border-t border-white/[0.07]">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-white/[0.04] transition-colors">
            <Link to="/profile" className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-luminous-primary-container to-luminous-secondary-container flex items-center justify-center text-midnight-950 text-xs font-bold shrink-0">
                {initials}
              </div>
              <span className="text-sm font-medium text-slate-200 truncate leading-tight">{displayName}</span>
            </Link>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              title="Sign out"
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-300 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <DeleteChatDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
        onConfirm={confirmDelete}
        chatTitle={deleteDialog.sessionTitle}
      />
    </>
  );
};

export default AppSidebar;
