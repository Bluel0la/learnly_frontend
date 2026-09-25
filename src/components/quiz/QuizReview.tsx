
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, ArrowLeft, Calendar, Target, Loader2, TrendingUp } from 'lucide-react';
import { QuizReviewResponse, quizApi } from '@/services/quizApi';
import { useToast } from '@/hooks/use-toast';

interface QuizReviewProps {
  sessionId: string;
  onBack: () => void;
}

const QuizReview: React.FC<QuizReviewProps> = ({ sessionId, onBack }) => {
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
          description: "Failed to load quiz review. Please try again.",
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

  const getScoreBadgeVariant = (percentage: number): "default" | "secondary" | "destructive" | "outline" => {
    if (percentage >= 80) return 'default';
    if (percentage >= 60) return 'secondary';
    return 'destructive';
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="luminous-glass-card border-white/10">
          <CardContent className="flex justify-center items-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-luminous-primary" />
              <p className="text-lg text-slate-300">Loading quiz review...</p>
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
            <h3 className="text-xl font-semibold mb-2 font-display text-white">Unable to Load Review</h3>
            <p className="text-slate-400 mb-4">There was an error loading the quiz review.</p>
            <Button onClick={onBack} className="bg-luminous-primary-container hover:brightness-110 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Activities
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const correctCount = reviewData.results.filter(r => r.is_correct).length;
  const wrongCount = reviewData.results.length - correctCount;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2 text-slate-300 hover:text-white hover:bg-white/5">
          <ArrowLeft className="h-4 w-4" />
          Back to Activities
        </Button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-display text-white">Quiz Review</h1>
          <p className="text-slate-400 capitalize">{reviewData.topic} Performance Review</p>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="luminous-glass-card border-luminous-primary/25">
        <CardHeader>
          <CardTitle className="text-xl lg:text-2xl flex items-center gap-3 font-display text-white">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-tr from-luminous-primary-container to-luminous-secondary-container flex items-center justify-center">
              <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
            </div>
            Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="text-center p-3 rounded-xl bg-emerald-500/[0.07] border border-emerald-400/25">
              <div className="text-2xl lg:text-3xl font-bold text-emerald-400">{correctCount}</div>
              <div className="text-sm text-slate-400 flex items-center justify-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Correct
              </div>
            </div>
            <div className="text-center p-3 rounded-xl bg-rose-500/[0.07] border border-rose-400/25">
              <div className="text-2xl lg:text-3xl font-bold text-rose-400">{wrongCount}</div>
              <div className="text-sm text-slate-400 flex items-center justify-center gap-1">
                <XCircle className="h-4 w-4" />
                Wrong
              </div>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="text-2xl lg:text-3xl font-bold text-white">{reviewData.total_questions}</div>
              <div className="text-sm text-slate-400 flex items-center justify-center gap-1">
                <Target className="h-4 w-4" />
                Total
              </div>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/10">
              <div className={`text-2xl lg:text-3xl font-bold ${getScoreColor(reviewData.score_percent)}`}>
                {reviewData.score_percent.toFixed(1)}%
              </div>
              <div className="text-sm text-slate-400">Final Score</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  reviewData.score_percent >= 80 ? 'bg-gradient-to-r from-emerald-400 to-teal-300' :
                  reviewData.score_percent >= 60 ? 'bg-gradient-to-r from-amber-400 to-yellow-300' : 'bg-gradient-to-r from-rose-500 to-red-400'
                }`}
                style={{ width: `${reviewData.score_percent}%` }}
              />
            </div>
            <div className="flex justify-center mt-3">
              <Badge variant={getScoreBadgeVariant(reviewData.score_percent)} className="px-4 py-1 text-sm">
                {reviewData.score_percent >= 80 ? 'Excellent Performance!' :
                 reviewData.score_percent >= 60 ? 'Good Job!' : 'Keep Practicing!'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Review */}
      <Card className="luminous-glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-lg lg:text-xl font-display text-white">Question-by-Question Review</CardTitle>
          <p className="text-sm text-slate-400">Review each question to understand your performance</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {reviewData.results.map((answer, index) => (
            <div key={answer.question_id} className={`border rounded-lg p-4 lg:p-6 ${
              answer.is_correct ? 'border-emerald-400/30 bg-emerald-500/[0.05]' : 'border-rose-400/30 bg-rose-500/[0.05]'
            }`}>
              <div className="flex items-start gap-3 lg:gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center ${
                    answer.is_correct ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}>
                    {answer.is_correct ? (
                      <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                    ) : (
                      <XCircle className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                    )}
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-base lg:text-lg text-slate-100">Question {index + 1}</span>
                    <Badge variant={answer.is_correct ? 'default' : 'destructive'} className="text-xs">
                      {answer.is_correct ? 'Correct' : 'Incorrect'}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm lg:text-base text-slate-300">
                      <span className="font-medium">Your answer: </span>
                      <span className={answer.is_correct ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
                        {answer.selected_answer}
                      </span>
                    </div>

                    {!answer.is_correct && (
                      <div className="text-sm lg:text-base text-slate-300">
                        <span className="font-medium">Correct answer: </span>
                        <span className="text-emerald-400 font-medium">{answer.correct_answer}</span>
                      </div>
                    )}
                  </div>

                  {answer.explanation && (
                    <div className="bg-luminous-secondary-container/[0.07] border border-luminous-secondary-container/25 rounded-lg p-3 lg:p-4">
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5">💡</div>
                        <div>
                          <div className="font-medium text-luminous-secondary text-sm lg:text-base mb-1">Explanation</div>
                          <div className="text-slate-300 text-sm lg:text-base">{answer.explanation}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizReview;
