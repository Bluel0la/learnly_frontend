import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Trophy, Target, Loader2 } from 'lucide-react';
import { QuizReviewResponse, quizApi } from '@/services/quizApi';
import { useToast } from '@/hooks/use-toast';

interface QuizResultsProps {
  sessionId: string;
  topic: string;
  onStartNewQuiz: () => void;
  onBackToQuizzes: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({
  sessionId,
  topic,
  onStartNewQuiz,
  onBackToQuizzes,
}) => {
  const [reviewData, setReviewData] = useState<QuizReviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchReviewData = async () => {
      try {
        const response = await quizApi.getQuizReview(sessionId);
        setReviewData(response);
      } catch (error) {
        console.error('Failed to fetch quiz review:', error);
        toast({
          title: "Error",
          description: "Failed to load quiz results. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviewData();
  }, [sessionId, toast]);

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-emerald-400';
    if (percentage >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getPerformanceMessage = (percentage: number) => {
    if (percentage >= 90) return 'Outstanding performance! 🌟';
    if (percentage >= 80) return 'Excellent work! 🎉';
    if (percentage >= 70) return 'Great job! 👍';
    if (percentage >= 60) return 'Good effort! Keep practicing! 💪';
    return 'Keep practicing - you\'ll improve! 📚';
  };

  const getNextSuggestion = () => {
    if (!reviewData) return null;
    const { score_percent, results } = reviewData;
    if (score_percent >= 80)
      return (
        <span>
          You’ve mastered this topic—try <span className="font-semibold">Simulated Exam</span> for a bigger challenge!
        </span>
      );
    // Show weakest topic (if possible)
    const wrongAnswers = results.filter(r => !r.is_correct);
    if (wrongAnswers.length > 0) {
      const freq: Record<string, number> = {};
      wrongAnswers.forEach(r => {
        freq[r.question_id] = (freq[r.question_id] || 0) + 1;
      });
      // In real case, map questionIDs to topics. For now, generic advice:
      return (
        <span>
          Try reviewing the <span className="font-semibold text-amber-200">previously incorrect questions</span> above and practicing similar ones to boost your accuracy.
        </span>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="luminous-glass-card border-white/10">
          <CardContent className="flex justify-center items-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-luminous-primary" />
              <p className="text-lg text-slate-300">Loading your results...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!reviewData) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="luminous-glass-card border-white/10">
          <CardContent className="text-center py-8">
            <h3 className="text-xl font-semibold mb-2 font-display text-white">Unable to Load Results</h3>
            <p className="text-slate-400 mb-4">There was an error loading your quiz results.</p>
            <Button onClick={onBackToQuizzes} className="bg-luminous-primary-container hover:brightness-110 text-white">Back to Quizzes</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const correctCount = reviewData.results.filter(r => r.is_correct).length;
  const wrongCount = reviewData.results.length - correctCount;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="luminous-glass-card border-white/10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400/20 to-luminous-primary-container/20 border border-amber-400/30 flex items-center justify-center">
              <Trophy className="h-10 w-10 text-amber-300" />
            </div>
          </div>
          <CardTitle className="text-2xl font-display text-white">Quiz Complete!</CardTitle>
          <p className="text-slate-400">{reviewData.topic.charAt(0).toUpperCase() + reviewData.topic.slice(1)} Quiz Results</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="space-y-2 p-4 rounded-xl bg-emerald-500/[0.07] border border-emerald-400/25">
              <div className="text-3xl font-bold text-emerald-400">{correctCount}</div>
              <div className="text-sm text-slate-400">Correct</div>
            </div>
            <div className="space-y-2 p-4 rounded-xl bg-rose-500/[0.07] border border-rose-400/25">
              <div className="text-3xl font-bold text-rose-400">{wrongCount}</div>
              <div className="text-sm text-slate-400">Wrong</div>
            </div>
            <div className="space-y-2 p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <div className={`text-3xl font-bold ${getScoreColor(reviewData.score_percent)}`}>
                {reviewData.score_percent.toFixed(1)}%
              </div>
              <div className="text-sm text-slate-400">Score</div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-lg font-medium mb-2 text-slate-200">
              {getPerformanceMessage(reviewData.score_percent)}
            </p>
            <p className="text-sm text-slate-400">
              Total questions answered: <span className="font-medium text-slate-200">{reviewData.total_questions}</span>
            </p>
          </div>

          <div className="mt-3 px-4 py-3 rounded-xl bg-amber-400/[0.08] border border-amber-400/25 text-amber-200 text-center font-medium text-sm">
            {getNextSuggestion()}
          </div>

          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                reviewData.score_percent >= 80 ? 'bg-gradient-to-r from-emerald-400 to-teal-300' :
                reviewData.score_percent >= 60 ? 'bg-gradient-to-r from-amber-400 to-yellow-300' : 'bg-gradient-to-r from-rose-500 to-red-400'
              }`}
              style={{ width: `${reviewData.score_percent}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="luminous-glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-lg font-display text-white">Question Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {reviewData.results.map((answer, index) => (
            <div key={answer.question_id} className="border border-white/10 bg-white/[0.02] rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {answer.is_correct ? (
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-rose-400" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="font-medium text-slate-200">Question {index + 1}</div>
                  <div className="text-sm text-slate-400">
                    Your answer: <span className={answer.is_correct ? 'text-emerald-400' : 'text-rose-400'}>
                      {answer.selected_answer}
                    </span>
                  </div>
                  {!answer.is_correct && (
                    <div className="text-sm text-slate-400">
                      Correct answer: <span className="text-emerald-400">{answer.correct_answer}</span>
                    </div>
                  )}
                  {answer.explanation && (
                    <div className="text-sm text-luminous-secondary bg-luminous-secondary-container/[0.07] border border-luminous-secondary-container/25 p-2 rounded">
                      💡 {answer.explanation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-center">
        <Button onClick={onStartNewQuiz} className="flex items-center gap-2 bg-luminous-primary-container hover:brightness-110 text-white">
          <Target className="h-4 w-4" />
          Try Another Quiz
        </Button>
        <Button variant="outline" onClick={onBackToQuizzes} className="bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:text-white">
          Back to Quizzes
        </Button>
      </div>
    </div>
  );
};

export default QuizResults;
