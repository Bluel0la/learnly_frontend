import React from 'react';
import { Brain, FileUp, LineChart, MessageCircle } from 'lucide-react';

/**
 * Right-side showcase for the auth page.
 * Honest capability overview — no testimonials, fabricated stats, or endorsements.
 */
const AuthShowcase = () => {
  return (
    <div className="hidden lg:flex flex-col gap-5 relative">
      <div className="relative rounded-2xl luminous-glass-card p-7 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-luminous-secondary-container/40 via-luminous-primary/50 to-transparent"></div>

        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2 font-luminous-mono text-xs text-slate-400">
            <MessageCircle className="w-4 h-4 text-luminous-secondary-container" />
            <span>WHAT YOU GET WITH LEARNLY</span>
          </div>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 font-luminous-mono text-[10px] text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            FREE TO START
          </span>
        </div>

        <div className="mt-5 space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-luminous-primary-container/20 border border-luminous-primary/30 flex items-center justify-center text-luminous-primary">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <p className="font-display font-bold text-white text-sm">AI study companion</p>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Step-by-step explanations in plain words — ask by text or snap a photo of the problem.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-luminous-secondary-container/10 border border-luminous-secondary-container/30 flex items-center justify-center text-luminous-secondary">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <p className="font-display font-bold text-white text-sm">Files become flashcards</p>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                PDF, DOCX, TXT, or PPTX notes summarized into question-and-answer decks.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <LineChart className="w-5 h-5" />
            </div>
            <div>
              <p className="font-display font-bold text-white text-sm">Quizzes that adapt to you</p>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                18 math topics with difficulty that follows your accuracy, plus per-topic analytics.
              </p>
            </div>
          </div>
        </div>

        {/* Decorative progress curve */}
        <div className="mt-5 p-4 rounded-xl bg-midnight-900/60 border border-white/5" aria-hidden="true">
          <div className="flex items-center justify-between mb-2">
            <span className="font-luminous-mono text-[11px] text-slate-400 uppercase">Your accuracy over time</span>
            <span className="font-luminous-mono text-[11px] text-luminous-secondary font-semibold">Illustration</span>
          </div>
          <svg className="w-full h-14 overflow-visible" fill="none" viewBox="0 0 300 50">
            <line x1="0" x2="300" y1="10" y2="10" stroke="currentColor" className="text-white/5" strokeDasharray="3 3"></line>
            <line x1="0" x2="300" y1="30" y2="30" stroke="currentColor" className="text-white/5" strokeDasharray="3 3"></line>
            <defs>
              <linearGradient id="authCurveGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#cbbeff" stopOpacity="0.35"></stop>
                <stop offset="100%" stopColor="#00eefc" stopOpacity="0"></stop>
              </linearGradient>
            </defs>
            <path d="M0 48 Q 60 44, 110 32 T 210 16 T 300 6 L 300 50 L 0 50 Z" fill="url(#authCurveGrad)"></path>
            <path d="M0 48 Q 60 44, 110 32 T 210 16 T 300 6" stroke="#00eefc" strokeLinecap="round" strokeWidth="2.5"></path>
            <circle cx="300" cy="6" fill="#ffffff" r="4"></circle>
          </svg>
        </div>

        <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/10 text-slate-400 text-xs">
          <span className="flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-luminous-primary" />
            AI tutor
          </span>
          <span className="flex items-center gap-1.5">
            <FileUp className="w-4 h-4 text-luminous-secondary" />
            Flashcards
          </span>
          <span className="flex items-center gap-1.5">
            <LineChart className="w-4 h-4 text-emerald-400" />
            Analytics
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuthShowcase;
