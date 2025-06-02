
import React from 'react';
import ChatMessages from '@/components/chat/ChatMessages';
import ChatInput from '@/components/chat/ChatInput';

type ChatPageProps = {
  sessionId?: string;
}

const ChatPage = ({ sessionId }: ChatPageProps) => {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-hidden pb-32">
        <ChatMessages sessionId={sessionId} />
      </div>
      <div className="sticky bottom-0 z-40">
        <ChatInput />
      </div>
    </div>
  );
};

export default ChatPage;
