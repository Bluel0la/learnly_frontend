import { apiGet, apiPost, apiRequest, apiUpload } from '@/lib/apiClient';
import { setCache, getCache } from '@/lib/cacheUtils';

export interface FlashcardDeck {
  deck_id: string;
  title: string;
  date_created: string;
  card_count?: number;
}

export interface FlashcardCard {
  card_id: string;
  deck_id?: string;
  question: string;
  answer?: string;
  times_reviewed?: number;
  correct_count?: number;
  wrong_count?: number;
  is_bookmarked?: boolean;
  is_studied?: boolean;
  last_reviewed?: string;
}

export interface PracticeCard {
  card_id: string;
  question: string;
  answer: string;
}

export interface RevealedCard {
  card_id: string;
  answer: string;
}

export interface SubmitResponse {
  message: string;
  card_id: string;
  is_correct: boolean;
  times_reviewed: number;
  correct_count: number;
  wrong_count: number;
  last_reviewed: string;
}

export interface GenerateResponse {
  message: string;
  filename?: string;
  deck_id?: string;
  num_flashcards?: number;
  summaries?: string[];
  flashcards?: Array<{ question: string; answer: string; summary?: string }>;
  // Adaptive-drills shape
  cards?: Array<{ question: string; answer: string }>;
  summary_points?: string[];
  status?: string;
}

export interface QuizCard {
  card_id: string;
  question: string;
  options: string[];
  correct_answer_index: number;
}

export interface QuizStart {
  deck_id: string;
  cards: QuizCard[];
}

export interface QuizResponse {
  card_id: string;
  user_answer: string;
}

export interface QuizResult {
  total_questions: number;
  correct: number;
  wrong: number;
  detailed_results: Array<{
    card_id: string;
    your_answer: string;
    correct_answer: string;
    correct: boolean;
  }>;
}

export const flashcardApi = {
  // Deck management
  createDeck: async (title: string): Promise<FlashcardDeck> => {
    const trimmed = title.trim();
    if (!trimmed) throw new Error('Deck title must not be empty.');
    return apiPost('/flashcard/decks/', { title: trimmed }, 'Failed to create deck');
  },

  getDecks: async (): Promise<FlashcardDeck[]> => {
    // Single call — backend annotates card_count (?include_card_count=true).
    const cacheKey = "fc_decks_v1";
    if (!navigator.onLine) {
      const cached = getCache<FlashcardDeck[]>(cacheKey);
      if (cached) return cached;
    }
    try {
      const decks = await apiGet<FlashcardDeck[]>('/flashcard/decks/?include_card_count=true', 'Failed to fetch decks');
      setCache(cacheKey, decks, 1000 * 60 * 60 * 12); // 12 hours
      return decks;
    } catch (error) {
      const cached = getCache<FlashcardDeck[]>(cacheKey);
      if (cached) return cached;
      throw error;
    }
  },

  getDeckCards: async (deckId: string): Promise<FlashcardCard[]> => {
    const cacheKey = `fc_deck_cards_${deckId}`;
    if (!navigator.onLine) {
      const cached = getCache<FlashcardCard[]>(cacheKey);
      if (cached) return cached;
    }
    try {
      const cards = await apiGet<FlashcardCard[]>(`/flashcard/decks/${deckId}/get-cards`, 'Failed to fetch deck cards');
      setCache(cacheKey, cards, 1000 * 60 * 60 * 12); // 12 hours
      return cards;
    } catch (error) {
      const cached = getCache<FlashcardCard[]>(cacheKey);
      if (cached) return cached;
      throw error;
    }
  },

  generateFlashcards: async (deckId: string, file: File, numFlashcards?: number, maxCards: number = 25): Promise<{
    message: string;
    filename: string;
    deck_id: string;
    num_flashcards: number;
    summaries: string[];
    flashcards: Array<{ question: string; answer: string; summary?: string }>;
  }> => {
    // Client-side file validation
    const maxSizeInMB = 10;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      throw new Error(`File size must be less than ${maxSizeInMB}MB`);
    }

    const supportedTypes = ['.pdf', '.pptx', '.docx', '.txt'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!supportedTypes.includes(fileExtension)) {
      throw new Error(`Unsupported file type. Please upload: ${supportedTypes.join(', ')}`);
    }

    const formData = new FormData();
    formData.append('file', file);

    // Backend reads these as query params, not form fields.
    const params = new URLSearchParams();
    if (typeof numFlashcards === "number") {
      params.append('num_flashcards', numFlashcards.toString());
    }
    params.append('max_cards', maxCards.toString());

    try {
      return await apiUpload(
        `/flashcard/decks/${deckId}/generate-flashcards/?${params.toString()}`,
        formData,
        'Failed to generate flashcards',
      );
    } catch (error) {
      if (error instanceof Error) {
        if (/\b401\b/.test(error.message)) throw new Error('Authentication failed. Please log in again.');
        if (/\b413\b/.test(error.message)) throw new Error('File too large. Please upload a smaller file.');
        if (/\b415\b/.test(error.message)) throw new Error('Unsupported file type. Please upload PDF, PPTX, DOCX, or TXT files.');
        if (/\b422\b/.test(error.message)) throw new Error('Invalid file content. Please check your file and try again.');
        if (/^5\d{2}\b/.test(error.message)) throw new Error('Server error. Please try again later.');
      }
      throw error;
    }
  },

  addCards: (deckId: string, cards: Array<{ question: string; answer: string }>): Promise<void> =>
    apiPost(`/flashcard/decks/${deckId}/cards/`, { cards }, 'Failed to add cards'),

  // Practice mode: backend returns a random card (re-request for a new card).
  getPracticeCard: (deckId: string): Promise<PracticeCard> =>
    apiGet(`/flashcard/decks/${deckId}/practice`, 'Failed to get practice card'),

  // Smart practice: hardest cards first via the real /cards/hard endpoint,
  // falling back to plain deck cards.
  getSmartPracticeCards: async (deckId: string, limit: number = 20): Promise<PracticeCard[]> => {
    try {
      const hard = await apiGet<FlashcardCard[]>(`/flashcard/cards/hard?limit=${limit}`, 'Failed to get hard cards');
      const mine = Array.isArray(hard) ? hard.filter((c) => !deckId || c.deck_id === deckId) : [];
      if (mine.length > 0) {
        return mine.slice(0, limit).map((card) => ({
          card_id: card.card_id,
          question: card.question,
          answer: card.answer || ''
        }));
      }
    } catch {
      // Fall through to deck cards below.
    }
    const deckCards = await flashcardApi.getDeckCards(deckId);
    return deckCards.map(card => ({
      card_id: card.card_id,
      question: card.question,
      answer: card.answer || ''
    })).slice(0, limit);
  },

  revealCard: (cardId: string): Promise<RevealedCard> =>
    apiGet(`/flashcard/cards/${cardId}/reveal`, 'Failed to reveal card'),

  submitResponse: (cardId: string, isCorrect: boolean): Promise<SubmitResponse> =>
    apiPost(`/flashcard/cards/${cardId}/submit-response`, { is_correct: isCorrect }, 'Failed to submit response'),

  // Card actions
  markStudied: (cardId: string): Promise<void> =>
    apiPost(`/flashcard/cards/${cardId}/mark-studied`, undefined, 'Failed to mark card as studied'),

  bookmarkCard: (cardId: string): Promise<void> =>
    apiPost(`/flashcard/cards/${cardId}/bookmark`, undefined, 'Failed to bookmark card'),

  unbookmarkCard: (cardId: string): Promise<void> =>
    apiPost(`/flashcard/cards/${cardId}/unbookmark`, undefined, 'Failed to unbookmark card'),

  resetCard: (cardId: string): Promise<void> =>
    apiPost(`/flashcard/cards/${cardId}/reset`, undefined, 'Failed to reset card'),

  // Filtered cards
  getBookmarkedCards: (skip = 0, limit = 20): Promise<FlashcardCard[]> =>
    apiGet(`/flashcard/cards/bookmarked?skip=${skip}&limit=${limit}`, 'Failed to get bookmarked cards'),

  getUnstudiedCards: (skip = 0, limit = 20): Promise<FlashcardCard[]> =>
    apiGet(`/flashcard/cards/unstudied?skip=${skip}&limit=${limit}`, 'Failed to get unstudied cards'),

  getHardCards: (skip = 0, limit = 20): Promise<FlashcardCard[]> =>
    apiGet(`/flashcard/cards/hard?skip=${skip}&limit=${limit}`, 'Failed to get hard cards'),

  // Quiz mode: backend returns {card_id, question}; options are synthesized
  // client-side from sibling cards for the multiple-choice UI.
  startQuiz: async (deckId: string, limit: number = 5): Promise<QuizStart> => {
    console.log(`Starting quiz for deck ${deckId} with limit ${limit}`);
    const result = await apiGet<{ deck_id: string; cards: Array<{ card_id: string; question: string }> }>(
      `/flashcard/decks/${deckId}/quiz?limit=${limit}`,
      'Failed to start quiz',
    );

    // Synthesize 4 options per card from sibling answers.
    const deckCards = await flashcardApi.getDeckCards(deckId);
    const cards: QuizCard[] = result.cards.map((quizCard) => {
      const fullCard = deckCards.find(card => card.card_id === quizCard.card_id);
      const correctAnswer = fullCard?.answer || 'Unknown';

      const otherAnswers = deckCards
        .filter(card => card.card_id !== quizCard.card_id && card.answer)
        .map(card => card.answer!)
        .slice(0, 3);

      while (otherAnswers.length < 3) {
        otherAnswers.push(`Option ${otherAnswers.length + 1}`);
      }

      const correctIndex = Math.floor(Math.random() * 4);
      const options = [...otherAnswers.slice(0, 3)];
      options.splice(correctIndex, 0, correctAnswer);

      return {
        card_id: quizCard.card_id,
        question: quizCard.question,
        options: options.slice(0, 4),
        correct_answer_index: correctIndex
      };
    });

    return { deck_id: result.deck_id, cards };
  },

  // Server-graded: send only card_id + user_answer, render server verdict.
  submitQuiz: (responses: QuizResponse[]): Promise<QuizResult> => {
    const payload = responses.map(({ card_id, user_answer }) => ({ card_id, user_answer }));
    return apiPost('/flashcard/quiz/submit', payload, 'Failed to submit quiz');
  },

  // Adaptive drill generation (mode/max_drills are query params).
  generateAdaptiveDrills: (deckId: string, mode: 'wrong' | 'bookmark', maxCards: number = 10): Promise<GenerateResponse> => {
    const params = new URLSearchParams({ mode, max_drills: maxCards.toString() });
    return apiPost(
      `/flashcard/decks/${deckId}/regenerate-adaptive-drills/?${params.toString()}`,
      undefined,
      'Failed to generate adaptive drills',
    );
  },

  deleteDeck: (deckId: string): Promise<{ message: string }> =>
    apiRequest(`/flashcard/decks/${deckId}`, { method: 'DELETE' }, 'Failed to delete deck'),
};
