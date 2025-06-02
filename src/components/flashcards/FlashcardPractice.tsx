
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bookmark, RotateCcw, Eye, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FlashcardCard, flashcardApi } from '@/services/flashcardApi';

interface FlashcardPracticeProps {
  deckId: string;
  onComplete?: () => void;
}

const FlashcardPractice: React.FC<FlashcardPracticeProps> = ({ deckId, onComplete }) => {
  const { toast } = useToast();
  const [currentCard, setCurrentCard] = useState<FlashcardCard | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadNextCard = async () => {
    try {
      setIsLoading(true);
      setShowAnswer(false);
      const card = await flashcardApi.getPracticeCard(deckId);
      setCurrentCard(card);
    } catch (error) {
      console.error('Error loading card:', error);
      toast({
        title: "Error",
        description: "Failed to load practice card",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevealAnswer = async () => {
    if (!currentCard) return;
    
    try {
      await flashcardApi.revealCard(currentCard.card_id);
      setShowAnswer(true);
    } catch (error) {
      console.error('Error revealing card:', error);
      toast({
        title: "Error",
        description: "Failed to reveal answer",
        variant: "destructive"
      });
    }
  };

  const handleResponse = async (isCorrect: boolean) => {
    if (!currentCard) return;
    
    try {
      await flashcardApi.submitResponse(currentCard.card_id, isCorrect);
      toast({
        title: isCorrect ? "Correct!" : "Keep practicing",
        description: isCorrect ? "Great job!" : "You'll get it next time"
      });
      loadNextCard();
    } catch (error) {
      console.error('Error submitting response:', error);
      toast({
        title: "Error",
        description: "Failed to submit response",
        variant: "destructive"
      });
    }
  };

  const handleBookmark = async () => {
    if (!currentCard) return;
    
    try {
      if (currentCard.is_bookmarked) {
        await flashcardApi.unbookmarkCard(currentCard.card_id);
        toast({ title: "Bookmark removed" });
      } else {
        await flashcardApi.bookmarkCard(currentCard.card_id);
        toast({ title: "Card bookmarked" });
      }
      
      setCurrentCard({
        ...currentCard,
        is_bookmarked: !currentCard.is_bookmarked
      });
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive"
      });
    }
  };

  const handleReset = async () => {
    if (!currentCard) return;
    
    try {
      await flashcardApi.resetCard(currentCard.card_id);
      toast({ title: "Card progress reset" });
      loadNextCard();
    } catch (error) {
      console.error('Error resetting card:', error);
      toast({
        title: "Error",
        description: "Failed to reset card",
        variant: "destructive"
      });
    }
  };

  React.useEffect(() => {
    loadNextCard();
  }, [deckId]);

  if (isLoading && !currentCard) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No more cards to practice!</p>
          <Button onClick={onComplete} className="mt-4">
            Return to Deck
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Card className="min-h-[300px]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Practice Card</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBookmark}
              className={currentCard.is_bookmarked ? "text-yellow-500" : ""}
            >
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Question:</h3>
            <p className="text-lg">{currentCard.question}</p>
          </div>
          
          {showAnswer ? (
            <>
              <div>
                <h3 className="font-medium mb-2">Answer:</h3>
                <p className="text-lg bg-muted p-4 rounded-lg">{currentCard.answer}</p>
              </div>
              
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => handleResponse(false)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  I got it wrong
                </Button>
                <Button
                  onClick={() => handleResponse(true)}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  I got it right
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <Button onClick={handleRevealAnswer} className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Reveal Answer
              </Button>
            </div>
          )}
          
          <div className="text-sm text-muted-foreground text-center">
            Reviewed: {currentCard.times_reviewed} times | 
            Correct: {currentCard.correct_count} | 
            Wrong: {currentCard.wrong_count}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FlashcardPractice;
