
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const FlashcardsPage = () => {
  const { toast } = useToast();

  return (
    <div className="container px-4 py-6 md:py-8">
      <h1 className="text-2xl md:text-3xl font-serif font-bold mb-4 md:mb-6">Flashcards</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <FlashcardDeck 
          title="Calculus Fundamentals" 
          cardCount={15} 
          progress={0.6} 
          tags={["Math", "Calculus"]} 
        />
        <FlashcardDeck 
          title="Biology Terminology" 
          cardCount={32} 
          progress={0.25} 
          tags={["Biology", "Science"]} 
        />
        <FlashcardDeck 
          title="World History" 
          cardCount={24} 
          progress={0.8} 
          tags={["History", "Social Studies"]} 
        />
        
        {/* New deck card */}
        <Card className="border-dashed border-2 border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
          <CardContent className="flex items-center justify-center h-full p-4 md:p-6">
            <Button 
              variant="ghost" 
              className="text-gray-500 hover:text-primary"
              onClick={() => toast({ title: "Create new flashcard deck" })}
            >
              + Create New Deck
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 md:mt-12">
        <h2 className="text-xl md:text-2xl font-serif font-bold mb-3 md:mb-4">Recently Studied</h2>
        <Card>
          <CardContent className="p-4 md:p-6">
            <p className="text-center text-gray-500">No recently studied flashcards</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const FlashcardDeck = ({ 
  title, 
  cardCount, 
  progress, 
  tags 
}: { 
  title: string; 
  cardCount: number; 
  progress: number;
  tags: string[];
}) => {
  const { toast } = useToast();
  
  const handleClick = () => {
    toast({
      title: `Opening ${title}`,
      description: "This feature is coming soon"
    });
  };
  
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleClick}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-serif">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-600 mb-3">{cardCount} cards</div>
        
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1">Progress</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full"
              style={{ width: `${progress * 100}%` }}
            ></div>
          </div>
          <div className="text-xs text-right mt-1 text-gray-500">
            {Math.round(progress * 100)}% complete
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mt-3">
          {tags.map(tag => (
            <span 
              key={tag} 
              className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FlashcardsPage;
