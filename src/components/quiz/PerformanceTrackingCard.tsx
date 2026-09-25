import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, TrendingUp, Target, Award, BarChart3, ChevronRight } from 'lucide-react';

interface PerformanceTrackingCardProps {
  onViewAnalytics: () => void;
}

const ITEMS = [
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    text: 'Monitor improvement over time',
    tile: 'bg-emerald-500/10 border-emerald-400/30 text-emerald-400',
  },
  {
    icon: Target,
    title: 'Detailed Analytics',
    text: 'Performance insights by topic',
    tile: 'bg-luminous-secondary-container/10 border-luminous-secondary-container/30 text-luminous-secondary',
  },
  {
    icon: Award,
    title: 'Quiz History',
    text: 'Review past results & growth',
    tile: 'bg-luminous-primary-container/15 border-luminous-primary/30 text-luminous-primary',
  },
];

const PerformanceTrackingCard: React.FC<PerformanceTrackingCardProps> = ({ onViewAnalytics }) => {
  return (
    <Card className="luminous-glass-card luminous-glow-border border-white/10 w-full overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-luminous-primary-container via-luminous-primary to-luminous-secondary-container" />
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 lg:w-12 lg:h-12 rounded-2xl bg-gradient-to-tr from-luminous-primary-container to-luminous-secondary-container flex items-center justify-center shrink-0">
            <BarChart3 className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
          </span>
          <div>
            <CardTitle className="text-xl lg:text-2xl font-extrabold font-display text-white leading-tight">
              Performance Hub
            </CardTitle>
            <p className="text-slate-400 text-xs lg:text-sm mt-0.5">Track your quiz journey</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 lg:space-y-3">
        {ITEMS.map(({ icon: Icon, title, text, tile }) => (
          <div
            key={title}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:border-luminous-primary/30 transition-colors"
          >
            <span className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${tile}`}>
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-sm lg:text-[15px] text-slate-100">{title}</p>
              <p className="text-xs text-slate-500 truncate">{text}</p>
            </div>
          </div>
        ))}

        <Button
          onClick={onViewAnalytics}
          className="w-full bg-luminous-primary-container hover:brightness-110 text-white font-bold text-sm lg:text-base py-2.5 lg:py-3 luminous-shadow-glow-purple group"
        >
          <Trophy className="h-4 w-4 mr-2" />
          Explore Analytics
          <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default PerformanceTrackingCard;
