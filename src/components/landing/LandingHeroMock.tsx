import React from 'react';
import { Flame, MessageCircle } from 'lucide-react';

/**
 * Static hero visual modeled on the real product:
 * a flashcard practice card, an AI study-chat excerpt, and progress widgets.
 * Illustrative content only — no live data, no invented metrics.
 */
const LandingHeroMock = () => {
  return (
    <div className="mt-16 max-w-6xl mx-auto relative">
      <div className="absolute -inset-1.5 bg-gradient-to-r from-luminous-primary-container via-luminous-secondary-container to-luminous-primary rounded-3xl blur-xl opacity-35 pointer-events-none"></div>
      <div className="relative rounded-2xl luminous-glass-card overflow-hidden text-left">
        {/* Window chrome */}
        <div className="bg-midnight-900/90 px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
            <span className="text-xs font-luminous-mono text-slate-400 pl-3 hidden sm:inline">Workspace — Quadratic Functions Practice</span>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-luminous-mono border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> AI Tutor
          </span>
        </div>

        <div className="p-6 md:p-8 bg-midnight-950/80 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Flashcard practice card */}
          <div className="lg:col-span-7 bg-midnight-800/90 rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-4">
                <span className="px-2.5 py-1 rounded-md bg-luminous-primary-container/20 text-luminous-primary font-luminous-mono font-semibold border border-luminous-primary/30 uppercase tracking-wider">
                  Flashcards • Card 14 of 48
                </span>
                <span className="text-slate-400 font-luminous-mono">Quadratic Functions</span>
              </div>
              <h4 className="text-xl font-display font-bold text-white mb-3">
                What is the vertex of the parabola y = x² − 4x + 3?
              </h4>
              <div className="p-4 rounded-xl bg-midnight-900/90 border border-white/5 text-slate-300 text-sm leading-relaxed mb-4">
                <p className="font-medium text-slate-200 mb-2">💡 <span className="text-luminous-primary font-semibold">AI breakdown:</span></p>
                Complete the square: y = (x − 2)² − 1, so the vertex is at (2, −1) — the minimum point of the parabola.
              </div>
            </div>
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-medium text-slate-400">How well did you recall this?</span>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-300 text-xs font-semibold border border-rose-500/30">Hard</span>
                <span className="px-3 py-1.5 rounded-lg bg-luminous-primary-container/30 text-luminous-primary text-xs font-semibold border border-luminous-primary/40">Good</span>
                <span className="px-3.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/40">Easy</span>
              </div>
            </div>
          </div>

          {/* AI chat excerpt + widgets */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-midnight-800/90 rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-luminous-primary-container to-luminous-secondary-container flex items-center justify-center text-midnight-950">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white">Study Chat</span>
              </div>
              <div className="mt-3 space-y-3 text-xs leading-relaxed">
                <div className="p-3 rounded-xl bg-midnight-900 border border-white/5 text-slate-300">
                  <span className="text-luminous-primary font-semibold">Learnly:</span> "Nice work on factoring! Want a 5-question diagnostic on completing the square?"
                </div>
                <div className="p-2.5 rounded-xl bg-luminous-primary-container/20 border border-luminous-primary/30 text-slate-200 self-end ml-6 text-right font-medium">
                  "Yes — and explain any I get wrong."
                </div>
                <div className="p-3 rounded-xl bg-midnight-900/90 border border-luminous-secondary-container/30 text-slate-300">
                  <span className="text-luminous-secondary font-luminous-mono text-[11px] font-bold">⚡ DIAGNOSTIC READY — 5 QUESTIONS</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-midnight-800/90 border border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-luminous-primary-container/20 border border-luminous-primary/30 flex items-center justify-center text-luminous-primary font-black text-sm">94%</div>
                <div>
                  <div className="text-[11px] font-luminous-mono text-slate-400 uppercase">Quiz Accuracy</div>
                  <div className="text-xs font-bold text-white">This week</div>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-midnight-800/90 border border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-luminous-mono text-slate-400 uppercase">Day Streak</div>
                  <div className="text-xs font-bold text-white">Keep it going</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingHeroMock;
