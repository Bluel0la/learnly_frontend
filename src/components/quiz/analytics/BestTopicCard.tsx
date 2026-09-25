
import React from "react";
import { Award, TrendingUp } from "lucide-react";

interface BestTopicCardProps {
  topic: string;
  accuracy: number;
  answered: number;
}

const BestTopicCard: React.FC<BestTopicCardProps> = ({ topic, accuracy, answered }) => (
  <div className="flex flex-col items-start gap-3">
    <span className="text-lg font-bold capitalize text-slate-100">{topic}</span>
    <span className="text-emerald-400 text-base flex items-center gap-2">
      <TrendingUp className="h-4 w-4" />
      {accuracy.toFixed(1)}% accuracy
    </span>
    <span className="text-xs text-slate-400">{answered} questions answered</span>
    <div className="mt-2 p-2 rounded bg-emerald-500/10 border border-emerald-400/25 text-sm text-emerald-300 font-medium flex items-center gap-2">
      <Award className="w-4 h-4" /> Keep it up!
    </div>
  </div>
);

export default BestTopicCard;
