import React from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';

interface LandingCTAProps {
  isAuthenticated: boolean;
  onGetStarted: () => void;
}

const LandingCTA = ({ isAuthenticated, onGetStarted }: LandingCTAProps) => {
  return (
    <section id="cta" className="relative py-24 sm:py-32 overflow-hidden scroll-mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="relative rounded-3xl p-10 sm:p-16 overflow-hidden border border-white/20 bg-gradient-to-b from-luminous-primary-container/40 via-midnight-900 to-midnight-950 backdrop-blur-2xl">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-luminous-secondary-container/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-luminous-primary-container/40 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-luminous-secondary text-xs font-luminous-mono font-semibold mb-6 border border-luminous-secondary-container/30">
              <span>Free to start · No credit card</span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
              Ready to study <span className="luminous-gradient-text">smarter</span>?
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed mb-10">
              Upload your first file and get AI-generated flashcards, a practice quiz,
              and a tutor that explains every answer.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <button
                onClick={onGetStarted}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 rounded-xl text-base font-bold text-midnight-950 bg-gradient-to-r from-luminous-secondary-container via-luminous-primary to-white hover:brightness-110 luminous-shadow-glow-cyan transition-all duration-300 hover:scale-105"
              >
                <span>{isAuthenticated ? 'Continue Learning' : 'Start Learning Free'}</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm font-medium text-slate-300">
              <span className="inline-flex items-center gap-1.5 text-emerald-400">
                <CheckCircle className="h-4 w-4" />
                Free to start
              </span>
              <span className="text-slate-600">•</span>
              <span>No credit card required</span>
              <span className="text-slate-600">•</span>
              <span>First deck in under a minute</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingCTA;
