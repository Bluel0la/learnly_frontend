
import React from 'react';
import ChatMessages from '@/components/chat/ChatMessages';
import ChatInput from '@/components/chat/ChatInput';

type ChatPageProps = {
  sessionId?: string;
}

const ChatPage = ({ sessionId }: ChatPageProps) => {
  return (
    <div className="flex flex-col h-[calc(100vh-9rem)] sm:h-[calc(100vh-9rem)] md:h-[calc(100vh-8rem)] bg-background">
      <div className="flex-1 overflow-hidden">
        <ChatMessages sessionId={sessionId} />
      </div>
      <div className="mt-auto">
        <ChatInput />
      </div>
    </div>
  );
};

export default ChatPage;
