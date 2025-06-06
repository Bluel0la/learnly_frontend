
import React, { useEffect, useState } from 'react';
import { Search, BookOpen, Calculator, FileText, MessageSquare, Library, HelpCircle, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  
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
      return <Calculator className="h-3 w-3 md:h-4 md:w-4 text-green-500" />;
    } else if (lowerTitle.includes('summary') || lowerTitle.includes('explain')) {
      return <FileText className="h-3 w-3 md:h-4 md:w-4 text-blue-500" />;
    } else if (lowerTitle.includes('flash') || lowerTitle.includes('card')) {
      return <BookOpen className="h-3 w-3 md:h-4 md:w-4 text-accent" />;
    } else {
      return <MessageSquare className="h-3 w-3 md:h-4 md:w-4 text-gray-500" />;
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

  const handleNewChat = () => {
    navigate('/chat');
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-3 md:p-4">
        <div className="flex items-center gap-2 px-1 py-1">
          <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          <span className="font-bold text-base md:text-lg">Learnly</span>
        </div>
        
        {/* New Chat Button */}
        <div className="px-1 mt-2">
          <SidebarMenuButton 
            onClick={handleNewChat}
            className="w-full justify-start gap-2 h-9 md:h-10 bg-primary/10 hover:bg-primary/20 text-primary font-medium text-sm"
          >
            <Plus className="h-3 w-3 md:h-4 md:w-4" />
            <span>New chat</span>
          </SidebarMenuButton>
        </div>

        <div className="px-1 mt-2">
          <SidebarInput
            type="text"
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-sm h-8 md:h-9"
          />
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-2 md:px-3">
        {/* Navigation Section */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/chat")} className="h-8 md:h-9 text-sm">
                  <Link to="/chat">
                    <MessageSquare className="h-4 w-4 md:h-5 md:w-5" />
                    <span>Chat</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/flashcards")} className="h-8 md:h-9 text-sm">
                  <Link to="/flashcards">
                    <BookOpen className="h-4 w-4 md:h-5 md:w-5" />
                    <span>Flashcards</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/quizzes")} className="h-8 md:h-9 text-sm">
                  <Link to="/quizzes">
                    <HelpCircle className="h-4 w-4 md:h-5 md:w-5" />
                    <span>Quizzes</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/resources")} className="h-8 md:h-9 text-sm">
                  <Link to="/resources">
                    <Library className="h-4 w-4 md:h-5 md:w-5" />
                    <span>Resources</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Recent Sessions Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs">Recent Sessions</SidebarGroupLabel>
          <SidebarGroupContent>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="h-4 w-4 border-2 border-t-transparent border-gray-500 rounded-full animate-spin"></div>
              </div>
            ) : (
              <SidebarMenu>
                {filteredSessions.map((session) => (
                  <SidebarMenuItem key={session.chat_id}>
                    <SidebarMenuButton asChild isActive={isSessionActive(session.chat_id)} className="h-auto py-2">
                      <Link to={`/chat/${session.chat_id}`}>
                        {getSessionIcon(session.chat_title)}
                        <div className="flex flex-col items-start overflow-hidden min-w-0 flex-1">
                          <span className="text-xs md:text-sm font-medium truncate w-full">{session.chat_title}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(session.created_at)}
                          </span>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                
                {filteredSessions.length === 0 && !isLoading && (
                  <div className="text-center p-3 text-muted-foreground text-xs">
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
