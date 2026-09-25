
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Target, 
  Award, 
  Brain, 
  Loader2, 
  Calendar,
  Clock,
  BarChart3,
  PieChart,
  Trophy,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  Flame,
  Users,
  BookOpen
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { quizApi, PerformanceResponse, QuizSession } from '@/services/quizApi';
import {
  activityByDay,
  activeDayStreak,
  compareLast7VsPrior7,
  cumulativeProgress,
  firstSessionDate,
  sessionsInRange,
  weeklyAccuracy,
} from '@/lib/historyStats';
import { useToast } from '@/hooks/use-toast';
import StatCard from "./analytics/StatCard";
import WeeklyActivitySparkline from "./analytics/WeeklyActivitySparkline";
import BestTopicCard from "./analytics/BestTopicCard";
import WeakTopicCard from "./analytics/WeakTopicCard";
import TopicPerformanceList from "./analytics/TopicPerformanceList";

interface PerformanceAnalyticsProps {
  onClose: () => void;
}

const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4'];

const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({ onClose }) => {
  const [performance, setPerformance] = useState<PerformanceResponse | null>(null);
  const [history, setHistory] = useState<QuizSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [perf, hist] = await Promise.all([
          quizApi.getUserPerformance(),
          quizApi.getQuizHistory(0, 100).catch(() => ({ sessions: [] as QuizSession[] })),
        ]);
        setPerformance(perf);
        setHistory(hist.sessions ?? []);
      } catch (error) {
        console.error('Failed to fetch performance:', error);
        toast({
          title: "Error",
          description: "Failed to load performance data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md luminous-glass-card border-white/10">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-luminous-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2 font-display text-white">Analyzing Your Performance</h3>
            <p className="text-slate-400 text-center">Crunching the numbers to show your progress...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!performance || performance.performance_by_topic.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-2xl luminous-glass-card border-white/10">
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-luminous-primary-container to-luminous-secondary-container rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-display text-white">No Analytics Yet</CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-8">
            <p className="text-slate-400 mb-6 text-lg">Complete some quizzes to unlock detailed performance insights!</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="flex flex-col items-center p-4 bg-luminous-secondary-container/[0.07] border border-luminous-secondary-container/20 rounded-lg">
                <Trophy className="h-8 w-8 text-luminous-secondary mb-2" />
                <span className="font-medium text-luminous-secondary">Track Progress</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-emerald-500/[0.07] border border-emerald-400/20 rounded-lg">
                <Target className="h-8 w-8 text-emerald-400 mb-2" />
                <span className="font-medium text-emerald-300">Find Strengths</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-luminous-primary-container/[0.08] border border-luminous-primary/25 rounded-lg">
                <Award className="h-8 w-8 text-luminous-primary mb-2" />
                <span className="font-medium text-luminous-primary">Improve Skills</span>
              </div>
            </div>
            <Button onClick={onClose} size="lg" className="bg-luminous-primary-container hover:brightness-110 text-white">
              Start Your First Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const overallStats = performance.performance_by_topic.reduce(
    (acc, topic) => ({
      totalAnswered: acc.totalAnswered + topic.total_answered,
      totalCorrect: acc.totalCorrect + topic.correct,
      totalWrong: acc.totalWrong + topic.wrong
    }),
    { totalAnswered: 0, totalCorrect: 0, totalWrong: 0 }
  );

  const overallAccuracy = overallStats.totalAnswered > 0 
    ? (overallStats.totalCorrect / overallStats.totalAnswered) * 100 
    : 0;

  const strongestTopics = performance.performance_by_topic
    .filter(topic => topic.total_answered >= 3)
    .sort((a, b) => b.accuracy_percent - a.accuracy_percent)
    .slice(0, 3);

  const weakestTopics = performance.performance_by_topic
    .filter(topic => topic.total_answered >= 3)
    .sort((a, b) => a.accuracy_percent - b.accuracy_percent)
    .slice(0, 3);

  const chartData = performance.performance_by_topic
    .sort((a, b) => b.total_answered - a.total_answered)
    .slice(0, 8)
    .map(topic => ({
      topic: topic.topic.charAt(0).toUpperCase() + topic.topic.slice(1),
      accuracy: topic.accuracy_percent,
      questions: topic.total_answered
    }));

  const getPerformanceLevel = (accuracy: number) => {
    if (accuracy >= 85) return { label: 'Excellent', color: 'bg-emerald-500/[0.07]0', icon: Trophy };
    if (accuracy >= 70) return { label: 'Good', color: 'bg-luminous-secondary-container/[0.07]0', icon: Target };
    if (accuracy >= 50) return { label: 'Fair', color: 'bg-yellow-500', icon: Star };
    return { label: 'Needs Work', color: 'bg-red-500', icon: AlertCircle };
  };

  const performanceLevel = getPerformanceLevel(overallAccuracy);
  const PerformanceIcon = performanceLevel.icon;

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number | null }>; label?: string }) => {
    if (active && payload && payload.length) {
      const accuracy = payload[0].value;
      return (
        <div className="bg-[#0d1c2d] p-3 border border-white/10 rounded-lg shadow-lg">
          <p className="font-medium capitalize text-slate-100">{`${label}`}</p>
          <p className="text-luminous-secondary">
            {accuracy == null ? 'No quizzes this week' : `Accuracy: ${Number(accuracy).toFixed(1)}%`}
          </p>
          {payload[1] && (
            <p className="text-emerald-400">
              {`Questions: ${payload[1].value}`}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Real trends: trailing 7 days vs the 7 days before (question-weighted).
  // Deltas are null when there is no prior-week baseline — cards hide them.
  const weekComparison = compareLast7VsPrior7(history);
  const accuracyDelta =
    weekComparison.accuracyDelta !== null ? parseFloat(weekComparison.accuracyDelta.toFixed(1)) : undefined;
  const totalAnsweredDelta = weekComparison.answeredDelta ?? undefined;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const DAY_MS = 24 * 60 * 60 * 1000;
  const endOfToday = new Date(startOfToday.getTime() + DAY_MS);
  const wrongIn = (from: Date, to: Date) =>
    Math.round(
      sessionsInRange(history, from, to).reduce(
        (sum, s) => sum + (s.total_questions ?? 0) * (1 - (s.accuracy ?? 0) / 100),
        0,
      ),
    );
  const recentWindow = sessionsInRange(history, new Date(endOfToday.getTime() - 7 * DAY_MS), endOfToday);
  const priorWindow = sessionsInRange(
    history,
    new Date(endOfToday.getTime() - 14 * DAY_MS),
    new Date(endOfToday.getTime() - 7 * DAY_MS),
  );
  const wrongCount = (list: typeof recentWindow) =>
    Math.round(list.reduce((sum, s) => sum + (s.total_questions ?? 0) * (1 - (s.accuracy ?? 0) / 100), 0));
  // Null (hidden) when there is no prior-week baseline.
  const totalWrongDelta = priorWindow.length > 0 ? wrongCount(recentWindow) - wrongCount(priorWindow) : undefined;

  // Real activity: questions answered per day, last 7 calendar days.
  const weekActivity = activityByDay(history);
  const recentAnswersByDay = weekActivity.map(({ day, count }) => ({ day, count }));

  // Real consecutive active-day streak.
  const streak = activeDayStreak(history);

  // Insight calculations (if topics are available)
  const mostImprovedTopic =
    performance.performance_by_topic
      .slice()
      .sort((a, b) => (b.accuracy_percent - a.accuracy_percent))
      .at(0);

  const weakestTopic =
    performance.performance_by_topic
      .slice()
      .sort((a, b) => (a.accuracy_percent - b.accuracy_percent))
      .at(0);

  // Weekly accuracy: real question-weighted averages per trailing-7-day window.
  // Weeks with no quizzes show as gaps.
  const weeklyAccuracyData = weeklyAccuracy(history);

  // Progress: real cumulative accuracy after each session (last 12).
  const progressOverTime = cumulativeProgress(history);

  const firstQuiz = firstSessionDate(history);

  const milestones = [
    { title: "First Quiz", completed: history.length > 0, date: firstQuiz ? firstQuiz.toLocaleDateString() : "Not yet" },
    { title: "50 Questions Answered", completed: true, date: "1 week ago" },
    { title: "70% Accuracy", completed: overallAccuracy >= 70, date: overallAccuracy >= 70 ? "Achieved!" : "In Progress" },
    { title: "100 Questions Answered", completed: overallStats.totalAnswered >= 100, date: overallStats.totalAnswered >= 100 ? "Achieved!" : "In Progress" },
    { title: "85% Accuracy", completed: overallAccuracy >= 85, date: overallAccuracy >= 85 ? "Achieved!" : "Goal" },
  ];

  const goals = [
    { title: "Maintain 80% Accuracy", progress: Math.min(100, (overallAccuracy / 80) * 100), target: "80%" },
    { title: "Answer 200 Questions", progress: Math.min(100, (overallStats.totalAnswered / 200) * 100), target: "200" },
    { title: "Master 5 Topics", progress: Math.min(100, (strongestTopics.length / 5) * 100), target: "5 topics" },
  ];

  // --- UI Rendering starts ---
  return (
    <div className="w-full max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3 font-display text-white">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-luminous-primary-container to-luminous-secondary-container flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            Performance Analytics
          </h1>
          <p className="text-slate-400 mt-1">Detailed insights into your quiz performance</p>
        </div>
        <Button onClick={onClose} variant="outline" size="lg" className="bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:text-white">
          Back to Quizzes
        </Button>
      </div>

      {/* Performance Overview Cards at the top */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          icon={<Brain className="h-4 w-4" />}
          label="Total Questions"
          value={overallStats.totalAnswered}
          delta={totalAnsweredDelta}
          deltaLabel="since last week"
          accentColor="blue"
        />
        <StatCard
          icon={<CheckCircle className="h-4 w-4" />}
          label="Accuracy Rate"
          value={`${overallAccuracy.toFixed(1)}%`}
          delta={accuracyDelta}
          deltaLabel="% since last week"
          accentColor="green"
        />
        <StatCard
          icon={<XCircle className="h-4 w-4" />}
          label="Incorrect Answers"
          value={overallStats.totalWrong}
          delta={totalWrongDelta}
          deltaLabel="since last week"
          accentColor="red"
        />
        <StatCard
          icon={<Star className="h-4 w-4" />}
          label="Active-Day Streak"
          value={streak}
          accentColor="purple"
        />
      </div>

      {/* Quiz accuracy over time - large chart at the top */}
      <Card className="luminous-glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-white">
            <TrendingUp className="h-5 w-5 text-luminous-secondary" />
            Your quiz accuracy each week (last 5 weeks)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyAccuracyData}>
                <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <Bar dataKey="percent" fill="#7952ff" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Activity and Performance insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="luminous-glass-card border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-white">
              <BarChart3 className="h-5 w-5" />
              Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyActivitySparkline data={recentAnswersByDay} />
            <div className="mt-2 text-xs text-slate-500 text-center">
              Number of questions answered each day (last 7 days)
            </div>
          </CardContent>
        </Card>
        
        <Card className="luminous-glass-card border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-luminous-primary">
              <Star className="h-5 w-5" /> Personal Bests & Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li>
                <span className="font-medium">Active-day streak:</span> {streak} {streak === 1 ? 'day' : 'days'}
              </li>
              <li>
                <span className="font-medium">Best Accuracy:</span>{" "}
                {performance.performance_by_topic
                  .reduce((a, b) => a.accuracy_percent > b.accuracy_percent ? a : b).accuracy_percent.toFixed(1)
                }%
              </li>
              <li>
                <span className="font-medium">Suggested Focus:</span>{" "}
                {weakestTopic ? (
                  <span className="text-orange-700 font-semibold capitalize">{weakestTopic.topic}</span>
                ) : (
                  <span className="text-emerald-300 font-semibold">Keep up the great work!</span>
                )}
              </li>
            </ul>
            <div className="mt-4 p-3 bg-luminous-secondary-container/[0.07] border border-luminous-secondary-container/20 rounded-lg text-luminous-secondary text-sm">
              {
                weakestTopic
                  ? <>Tip: Practice more <span className="font-semibold capitalize">{weakestTopic.topic}</span> questions for a well-rounded performance.</>
                  : <>You have no weak spots! Try a simulated exam for a new challenge.</>
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Best and Weak areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="luminous-glass-card border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-luminous-primary">
              <Award className="h-5 w-5" /> Your Best Area
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mostImprovedTopic ? (
              <BestTopicCard
                topic={mostImprovedTopic.topic}
                accuracy={mostImprovedTopic.accuracy_percent}
                answered={mostImprovedTopic.total_answered}
              />
            ) : (
              <p className="text-slate-500 text-center py-4">
                More data needed to highlight your best performing topic.
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="luminous-glass-card border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-400">
              <Target className="h-5 w-5" />
              Needs Practice
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weakestTopic ? (
              <WeakTopicCard
                topic={weakestTopic.topic}
                accuracy={weakestTopic.accuracy_percent}
                answered={weakestTopic.total_answered}
              />
            ) : (
              <p className="text-slate-500 text-center py-4">
                No weak topics detected yet—keep going!
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs for detailed analytics */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4 bg-white/5 border border-white/10">
          <TabsTrigger value="overview" className="text-xs sm:text-sm data-[state=active]:bg-luminous-primary-container data-[state=active]:text-white text-slate-400">Overview</TabsTrigger>
          <TabsTrigger value="topics" className="text-xs sm:text-sm data-[state=active]:bg-luminous-primary-container data-[state=active]:text-white text-slate-400">By Topics</TabsTrigger>
          <TabsTrigger value="insights" className="text-xs sm:text-sm data-[state=active]:bg-luminous-primary-container data-[state=active]:text-white text-slate-400">Insights</TabsTrigger>
          <TabsTrigger value="progress" className="text-xs sm:text-sm data-[state=active]:bg-luminous-primary-container data-[state=active]:text-white text-slate-400">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Performance by Topic Bar Chart */}
          <Card className="luminous-glass-card border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-white">
                <BarChart3 className="h-5 w-5 text-luminous-primary" />
                Performance by Topic
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis
                      dataKey="topic"
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      tickLine={false}
                    />
                    <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <CustomTooltip />
                    <Bar dataKey="accuracy" fill="#7952ff" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topics" className="space-y-4">
          <Card className="luminous-glass-card border-white/10">
            <CardHeader>
              <CardTitle className="font-display text-white">Detailed Topic Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <TopicPerformanceList
                topics={performance.performance_by_topic}
                getPerformanceLevel={getPerformanceLevel}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strongest Topics */}
            <Card className="luminous-glass-card border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-400">
                  <Trophy className="h-5 w-5" />
                  Your Strongest Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {strongestTopics.length > 0 ? (
                  <div className="space-y-3">
                    {strongestTopics.map((topic, index) => (
                      <div key={topic.topic} className="flex items-center gap-3 p-3 bg-emerald-500/[0.07] rounded-lg">
                        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium capitalize text-slate-100">{topic.topic}</p>
                          <p className="text-sm text-slate-400">{topic.accuracy_percent.toFixed(1)}% accuracy</p>
                        </div>
                        <Trophy className="h-5 w-5 text-emerald-400" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">Complete more quizzes to identify your strengths!</p>
                )}
              </CardContent>
            </Card>

            {/* Areas for Improvement */}
            <Card className="luminous-glass-card border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-400">
                  <Target className="h-5 w-5" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                {weakestTopics.length > 0 ? (
                  <div className="space-y-3">
                    {weakestTopics.map((topic, index) => (
                      <div key={topic.topic} className="flex items-center gap-3 p-3 bg-amber-500/[0.07] rounded-lg">
                        <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium capitalize text-slate-100">{topic.topic}</p>
                          <p className="text-sm text-slate-400">{topic.accuracy_percent.toFixed(1)}% accuracy</p>
                        </div>
                        <AlertCircle className="h-5 w-5 text-amber-400" />
                      </div>
                    ))}
                    <div className="mt-4 p-3 bg-luminous-secondary-container/[0.07] rounded-lg">
                      <p className="text-sm text-luminous-secondary font-medium">💡 Tip: Focus on practicing these topics to improve your overall performance!</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">Great job! No weak areas identified yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          {/* Progress Over Time */}
          <Card className="luminous-glass-card border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-white">
                <TrendingUp className="h-5 w-5 text-luminous-secondary" />
                Progress Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={progressOverTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <defs>
                      <linearGradient id="progressFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7952ff" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="#7952ff" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="accuracy"
                      stroke="#8b7bff"
                      strokeWidth={2.5}
                      fill="url(#progressFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="text-sm text-slate-400 text-center">
                Your cumulative accuracy after each session (last {progressOverTime.length || 12})
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Milestones */}
            <Card className="luminous-glass-card border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-luminous-primary">
                  <Award className="h-5 w-5" />
                  Milestones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {milestones.map((milestone, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        milestone.completed ? 'bg-emerald-500' : 'bg-white/20'
                      }`}>
                        {milestone.completed ? (
                          <CheckCircle className="h-5 w-5 text-white" />
                        ) : (
                          <Clock className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{milestone.title}</p>
                        <p className="text-sm text-slate-400">{milestone.date}</p>
                      </div>
                      {milestone.completed && (
                        <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
                          Completed
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Goals */}
            <Card className="luminous-glass-card border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-luminous-primary">
                  <Target className="h-5 w-5" />
                  Current Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {goals.map((goal, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{goal.title}</span>
                        <span className="text-sm text-slate-400">{goal.progress.toFixed(0)}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                      <p className="text-xs text-slate-500">Target: {goal.target}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-luminous-secondary-container/[0.07] rounded-lg">
                  <p className="text-sm text-luminous-secondary font-medium">
                    🎯 Keep practicing to reach your goals!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Streak Tracking */}
          <Card className="luminous-glass-card border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-400">
                <Flame className="h-5 w-5" />
                Study Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Flame className="h-10 w-10 text-white" />
                </div>
                <div className="text-3xl font-bold text-orange-600 mb-2">{streak} {streak === 1 ? 'Day' : 'Days'}</div>
                <p className="text-slate-400 mb-4">Consecutive days with a quiz</p>
                <div className="grid grid-cols-7 gap-2 max-w-xs mx-auto">
                  {weekActivity.map((d) => (
                    <div key={d.date.toISOString()} className="flex flex-col items-center gap-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                          d.active ? 'bg-orange-500 text-white' : 'bg-white/10 text-slate-500'
                        }`}
                      >
                        {d.active ? '✓' : '○'}
                      </div>
                      <span className="text-[10px] text-slate-500">{d.day.slice(0, 1)}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">Last 7 days</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceAnalytics;
