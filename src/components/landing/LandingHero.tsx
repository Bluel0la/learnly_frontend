import React from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import LandingHeroMock from './LandingHeroMock';

interface LandingHeroProps {
  isAuthenticated: boolean;
  onGetStarted: () => void;
}

const LandingHero = ({ isAuthenticated, onGetStarted }: LandingHeroProps) => {
  return (
    <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Status pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-midnight-800/80 border border-luminous-primary/30 text-luminous-primary text-xs sm:text-sm font-semibold mb-8 backdrop-blur-md">
          <span className="flex h-2 w-2 rounded-full bg-luminous-secondary-container animate-pulse"></span>
          <span>New · OpenAI-powered study companion</span>
        </div>

        {/* Headline */}
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.12] mb-6 max-w-5xl mx-auto text-white">
          Turn your notes into
          <br />
          <span className="luminous-gradient-text">flashcards, quizzes &amp; mastery</span>
        </h1>

        {/* Subheading */}
        <p className="max-w-3xl mx-auto text-lg sm:text-xl text-slate-300 leading-relaxed font-normal mb-10">
          Upload your study files and Learnly generates smart flashcards, adaptive math quizzes,
          and an AI tutor that explains every answer — while tracking your progress.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-base font-bold text-white luminous-btn-primary luminous-shadow-glow-cyan hover:-translate-y-0.5"
          >
            <span>{isAuthenticated ? 'Continue Learning' : 'Get Started Free'}</span>
            <ArrowRight className="h-5 w-5" />
          </button>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-7 py-4 rounded-xl text-base font-semibold text-slate-200 luminous-btn-glass"
          >
            See how it works
          </a>
        </div>

        {/* Trust row */}
        <div className="flex items-center justify-center flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm text-slate-400 font-medium">
          <span className="inline-flex items-center gap-1.5 text-emerald-400">
            <CheckCircle className="h-4 w-4" />
            Free to start
          </span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            No credit card required
          </span>
        </div>

        <LandingHeroMock />
      </div>
    </section>
  );
};

export default LandingHero;
