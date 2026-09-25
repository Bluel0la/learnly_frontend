import { apiGet, apiPost, apiRequest, apiUpload, ApiError } from '@/lib/apiClient';
import { API_BASE_URL, getAuthHeaders } from './apiConfig';

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

  // Stream a message: tokens arrive live via SSE, then a done payload.
  // Resolves with the done payload; rejects with ApiError on failure.
  sendMessageStream: async (
    data: SendMessageRequest,
    onToken: (token: string) => void,
  ): Promise<SendMessageResponse> => {
    const response = await fetch(`${API_BASE_URL}/chat/send-message-stream`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
      mode: 'cors',
    });

    if (!response.ok || !response.body) {
      const body = await response.json().catch(() => null);
      const detail =
        body && typeof body === 'object' && 'detail' in body && typeof body.detail === 'string'
          ? body.detail
          : response.statusText || 'Failed to send message';
      throw new ApiError(response.status, detail);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    const pump = async (): Promise<SendMessageResponse> => {
      const { done, value } = await reader.read();
      if (done) throw new ApiError(503, 'Stream ended before completion.');
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop() ?? '';
      for (const event of events) {
        const line = event.split('\n').find((l) => l.startsWith('data:'));
        if (!line) continue;
        let payload: { token?: string; done?: SendMessageResponse; error?: string };
        try {
          payload = JSON.parse(line.slice(5).trim());
        } catch {
          continue;
        }
        if (payload.token) onToken(payload.token);
        if (payload.error) throw new ApiError(503, payload.error);
        if (payload.done) return payload.done;
      }
      return pump();
    };

    try {
      return await pump();
    } finally {
      reader.cancel().catch(() => undefined);
    }
  },

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
