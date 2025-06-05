import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, BookOpen, Play, Upload, Sparkles, Edit, Clock } from 'lucide-react';
import { FlashcardDeck, flashcardApi } from '@/services/flashcardApi';
import FlashcardPractice from '@/components/flashcards/FlashcardPractice';
import FlashcardQuiz from '@/components/flashcards/FlashcardQuiz';
import ManualCardDialog from '@/components/flashcards/ManualCardDialog';

const FlashcardsPage = () => {
  const { toast } = useToast();
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'decks' | 'practice' | 'quiz'>('decks');
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const loadDecks = async () => {
    try {
      setIsLoading(true);
      const userDecks = await flashcardApi.getDecks();
      setDecks(userDecks);
    } catch (error) {
      console.error('Error loading decks:', error);
      toast({
        title: "Error",
        description: "Failed to load flashcard decks",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDeck = async () => {
    if (!newDeckTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a deck title",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Creating deck with title:', newDeckTitle);
      const newDeck = await flashcardApi.createDeck(newDeckTitle);
      console.log('Deck created successfully:', newDeck);
      toast({
        title: "Success! 🎉",
        description: `Deck "${newDeck.title}" created successfully`
      });
      setNewDeckTitle('');
      setIsCreateDialogOpen(false);
      loadDecks();
    } catch (error) {
      console.error('Error creating deck:', error);
      toast({
        title: "Error",
        description: "Failed to create deck",
        variant: "destructive"
      });
    }
  };

  const handleStartPractice = (deckId: string) => {
    setSelectedDeckId(deckId);
    setCurrentView('practice');
  };

  const handleStartQuiz = (deckId: string) => {
    setSelectedDeckId(deckId);
    setCurrentView('quiz');
  };

  const handleBackToDecks = () => {
    setCurrentView('decks');
    setSelectedDeckId(null);
    loadDecks(); // Refresh decks to get updated card counts
  };

  useEffect(() => {
    loadDecks();
  }, []);

  if (currentView === 'practice' && selectedDeckId) {
    return (
      <div className="container px-4 py-6 md:py-8">
        <div className="mb-4">
          <Button onClick={handleBackToDecks} variant="outline" className="hover:scale-105 transition-transform">
            ← Back to Decks
          </Button>
        </div>
        <FlashcardPractice
          deckId={selectedDeckId}
          onComplete={handleBackToDecks}
        />
      </div>
    );
  }

  if (currentView === 'quiz' && selectedDeckId) {
    return (
      <div className="container px-4 py-6 md:py-8">
        <div className="mb-4">
          <Button onClick={handleBackToDecks} variant="outline" className="hover:scale-105 transition-transform">
            ← Back to Decks
          </Button>
        </div>
        <FlashcardQuiz
          deckId={selectedDeckId}
          onComplete={handleBackToDecks}
        />
      </div>
    );
  }

  return (
    <div className="container px-4 py-6 md:py-8">
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎓</span>
          <h1 className="text-2xl md:text-3xl font-serif font-bold">Flashcards</h1>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 hover:scale-105 transition-transform">
              <Plus className="h-4 w-4" />
              New Deck
            </Button>
          </DialogTrigger>
          <DialogContent className="animate-scale-in">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Create New Deck
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Enter deck title..."
                value={newDeckTitle}
                onChange={(e) => setNewDeckTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateDeck()}
                className="focus:ring-2 focus:ring-primary transition-all"
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateDeck} className="hover:scale-105 transition-transform">
                  Create Deck
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {decks.map((deck, index) => (
            <div 
              key={deck.deck_id} 
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <FlashcardDeckCard
                deck={deck}
                onStartPractice={() => handleStartPractice(deck.deck_id)}
                onStartQuiz={() => handleStartQuiz(deck.deck_id)}
                onCardsAdded={loadDecks}
              />
            </div>
          ))}
          
          {decks.length === 0 && (
            <Card className="col-span-full animate-fade-in">
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-lg font-medium mb-2">No flashcard decks yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first deck to start studying with flashcards
                </p>
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="hover:scale-105 transition-transform"
                >
                  Create Your First Deck
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

const FlashcardDeckCard = ({ 
  deck, 
  onStartPractice,
  onStartQuiz,
  onCardsAdded
}: { 
  deck: FlashcardDeck; 
  onStartPractice: () => void;
  onStartQuiz: () => void;
  onCardsAdded: () => void;
}) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      setUploadProgress('Preparing upload...');
      
      console.log('Starting file upload for deck:', deck.deck_id);
      console.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      // File validation feedback
      const maxSizeInMB = 10;
      if (file.size > maxSizeInMB * 1024 * 1024) {
        throw new Error(`File size must be less than ${maxSizeInMB}MB`);
      }

      const supportedExtensions = ['.pdf', '.pptx', '.docx', '.txt'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!supportedExtensions.includes(fileExtension)) {
        throw new Error(`Unsupported file type. Please upload: ${supportedExtensions.join(', ')}`);
      }

      setUploadProgress('Uploading file...');
      
      // Add a small delay to show progress
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUploadProgress('Processing content...');
      
      const result = await flashcardApi.generateFlashcards(deck.deck_id, file, 30);
      
      setUploadProgress('Creating flashcards...');
      
      // Another small delay for UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Upload completed successfully:', result);
      
      toast({
        title: "Success! ✨",
        description: `Generated ${result.cards?.length || 'multiple'} flashcards from "${file.name}"`
      });
      onCardsAdded();
      
    } catch (error) {
      console.error('Error generating flashcards:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate flashcards from file';
      
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress('');
      event.target.value = '';
    }
  };

  const handleUploadClick = () => {
    const fileInput = document.getElementById(`upload-${deck.deck_id}`) as HTMLInputElement;
    if (fileInput) {
      console.log('Triggering file input click for deck:', deck.deck_id);
      fileInput.click();
    }
  };
  
  return (
    <>
      <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-serif flex items-center gap-2">
            <span className="text-xl">🃏</span>
            {deck.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {deck.card_count || 0} cards • Created {new Date(deck.date_created).toLocaleDateString()}
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={onStartPractice} 
                className="group-hover:scale-105 transition-transform"
                disabled={!deck.card_count || deck.card_count === 0}
              >
                <Play className="h-4 w-4 mr-2" />
                Practice
              </Button>
              
              <Button 
                onClick={onStartQuiz} 
                variant="outline"
                className="group-hover:scale-105 transition-transform bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100"
                disabled={!deck.card_count || deck.card_count < 5}
              >
                <Clock className="h-4 w-4 mr-2" />
                Quiz
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => setIsManualDialogOpen(true)}
                className="group-hover:scale-105 transition-transform"
              >
                <Edit className="h-4 w-4 mr-2" />
                Add Cards
              </Button>
              
              <div className="relative">
                <input
                  type="file"
                  id={`upload-${deck.deck_id}`}
                  accept=".pdf,.pptx,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                <Button 
                  variant="outline" 
                  className="w-full group-hover:scale-105 transition-transform bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100"
                  disabled={isUploading}
                  onClick={handleUploadClick}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </div>
          </div>
          
          {isUploading && (
            <div className="text-xs text-center text-muted-foreground animate-pulse bg-blue-50 p-2 rounded">
              📤 {uploadProgress}
            </div>
          )}
        </CardContent>
      </Card>
      
      <ManualCardDialog
        isOpen={isManualDialogOpen}
        onOpenChange={setIsManualDialogOpen}
        deckId={deck.deck_id}
        onCardsAdded={onCardsAdded}
      />
    </>
  );
};

export default FlashcardsPage;
