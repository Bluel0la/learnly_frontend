
import { API_BASE_URL, getAuthHeaders } from './apiConfig';

export interface FlashcardDeck {
  deck_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  card_count?: number;
}

export interface FlashcardCard {
  card_id: string;
  deck_id: string;
  question: string;
  answer: string;
  times_reviewed: number;
  correct_count: number;
  wrong_count: number;
  is_bookmarked: boolean;
  is_studied: boolean;
  created_at: string;
}

export interface QuizQuestion {
  card_id: string;
  question: string;
  answer: string;
}

export interface QuizResponse {
  card_id: string;
  user_answer: string;
  is_correct: boolean;
}

export interface QuizResult {
  total_questions: number;
  correct: number;
  wrong: number;
  detailed_results: Array<{
    card_id: string;
    question: string;
    correct_answer: string;
    user_answer: string;
    is_correct: boolean;
  }>;
}

export const flashcardApi = {
  // Deck management
  createDeck: async (title: string): Promise<FlashcardDeck> => {
    const response = await fetch(`${API_BASE_URL}/flashcard/decks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title })
    });
    
    if (!response.ok) {
      throw new Error('Failed to create deck');
    }
    
    return response.json();
  },

  getDecks: async (): Promise<FlashcardDeck[]> => {
    const response = await fetch(`${API_BASE_URL}/flashcard/decks`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch decks');
    }
    
    return response.json();
  },

  // Card management
  addCards: async (deckId: string, cards: Array<{ question: string; answer: string }>): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/flashcard/decks/${deckId}/cards/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ cards })
    });
    
    if (!response.ok) {
      throw new Error('Failed to add cards');
    }
  },

  generateFlashcards: async (deckId: string, file: File, maxCards: number = 30): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/flashcard/decks/${deckId}/generate-flashcards/?max_cards=${maxCards}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate flashcards');
    }
  },

  // Practice mode
  getPracticeCard: async (deckId: string): Promise<FlashcardCard> => {
    const response = await fetch(`${API_BASE_URL}/flashcard/decks/${deckId}/practice`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to get practice card');
    }
    
    return response.json();
  },

  revealCard: async (cardId: string): Promise<FlashcardCard> => {
    const response = await fetch(`${API_BASE_URL}/flashcard/cards/${cardId}/reveal`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to reveal card');
    }
    
    return response.json();
  },

  submitResponse: async (cardId: string, isCorrect: boolean): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/flashcard/cards/${cardId}/submit-response`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ is_correct: isCorrect })
    });
    
    if (!response.ok) {
      throw new Error('Failed to submit response');
    }
  },

  // Card actions
  markStudied: async (cardId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/flashcard/cards/${cardId}/mark-studied`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark card as studied');
    }
  },

  bookmarkCard: async (cardId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/flashcard/cards/${cardId}/bookmark`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to bookmark card');
    }
  },

  unbookmarkCard: async (cardId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/flashcard/cards/${cardId}/unbookmark`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to unbookmark card');
    }
  },

  resetCard: async (cardId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/flashcard/cards/${cardId}/reset`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to reset card');
    }
  },

  // Filtered cards
  getBookmarkedCards: async (): Promise<FlashcardCard[]> => {
    const response = await fetch(`${API_BASE_URL}/flashcard/cards/bookmarked`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to get bookmarked cards');
    }
    
    return response.json();
  },

  getUnstudiedCards: async (): Promise<FlashcardCard[]> => {
    const response = await fetch(`${API_BASE_URL}/flashcard/cards/unstudied`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to get unstudied cards');
    }
    
    return response.json();
  },

  getHardCards: async (): Promise<FlashcardCard[]> => {
    const response = await fetch(`${API_BASE_URL}/flashcard/cards/hard`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to get hard cards');
    }
    
    return response.json();
  },

  // Quiz mode
  startQuiz: async (deckId: string, limit: number = 5): Promise<QuizQuestion[]> => {
    const response = await fetch(`${API_BASE_URL}/flashcard/decks/${deckId}/quiz?limit=${limit}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to start quiz');
    }
    
    return response.json();
  },

  submitQuiz: async (responses: QuizResponse[]): Promise<QuizResult> => {
    const response = await fetch(`${API_BASE_URL}/flashcard/quiz/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(responses)
    });
    
    if (!response.ok) {
      throw new Error('Failed to submit quiz');
    }
    
    return response.json();
  }
};
