import React, { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage, chatApi } from '@/services/api';
import MessageActions from './MessageActions';
import LaTeXRenderer from './LaTeXRenderer';

type MessageType = 'user' | 'ai';

type UIMessage = {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  originalPrompt?: string; // For redo functionality
};

interface ChatMessagesProps {
  sessionId?: string;
}

const TYPING_PROMPTS = [
  "What is photosynthesis?",
  "Explain the water cycle",
  "How do I solve quadratic equations?",
  "What caused the Great Depression?",
  "Explain Newton's laws of motion",
  "What is the difference between metaphor and simile?",
  "How do I write a research paper?",
  "What is the structure of a protein?",
  "Explain the scientific method",
  "How does the electoral college work?"
];

const TypingAnimation = () => {
  const [displayText, setDisplayText] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(80);
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      const currentText = TYPING_PROMPTS[currentPrompt];
      
      if (!isDeleting) {
        setDisplayText(currentText.substring(0, displayText.length + 1));
        
        if (displayText.length === currentText.length) {
          setIsDeleting(true);
          setTypingSpeed(100);
          setTimeout(() => {
            setTypingSpeed(50);
          }, 1500);
        }
      } else {
        setDisplayText(currentText.substring(0, displayText.length - 1));
        
        if (displayText.length === 0) {
          setIsDeleting(false);
          setCurrentPrompt((currentPrompt + 1) % TYPING_PROMPTS.length);
          setTypingSpeed(80);
        }
      }
    }, typingSpeed);
    
    return () => clearTimeout(timeout);
  }, [displayText, currentPrompt, isDeleting, typingSpeed]);
  
  return (
    <div className="relative">
      <span className="text-lg text-gray-700">{displayText}</span>
      <span className="ml-1 animate-pulse">|</span>
    </div>
  );
};

const ChatMessages = ({ sessionId: propSessionId }: ChatMessagesProps) => {
  const params = useParams();
  const sessionId = propSessionId || params.sessionId;
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Load messages based on sessionId
  useEffect(() => {
    if (sessionId) {
      setIsLoading(true);
      
      chatApi.getSessionMessages(sessionId)
        .then((chatMessages) => {
          const formattedMessages = chatMessages.flatMap((message, index) => {
            const userMessage: UIMessage = {
              id: `${index}a`,
              type: 'user',
              content: message.query,
              timestamp: new Date(message.timestamp)
            };
            
            const aiMessage: UIMessage = {
              id: `${index}b`,
              type: 'ai',
              content: message.response,
              timestamp: new Date(message.timestamp),
              originalPrompt: message.query // Store original prompt for redo
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
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      // If no sessionId, start with empty chat
      setMessages([]);
    }
  }, [sessionId, toast]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      
      // Refresh the page to show the updated conversation
      window.location.reload();
      
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
    // Create a custom event to trigger edit mode in ChatInput
    const editEvent = new CustomEvent('editMessage', {
      detail: { messageId, originalPrompt }
    });
    window.dispatchEvent(editEvent);
  };

  // Function to detect if content contains LaTeX
  const hasLaTeX = (content: string) => {
    return /\$\$[\s\S]*?\$\$|\$[^$\n]+?\$/.test(content);
  };

  return (
    <ScrollArea className="h-full">
      <div className="py-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-gray-500">Loading conversation...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p className="text-lg font-semibold mb-4">Start a new conversation</p>
              <div className="mb-4">
                <TypingAnimation />
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex flex-col">
                <div className={getMessageClassName(message)}>
                  <div className="mb-1 flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {message.type === 'user' ? 'You' : 'AI Assistant'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  <div className="whitespace-pre-line">
                    {hasLaTeX(message.content) ? (
                      <LaTeXRenderer content={message.content} />
                    ) : (
                      message.content
                    )}
                  </div>
                  {message.type === 'ai' && (
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
  );
};

export default ChatMessages;
