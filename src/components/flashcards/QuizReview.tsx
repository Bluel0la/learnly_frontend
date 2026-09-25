
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { QuizResult, QuizCard, QuizResponse } from '@/services/flashcardApi';
import AdaptiveDrillSuggestion from './AdaptiveDrillSuggestion';

interface QuizReviewProps {
  result?: QuizResult;
  deckId?: string;
  quizCards?: QuizCard[];
  userResponses?: QuizResponse[];
  onRestart?: () => void;
  onExit?: () => void;
  onRetakeQuiz?: () => void;
  onBackToDeck?: () => void;
}

const QuizReview: React.FC<QuizReviewProps> = ({ 
  result, 
  deckId, 
  quizCards,
  userResponses,
  onRestart, 
  onExit,
  onRetakeQuiz,
  onBackToDeck 
}) => {
  // Handle both the new API result format and the old manual review format
  const isApiResult = !!result;
  
  let accuracy: number;
  let correct: number;
  let wrong: number;
  let totalQuestions: number;
  let detailedResults: Array<{
    card_id: string;
    your_answer: string;
    correct_answer: string;
    correct: boolean;
  }>;

  if (isApiResult && result) {
    // Use API result
    accuracy = Math.round((result.correct / result.total_questions) * 100);
    correct = result.correct;
    wrong = result.wrong;
    totalQuestions = result.total_questions;
    detailedResults = result.detailed_results;
  } else if (quizCards && userResponses) {
    // Legacy manual path (kept for compat): correctness re-derived from cards.
    // Prefer passing the server `result` — the backend is the source of truth.
    correct = 0;
    detailedResults = userResponses.map(response => {
      const card = quizCards.find(c => c.card_id === response.card_id);
      const correctAnswer = card ? card.options[card.correct_answer_index] : 'Unknown';
      const isCorrect = response.user_answer === correctAnswer;
      if (isCorrect) correct += 1;

      return {
        card_id: response.card_id,
        your_answer: response.user_answer,
        correct_answer: correctAnswer,
        correct: isCorrect
      };
    });
    totalQuestions = userResponses.length;
    wrong = totalQuestions - correct;
    accuracy = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;
  } else {
    // Fallback values
    accuracy = 0;
    correct = 0;
    wrong = 0;
    totalQuestions = 0;
    detailedResults = [];
  }

  const grade = accuracy >= 90 ? 'A' : accuracy >= 80 ? 'B' : accuracy >= 70 ? 'C' : accuracy >= 60 ? 'D' : 'F';

  const handleDrillsGenerated = () => {
    // Optionally refresh the page or show a success message
    if (onExit) {
      onExit(); // Return to deck view to see new cards
    } else if (onBackToDeck) {
      onBackToDeck();
    }
  };

  const handleRetakeAction = () => {
    if (onRestart) {
      onRestart();
    } else if (onRetakeQuiz) {
      onRetakeQuiz();
    }
  };

  const handleExitAction = () => {
    if (onExit) {
      onExit();
    } else if (onBackToDeck) {
      onBackToDeck();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Results Summary */}
      <Card className="luminous-glass-card border-white/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-display text-white">Quiz Complete!</CardTitle>
          <CardDescription className="text-slate-400">Here's how you performed</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-6xl font-bold luminous-gradient-text">{grade}</div>
          <div className="text-xl text-slate-200">
            {correct}/{totalQuestions} correct ({accuracy}%)
          </div>

          <div className="flex justify-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-emerald-400">
              <CheckCircle className="h-4 w-4" />
              {correct} Correct
            </div>
            <div className="flex items-center gap-1 text-rose-400">
              <XCircle className="h-4 w-4" />
              {wrong} Wrong
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adaptive Drill Suggestion - only show if we have deckId and wrong answers */}
      {deckId && wrong > 0 && (
        <AdaptiveDrillSuggestion
          deckId={deckId}
          wrongAnswers={wrong}
          totalQuestions={totalQuestions}
          onDrillsGenerated={handleDrillsGenerated}
        />
      )}

      {/* Detailed Results */}
      <Card className="luminous-glass-card border-white/10">
        <CardHeader>
          <CardTitle className="font-display text-white">Detailed Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {detailedResults.map((detail, index) => (
            <div key={detail.card_id} className="border-l-4 pl-4 py-2 bg-white/[0.02] rounded-r-lg"
                 style={{ borderColor: detail.correct ? '#34d399' : '#fb7185' }}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-slate-200">Question {index + 1}</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Your answer: <span className={detail.correct ? 'text-emerald-400' : 'text-rose-400'}>
                      {detail.your_answer}
                    </span>
                  </p>
                  {!detail.correct && (
                    <p className="text-sm text-emerald-400 mt-1">
                      Correct answer: {detail.correct_answer}
                    </p>
                  )}
                </div>
                <div className="ml-2">
                  {detail.correct ?
                    <CheckCircle className="h-5 w-5 text-emerald-400" /> :
                    <XCircle className="h-5 w-5 text-rose-400" />
                  }
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center">
        <Button onClick={handleRetakeAction} variant="outline" className="flex items-center gap-2 bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:text-white">
          <RotateCcw className="h-4 w-4" />
          Retake Quiz
        </Button>
        <Button onClick={handleExitAction} className="bg-luminous-primary-container hover:brightness-110 text-white">
          Back to Deck
        </Button>
      </div>
    </div>
  );
};

export default QuizReview;
