
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Zap } from 'lucide-react';

interface ScoreMeterProps {
  streak: number;
  rank: string;
  multiplier: number;
  totalQuestions: number;
}

const ScoreMeter: React.FC<ScoreMeterProps> = ({ streak, rank, multiplier, totalQuestions }) => {
  // Calculate questions needed for next rank based on deck size
  const getQuestionsForNextRank = (currentRank: string): number => {
    const rankThresholds = {
      'E': Math.max(2, Math.floor(totalQuestions * 0.15)),
      'D': Math.max(3, Math.floor(totalQuestions * 0.25)),
      'C': Math.max(4, Math.floor(totalQuestions * 0.35)),
      'B': Math.max(5, Math.floor(totalQuestions * 0.45)),
      'A': Math.max(6, Math.floor(totalQuestions * 0.60)),
      'S': Math.max(7, Math.floor(totalQuestions * 0.75)),
      'S+': Math.max(8, Math.floor(totalQuestions * 0.90))
    };

    const ranks = ['E', 'D', 'C', 'B', 'A', 'S', 'S+'];
    const currentIndex = ranks.indexOf(currentRank);
    
    if (currentIndex === -1 || currentIndex === ranks.length - 1) return 0;
    
    const nextRank = ranks[currentIndex + 1];
    return rankThresholds[nextRank as keyof typeof rankThresholds];
  };

  const getRankColor = (rank: string): string => {
    const colors = {
      'E': 'text-slate-400',
      'D': 'text-orange-400',
      'C': 'text-yellow-400',
      'B': 'text-sky-400',
      'A': 'text-emerald-400',
      'S': 'text-luminous-primary',
      'S+': 'text-pink-400'
    };
    return colors[rank as keyof typeof colors] || 'text-slate-400';
  };

  const getMultiplierColor = (multiplier: number): string => {
    if (multiplier >= 5) return 'text-pink-400';
    if (multiplier >= 4) return 'text-luminous-primary';
    if (multiplier >= 3) return 'text-sky-400';
    if (multiplier >= 2) return 'text-emerald-400';
    return 'text-slate-400';
  };

  const questionsForNext = getQuestionsForNextRank(rank);
  const isMaxRank = rank === 'S+';

  return (
    <Card className="mb-2 luminous-glass-card luminous-glow-border border-white/10 overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-luminous-primary-container via-luminous-primary to-luminous-secondary-container" />
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2.5">
              <span className="w-11 h-11 rounded-2xl bg-luminous-primary-container/15 border border-luminous-primary/30 flex items-center justify-center">
                <Trophy className={`h-5 w-5 ${getRankColor(rank)}`} />
              </span>
              <div>
                <div className={`text-2xl font-black font-display leading-none ${getRankColor(rank)} transition-colors duration-300`}>
                  {rank}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {isMaxRank ? 'MAX RANK!' : `${questionsForNext - streak} more to rank up`}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pl-4 sm:pl-6 border-l border-white/10">
              <Zap className={`h-5 w-5 ${getMultiplierColor(multiplier)}`} />
              <div>
                <div className={`text-lg font-bold leading-none ${getMultiplierColor(multiplier)} transition-colors duration-300`}>
                  {multiplier}x
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Multiplier</div>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-black font-display leading-none text-white">
              {streak}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Streak</div>
          </div>
        </div>

        {!isMaxRank && (
          <div className="mt-4">
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-luminous-primary-container to-luminous-secondary-container h-1.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min((streak / questionsForNext) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScoreMeter;
