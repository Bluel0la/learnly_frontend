import React from 'react';
import { useNavigate } from 'react-router-dom';
import { secureTokenStorage } from '@/services/secureTokenStorage';
import LandingNavigation from '@/components/landing/LandingNavigation';
import LandingHero from '@/components/landing/LandingHero';
import LandingStats from '@/components/landing/LandingStats';
import LandingFeatures from '@/components/landing/LandingFeatures';
import LandingHowItWorks from '@/components/landing/LandingHowItWorks';
import LandingCTA from '@/components/landing/LandingCTA';
import LandingFooter from '@/components/landing/LandingFooter';

const Index = () => {
  const navigate = useNavigate();
  const isAuthenticated = secureTokenStorage.isAuthenticated();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/chat');
    } else {
      navigate('/login');
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div id="top" className="min-h-screen luminous-bg-mesh text-slate-200 font-luminous-body antialiased overflow-x-hidden">
      {/* Ambient lighting */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[500px] bg-gradient-to-b from-luminous-primary-container/20 via-luminous-primary/5 to-transparent blur-[140px] pointer-events-none"></div>
      <div className="fixed top-1/3 -left-64 w-[500px] h-[500px] bg-cyan-500/10 blur-[130px] pointer-events-none"></div>
      <div className="fixed bottom-1/4 -right-64 w-[600px] h-[600px] bg-purple-600/15 blur-[150px] pointer-events-none"></div>
      <div className="luminous-tech-grid">
        <LandingNavigation
          isAuthenticated={isAuthenticated}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          onGetStarted={handleGetStarted}
          onLogin={handleLogin}
        />
        <main className="relative">
          <LandingHero isAuthenticated={isAuthenticated} onGetStarted={handleGetStarted} />
          <LandingStats />
          <LandingFeatures />
          <LandingHowItWorks />
          <LandingCTA isAuthenticated={isAuthenticated} onGetStarted={handleGetStarted} />
        </main>
        <LandingFooter onSignIn={handleLogin} onGetStarted={handleGetStarted} />
      </div>
    </div>
  );
};

export default Index;
