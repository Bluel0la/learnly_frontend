import React from 'react';
import { Brain, Menu, X } from 'lucide-react';

interface LandingNavigationProps {
  isAuthenticated: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  onGetStarted: () => void;
  onLogin: () => void;
}

const LandingNavigation = ({
  isAuthenticated,
  mobileMenuOpen,
  setMobileMenuOpen,
  onGetStarted,
  onLogin
}: LandingNavigationProps) => {
  return (
    <header className="sticky top-4 z-50 w-full px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="luminous-glass-panel rounded-2xl px-5 sm:px-6 py-3.5 flex items-center justify-between shadow-2xl shadow-black/60">
          <a aria-label="Learnly Home" className="flex items-center gap-3 group focus:outline-none" href="#top">
            <div className="relative flex items-center justify-center">
              <div className="absolute -inset-1 bg-gradient-to-r from-luminous-primary-container to-luminous-secondary-container rounded-xl blur-sm opacity-70 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative w-10 h-10 rounded-xl bg-midnight-900 border border-white/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <Brain className="w-5 h-5 text-luminous-primary" />
              </div>
            </div>
            <span className="text-xl font-display font-extrabold tracking-tight text-white flex items-center gap-1 shrink-0">
              Learn<span className="text-luminous-primary">ly</span>
              <span className="hidden min-[400px]:inline text-[10px] font-luminous-mono px-1.5 py-0.5 rounded bg-luminous-primary-container/30 border border-luminous-primary/30 text-luminous-primary ml-1 uppercase">2.0</span>
            </span>
          </a>

          {/* Desktop Navigation Menu */}
          <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a className="hover:text-luminous-primary transition-colors duration-200" href="#features">Features</a>
            <a className="hover:text-luminous-primary transition-colors duration-200" href="#how-it-works">How It Works</a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {!isAuthenticated && (
              <button
                onClick={onLogin}
                className="hidden sm:inline-block text-sm font-semibold text-slate-300 hover:text-white transition-colors duration-200 whitespace-nowrap"
              >
                Sign In
              </button>
            )}
            <button
              onClick={onGetStarted}
              className="inline-flex items-center justify-center px-3 sm:px-5 py-2 rounded-xl text-[13px] sm:text-sm font-bold text-white luminous-btn-primary luminous-shadow-glow-purple whitespace-nowrap"
            >
              <span className="sm:hidden">{isAuthenticated ? 'Dashboard' : 'Start Free'}</span>
              <span className="hidden sm:inline">{isAuthenticated ? 'Go to Dashboard' : 'Start Learning Free'}</span>
            </button>
            <button
              aria-label="Toggle menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 shrink-0 rounded-xl text-slate-300 hover:text-white luminous-btn-glass"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 luminous-glass-panel rounded-2xl py-4 px-5">
            <div className="flex flex-col space-y-4">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-slate-300 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-slate-300 hover:text-white transition-colors">How It Works</a>
              {!isAuthenticated && (
                <button onClick={() => { setMobileMenuOpen(false); onLogin(); }} className="text-left text-slate-300 hover:text-white transition-colors">
                  Sign In
                </button>
              )}
              <button
                onClick={() => { setMobileMenuOpen(false); onGetStarted(); }}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white luminous-btn-primary"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Start Learning Free'}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default LandingNavigation;
