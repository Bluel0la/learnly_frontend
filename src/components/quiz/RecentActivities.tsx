
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Calendar, Target, Loader2, TrendingUp, Award, Star, Clock, Eye, ChevronRight } from 'lucide-react';
import { quizApi, HistoryResponse } from '@/services/quizApi';
import { useToast } from '@/hooks/use-toast';
import QuizReview from './QuizReview';

const RecentActivities: React.FC = () => {
  const [history, setHistory] = useState<HistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await quizApi.getQuizHistory();
        setHistory(data);
      } catch (error) {
        console.error('Failed to fetch quiz history:', error);
        toast({
          title: "Error",
          description: "Failed to load quiz history. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [toast]);

  if (selectedSessionId) {
    return (
      <QuizReview 
        sessionId={selectedSessionId} 
        onBack={() => setSelectedSessionId(null)} 
      />
    );
  }

  if (isLoading) {
    return (
      <Card className="luminous-glass-card border-white/10 w-full">
        <CardContent className="p-6 lg:p-8">
          <div className="text-center text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-luminous-primary" />
            <p className="text-lg font-medium">Loading recent activities...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!history || history.sessions.length === 0) {
    return (
      <Card className="luminous-glass-card border-white/10 w-full">
        <CardContent className="p-6 lg:p-8">
          <div className="text-center">
            <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-tr from-luminous-primary-container to-luminous-secondary-container flex items-center justify-center mx-auto mb-4 lg:mb-6">
              <Trophy className="h-8 w-8 lg:h-10 lg:w-10 text-white" />
            </div>
            <h3 className="text-xl lg:text-2xl font-bold mb-3 text-white font-display">Start Your Quiz Journey!</h3>
            <p className="text-slate-400 text-base lg:text-lg mb-4 lg:mb-6">Complete your first math quiz to see your progress here</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 lg:gap-4 text-sm text-slate-400">
              <div className="flex items-center justify-center gap-1">
                <Star className="h-4 w-4 text-luminous-primary" />
                <span>Track Progress</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <Award className="h-4 w-4 text-luminous-secondary" />
                <span>Earn Achievements</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <span>Improve Skills</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'bg-emerald-400';
    if (accuracy >= 60) return 'bg-amber-400';
    return 'bg-rose-400';
  };

  const getAccuracyBadgeVariant = (accuracy: number): "default" | "secondary" | "destructive" | "outline" => {
    if (accuracy >= 80) return 'default';
    if (accuracy >= 60) return 'secondary';
    return 'destructive';
  };

  const getPerformanceIcon = (accuracy: number) => {
    if (accuracy >= 80) return <Trophy className="h-4 w-4 lg:h-5 lg:w-5 text-amber-300" />;
    if (accuracy >= 60) return <Award className="h-4 w-4 lg:h-5 lg:w-5 text-luminous-secondary" />;
    return <Target className="h-4 w-4 lg:h-5 lg:w-5 text-slate-400" />;
  };

  const displayedSessions = showAll ? history.sessions : history.sessions.slice(0, 5);

  return (
    <Card className="luminous-glass-card border-white/10 w-full">
      <CardHeader className="bg-gradient-to-r from-luminous-primary-container/30 to-luminous-secondary-container/15 border-b border-white/10 rounded-t-lg">
        <CardTitle className="flex items-center gap-3 text-lg lg:text-xl font-display text-white">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white/10 border border-white/10 rounded-full flex items-center justify-center">
            <Clock className="h-4 w-4 lg:h-6 lg:w-6 text-luminous-secondary" />
          </div>
          Recent Quiz Activity
          <Badge variant="secondary" className="bg-white/10 text-slate-200 border-white/10 text-xs">
            {history.sessions.length} sessions
          </Badge>
        </CardTitle>
        <p className="text-slate-400 text-sm">Click on any activity to review detailed performance</p>
      </CardHeader>
      <CardContent className="p-4 lg:p-6">
        <div className="space-y-3 lg:space-y-4">
          {displayedSessions.map((session, index) => (
            <div
              key={session.session_id}
              className="group bg-white/[0.02] hover:bg-white/[0.05] p-3 lg:p-4 rounded-lg transition-all duration-200 border border-white/[0.07] hover:border-luminous-primary/40 cursor-pointer"
              onClick={() => setSelectedSessionId(session.session_id)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3 lg:gap-4 flex-1">
                  <div className="relative w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-tr from-luminous-primary-container to-luminous-secondary-container flex items-center justify-center shrink-0">
                    {getPerformanceIcon(session.accuracy)}
                    <div className="absolute -top-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 bg-midnight-900 border border-white/20 rounded-full flex items-center justify-center">
                      <span className="text-[10px] font-bold text-slate-300">#{index + 1}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-base lg:text-lg capitalize text-slate-100 truncate">{session.topic}</h4>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs lg:text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 lg:h-4 lg:w-4" />
                        <span>{new Date(session.date).toLocaleDateString()}</span>
                      </div>
                      <span className="hidden sm:inline">•</span>
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3 lg:h-4 lg:w-4" />
                        <span>{session.total_questions} questions</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-2">
                  <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2">
                    <Badge variant={getAccuracyBadgeVariant(session.accuracy)} className="text-xs font-semibold px-2 py-1">
                      {session.accuracy.toFixed(1)}%
                    </Badge>
                    <div className="w-16 lg:w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getAccuracyColor(session.accuracy)} transition-all duration-500`}
                        style={{ width: `${session.accuracy}%` }}
                      />
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 lg:h-5 lg:w-5 text-slate-500 group-hover:text-luminous-primary transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {history.sessions.length > 5 && (
          <div className="mt-4 lg:mt-6 text-center">
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:text-white"
              size="sm"
            >
              <Eye className="h-4 w-4 mr-2" />
              {showAll ? 'Show Less' : `View All ${history.sessions.length} Activities`}
            </Button>
          </div>
        )}

        {displayedSessions.length === 0 && (
          <div className="text-center text-slate-500 py-6 lg:py-8">
            <Target className="h-10 w-10 lg:h-12 lg:w-12 mx-auto mb-3 text-slate-600" />
            <p>No recent activities found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivities;
