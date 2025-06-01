
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FileText, Calculator, MessageSquare, Bookmark, Send, Mic,
  Globe, Plus, ArrowUp, Lightbulb, MoreHorizontal, Camera, X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { chatApi } from '@/services/api';
import ImageUpload from './ImageUpload';

const ChatInput = () => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const { toast } = useToast();
  const params = useParams();
  const navigate = useNavigate();
  const sessionId = params.sessionId;

  useEffect(() => {
    const handleEditMessage = (event: CustomEvent) => {
      const { messageId, originalPrompt } = event.detail;
      setMessage(originalPrompt);
      setIsEditMode(true);
      setEditingMessageId(messageId);
    };

    window.addEventListener('editMessage', handleEditMessage as EventListener);
    return () => {
      window.removeEventListener('editMessage', handleEditMessage as EventListener);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      if (!sessionId) {
        const newSession = await chatApi.startSession({
          chat_title: message.length > 20 ? `${message.substring(0, 20)}...` : message
        });

        await chatApi.sendMessage({
          prompt: message,
          chat_id: newSession.chat_id
        });

        navigate(`/chat/${newSession.chat_id}`);
        toast({
          title: "New chat started",
          description: "Your message has been sent"
        });
      } else {
        await chatApi.sendMessage({ prompt: message, chat_id: sessionId });
        window.location.reload(); // consider using state instead
      }

      setMessage('');
      setIsEditMode(false);
      setEditingMessageId(null);
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
  };

  const handleCancelEdit = () => {
    setMessage('');
    setIsEditMode(false);
    setEditingMessageId(null);
  };

  const handleSmartButton = (action: string) => {
    let actionMsg = '';
    switch (action) {
      case 'summarize':
        actionMsg = 'Please summarize this for me: ';
        break;
      case 'solve':
        actionMsg = 'Please solve this math problem: ';
        break;
      case 'explain':
        actionMsg = 'Can you explain this concept: ';
        break;
      case 'save':
        toast({ title: "Save feature", description: "This feature is coming soon" });
        return;
    }
    setMessage(prev => `${actionMsg}${prev}`);
  };

  const handleTextExtracted = (text: string) => {
    setExtractedText(text);
    toast({
      title: "Text extracted successfully",
      description: "The text from your image has been added above the input box."
    });
  };

  const handleCloseExtractedText = () => setExtractedText('');

  return (
    <>
      <div className="w-full max-w-4xl mx-auto p-4 space-y-3">
        {isEditMode && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center justify-between">
            <span className="text-sm text-yellow-800">Editing message - make your changes and press send</span>
            <button type="button" onClick={handleCancelEdit} className="text-yellow-600 hover:text-yellow-800">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {extractedText && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 relative">
            <button
              type="button"
              onClick={handleCloseExtractedText}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="pr-8">
              <p className="text-sm font-medium text-blue-800 mb-1">Extracted Text:</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap max-h-32 overflow-y-auto">
                {extractedText}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex items-center bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow focus-within:shadow-md focus-within:border-gray-300">
            <button
              type="button"
              onClick={() => setShowImageUpload(true)}
              className="flex-shrink-0 ml-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Camera className="h-5 w-5 text-gray-500" />
            </button>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                isEditMode ? "Edit your message..." :
                sessionId ? "Continue the conversation..." :
                "Message Learnly..."
              }
              className="flex-1 resize-none bg-transparent py-4 px-3 text-sm placeholder-gray-500 border-none outline-none max-h-32 min-h-[24px]"
              disabled={isSubmitting}
              rows={1}
              style={{ lineHeight: '1.5' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />

            <button
              type="submit"
              disabled={!message.trim() || isSubmitting}
              className={`flex-shrink-0 mr-3 p-2 rounded-lg transition-colors ${
                message.trim() && !isSubmitting
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <div className="h-5 w-5 border-2 border-t-transparent border-current rounded-full animate-spin" />
              ) : (
                <ArrowUp className="h-5 w-5" />
              )}
            </button>
          </div>
        </form>

        <div className="text-xs text-center text-gray-500 mt-2">
          Your AI tutor is here to help with explanations, not to provide answers for graded assignments.
        </div>
      </div>

      {showImageUpload && (
        <ImageUpload
          onTextExtracted={handleTextExtracted}
          onClose={() => setShowImageUpload(false)}
        />
      )}
    </>
  );
};

export default ChatInput;
