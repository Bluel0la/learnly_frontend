
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, Mic, ArrowUp, X } from 'lucide-react';
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

  // Listen for edit events from MessageActions
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
          
          // Send the message in the new session
          await chatApi.sendMessage({
            prompt: finalMessage,
            chat_id: newSession.chat_id
          });
          
          // Navigate to the new chat session
          navigate(`/chat/${newSession.chat_id}`);
          toast({
            title: "New chat started",
            description: "Your message has been sent"
          });
        } else {
          // Send message in existing session
          await chatApi.sendMessage({
            prompt: finalMessage,
            chat_id: sessionId
          });
          
          // Refresh the page to show the updated conversation
          window.location.reload();
        }
        
        setMessage('');
        setExtractedText(''); // Clear extracted text after sending
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
    }
  };

  const handleTextExtracted = (extractedTextResult: string) => {
    setExtractedText(extractedTextResult);
    // Don't set it as message content - let user add their own follow-up
    toast({
      title: "Text extracted successfully",
      description: "Add your follow-up question in the input box below."
    });
  };

  const clearExtractedText = () => {
    setExtractedText('');
  };

  return (
    <div className="border-t bg-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Extracted Text Display */}
        {extractedText && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg relative">
            <button
              onClick={clearExtractedText}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <X size={16} />
            </button>
            <p className="text-sm text-blue-800 font-medium mb-1">Extracted Text:</p>
            <p className="text-sm text-gray-700 pr-6">{extractedText}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-2 p-3 rounded-full border shadow-sm bg-white">
            {/* Left Icons */}
            <div className="flex items-center gap-2 pl-2 pr-1">
              <button
                type="button"
                onClick={() => setShowImageUpload(true)}
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <Plus size={20} />
              </button>
            </div>

            {/* Input */}
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={extractedText ? "Add your follow-up question..." : "Ask anything"}
              className="flex-1 px-3 py-2 text-sm focus:outline-none bg-transparent"
              disabled={isSubmitting}
            />

            {/* Microphone */}
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 cursor-pointer mr-2"
            >
              <Mic size={20} />
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={(!message.trim() && !extractedText) || isSubmitting}
              className={`p-2 rounded-full transition ${
                (message.trim() || extractedText) && !isSubmitting
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <div className="h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
              ) : (
                <ArrowUp size={16} />
              )}
            </button>
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
