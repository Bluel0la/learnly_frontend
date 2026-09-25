
import React from "react";
import { AlertCircle } from "lucide-react";

interface WeakTopicCardProps {
  topic: string;
  accuracy: number;
  answered: number;
}

const WeakTopicCard: React.FC<WeakTopicCardProps> = ({ topic, accuracy, answered }) => (
  <div className="flex flex-col items-start gap-3">
    <span className="text-lg font-bold capitalize text-slate-100">{topic}</span>
    <span className="text-rose-400 text-base flex items-center gap-2">
      <AlertCircle className="h-4 w-4" />
      {accuracy.toFixed(1)}% accuracy
    </span>
    <span className="text-xs text-slate-400">{answered} questions answered</span>
    <div className="mt-2 p-2 bg-luminous-secondary-container/[0.07] border border-luminous-secondary-container/25 rounded text-xs text-luminous-secondary font-medium">
      💡 Tip: Practice this topic to boost your scores!
    </div>
  </div>
);

export default WeakTopicCard;
