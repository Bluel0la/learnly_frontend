import React, { useState } from 'react';
import { useSearchParams, Navigate, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, AtSign, Brain, Eye, EyeOff, Lock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authApi, SignupRequest } from '@/services/api';
import { secureTokenStorage } from '@/services/secureTokenStorage';
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import AuthShowcase from '@/components/auth/AuthShowcase';

type AuthMode = 'login' | 'signup';

const inputClass =
  'w-full pl-11 pr-4 py-2.5 rounded-xl bg-midnight-900/90 text-white placeholder:text-slate-500 text-sm border border-white/10 focus:outline-none focus:border-luminous-primary-container focus:ring-2 focus:ring-luminous-primary-container/30 transition-all';

const LoginPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<AuthMode>(searchParams.get('tab') === 'signup' ? 'signup' : 'login');
  const navigate = useNavigate();
  const [showPostLoginOnboarding, setShowPostLoginOnboarding] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupFirstname, setSignupFirstname] = useState('');
  const [signupLastname, setSignupLastname] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const switchTab = (mode: AuthMode) => {
    setActiveTab(mode);
    setSearchParams({ tab: mode });
  };

  // Check if user is already authenticated - simplified logic
  const isAuthenticated = secureTokenStorage.isAuthenticated();
  const onboardingComplete = localStorage.getItem("learnly_onboarding_complete") === "true";

  // If authenticated and onboarding complete, redirect to chat
  if (isAuthenticated && onboardingComplete) {
    return <Navigate to="/chat" replace />;
  }

  // If authenticated but onboarding not complete, show onboarding
  if (isAuthenticated && !onboardingComplete && !showPostLoginOnboarding) {
    return <OnboardingModal open={true} onComplete={() => {
      localStorage.setItem("learnly_onboarding_complete", "true");
      window.location.href = '/chat';
    }} />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await authApi.login({
        email: loginEmail,
        password: loginPassword
      });
      secureTokenStorage.setToken(response.access_token);
      toast({
        title: "Success",
        description: "Logged in successfully!"
      });

      // Check if onboarding is complete
      const onboardingComplete = localStorage.getItem("learnly_onboarding_complete") === "true";
      if (!onboardingComplete) {
        setShowPostLoginOnboarding(true);
      } else {
        // Direct navigation to chat page
        window.location.href = '/chat';
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to log in",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords don't match",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      const signupData: SignupRequest = {
        firstname: signupFirstname,
        lastname: signupLastname,
        email: signupEmail,
        password: signupPassword
      };
      await authApi.signup(signupData);
      toast({
        title: "Success",
        description: "Account created successfully! Please log in."
      });

      // Clear signup form
      setSignupFirstname('');
      setSignupLastname('');
      setSignupEmail('');
      setSignupPassword('');
      setConfirmPassword('');

      // Switch to login tab
      switchTab('login');
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create account",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isSignup = activeTab === 'signup';

  return (
    <>
      {showPostLoginOnboarding && <OnboardingModal open={showPostLoginOnboarding} onComplete={() => {
        localStorage.setItem("learnly_onboarding_complete", "true");
        setShowPostLoginOnboarding(false);
        window.location.href = '/chat';
      }} />}

      <div className="min-h-screen luminous-bg-mesh text-slate-200 font-luminous-body antialiased overflow-x-hidden flex flex-col">
        {/* Ambient glows */}
        <div className="fixed -top-32 -left-20 w-96 h-96 rounded-full bg-luminous-primary-container/20 blur-[120px] pointer-events-none"></div>
        <div className="fixed bottom-10 right-1/4 w-[32rem] h-[32rem] rounded-full bg-luminous-secondary-container/10 blur-[150px] pointer-events-none"></div>

        {/* Top bar */}
        <div className="relative w-full max-w-[1240px] mx-auto px-4 sm:px-6 pt-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-luminous-primary-container to-luminous-secondary-container flex items-center justify-center">
              <Brain className="w-5 h-5 text-midnight-950" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-white">
              Learn<span className="text-luminous-primary">ly</span>
            </span>
          </Link>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>

        {/* Split layout */}
        <div className="relative flex-1 w-full max-w-[1240px] mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Form card */}
          <div className="w-full max-w-xl mx-auto lg:mx-0">
            <div className="relative rounded-2xl luminous-glass-card p-6 sm:p-9">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-luminous-primary-container/60 to-transparent"></div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                <span className="inline-flex self-start items-center gap-2 px-2.5 py-1 rounded-full bg-midnight-800/90 font-luminous-mono text-[11px] uppercase tracking-wider text-luminous-secondary-container whitespace-nowrap">
                  <span className="w-2 h-2 shrink-0 rounded-full bg-luminous-secondary-container animate-pulse"></span>
                  Learnly 2.0
                </span>
                <div className="relative grid grid-cols-2 p-1 bg-midnight-950/80 rounded-xl w-full sm:w-auto" role="tablist" aria-label="Sign in or create account">
                  {/* Sliding thumb */}
                  <span
                    aria-hidden="true"
                    className={`absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-luminous-primary-container luminous-shadow-glow-purple transition-transform duration-300 ease-in-out ${
                      isSignup ? 'translate-x-full' : 'translate-x-0'
                    }`}
                  />
                  <button
                    role="tab"
                    aria-selected={!isSignup}
                    onClick={() => switchTab('login')}
                    className={`relative z-10 px-3 py-1.5 rounded-lg text-[13px] sm:text-sm whitespace-nowrap transition-colors duration-200 ${
                      !isSignup ? 'font-semibold text-white' : 'font-medium text-slate-400 hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    role="tab"
                    aria-selected={isSignup}
                    onClick={() => switchTab('signup')}
                    className={`relative z-10 px-3 py-1.5 rounded-lg text-[13px] sm:text-sm whitespace-nowrap transition-colors duration-200 ${
                      isSignup ? 'font-semibold text-white' : 'font-medium text-slate-400 hover:text-white'
                    }`}
                  >
                    Create Account
                  </button>
                </div>
              </div>

              <div key={activeTab} className="animate-auth-panel">
                <h1 className="font-display text-3xl sm:text-4xl text-white font-extrabold tracking-tight">
                  {isSignup ? 'Build your future' : 'Welcome back'}
                </h1>
                <p className="text-sm text-slate-400 mt-1.5 mb-7">
                  {isSignup
                    ? 'Create your free account — no credit card required.'
                    : 'Pick up right where you left off.'}
                </p>

                <form className="space-y-4" onSubmit={isSignup ? handleSignup : handleLogin}>
                {isSignup && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-slate-400" htmlFor="auth-firstname">First name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                          id="auth-firstname"
                          className={inputClass}
                          placeholder="Alex"
                          type="text"
                          value={signupFirstname}
                          onChange={(e) => setSignupFirstname(e.target.value)}
                          required
                          maxLength={50}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-slate-400" htmlFor="auth-lastname">Last name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                          id="auth-lastname"
                          className={inputClass}
                          placeholder="Morgan"
                          type="text"
                          value={signupLastname}
                          onChange={(e) => setSignupLastname(e.target.value)}
                          required
                          maxLength={50}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-400" htmlFor="auth-email">Email</label>
                  <div className="relative">
                    <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      id="auth-email"
                      className={inputClass}
                      placeholder="you@example.com"
                      type="email"
                      value={isSignup ? signupEmail : loginEmail}
                      onChange={(e) => isSignup ? setSignupEmail(e.target.value) : setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-400" htmlFor="auth-password">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      id="auth-password"
                      className={`${inputClass} pr-11`}
                      placeholder="••••••••"
                      type={showPassword ? 'text' : 'password'}
                      value={isSignup ? signupPassword : loginPassword}
                      onChange={(e) => isSignup ? setSignupPassword(e.target.value) : setLoginPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {isSignup && (
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-400" htmlFor="auth-confirm">Confirm password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        id="auth-confirm"
                        className={`${inputClass} pr-11`}
                        placeholder="••••••••"
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        aria-label={showConfirm ? 'Hide password' : 'Show password'}
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors p-1"
                      >
                        {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full group mt-2 py-3 px-5 rounded-xl font-display font-bold text-white luminous-btn-primary luminous-shadow-glow-purple flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span>{isLoading ? (isSignup ? 'Creating account…' : 'Signing in…') : (isSignup ? 'Create Free Account' : 'Sign In to Learnly')}</span>
                  {!isLoading && <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />}
                </button>
              </form>

              <p className="mt-5 text-center text-sm text-slate-400">
                {isSignup ? (
                  <>Already have an account?{' '}
                    <button onClick={() => switchTab('login')} className="text-luminous-primary hover:text-luminous-secondary font-semibold transition-colors">
                      Sign in
                    </button>
                  </>
                ) : (
                  <>New to Learnly?{' '}
                    <button onClick={() => switchTab('signup')} className="text-luminous-primary hover:text-luminous-secondary font-semibold transition-colors">
                      Create an account
                    </button>
                  </>
                )}
              </p>
              </div>

              <div className="mt-5 pt-4 border-t border-white/10 text-center font-luminous-mono text-[11px] text-slate-500">
                Free to start · No credit card required
              </div>
            </div>
          </div>

          <AuthShowcase />
        </div>

        <footer className="relative w-full max-w-[1240px] mx-auto px-4 sm:px-6 pb-8 text-center font-luminous-mono text-[11px] text-slate-500">
          © 2026 Learnly. All rights reserved.
        </footer>
      </div>
    </>
  );
};

export default LoginPage;
