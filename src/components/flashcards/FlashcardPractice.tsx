
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bookmark, RotateCcw, Eye, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PracticeCard, RevealedCard, SubmitResponse, flashcardApi } from '@/services/flashcardApi';
import PracticeAdaptiveSuggestion from './PracticeAdaptiveSuggestion';

interface FlashcardPracticeProps {
  deckId: string;
  onComplete?: () => void;
}

const FlashcardPractice: React.FC<FlashcardPracticeProps> = ({ deckId, onComplete }) => {
  const { toast } = useToast();
  const [currentCard, setCurrentCard] = useState<PracticeCard | null>(null);
  const [revealedCard, setRevealedCard] = useState<RevealedCard | null>(null);
  const [cardStats, setCardStats] = useState<SubmitResponse | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);

  const loadNextCard = async () => {
    try {
      setIsLoading(true);
      setShowAnswer(false);
      setRevealedCard(null);
      setCardStats(null);
      setIsFlipping(false);
      setIsBookmarked(false);
      
      const card = await flashcardApi.getPracticeCard(deckId);
      setCurrentCard(card);
    } catch (error) {
      console.error('Error loading card:', error);
      if (error instanceof Error && error.message.includes('No more cards')) {
        setCurrentCard(null);
        return;
      }
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
      setIsFlipping(true);
      const revealed = await flashcardApi.revealCard(currentCard.card_id);
      setRevealedCard(revealed);
      
      setTimeout(() => {
        setShowAnswer(true);
        setIsFlipping(false);
      }, 400);
    } catch (error) {
      console.error('Error revealing card:', error);
      toast({
        title: "Error",
        description: "Failed to reveal answer",
        variant: "destructive"
      });
      setIsFlipping(false);
    }
  };

  const handleResponse = async (isCorrect: boolean) => {
    if (!currentCard) return;
    
    try {
      const response = await flashcardApi.submitResponse(currentCard.card_id, isCorrect);
      setCardStats(response);
      
      // Track consecutive wrong answers
      if (isCorrect) {
        setConsecutiveWrong(0);
      } else {
        setConsecutiveWrong(prev => prev + 1);
      }
      
      toast({
        title: isCorrect ? "Correct! 🎉" : "Keep practicing! 💪",
        description: isCorrect ? "Great job!" : "You'll get it next time"
      });
      
      setTimeout(() => {
        loadNextCard();
      }, 1500);
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
      if (isBookmarked) {
        await flashcardApi.unbookmarkCard(currentCard.card_id);
        toast({ title: "Bookmark removed" });
      } else {
        await flashcardApi.bookmarkCard(currentCard.card_id);
        toast({ title: "Card bookmarked ⭐" });
      }
      
      setIsBookmarked(!isBookmarked);
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
      toast({ title: "Card progress reset 🔄" });
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

  const handleDrillsGenerated = () => {
    setConsecutiveWrong(0); // Reset counter after generating drills
    toast({
      title: "Practice cards added! 📚",
      description: "New cards have been added to help you practice this topic."
    });
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
      <Card className="animate-fade-in max-w-md mx-auto luminous-glass-card border-white/10">
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-semibold mb-2 font-display text-white">Congratulations!</h3>
          <p className="text-slate-400 mb-4">You've completed all available cards!</p>
          <Button onClick={onComplete} className="mt-4 bg-luminous-primary-container hover:brightness-110 text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Deck
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">
      {/* Adaptive drill suggestion */}
      <PracticeAdaptiveSuggestion
        deckId={deckId}
        consecutiveWrong={consecutiveWrong}
        currentCardId={currentCard?.card_id}
        onDrillsGenerated={handleDrillsGenerated}
      />

      <Card className={`transition-all duration-500 luminous-glass-card border-white/10 ${isFlipping ? 'animate-card-flip' : ''}`}>
        <CardHeader className="flex flex-row items-center justify-between border-b border-white/10">
          <CardTitle className="text-lg flex items-center gap-2 font-display text-white">
            <span className="text-2xl">🎯</span>
            Practice Card
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBookmark}
              className={`transition-colors text-slate-400 hover:text-white hover:bg-white/5 ${isBookmarked ? "text-yellow-400" : ""} hover:scale-110`}
            >
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleReset}
              className="text-slate-400 hover:text-white hover:bg-white/5 hover:scale-110 transition-transform"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="min-h-[200px]">
            <h3 className="font-semibold mb-4 text-luminous-primary text-lg">Question:</h3>
            <ScrollArea className="h-[160px] w-full border border-white/10 rounded-lg p-4 bg-midnight-900/70 luminous-scroll">
              <div className="text-base leading-relaxed break-words whitespace-pre-wrap text-slate-100">
                {currentCard.question}
              </div>
            </ScrollArea>
          </div>

          {showAnswer && revealedCard ? (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-emerald-500/[0.07] p-6 rounded-lg border-l-4 border-emerald-400 border border-white/10">
                <h3 className="font-semibold mb-4 text-emerald-300 text-lg">Answer:</h3>
                <ScrollArea className="h-[200px] w-full luminous-scroll">
                  <div className="text-base leading-relaxed break-words whitespace-pre-wrap text-slate-100">
                    {revealedCard.answer}
                  </div>
                </ScrollArea>
              </div>

              <div className="flex gap-4 justify-center pt-4">
                <Button
                  onClick={() => handleResponse(false)}
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2 hover:scale-105 transition-transform bg-white/5 border-white/10 text-slate-200 hover:border-rose-400/50 hover:text-white min-w-[140px]"
                >
                  <XCircle className="h-5 w-5 text-rose-400" />
                  I got it wrong
                </Button>
                <Button
                  onClick={() => handleResponse(true)}
                  size="lg"
                  className="flex items-center gap-2 hover:scale-105 transition-transform bg-emerald-600 hover:bg-emerald-500 text-white min-w-[140px]"
                >
                  <CheckCircle className="h-5 w-5" />
                  I got it right
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Button
                onClick={handleRevealAnswer}
                size="lg"
                className="flex items-center gap-2 hover:scale-105 transition-transform min-w-[140px] bg-luminous-primary-container hover:brightness-110 text-white"
                disabled={isFlipping}
              >
                <Eye className="h-5 w-5" />
                {isFlipping ? "Revealing..." : "Reveal Answer"}
              </Button>
            </div>
          )}

          {cardStats && (
            <div className="text-sm text-slate-400 text-center bg-white/[0.03] p-4 rounded-lg animate-fade-in border-t border-white/10">
              <div className="flex justify-center gap-6 flex-wrap">
                <span className="flex items-center gap-1">
                  📊 <strong className="text-slate-200">{cardStats.times_reviewed}</strong> reviews
                </span>
                <span className="text-emerald-400 flex items-center gap-1">
                  ✅ <strong>{cardStats.correct_count}</strong> correct
                </span>
                <span className="text-rose-400 flex items-center gap-1">
                  ❌ <strong>{cardStats.wrong_count}</strong> wrong
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FlashcardPractice;
