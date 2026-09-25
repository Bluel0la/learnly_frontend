import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { quizApi, QuizQuestion, QuestionResponse, SubmitResultResponse,
AdaptiveQuestionBatch, QuestionBatchResponse } from '@/services/quizApi';
import { ArrowLeft, Clock, Trophy, Zap, Brain, Pause } from 'lucide-react';

interface ActiveMathQuizProps {
  sessionId: string;
  topic: string;
  totalQuestions: number;
  onQuizComplete: (results: SubmitResultResponse) => void;
  onBack: () => void;
  isFirstAttempt?: boolean;
  // Optional prop for handling resume state externally, unused for now
}

// For localStorage
const STORAGE_PREFIX = 'quiz-progress-';

type QuizPhase = 'skill-assessment' | 'adaptive-quiz' | 'completed';

interface SavedQuizProgress {
  currentQuestionIndex: number;
  userAnswers: QuestionResponse[];
  selectedAnswer: string;
  timeElapsed: number;
  quizPhase: QuizPhase;
  currentDifficulty: string;
  previousScore: number;
  questions: QuizQuestion[];
  // For possible future extensions
}

const ActiveMathQuiz: React.FC<ActiveMathQuizProps> = ({ 
  sessionId, 
  topic, 
  totalQuestions, 
  onQuizComplete, 
  onBack,
  isFirstAttempt = true
}) => {
  const { toast } = useToast();

  // Resume dialog state
  const [showResumeDialog, setShowResumeDialog] = useState(false);

  // All quiz states
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<QuestionResponse[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [quizPhase, setQuizPhase] = useState<QuizPhase>(isFirstAttempt ? 'skill-assessment' : 'adaptive-quiz');
  const [currentDifficulty, setCurrentDifficulty] = useState<string>('mixed');
  const [previousScore, setPreviousScore] = useState<number>(0);

  // Debug: log session, storage state on mount
  useEffect(() => {
    const paused = localStorage.getItem(STORAGE_PREFIX + sessionId);
    console.log("Quiz mount: sessionId", sessionId, "Paused data exists?", !!paused);
    if (paused) {
      try {
        const parsed = JSON.parse(paused);
        // Check if sessionId inside matches the current sessionId
        if (parsed && parsed.questions?.length > 0) {
          console.log("Found paused quiz progress:", parsed);
        } else {
          console.warn("Paused data found but appears invalid:", paused);
        }
      } catch (err) {
        console.warn("Paused quiz data could not be parsed; will start fresh", err, paused);
      }
    }
  }, [sessionId]);

  // Timer handle
  useEffect(() => {
    if (isLoading) return;
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isLoading]);

  // On mount, see if we have paused data for this session
  useEffect(() => {
    const paused = localStorage.getItem(STORAGE_PREFIX + sessionId);
    if (paused) {
      setShowResumeDialog(true);
      setIsLoading(false); // Wait for user to choose resume/startover!
      console.log("showResumeDialog set TRUE due to paused progress for session:", sessionId);
    } else {
      console.log("No paused progress found. Initializing quiz.");
      initializeQuiz();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, isFirstAttempt, totalQuestions]);

  // Save progress after every relevant state change
  useEffect(() => {
    if (isLoading) return;
    if (questions.length === 0) return;
    const toSave: SavedQuizProgress = {
      currentQuestionIndex,
      userAnswers,
      selectedAnswer,
      timeElapsed,
      quizPhase,
      currentDifficulty,
      previousScore,
      questions,
    };
    localStorage.setItem(STORAGE_PREFIX + sessionId, JSON.stringify(toSave));
    console.log("Saved quiz progress for session:", sessionId, toSave);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, userAnswers, selectedAnswer, timeElapsed, quizPhase, currentDifficulty, previousScore, questions, isLoading]);

  // Helper - restore from saved progress
  const restoreFromSaved = () => {
    const paused = localStorage.getItem(STORAGE_PREFIX + sessionId);
    if (paused) {
      try {
        const data: SavedQuizProgress = JSON.parse(paused);
        setQuestions(data.questions);
        setCurrentQuestionIndex(data.currentQuestionIndex);
        setUserAnswers(data.userAnswers);
        setSelectedAnswer(data.selectedAnswer);
        setTimeElapsed(data.timeElapsed);
        setQuizPhase(data.quizPhase);
        setCurrentDifficulty(data.currentDifficulty);
        setPreviousScore(data.previousScore);
        setShowResumeDialog(false);
        setIsLoading(false);
        toast({
          title: "Quiz Resumed",
          description: "Your progress was restored!"
        });
        console.log("Quiz progress restored from storage for session:", sessionId, data);
      } catch (err) {
        console.warn("Restore from saved failed, starting new. Err:", err);
        localStorage.removeItem(STORAGE_PREFIX + sessionId);
        initializeQuiz(); // If failed to parse, just restart clean
      }
    }
  };

  // Helper - wipe saved session and start new
  const startNewSession = () => {
    localStorage.removeItem(STORAGE_PREFIX + sessionId);
    setShowResumeDialog(false);
    initializeQuiz();
    console.log("Start new session; previous progress cleared for:", sessionId);
  };

  // Called when no saved pause found or after "start new"
  const initializeQuiz = async () => {
    try {
      setIsLoading(true);
      let response: QuestionBatchResponse | AdaptiveQuestionBatch;
      if (isFirstAttempt) {
        response = await quizApi.getInitialQuestionBatch(sessionId);
        setQuestions(response.current_batch);
        setQuizPhase('skill-assessment');
        toast({
          title: "Skill Assessment",
          description: "Let's see what you know! Mixed difficulty questions to assess your level.",
        });
      } else {
        response = await quizApi.getNextAdaptiveBatch(sessionId, { 
          difficulty: 'medium',
          num_questions: totalQuestions 
        });
        setQuestions(response.current_batch);
        setCurrentDifficulty(response.difficulty_level);
        setPreviousScore(response.previous_score_percent);
        setQuizPhase('adaptive-quiz');
        toast({
          title: "Adaptive Quiz Ready!",
          description: `Starting at ${response.difficulty_level} difficulty based on your history.`,
        });
      }
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setSelectedAnswer('');
      setTimeElapsed(0);
    } catch (error) {
      console.error('Failed to initialize quiz:', error);
      toast({
        title: "Error",
        description: "Failed to load quiz questions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (!selectedAnswer) {
      toast({
        title: "Answer Required",
        description: "Please select an answer before proceeding.",
        variant: "destructive"
      });
      return;
    }

    const newAnswer: QuestionResponse = {
      question_id: questions[currentQuestionIndex].question_id,
      selected_answer: selectedAnswer
    };

    const updatedAnswers = [...userAnswers, newAnswer];
    setUserAnswers(updatedAnswers);
    setSelectedAnswer('');

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      submitQuiz(updatedAnswers);
    }
  };

  const submitQuiz = async (answers: QuestionResponse[]) => {
    setIsSubmitting(true);
    try {
      const response = await quizApi.submitAnswers(sessionId, { responses: answers });
      localStorage.removeItem(STORAGE_PREFIX + sessionId); // Clear progress after submit!
      if (quizPhase === 'skill-assessment') {
        toast({
          title: "Assessment Complete!",
          description: `Your skill level has been assessed. Score: ${response.score_percent}%`,
        });
      } else {
        toast({
          title: "Quiz Complete!",
          description: `Final score: ${response.score_percent}%`,
        });
      }
      onQuizComplete(response);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      toast({
        title: "Error",
        description: "Failed to submit answers. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePause = () => {
    toast({
      title: "Quiz Paused",
      description: "Your progress has been saved. You can resume later."
    });
    onBack(); // Will keep localStorage entry
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseIcon = () => {
    switch (quizPhase) {
      case 'skill-assessment': return <Brain className="h-5 w-5" />;
      case 'adaptive-quiz': return <Zap className="h-5 w-5" />;
      default: return <Trophy className="h-5 w-5" />;
    }
  };

  const getPhaseTitle = () => {
    switch (quizPhase) {
      case 'skill-assessment': return 'Skill Assessment';
      case 'adaptive-quiz': return `Adaptive Quiz - ${currentDifficulty}`;
      default: return 'Quiz Complete';
    }
  };

  const getPhaseDescription = () => {
    switch (quizPhase) {
      case 'skill-assessment': return 'Determining your skill level with mixed difficulty questions';
      case 'adaptive-quiz': return `Personalized questions at ${currentDifficulty} level`;
      default: return 'Quiz completed';
    }
  };

  if (showResumeDialog) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-6">
        <Card className="max-w-md mx-auto w-full luminous-glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-lg text-center font-display text-white">Resume Quiz?</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <p className="text-slate-300 text-center">
              {`You have a paused quiz for this topic (session: ${sessionId.slice(0, 8)}...).`}
              <br />
              Would you like to resume where you left off, or start over?
              <br />
              <span className="text-xs text-slate-500">(Pausing saves only your in-progress answers. If your session ID changes, you may need to re-start.)</span>
            </p>
            <div className="flex gap-4">
              <Button onClick={restoreFromSaved} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                Resume
              </Button>
              <Button onClick={startNewSession} variant="outline" className="bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:text-white">
                Start Over
              </Button>
              <Button onClick={onBack} variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/5">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-slate-400">Loading quiz...</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="luminous-glass-card border-white/10">
        <CardContent className="text-center py-8">
          <h3 className="text-xl font-semibold mb-2 font-display text-white">No Questions Available</h3>
          <p className="text-slate-400 mb-4">Unable to load quiz questions.</p>
          <Button onClick={onBack} className="bg-luminous-primary-container hover:brightness-110 text-white">Back to Quiz Selection</Button>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-emerald-300 bg-emerald-500/15 border border-emerald-400/30';
      case 'medium': return 'text-amber-300 bg-amber-500/15 border border-amber-400/30';
      case 'hard': return 'text-rose-300 bg-rose-500/15 border border-rose-400/30';
      case 'mixed': return 'text-luminous-secondary bg-luminous-secondary-container/10 border border-luminous-secondary-container/30';
      default: return 'text-slate-300 bg-white/10 border border-white/10';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-gradient-to-r from-luminous-primary-container/40 via-midnight-900 to-midnight-950 border border-white/10 text-white p-4 rounded-2xl backdrop-blur-xl">
        <Button
          variant="ghost"
          onClick={onBack}
          disabled={isSubmitting}
          className="text-slate-300 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            {getPhaseIcon()}
            <h2 className="font-bold text-lg font-display">{getPhaseTitle()}</h2>
          </div>
          <p className="text-slate-300 text-sm">
            {topic.charAt(0).toUpperCase() + topic.slice(1)} • Question {currentQuestionIndex + 1} of {questions.length}
          </p>
          <p className="text-slate-500 text-xs">{getPhaseDescription()}</p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={handlePause}
            className="text-slate-300 hover:text-white hover:bg-white/10 px-3 py-1"
            disabled={isSubmitting}
          >
            <Pause className="h-5 w-5 mr-1" /> Pause
          </Button>
          <div className="hidden sm:flex items-center gap-2 text-slate-300">
            <Clock className="h-4 w-4" />
            <span className="font-luminous-mono text-sm">{formatTime(timeElapsed)}</span>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold font-luminous-mono uppercase ${getDifficultyColor(currentQuestion.difficulty)}`}>
            {currentQuestion.difficulty.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-luminous-mono uppercase tracking-widest text-slate-400">Progress</span>
          <span className="text-sm font-bold text-luminous-secondary font-luminous-mono">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-luminous-primary-container to-luminous-secondary-container h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <Card className="luminous-glass-card luminous-glow-border border-white/10">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-luminous-primary-container to-luminous-secondary-container flex items-center justify-center text-white text-xl font-bold font-display luminous-shadow-glow-purple">
              {currentQuestionIndex + 1}
            </div>
          </div>
          <CardTitle className="font-display text-xl sm:text-2xl font-bold text-white leading-relaxed px-4">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3" key={currentQuestion.question_id}>
            {currentQuestion.choices.map((choice, index) => {
              const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
              const isSelected = selectedAnswer === choice;

              return (
                <button
                  key={index}
                  className={`animate-luminous-option-in w-full flex items-center gap-3.5 p-4 rounded-xl border text-left transition-all duration-200 min-h-[64px] ${
                    isSelected
                      ? 'bg-luminous-primary-container/25 text-white border-luminous-primary luminous-shadow-glow-purple scale-[1.01]'
                      : 'bg-white/[0.03] border-white/10 text-slate-200 hover:bg-white/[0.07] hover:border-luminous-primary/50 hover:text-white hover:translate-x-0.5'
                  }`}
                  style={{ animationDelay: `${index * 60}ms` }}
                  onClick={() => handleAnswerSelect(choice)}
                  disabled={isSubmitting}
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-sm font-bold font-display transition-colors ${
                      isSelected ? 'bg-white text-luminous-primary-container' : 'bg-white/10 text-slate-300'
                    }`}>
                      {letters[index] ?? index + 1}
                    </div>
                    <div className="text-[15px] leading-relaxed whitespace-normal break-words flex-1 text-left">
                      {choice}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-6">
            <Button
              onClick={handleNextQuestion}
              disabled={!selectedAnswer || isSubmitting}
              className="w-full h-14 text-lg font-bold bg-luminous-primary-container hover:brightness-110 text-white luminous-shadow-glow-purple transition-all duration-300 disabled:opacity-40 disabled:shadow-none"
            >
              <div className="flex items-center gap-2">
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : currentQuestionIndex < questions.length - 1 ? (
                  <>
                    <Zap className="h-5 w-5" />
                    Next Question
                  </>
                ) : (
                  <>
                    <Trophy className="h-5 w-5" />
                    {quizPhase === 'skill-assessment' ? 'Complete Assessment' : 'Submit Quiz'}
                  </>
                )}
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActiveMathQuiz;

// ... file is getting long, consider splitting dialog, timer, and storage helpers to their own files!
