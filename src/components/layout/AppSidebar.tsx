
import React, { useEffect, useState } from 'react';
import { Search, BookOpen, Calculator, FileText, MessageSquare, Library, HelpCircle, User, Plus, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link, useLocation } from 'react-router-dom';
import { ChatSession, chatApi } from '@/services/api';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarInput,
} from '@/components/ui/sidebar';

const AppSidebar = () => {
  const { toast } = useToast();
  const location = useLocation();
  
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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

  const filteredSessions = sessions
    .filter(session => 
      searchQuery === '' || 
      session.chat_title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const getSessionIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('math') || lowerTitle.includes('calc') || lowerTitle.includes('equation')) {
      return <Calculator className="h-4 w-4 text-gray-500" />;
    } else if (lowerTitle.includes('summary') || lowerTitle.includes('explain')) {
      return <FileText className="h-4 w-4 text-gray-500" />;
    } else if (lowerTitle.includes('flash') || lowerTitle.includes('card')) {
      return <BookOpen className="h-4 w-4 text-gray-500" />;
    } else {
      return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const isActive = (path: string) => {
    if (path === "/chat") {
      return location.pathname === "/chat" || location.pathname === "/";
    }
    return location.pathname === path;
  };

  const isSessionActive = (id: string) => {
    return location.pathname === `/chat/${id}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const navigationItems = [
    { title: "Chat", url: "/chat", icon: MessageSquare },
    { title: "Flashcards", url: "/flashcards", icon: BookOpen },
    { title: "Quizzes", url: "/quizzes", icon: HelpCircle },
    { title: "Resources", url: "/resources", icon: Library },
    { title: "Profile", url: "/profile", icon: User },
  ];

  return (
    <Sidebar className="bg-gray-900">
      <SidebarHeader className="border-b border-gray-700 p-3">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-6 w-6 text-white" />
          <span className="font-semibold text-lg text-white">Learnly</span>
        </div>
        
        <Link
          to="/chat"
          className="flex items-center gap-2 w-full p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-white text-sm"
        >
          <Plus className="h-4 w-4" />
          <span>New chat</span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="bg-gray-900">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} className="text-gray-300 hover:bg-gray-800 data-[active=true]:bg-gray-700 data-[active=true]:text-white">
                    <Link to={item.url} className="flex items-center gap-3 px-3 py-2">
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="px-3 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-gray-600"
            />
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="h-5 w-5 border-2 border-t-transparent border-gray-500 rounded-full animate-spin"></div>
              </div>
            ) : (
              <SidebarMenu>
                {filteredSessions.map((session) => (
                  <SidebarMenuItem key={session.chat_id}>
                    <SidebarMenuButton asChild isActive={isSessionActive(session.chat_id)} className="text-gray-300 hover:bg-gray-800 data-[active=true]:bg-gray-700 data-[active=true]:text-white group">
                      <Link to={`/chat/${session.chat_id}`} className="flex items-center gap-3 px-3 py-2 relative">
                        {getSessionIcon(session.chat_title)}
                        <div className="flex-1 overflow-hidden">
                          <div className="text-sm font-medium truncate">{session.chat_title}</div>
                          <div className="text-xs text-gray-500">{formatDate(session.created_at)}</div>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                
                {filteredSessions.length === 0 && !isLoading && (
                  <div className="text-center p-4 text-gray-500 text-sm">
                    No chat sessions found
                  </div>
                )}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
