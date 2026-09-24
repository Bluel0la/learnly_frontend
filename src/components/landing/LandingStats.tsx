import React from 'react';
import { BookOpen, Brain, FileUp, LineChart } from 'lucide-react';

/** Honest capability strip — what the platform actually does. */
const capabilities = [
  { icon: Brain, title: '18 math topics', text: 'Adaptive quizzes that follow your level' },
  { icon: FileUp, title: 'PDF · DOCX · TXT · PPTX', text: 'Files become flashcards in seconds' },
  { icon: BookOpen, title: 'AI study chat', text: 'Step-by-step explanations + image upload' },
  { icon: LineChart, title: 'Real analytics', text: 'Accuracy, streaks & topic breakdowns' },
];

const LandingStats = () => {
  return (
    <section className="py-16 md:py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="p-6 rounded-2xl luminous-glass-panel hover:border-luminous-primary/40 transition duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-luminous-primary-container/20 border border-luminous-primary/30 flex items-center justify-center text-luminous-primary mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <p className="font-display text-lg font-bold text-white tracking-tight mb-1">{title}</p>
              <p className="text-sm text-slate-400">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingStats;
