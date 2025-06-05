
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { QuizResult } from '@/services/flashcardApi';
import AdaptiveDrillSuggestion from './AdaptiveDrillSuggestion';

interface QuizReviewProps {
  result: QuizResult;
  deckId: string;
  onRestart: () => void;
  onExit: () => void;
}

const QuizReview: React.FC<QuizReviewProps> = ({ result, deckId, onRestart, onExit }) => {
  const accuracy = Math.round((result.correct / result.total_questions) * 100);
  const grade = accuracy >= 90 ? 'A' : accuracy >= 80 ? 'B' : accuracy >= 70 ? 'C' : accuracy >= 60 ? 'D' : 'F';

  const handleDrillsGenerated = () => {
    // Optionally refresh the page or show a success message
    onExit(); // Return to deck view to see new cards
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Results Summary */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
          <CardDescription>Here's how you performed</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-6xl font-bold text-blue-600">{grade}</div>
          <div className="text-xl">
            {result.correct}/{result.total_questions} correct ({accuracy}%)
          </div>
          
          <div className="flex justify-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-4 w-4" />
              {result.correct} Correct
            </div>
            <div className="flex items-center gap-1 text-red-600">
              <XCircle className="h-4 w-4" />
              {result.wrong} Wrong
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adaptive Drill Suggestion */}
      <AdaptiveDrillSuggestion
        deckId={deckId}
        wrongAnswers={result.wrong}
        totalQuestions={result.total_questions}
        onDrillsGenerated={handleDrillsGenerated}
      />

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.detailed_results.map((detail, index) => (
            <div key={detail.card_id} className="border-l-4 pl-4 py-2" 
                 style={{ borderColor: detail.correct ? '#10b981' : '#ef4444' }}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium">Question {index + 1}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Your answer: <span className={detail.correct ? 'text-green-600' : 'text-red-600'}>
                      {detail.your_answer}
                    </span>
                  </p>
                  {!detail.correct && (
                    <p className="text-sm text-green-600 mt-1">
                      Correct answer: {detail.correct_answer}
                    </p>
                  )}
                </div>
                <div className="ml-2">
                  {detail.correct ? 
                    <CheckCircle className="h-5 w-5 text-green-600" /> : 
                    <XCircle className="h-5 w-5 text-red-600" />
                  }
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center">
        <Button onClick={onRestart} variant="outline" className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4" />
          Retake Quiz
        </Button>
        <Button onClick={onExit}>
          Back to Deck
        </Button>
      </div>
    </div>
  );
};

export default QuizReview;
