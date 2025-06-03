
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle, XCircle, Trophy, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { QuizCard, QuizResponse, QuizResult, flashcardApi } from '@/services/flashcardApi';

interface FlashcardQuizProps {
  deckId: string;
  onComplete?: () => void;
}

const FlashcardQuiz: React.FC<FlashcardQuizProps> = ({ deckId, onComplete }) => {
  const { toast } = useToast();
  const [quizCards, setQuizCards] = useState<QuizCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const startQuiz = async () => {
    try {
      setIsLoading(true);
      const quizData = await flashcardApi.startQuiz(deckId, 10); // 10 question quiz
      setQuizCards(quizData.cards);
      setUserAnswers(new Array(quizData.cards.length).fill(''));
      setIsActive(true);
      setTimeLeft(300); // Reset timer
    } catch (error) {
      console.error('Error starting quiz:', error);
      toast({
        title: "Error",
        description: "Failed to start quiz",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const submitQuiz = async () => {
    try {
      const responses: QuizResponse[] = quizCards.map((card, index) => ({
        card_id: card.card_id,
        user_answer: userAnswers[index] || '',
        is_correct: false // This will be determined by the backend
      }));

      const result = await flashcardApi.submitQuiz(responses);
      setQuizResult(result);
      setIsCompleted(true);
      setIsActive(false);
      
      toast({
        title: "Quiz Complete! 🎉",
        description: `You scored ${result.correct}/${result.total_questions}`
      });
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast({
        title: "Error",
        description: "Failed to submit quiz",
        variant: "destructive"
      });
    }
  };

  const handleNext = () => {
    const newAnswers = [...userAnswers];
    newAnswers[currentCardIndex] = currentAnswer;
    setUserAnswers(newAnswers);
    
    if (currentCardIndex < quizCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setCurrentAnswer(userAnswers[currentCardIndex + 1] || '');
    } else {
      submitQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      const newAnswers = [...userAnswers];
      newAnswers[currentCardIndex] = currentAnswer;
      setUserAnswers(newAnswers);
      setCurrentCardIndex(currentCardIndex - 1);
      setCurrentAnswer(userAnswers[currentCardIndex - 1] || '');
    }
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => {
          if (timeLeft <= 1) {
            submitQuiz();
            return 0;
          }
          return timeLeft - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isCompleted && quizResult) {
    const percentage = Math.round((quizResult.correct / quizResult.total_questions) * 100);
    
    return (
      <Card className="max-w-4xl mx-auto animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Quiz Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="text-6xl font-bold mb-4">
              <span className={getScoreColor(percentage)}>{percentage}%</span>
            </div>
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{quizResult.total_questions}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{quizResult.correct}</div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{quizResult.wrong}</div>
                <div className="text-sm text-muted-foreground">Wrong</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-semibold">Detailed Results:</h3>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {quizResult.detailed_results.map((result, index) => (
                <div key={result.card_id} className="border rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    {result.correct ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    )}
                    <div className="flex-1 text-sm">
                      <div><strong>Your answer:</strong> {result.your_answer}</div>
                      <div><strong>Correct answer:</strong> {result.correct_answer}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2 justify-center">
            <Button onClick={() => startQuiz()} className="hover:scale-105 transition-transform">
              Retake Quiz
            </Button>
            <Button variant="outline" onClick={onComplete}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Deck
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isActive && quizCards.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-6 w-6" />
            Timed Quiz Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <div className="text-4xl">⚡</div>
            <h3 className="text-lg font-semibold">Ready for a challenge?</h3>
            <p className="text-muted-foreground">
              Test your knowledge with a 5-minute timed quiz covering 10 random cards from this deck.
            </p>
          </div>
          
          <div className="flex gap-2 justify-center">
            <Button onClick={startQuiz} size="lg" className="hover:scale-105 transition-transform">
              Start Quiz
            </Button>
            <Button variant="outline" onClick={onComplete}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Deck
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentCard = quizCards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / quizCards.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Quiz Mode
            </CardTitle>
            <div className={`text-lg font-mono ${timeLeft < 60 ? 'text-red-500' : ''}`}>
              {formatTime(timeLeft)}
            </div>
          </div>
          <Progress value={progress} className="w-full" />
          <div className="text-sm text-muted-foreground">
            Question {currentCardIndex + 1} of {quizCards.length}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-4 text-lg">Question:</h3>
            <div className="bg-gray-50 p-4 rounded-lg border min-h-[100px]">
              <div className="text-base leading-relaxed whitespace-pre-wrap">
                {currentCard?.question}
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-lg">Your Answer:</h3>
            <Input
              placeholder="Type your answer here..."
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleNext()}
              className="min-h-[60px]"
            />
          </div>
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentCardIndex === 0}
            >
              Previous
            </Button>
            <Button
              onClick={handleNext}
              className="hover:scale-105 transition-transform"
            >
              {currentCardIndex === quizCards.length - 1 ? 'Finish Quiz' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FlashcardQuiz;
