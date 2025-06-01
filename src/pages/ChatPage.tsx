
import React from 'react';
import ChatMessages from '@/components/chat/ChatMessages';
import ChatInput from '@/components/chat/ChatInput';

type ChatPageProps = {
  sessionId?: string;
}

const ChatPage = ({ sessionId }: ChatPageProps) => {
  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 min-h-0 overflow-hidden">
        <ChatMessages sessionId={sessionId} />
      </div>
      <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-32">
        <ChatInput />
      </div>
    </div>
  );
};

export default ChatPage;
