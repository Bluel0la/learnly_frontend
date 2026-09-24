import React from 'react';
import { FileUp, Sparkles, TrendingUp } from 'lucide-react';

const steps = [
  {
    icon: FileUp,
    step: 'Step 1',
    title: 'Upload your material',
    text: 'Drop in lecture notes, textbook chapters, or slides — PDF, DOCX, TXT, or PPTX. Plain typed cards work too.',
  },
  {
    icon: Sparkles,
    step: 'Step 2',
    title: 'Generate decks & quizzes',
    text: 'Learnly summarizes your content into flashcards and builds graded quizzes tuned to your level.',
  },
  {
    icon: TrendingUp,
    step: 'Step 3',
    title: 'Practice & track',
    text: 'Review with recall ratings, retry your weak spots with adaptive drills, and watch accuracy climb.',
  },
];

const LandingHowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-28 relative scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-luminous-primary-container/20 border border-luminous-primary/30 text-luminous-primary text-xs font-luminous-mono uppercase tracking-widest mb-4">
            How it works
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-5">
            From notes to mastery in <span className="luminous-gradient-text">three steps</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map(({ icon: Icon, step, title, text }, i) => (
            <div
              key={title}
              className="rounded-3xl luminous-glass-card p-8 relative overflow-hidden hover:border-luminous-primary/40 transition-all duration-300"
            >
              <span className="absolute top-6 right-7 font-display text-5xl font-extrabold text-white/5 select-none">
                {i + 1}
              </span>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-luminous-primary-container/30 to-luminous-secondary-container/20 border border-luminous-primary/30 flex items-center justify-center text-luminous-primary mb-6">
                <Icon className="w-7 h-7" />
              </div>
              <p className="text-xs font-luminous-mono uppercase tracking-widest text-luminous-secondary mb-2">{step}</p>
              <h3 className="font-display text-xl font-bold text-white mb-3">{title}</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingHowItWorks;
