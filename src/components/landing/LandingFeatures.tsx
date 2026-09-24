import React from 'react';
import { BookOpen, Brain, FileUp, LineChart, MessageCircle, Sparkles } from 'lucide-react';

const LandingFeatures = () => {
  return (
    <section id="features" className="py-20 md:py-32 relative scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-luminous-primary-container/20 border border-luminous-primary/30 text-luminous-primary text-xs font-luminous-mono uppercase tracking-widest mb-4">
            What you get
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-5">
            Everything you need to <span className="luminous-gradient-text">study smarter</span>
          </h2>
          <p className="text-lg text-slate-300 leading-relaxed font-normal">
            An AI tutor, file-to-flashcard generation, adaptive math quizzes, and analytics
            that show exactly where you stand.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* AI study chat — wide card */}
          <div className="md:col-span-2 rounded-3xl luminous-glass-card p-8 flex flex-col justify-between relative overflow-hidden group hover:border-luminous-primary/40 transition-all duration-300">
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-luminous-primary-container to-indigo-600 flex items-center justify-center text-white mb-6 luminous-shadow-glow-purple">
                <MessageCircle className="w-7 h-7" />
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-3">Instant AI study companion</h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mb-6">
                Stuck on homework? Ask questions in plain words — or snap a photo of the problem —
                and get step-by-step explanations plus follow-up practice on the spot.
              </p>
            </div>
            <div className="w-full bg-midnight-900/90 rounded-2xl p-5 border border-white/10 text-xs font-luminous-mono space-y-3 relative z-10">
              <div className="bg-white/[0.03] p-3 rounded-lg border border-white/5 text-slate-300">
                <strong className="text-luminous-secondary">You:</strong> "Why do I flip the inequality sign when dividing by a negative?"
              </div>
              <div className="bg-luminous-primary-container/10 p-3.5 rounded-lg border border-luminous-primary/20 text-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 text-luminous-primary font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>Learnly:</span>
                </div>
                <p className="font-luminous-body text-xs">"Multiplying or dividing by a negative reverses order — try it with −2 &lt; 3, then divide both sides by −1…"</p>
              </div>
            </div>
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-luminous-primary-container/15 rounded-full blur-3xl pointer-events-none"></div>
          </div>

          {/* File ingestion */}
          <div className="rounded-3xl luminous-glass-card p-8 flex flex-col justify-between relative overflow-hidden group hover:border-luminous-secondary-container/40 transition-all duration-300">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-luminous-secondary-container/20 to-teal-500/20 border border-luminous-secondary-container/40 flex items-center justify-center text-luminous-secondary mb-6">
                <FileUp className="w-7 h-7" />
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-3">Files become flashcards</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Drop in your PDFs, slides, or notes. Learnly summarizes the content and generates
                question-and-answer decks from it.
              </p>
            </div>
            <div className="bg-midnight-900/90 rounded-2xl p-4 border border-white/10 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-red-400 font-bold text-xs">PDF</div>
                <div>
                  <div className="text-xs font-bold text-white">Quadratic_Notes.pdf</div>
                  <div className="text-[11px] font-luminous-mono text-slate-400">PDF · DOCX · TXT · PPTX</div>
                </div>
              </div>
              <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-luminous-mono font-bold text-center">
                ✓ Flashcards generated &amp; saved
              </div>
            </div>
          </div>

          {/* Adaptive quizzes */}
          <div className="rounded-3xl luminous-glass-card p-8 flex flex-col justify-between relative overflow-hidden group hover:border-emerald-400/40 transition-all duration-300">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-6">
                <Brain className="w-7 h-7" />
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-3">Adaptive math quizzes</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                18 topics from arithmetic to calculus. Difficulty follows your accuracy, and every
                answer comes back graded with an explanation.
              </p>
            </div>
            <div className="bg-midnight-900/90 rounded-2xl p-4 border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Last session</span>
                <span className="text-emerald-400 font-luminous-mono font-bold">8 / 10</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-400 to-teal-400 h-full rounded-full" style={{ width: '80%' }}></div>
              </div>
              <div className="pt-2 border-t border-white/5 text-[11px] text-slate-400 font-luminous-mono">
                Next up: medium → pro difficulty
              </div>
            </div>
          </div>

          {/* Analytics — wide card */}
          <div className="md:col-span-2 rounded-3xl luminous-glass-card p-8 flex flex-col justify-between relative overflow-hidden group hover:border-luminous-primary/40 transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              <div className="flex-1">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-luminous-primary-container/20 border border-luminous-primary/40 flex items-center justify-center text-luminous-primary mb-6">
                  <LineChart className="w-7 h-7" />
                </div>
                <h3 className="font-display text-2xl font-bold text-white mb-3">Progress you can actually see</h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mb-6">
                  Accuracy trends, active-day streaks, per-topic breakdowns, and adaptive drills
                  built from the cards you keep missing.
                </p>
              </div>
              <div className="flex-1 w-full bg-midnight-900/90 rounded-2xl p-5 border border-white/10 space-y-3">
                {[
                  { topic: 'Quadratic functions', pct: 92 },
                  { topic: 'Fractions', pct: 76 },
                  { topic: 'Trigonometry', pct: 58 },
                ].map((row) => (
                  <div key={row.topic}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-300 font-medium">{row.topic}</span>
                      <span className="text-luminous-secondary font-luminous-mono font-bold">{row.pct}%</span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-luminous-primary-container to-luminous-secondary-container h-full rounded-full"
                        style={{ width: `${row.pct}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t border-white/5 flex items-center gap-2 text-[11px] text-slate-400">
                  <BookOpen className="w-4 h-4 text-luminous-primary" />
                  <span>Suggested focus: Trigonometry — 3 adaptive drills ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingFeatures;
