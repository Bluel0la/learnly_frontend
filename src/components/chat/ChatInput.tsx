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
      <div className="fixed bottom-0 inset-x-0 z-50 border-t border-gray-200 bg-white px-4 py-2 sm:px-6">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-2">
          {isEditMode && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 flex items-center justify-between">
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

          <div className="flex items-center border border-gray-300 rounded-full shadow-sm px-3 py-2 bg-white">
            <button
              type="button"
              onClick={() => setShowImageUpload(true)}
              className="mr-2 hover:bg-gray-100 rounded-full p-1 text-gray-500 hover:text-gray-700"
            >
              <Camera className="h-5 w-5" />
            </button>

            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                isEditMode ? "Edit your message..." :
                sessionId ? "Continue the conversation..." :
                "Message AI tutor..."
              }
              className="flex-1 bg-transparent outline-none text-sm placeholder-gray-400"
              disabled={isSubmitting}
            />

            <button
              type="submit"
              disabled={!message.trim() || isSubmitting}
              className={`ml-2 rounded-full p-2 transition ${
                message.trim() && !isSubmitting
                  ? 'bg-black text-white hover:bg-gray-900'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <div className="h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
              ) : (
                <ArrowUp className="h-5 w-5" />
              )}
            </button>
          </div>

          {!isEditMode && (
            <div className="flex justify-center space-x-2">
              <SmartIcon icon={<Plus className="h-4 w-4" />} />
              <SmartIcon icon={<Globe className="h-4 w-4" />} />
              <SmartIcon icon={<Lightbulb className="h-4 w-4" />} />
              <SmartIcon icon={<FileText className="h-4 w-4" />} onClick={() => handleSmartButton('summarize')} />
              <SmartIcon icon={<Calculator className="h-4 w-4" />} onClick={() => handleSmartButton('solve')} />
              <SmartIcon icon={<MessageSquare className="h-4 w-4" />} onClick={() => handleSmartButton('explain')} />
              <SmartIcon icon={<Mic className="h-4 w-4" />} />
              <SmartIcon icon={<MoreHorizontal className="h-4 w-4" />} />
            </div>
          )}

          <div className="text-xs text-center text-gray-500">
            Your AI tutor is here to help with explanations, not to provide answers for graded assignments.
          </div>
        </form>
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

const SmartIcon = ({
  icon,
  onClick,
}: {
  icon: React.ReactNode;
  onClick?: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="hover:bg-gray-100 rounded-full p-1 transition"
  >
    {icon}
  </button>
);

export default ChatInput;
