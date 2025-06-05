
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, ArrowLeft, RotateCcw } from 'lucide-react';
import { QuizCard, QuizResponse } from '@/services/flashcardApi';

interface QuizReviewProps {
  quizCards: QuizCard[];
  userResponses: QuizResponse[];
  onRetakeQuiz: () => void;
  onBackToDeck: () => void;
}

const QuizReview: React.FC<QuizReviewProps> = ({
  quizCards,
  userResponses,
  onRetakeQuiz,
  onBackToDeck
}) => {
  const failedCards = quizCards.filter((card, index) => {
    const response = userResponses[index];
    return response && !response.is_correct;
  });

  if (failedCards.length === 0) {
    return (
      <Card className="max-w-4xl mx-auto animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-xl text-green-600">
            <CheckCircle className="h-6 w-6" />
            Perfect Score!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">You got all questions correct! No review needed.</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={onRetakeQuiz} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake Quiz
            </Button>
            <Button onClick={onBackToDeck}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Deck
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-6 w-6 text-red-500" />
            Review Missed Questions ({failedCards.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Here are the questions you missed. Review them to improve your understanding.
          </p>
          <div className="flex gap-2 mb-6">
            <Button onClick={onRetakeQuiz} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake Quiz
            </Button>
            <Button onClick={onBackToDeck}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Deck
            </Button>
          </div>
        </CardContent>
      </Card>

      {failedCards.map((card, failedIndex) => {
        const originalIndex = quizCards.findIndex(c => c.card_id === card.card_id);
        const userResponse = userResponses[originalIndex];
        
        return (
          <Card key={card.card_id} className="border-red-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-medium">
                  Question {originalIndex + 1}
                </span>
                Missed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 text-gray-700">Question:</h4>
                <div className="bg-gray-50 p-3 rounded border">
                  {card.question}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 text-red-600">Your Answer:</h4>
                  <div className="bg-red-50 border border-red-200 p-3 rounded">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      <span>{userResponse?.user_answer}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-green-600">Correct Answer:</h4>
                  <div className="bg-green-50 border border-green-200 p-3 rounded">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{card.options[card.correct_answer_index]}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-gray-700">All Options:</h4>
                <div className="space-y-2">
                  {card.options.map((option, optionIndex) => {
                    const isCorrect = optionIndex === card.correct_answer_index;
                    const wasUserChoice = option === userResponse?.user_answer;
                    
                    let className = "p-2 rounded border ";
                    if (isCorrect) {
                      className += "bg-green-50 border-green-200 text-green-800";
                    } else if (wasUserChoice) {
                      className += "bg-red-50 border-red-200 text-red-800";
                    } else {
                      className += "bg-gray-50 border-gray-200 text-gray-600";
                    }
                    
                    return (
                      <div key={optionIndex} className={className}>
                        <div className="flex items-center gap-2">
                          {isCorrect && <CheckCircle className="h-4 w-4 text-green-500" />}
                          {wasUserChoice && !isCorrect && <XCircle className="h-4 w-4 text-red-500" />}
                          <span className="text-sm font-medium">
                            {String.fromCharCode(65 + optionIndex)}.
                          </span>
                          <span>{option}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default QuizReview;
