import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { authApi, type ProfileUpdateRequest } from '@/services/authApi';
import { chatApi } from '@/services/chatApi';
import { quizApi } from '@/services/quizApi';
import { flashcardApi } from '@/services/flashcardApi';
import { secureTokenStorage } from '@/services/secureTokenStorage';

/** React-query hooks for server state. Pages can adopt these incrementally. */

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.auth.profile,
    queryFn: () => authApi.getProfile(),
    enabled: secureTokenStorage.isAuthenticated(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProfileUpdateRequest) => authApi.updateProfile(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.auth.profile }),
  });
}

export function useChatSessions(skip = 0, limit = 20) {
  return useQuery({
    queryKey: [...queryKeys.chat.sessions, skip, limit],
    queryFn: () => chatApi.getSessions(skip, limit),
    enabled: secureTokenStorage.isAuthenticated(),
  });
}

export function useChatHistory(chatId: string | undefined, skip = 0, limit = 50) {
  return useQuery({
    queryKey: chatId ? [...queryKeys.chat.messages(chatId), skip, limit] : ['chat', 'messages', 'none'],
    queryFn: () => chatApi.getSessionMessages(chatId!, skip, limit),
    enabled: secureTokenStorage.isAuthenticated() && !!chatId,
  });
}

export function useSendMessage(chatId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (prompt: string) => chatApi.sendMessage({ prompt, chat_id: chatId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.chat.messages(chatId) }),
  });
}

export function useDecks() {
  return useQuery({
    queryKey: queryKeys.flashcards.decks,
    queryFn: () => flashcardApi.getDecks(),
    enabled: secureTokenStorage.isAuthenticated(),
  });
}

export function useDeckCards(deckId: string | undefined) {
  return useQuery({
    queryKey: deckId ? queryKeys.flashcards.cards(deckId) : ['flashcards', 'cards', 'none'],
    queryFn: () => flashcardApi.getDeckCards(deckId!),
    enabled: secureTokenStorage.isAuthenticated() && !!deckId,
  });
}

export function useQuizHistory(skip = 0, limit = 20) {
  return useQuery({
    queryKey: [...queryKeys.quiz.history, skip, limit],
    queryFn: () => quizApi.getQuizHistory(skip, limit),
    enabled: secureTokenStorage.isAuthenticated(),
  });
}

export function useQuizPerformance() {
  return useQuery({
    queryKey: queryKeys.quiz.performance,
    queryFn: () => quizApi.getUserPerformance(),
    enabled: secureTokenStorage.isAuthenticated(),
  });
}

export function useQuizTopics() {
  return useQuery({
    queryKey: queryKeys.quiz.topics,
    queryFn: () => quizApi.getAvailableTopics(),
    enabled: secureTokenStorage.isAuthenticated(),
    staleTime: 30 * 60 * 1000,
  });
}
