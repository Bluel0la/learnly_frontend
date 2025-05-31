
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { tokenStorage } from '@/services/api';

interface AuthRedirectProps {
  children: React.ReactNode;
}

const AuthRedirect = ({ children }: AuthRedirectProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    const checkAuth = () => {
      // Don't redirect if already on login or signup page
      const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
      
      if (!tokenStorage.isAuthenticated() && !isAuthPage) {
        toast({
          title: "Session expired",
          description: "Please log in to continue",
          variant: "destructive"
        });
        navigate('/login', { state: { from: location.pathname } });
      }
    };

    // Check immediately
    checkAuth();
    
    // Set up interval to check token expiration every minute
    const interval = setInterval(checkAuth, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [location.pathname, navigate, toast]);

  return <>{children}</>;
};

export default AuthRedirect;
