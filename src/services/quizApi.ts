import { apiGet, apiPost } from '@/lib/apiClient';

// Types for Quiz API - Updated to match exact API specification
export interface MathTopic {
  topic_id: string;
  name: string;
}

export interface StartQuizRequest {
  topic: string;
  num_questions: number;
}

export interface StartQuizResponse {
  session_id: string;
  topic: string;
  total_questions: number;
  message: string;
  historical_accuracy: number;
}

export interface SimulatedExamRequest {
  topics: string[];
  num_questions: number;
}

export interface QuizQuestion {
  question_id: string;
  question: string;
  choices: string[];
  topic: string;
  difficulty: string;
}

export interface QuestionBatchResponse {
  session_id: string;
  current_batch: QuizQuestion[];
  remaining: number;
}

export interface QuestionResponse {
  question_id: string;
  selected_answer: string;
}

export interface SubmitAnswersRequest {
  responses: QuestionResponse[];
}

export interface GradedAnswer {
  question_id: string;
  correct_answer: string;
  selected_answer: string;
  is_correct: boolean;
  explanation: string;
}

export interface SubmitResultResponse {
  correct: number;
  wrong: number;
  graded: GradedAnswer[];
  total_attempted: number;
  score_percent: number;
  next_difficulty: string;
}

export interface AdaptiveBatchRequest {
  difficulty: string;
  num_questions: number;
}

export interface AdaptiveQuestionBatch {
  session_id: string;
  current_batch: QuizQuestion[];
  remaining: number;
  difficulty_level: string;
  previous_score_percent: number;
}

export interface QuizReviewResponse {
  session_id: string;
  topic: string;
  total_questions: number;
  score_percent: number;
  results: GradedAnswer[];
}

export interface TopicPerformance {
  topic: string;
  total_answered: number;
  correct: number;
  wrong: number;
  accuracy_percent: number;
  average_difficulty: number;
}

export interface PerformanceResponse {
  user_id: string;
  performance_by_topic: TopicPerformance[];
}

export interface QuizSession {
  session_id: string;
  topic: string;
  date: string;
  accuracy: number;
  total_questions: number;
}

export interface HistoryResponse {
  sessions: QuizSession[];
}

export interface EndSessionSummary {
  session_id: string;
  topic: string;
  total_questions: number;
  correct: number;
  wrong: number;
  accuracy: number;
  ended_at: string;
}

class QuizApi {
  getAvailableTopics(): Promise<MathTopic[]> {
    return apiGet('/quiz/math/topics', 'Failed to fetch available topics');
  }

  startQuizSession(request: StartQuizRequest): Promise<StartQuizResponse> {
    return apiPost('/quiz/math/start', request, 'Failed to start quiz session');
  }

  startSimulatedExam(request: SimulatedExamRequest): Promise<StartQuizResponse> {
    return apiPost('/quiz/math/simulated-exam', request, 'Failed to start simulated exam');
  }

  getInitialQuestionBatch(sessionId: string): Promise<QuestionBatchResponse> {
    return apiGet(`/quiz/math/questions/${sessionId}`, 'Failed to fetch initial questions');
  }

  submitAnswers(sessionId: string, request: SubmitAnswersRequest): Promise<SubmitResultResponse> {
    return apiPost(`/quiz/math/${sessionId}/submit`, request, 'Failed to submit answers');
  }

  getNextAdaptiveBatch(sessionId: string, request: AdaptiveBatchRequest): Promise<AdaptiveQuestionBatch> {
    return apiPost(`/quiz/math/${sessionId}/next-adaptive-batch`, request, 'Failed to get next adaptive batch');
  }

  getQuizReview(sessionId: string): Promise<QuizReviewResponse> {
    return apiGet(`/quiz/math/${sessionId}/review`, 'Failed to fetch quiz review');
  }

  getUserPerformance(): Promise<PerformanceResponse> {
    return apiGet('/quiz/math/performance', 'Failed to fetch user performance');
  }

  getQuizHistory(skip = 0, limit = 20): Promise<HistoryResponse> {
    return apiGet(`/quiz/math/history?skip=${skip}&limit=${limit}`, 'Failed to fetch quiz history');
  }

  endSession(sessionId: string): Promise<EndSessionSummary> {
    return apiPost(`/quiz/math/${sessionId}/end`, undefined, 'Failed to end quiz session');
  }
}

export const quizApi = new QuizApi();
