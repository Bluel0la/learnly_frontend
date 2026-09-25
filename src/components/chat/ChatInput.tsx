
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, ArrowUp, X, ImagePlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { chatApi } from '@/services/api';
import ImageUpload from './ImageUpload';

const ChatInput = () => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const { toast } = useToast();
  const params = useParams();
  const navigate = useNavigate();
  const sessionId = params.sessionId;
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  // Listen for edit events from MessageActions
  useEffect(() => {
    const handleEditMessage = (event: CustomEvent) => {
      const { messageId, originalPrompt } = event.detail;
      setMessage(originalPrompt);
    };

    window.addEventListener('editMessage', handleEditMessage as EventListener);
    
    return () => {
      window.removeEventListener('editMessage', handleEditMessage as EventListener);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void submitMessage();
    }
  };

  type BridgeMessage = {
    id: string;
    type: 'user' | 'ai';
    content: string;
    timestamp: Date;
    originalPrompt?: string;
  };

  const pushChatMessage = (msg: BridgeMessage) => {
    const w = window as unknown as { addChatMessage?: (m: BridgeMessage) => void };
    w.addChatMessage?.(msg);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitMessage();
  };

  const submitMessage = async () => {
    // Combine extracted text with user message if both exist
    const finalMessage = extractedText 
      ? (message.trim() ? `${extractedText}\n\n${message}` : extractedText)
      : message;
    
    if (finalMessage.trim() && !isSubmitting) {
      setIsSubmitting(true);
      
      try {
        if (!sessionId) {
          // Start a new chat session
          const newSession = await chatApi.startSession({
            chat_title: finalMessage.length > 20 ? `${finalMessage.substring(0, 20)}...` : finalMessage
          });
          
          // Add user message immediately
          pushChatMessage({
            id: `temp-user-${Date.now()}`,
            type: 'user',
            content: finalMessage,
            timestamp: new Date()
          });

          // Send the message and get response
          const response = await chatApi.sendMessage({
            prompt: finalMessage,
            chat_id: newSession.chat_id
          });

          // Add AI response immediately
          pushChatMessage({
            id: `temp-ai-${Date.now()}`,
            type: 'ai',
            content: response.response,
            timestamp: new Date(),
            originalPrompt: finalMessage
          });
          
          // Navigate to the new chat session
          navigate(`/chat/${newSession.chat_id}`);
          toast({
            title: "New chat started",
            description: "Your message has been sent"
          });
        } else {
          // Add user message immediately to existing chat
          pushChatMessage({
            id: `temp-user-${Date.now()}`,
            type: 'user',
            content: finalMessage,
            timestamp: new Date()
          });

          // Send message and get response
          const response = await chatApi.sendMessage({
            prompt: finalMessage,
            chat_id: sessionId
          });

          // Add AI response immediately
          pushChatMessage({
            id: `temp-ai-${Date.now()}`,
            type: 'ai',
            content: response.response,
            timestamp: new Date(),
            originalPrompt: finalMessage
          });
        }
        
        setMessage('');
        setExtractedText('');
      } catch (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive"
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleTextExtracted = (extractedTextResult: string) => {
    setExtractedText(extractedTextResult);
    toast({
      title: "Text extracted successfully",
      description: "Add your follow-up question in the input box below."
    });
  };

  const clearExtractedText = () => {
    setExtractedText('');
  };

  return (
    <div className="sticky bottom-0 px-4 pb-4 pt-2 bg-gradient-to-t from-[#051424] via-[#051424] to-transparent">
      <div className="max-w-3xl mx-auto">
        {/* Extracted Text Display */}
        {extractedText && (
          <div className="mb-3 p-3 bg-luminous-primary-container/10 border border-luminous-primary/30 rounded-2xl relative">
            <button
              onClick={clearExtractedText}
              aria-label="Clear extracted text"
              className="absolute top-2 right-2 text-slate-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
            <p className="text-xs text-luminous-primary font-semibold mb-1 font-luminous-mono uppercase tracking-wider">Extracted text</p>
            <p className="text-sm text-slate-200 pr-6 line-clamp-4">{extractedText}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="luminous-composer rounded-3xl p-3 md:p-4 shadow-2xl">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={extractedText ? "Add your follow-up question..." : "Ask anything, paste lecture notes, or drop a topic..."}
              disabled={isSubmitting}
              className="w-full px-2 pt-1 pb-2 text-slate-100 text-[15px] md:text-base leading-relaxed resize-none focus:outline-none"
              style={{
                minHeight: '52px',
                maxHeight: '200px',
                overflowY: 'auto'
              }}
              rows={2}
            />

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowImageUpload(true)}
                  title="Upload an image of the problem"
                  className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center"
                >
                  <Plus size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowImageUpload(true)}
                  title="Extract text from image"
                  className="hidden sm:flex items-center gap-1.5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <ImagePlus size={18} />
                </button>
              </div>

              <button
                type="submit"
                disabled={(!message.trim() && !extractedText) || isSubmitting}
                title="Send message"
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 ${
                  (message.trim() || extractedText) && !isSubmitting
                    ? 'bg-slate-100 text-[#051424] hover:opacity-90 active:scale-95 shadow-md'
                    : 'bg-white/10 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <div className="h-5 w-5 border-2 border-t-transparent border-current rounded-full animate-spin"></div>
                ) : (
                  <ArrowUp size={20} strokeWidth={2.5} />
                )}
              </button>
            </div>
          </div>

          {/* Helper Text */}
          <div className="mt-3 text-center text-xs text-slate-500 font-luminous-mono">
            Press <span className="text-slate-300 font-semibold">Enter</span> to send, <span className="text-slate-300 font-semibold">Shift + Enter</span> for new line
          </div>
        </form>

        {/* Image Upload Modal */}
        {showImageUpload && (
          <ImageUpload
            onTextExtracted={handleTextExtracted}
            onClose={() => setShowImageUpload(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ChatInput;
