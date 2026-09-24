import React from 'react';
import { Brain } from 'lucide-react';

interface LandingFooterProps {
  onSignIn: () => void;
  onGetStarted: () => void;
}

const LandingFooter = ({ onSignIn, onGetStarted }: LandingFooterProps) => {
  return (
    <footer className="bg-midnight-950 text-slate-400 pt-16 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          <div className="md:col-span-7 space-y-4">
            <a aria-label="Learnly Home" className="flex items-center gap-3 focus:outline-none" href="#top">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-luminous-primary-container to-luminous-secondary-container flex items-center justify-center">
                <Brain className="w-5 h-5 text-midnight-950" />
              </div>
              <span className="font-display text-2xl font-bold tracking-tight text-white">
                Learn<span className="text-luminous-primary">ly</span>
              </span>
            </a>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              An AI study companion that turns your notes into flashcards, adaptive quizzes,
              and step-by-step explanations.
            </p>
          </div>
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-luminous-mono font-bold text-white uppercase tracking-wider">Product</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a className="hover:text-luminous-primary transition-colors" href="#features">Features</a></li>
              <li><a className="hover:text-luminous-primary transition-colors" href="#how-it-works">How It Works</a></li>
            </ul>
          </div>
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-luminous-mono font-bold text-white uppercase tracking-wider">Account</h4>
            <ul className="space-y-2.5 text-sm">
              <li><button className="hover:text-luminous-primary transition-colors" onClick={onSignIn}>Sign In</button></li>
              <li><button className="hover:text-luminous-primary transition-colors" onClick={onGetStarted}>Get Started Free</button></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Learnly. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
