import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { flashcardApi, QuizCard, QuizResponse, QuizResult } from '@/services/api';
import ScoreMeter from './ScoreMeter';
import QuizReview from './QuizReview';

interface MultipleChoiceQuizProps {
  deckId: string;
  onComplete?: () => void;
}

const MultipleChoiceQuiz: React.FC<MultipleChoiceQuizProps> = ({ deckId, onComplete }) => {
  const [quizCards, setQuizCards] = useState<QuizCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [userResponses, setUserResponses] = useState<QuizResponse[]>([]);
  const [serverResult, setServerResult] = useState<QuizResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Score tracking
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [rank, setRank] = useState('E');
  const [multiplier, setMultiplier] = useState(1);
  const [totalScore, setTotalScore] = useState(0);

  const { toast } = useToast();

  useEffect(() => {
    const startQuiz = async () => {
      try {
        setIsLoading(true);
        const quizData = await flashcardApi.startQuiz(deckId, 10);
        setQuizCards(quizData.cards);
      } catch (error) {
        console.error('Failed to start quiz:', error);
        toast({
          title: "Error",
          description: "Failed to start quiz. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    startQuiz();
  }, [deckId, toast]);

  const calculateRank = (currentStreak: number, totalQuestions: number): string => {
    const rankThresholds = {
      'S+': Math.max(8, Math.floor(totalQuestions * 0.90)),
      'S': Math.max(7, Math.floor(totalQuestions * 0.75)),
      'A': Math.max(6, Math.floor(totalQuestions * 0.60)),
      'B': Math.max(5, Math.floor(totalQuestions * 0.45)),
      'C': Math.max(4, Math.floor(totalQuestions * 0.35)),
      'D': Math.max(3, Math.floor(totalQuestions * 0.25)),
      'E': Math.max(2, Math.floor(totalQuestions * 0.15))
    };

    for (const [rankName, threshold] of Object.entries(rankThresholds)) {
      if (currentStreak >= threshold) {
        return rankName;
      }
    }
    return 'E';
  };

  const calculateMultiplier = (currentStreak: number): number => {
    return Math.min(1 + Math.floor(currentStreak / 2), 6);
  };

  const handleAnswerSelect = (answer: string) => {
    if (hasAnswered) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || hasAnswered) return;

    const currentCard = quizCards[currentCardIndex];
    // Instant UI feedback only — the server is the source of truth for grading.
    const correctAnswer = currentCard.options[currentCard.correct_answer_index];
    const isCorrect = selectedAnswer === correctAnswer;

    setHasAnswered(true);

    const response: QuizResponse = {
      card_id: currentCard.card_id,
      user_answer: selectedAnswer,
    };

    setUserResponses(prev => [...prev, response]);

    // Update score tracking
    let newStreak = streak;
    let newRank = rank;
    let newMultiplier = multiplier;

    if (isCorrect) {
      newStreak = streak + 1;
      setMaxStreak(prev => Math.max(prev, newStreak));
      
      newRank = calculateRank(newStreak, quizCards.length);
      newMultiplier = calculateMultiplier(newStreak);
      
      const points = 100 * newMultiplier;
      setTotalScore(prev => prev + points);
    } else {
      newStreak = 0;
      newRank = calculateRank(newStreak, quizCards.length);
      newMultiplier = 1;
    }

    setStreak(newStreak);
    setRank(newRank);
    setMultiplier(newMultiplier);

    // Wait for a moment to show the result, then transition
    setTimeout(() => {
      if (currentCardIndex < quizCards.length - 1) {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentCardIndex(prev => prev + 1);
          setSelectedAnswer(null);
          setHasAnswered(false);
          setIsTransitioning(false);
        }, 300);
      } else {
        finishQuiz([...userResponses, response]);
      }
    }, 1500);
  };

  const finishQuiz = async (allResponses: QuizResponse[]) => {
    setIsSubmitting(true);
    try {
      // Server-graded: submit answers, render the server's verdict.
      // Attempts are recorded server-side (submit updates review stats).
      const result = await flashcardApi.submitQuiz(allResponses);
      setServerResult(result);

      // Display-only streak/rank derived from the server verdict.
      const correctCount = result.correct;
      setStreak(correctCount);
      setMaxStreak((prev) => Math.max(prev, correctCount));
      setRank(calculateRank(correctCount, result.total_questions));

      setIsComplete(true);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      toast({
        title: "Error",
        description: "Could not grade your quiz. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestart = () => {
    setCurrentCardIndex(0);
    setUserResponses([]);
    setServerResult(null);
    setSelectedAnswer(null);
    setHasAnswered(false);
    setIsComplete(false);
    setStreak(0);
    setMaxStreak(0);
    setRank('E');
    setMultiplier(1);
    setTotalScore(0);
    setIsTransitioning(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-slate-400">Loading quiz...</div>
      </div>
    );
  }

  if (isComplete) {
    if (!serverResult) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-slate-400">Grading your quiz...</div>
        </div>
      );
    }
    return (
      <QuizReview
        result={serverResult}
        deckId={deckId}
        onRestart={handleRestart}
        onExit={onComplete}
      />
    );
  }

  if (quizCards.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-xl font-semibold mb-2 font-display text-white">No Quiz Available</h3>
        <p className="text-slate-400 mb-4">This deck doesn't have enough cards for a quiz.</p>
        <Button onClick={onComplete} className="bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:text-white" variant="outline">Back to Deck</Button>
      </div>
    );
  }

  const currentCard = quizCards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / quizCards.length) * 100;
  const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <ScoreMeter
        streak={streak}
        rank={rank}
        multiplier={multiplier}
        totalQuestions={quizCards.length}
      />

      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-luminous-mono uppercase tracking-widest text-slate-400">
            Question {currentCardIndex + 1} of {quizCards.length}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-luminous-secondary-container/10 border border-luminous-secondary-container/30 text-sm font-bold text-luminous-secondary font-luminous-mono">
            {totalScore} pts
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-luminous-primary-container to-luminous-secondary-container h-2 rounded-full transition-all duration-500 luminous-shadow-glow-cyan"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Card className={`luminous-glass-card luminous-glow-border border-white/10 transition-all duration-300 ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
        <CardHeader className="pb-4">
          <p className="text-[11px] font-luminous-mono uppercase tracking-widest text-luminous-primary mb-2">
            Pick the best answer
          </p>
          <CardTitle className="font-display text-xl sm:text-2xl font-bold leading-snug text-white">
            {currentCard.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3" key={currentCard.card_id}>
            {currentCard.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = hasAnswered && option === currentCard.options[currentCard.correct_answer_index];
              const isWrong = hasAnswered && isSelected && !isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={hasAnswered}
                  style={{ animationDelay: `${index * 60}ms` }}
                  className={`animate-luminous-option-in w-full flex items-center gap-3.5 p-4 rounded-xl border text-left transition-all duration-200 h-auto min-h-[60px] ${
                    hasAnswered
                      ? isCorrect
                        ? 'animate-luminous-pop bg-emerald-500/[0.12] text-emerald-100 border-emerald-400/60 shadow-[0_0_20px_-4px_rgba(52,211,153,0.5)]'
                        : isWrong
                        ? 'animate-luminous-shake bg-rose-500/[0.12] text-rose-100 border-rose-400/60'
                        : 'opacity-40 bg-white/[0.03] border-white/10 text-slate-400 cursor-default'
                      : isSelected
                      ? 'bg-luminous-primary-container/25 text-white border-luminous-primary luminous-shadow-glow-purple scale-[1.01]'
                      : 'bg-white/[0.03] border-white/10 text-slate-200 hover:bg-white/[0.07] hover:border-luminous-primary/50 hover:text-white hover:translate-x-0.5 cursor-pointer'
                  }`}
                >
                  <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold font-display transition-colors ${
                    hasAnswered
                      ? isCorrect
                        ? 'bg-emerald-400 text-emerald-950'
                        : isWrong
                        ? 'bg-rose-400 text-rose-950'
                        : 'bg-white/10 text-slate-400'
                      : isSelected
                      ? 'bg-white text-luminous-primary-container'
                      : 'bg-white/10 text-slate-300'
                  }`}>
                    {hasAnswered && isCorrect ? '✓' : hasAnswered && isWrong ? '✕' : LETTERS[index] ?? index + 1}
                  </span>
                  <span className="text-sm sm:text-[15px] leading-relaxed whitespace-normal break-words flex-1">
                    {option}
                  </span>
                </button>
              );
            })}
          </div>

          {!hasAnswered && (
            <Button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer || isSubmitting}
              className="w-full mt-6 h-12 text-base font-bold bg-luminous-primary-container hover:brightness-110 text-white luminous-shadow-glow-purple disabled:opacity-40 disabled:shadow-none"
            >
              {selectedAnswer ? 'Submit Answer' : 'Select an answer above'}
            </Button>
          )}
          {hasAnswered && currentCardIndex < quizCards.length - 1 && (
            <p className="text-center text-xs text-slate-500 animate-fade-in">Next question coming up…</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MultipleChoiceQuiz;
