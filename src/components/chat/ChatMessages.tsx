
import React, { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage, chatApi } from '@/services/api';
import MessageActions from './MessageActions';
import SecureLaTeXRenderer from './SecureLaTeXRenderer';
import RotatingText from '@/components/ui/rotating-text';
import { useTimeBasedGreeting } from '@/hooks/useTimeBasedGreeting';
import { useUserProfile } from '@/hooks/useUserProfile';

type MessageType = 'user' | 'ai';

type UIMessage = {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  originalPrompt?: string;
  /** Streaming in progress — renders a typing indicator. */
  pending?: boolean;
};

interface ChatMessagesProps {
  sessionId?: string;
  onNewMessage?: (message: UIMessage) => void;
}

const ChatMessages = ({ sessionId: propSessionId, onNewMessage }: ChatMessagesProps) => {
  const params = useParams();
  const sessionId = propSessionId || params.sessionId;
  const { toast } = useToast();
  const { greetings } = useTimeBasedGreeting();
  const { profile } = useUserProfile();
  
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Function to add new messages in real-time
  const addMessage = (newMessage: UIMessage) => {
    setMessages(prev => [...prev, newMessage]);
    onNewMessage?.(newMessage);
  };

  // Expose message helpers globally for ChatInput to use
  useEffect(() => {
    const w = window as unknown as {
      addChatMessage?: (m: UIMessage) => void;
      updateChatMessage?: (id: string, patch: Partial<UIMessage>) => void;
      removeChatMessage?: (id: string) => void;
    };
    w.addChatMessage = addMessage;
    w.updateChatMessage = (id, patch) =>
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    w.removeChatMessage = (id) => setMessages((prev) => prev.filter((m) => m.id !== id));
    return () => {
      delete w.addChatMessage;
      delete w.updateChatMessage;
      delete w.removeChatMessage;
    };
  }, []);
  
  // Load messages based on sessionId
  useEffect(() => {
    if (sessionId) {
      setIsLoading(true);

      chatApi.getSessionMessages(sessionId)
        .then((chatMessages) => {
          const formattedMessages = chatMessages.flatMap((message, index) => {
            const userMessage: UIMessage = {
              id: `${sessionId}-${index}a`,
              type: 'user',
              content: message.query,
              timestamp: new Date(message.timestamp)
            };
            
            const aiMessage: UIMessage = {
              id: `${sessionId}-${index}b`,
              type: 'ai',
              content: message.response,
              timestamp: new Date(message.timestamp),
              originalPrompt: message.query
            };
            
            return [userMessage, aiMessage];
          });

          setMessages(formattedMessages);
        })
        .catch((error) => {
          console.error('Error fetching chat messages:', error);
          toast({
            title: "Error",
            description: "Failed to load chat messages",
            variant: "destructive"
          });
          setMessages([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setMessages([]);
      setIsLoading(false);
    }
  }, [sessionId, toast]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const getMessageClassName = (message: UIMessage) => {
    return message.type === 'user' ? 'chat-message-user' : 'chat-message-ai';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "The message has been copied to your clipboard"
    });
  };

  const handleRedo = async (originalPrompt: string) => {
    if (!sessionId || !originalPrompt) return;
    
    try {
      await chatApi.sendMessage({
        prompt: originalPrompt,
        chat_id: sessionId
      });
      
      // Refresh messages instead of page reload
      const chatMessages = await chatApi.getSessionMessages(sessionId);
      const formattedMessages = chatMessages.flatMap((message, index) => {
        const userMessage: UIMessage = {
          id: `${sessionId}-${index}a`,
          type: 'user',
          content: message.query,
          timestamp: new Date(message.timestamp)
        };
        
        const aiMessage: UIMessage = {
          id: `${sessionId}-${index}b`,
          type: 'ai',
          content: message.response,
          timestamp: new Date(message.timestamp),
          originalPrompt: message.query
        };
        
        return [userMessage, aiMessage];
      });
      
      setMessages(formattedMessages);
      
      toast({
        title: "Message resent",
        description: "Your prompt has been resent to get a new response"
      });
    } catch (error) {
      console.error('Error resending message:', error);
      toast({
        title: "Error",
        description: "Failed to resend message",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (messageId: string, originalPrompt: string) => {
    const editEvent = new CustomEvent('editMessage', {
      detail: { messageId, originalPrompt }
    });
    window.dispatchEvent(editEvent);
  };

  const hasLaTeX = (content: string) => {
    return /\\begin\{aligned\}|\\text\{|\$\$[\s\S]*?\$\$|\$[^$\n]+?\$|\\rightarrow|\\leftarrow/.test(content);
  };

  const userName = profile?.first_name || profile?.firstname || 'there';

  return (
    <div className="flex flex-col h-full max-w-full">
      <ScrollArea className="flex-1 h-full">
        <div className="p-4 max-w-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-pulse text-slate-500">Loading conversation...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[55vh] px-4">
              <div className="w-full max-w-3xl flex flex-col items-center text-center">
                <div className="font-display text-3xl md:text-[44px] leading-tight font-bold text-slate-100 tracking-tight mb-2.5 flex flex-wrap items-center justify-center gap-x-3">
                  <RotatingText
                    texts={greetings}
                    rotationInterval={2500}
                    staggerDuration={0.05}
                    mainClassName="font-display text-3xl md:text-[44px] font-bold"
                    transition={{ type: "spring", damping: 20, stiffness: 200 }}
                    splitBy="words"
                  />
                  <span className="luminous-gradient-text font-bold">
                    {userName}
                  </span>
                </div>
                <p className="text-base md:text-lg text-slate-400 font-normal">
                  Ready to study something new today?
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex flex-col max-w-full">
                  <div className={`${getMessageClassName(message)} max-w-full word-wrap break-words`}>
                    <div className="mb-1 flex justify-between items-center">
                      <span className="text-xs text-slate-400">
                        {message.type === 'user' ? 'You' : 'AI Assistant'}
                      </span>
                      <span className="text-xs text-slate-600">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <div className="text-left max-w-full overflow-hidden">
                      {message.pending && !message.content ? (
                        <div className="flex items-center gap-1.5 py-2" aria-label="Learnly is thinking">
                          {[0, 1, 2].map((i) => (
                            <span
                              key={i}
                              className="w-2 h-2 rounded-full bg-luminous-primary animate-pulse"
                              style={{ animationDelay: `${i * 200}ms` }}
                            />
                          ))}
                        </div>
                      ) : hasLaTeX(message.content) ? (
                        <SecureLaTeXRenderer content={message.content} />
                      ) : (
                        <div className="whitespace-pre-line break-words max-w-full">
                          {message.content}
                        </div>
                      )}
                    </div>
                    {message.type === 'ai' && !message.pending && (
                      <MessageActions
                        content={message.content}
                        originalPrompt={message.originalPrompt || ''}
                        messageId={message.id}
                        onCopy={handleCopy}
                        onRedo={handleRedo}
                        onEdit={handleEdit}
                      />
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatMessages;
