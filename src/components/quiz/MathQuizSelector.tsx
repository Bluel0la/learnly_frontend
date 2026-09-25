
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { quizApi, MathTopic, StartQuizRequest } from '@/services/quizApi';
import { Brain } from 'lucide-react';
import TopicSelector from './TopicSelector';

interface MathQuizSelectorProps {
  onQuizStart: (sessionId: string, topic: string, totalQuestions: number) => void;
}

const MathQuizSelector: React.FC<MathQuizSelectorProps> = ({ onQuizStart }) => {
  const [topics, setTopics] = useState<MathTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const availableTopics = await quizApi.getAvailableTopics();
        setTopics(availableTopics);
      } catch (error) {
        console.error('Failed to fetch topics:', error);
        toast({
          title: "Error",
          description: "Failed to load available topics. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoadingTopics(false);
      }
    };

    fetchTopics();
  }, [toast]);

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopic(topicId);
  };

  const handleStartQuiz = async () => {
    if (!selectedTopic) {
      toast({
        title: "Topic Required",
        description: "Please select a topic to start the quiz.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const request: StartQuizRequest = {
        topic: selectedTopic,
        num_questions: numQuestions
      };

      const response = await quizApi.startQuizSession(request);

      toast({
        title: "Quiz Started!",
        description: `${response.message}. Historical accuracy: ${response.historical_accuracy}%`
      });

      onQuizStart(response.session_id, response.topic, response.total_questions);
    } catch (error) {
      console.error('Failed to start quiz:', error);
      toast({
        title: "Error",
        description: "Failed to start quiz. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingTopics) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-slate-400">Loading topics...</div>
      </div>
    );
  }

  const selectedTopicData = topics.find(t => t.topic_id === selectedTopic);

  return (
    <div className="w-full max-w-full overflow-hidden space-y-8">
      {/* Main Quiz Card */}
      <Card className="luminous-glass-card luminous-glow-border border-white/10 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-luminous-primary-container via-luminous-primary to-luminous-secondary-container" />
        <CardHeader className="text-center pb-4 pt-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-luminous-primary-container to-luminous-secondary-container flex items-center justify-center luminous-shadow-glow-purple">
              <Brain className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="font-display text-3xl font-extrabold text-white tracking-tight">Math Quiz Challenge</CardTitle>
          <p className="text-slate-400 text-lg">Test your skills and level up!</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-xs font-luminous-mono uppercase tracking-widest text-slate-400">Number of Questions</label>
              <Select value={numQuestions.toString()} onValueChange={(value) => setNumQuestions(Number(value))}>
                <SelectTrigger className="h-12 bg-white/[0.03] border-white/10 text-slate-100 text-[15px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0d1c2d] border-white/10 text-slate-200">
                  <SelectItem value="5">5 Questions (Quick)</SelectItem>
                  <SelectItem value="10">10 Questions (Standard)</SelectItem>
                  <SelectItem value="15">15 Questions (Extended)</SelectItem>
                  <SelectItem value="20">20 Questions (Challenge)</SelectItem>
                </SelectContent>
              </Select>
              {selectedTopicData && (
                <p className="text-xs text-slate-500">
                  {selectedTopicData.name} · Adaptive difficulty · ~{Math.ceil(numQuestions * 1.5)} min
                </p>
              )}
            </div>

            <Button
              className="w-full h-12 bg-white text-[#5b2ee5] hover:bg-white/90 font-bold text-base shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-60"
              onClick={handleStartQuiz}
              disabled={!selectedTopic || isLoading}
            >
              {isLoading ? 'Starting Quiz...' : selectedTopic ? 'Start Quiz Challenge' : 'Pick a topic below'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Topic Selection */}
      <Card className="luminous-glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-xl font-display text-white">Choose Your Topic</CardTitle>
          <p className="text-slate-400 text-sm">Select a topic to focus your practice session</p>
        </CardHeader>
        <CardContent className="max-w-full overflow-hidden">
          <TopicSelector
            topics={topics}
            selectedTopics={selectedTopic ? [selectedTopic] : []}
            onTopicToggle={handleTopicToggle}
            multiSelect={false}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default MathQuizSelector;
