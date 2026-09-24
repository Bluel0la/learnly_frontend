import { apiGet, apiPost, apiRequest, apiUpload } from '@/lib/apiClient';

// Chat related types
export interface ChatSession {
  chat_id: string;
  chat_title: string;
  created_at: string;
}

export interface ChatMessage {
  query: string;
  response: string;
  timestamp: string;
}

export interface StartSessionRequest {
  chat_title: string;
}

export interface SendMessageRequest {
  prompt: string;
  chat_id: string;
}

export interface SendMessageResponse {
  chat_id: string;
  query_id: string;
  response: string;
  task_type?: string;
}

// Image extraction types
export interface ExtractTextResponse {
  text: string;
}

// Chat API service
export const chatApi = {
  // Start a new chat session
  startSession: (data: StartSessionRequest): Promise<ChatSession> =>
    apiPost('/chat/start-session', data, 'Failed to start chat session'),

  // Send a message in a chat session
  sendMessage: (data: SendMessageRequest): Promise<SendMessageResponse> =>
    apiPost('/chat/send-message', data, 'Failed to send message'),

  // Get all messages in a chat session
  getSessionMessages: (chatId: string, skip = 0, limit = 50): Promise<ChatMessage[]> =>
    apiGet(`/chat/session/${chatId}?skip=${skip}&limit=${limit}`, 'Failed to fetch chat messages'),

  // Get all chat sessions for a user
  getSessions: (skip = 0, limit = 20): Promise<ChatSession[]> =>
    apiGet(`/chat/sessions?skip=${skip}&limit=${limit}`, 'Failed to fetch chat sessions'),

  // Delete a chat session
  deleteSession: (chatId: string): Promise<void> =>
    apiRequest(`/chat/delete-chat/${chatId}`, { method: 'DELETE' }, 'Failed to delete chat session'),

  // Extract text from image (vision transcription)
  extractText: (file: File): Promise<ExtractTextResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiUpload('/chat/extract-text/', formData, 'Failed to extract text from image');
  },
};
