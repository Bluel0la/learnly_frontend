
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
    // Don't redirect if already on login or signup page
    const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
    
    if (!tokenStorage.isAuthenticated() && !isAuthPage) {
      toast({
        title: "Authentication required",
        description: "Please log in to access this page",
        variant: "destructive"
      });
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [location.pathname, navigate, toast]);

  return <>{children}</>;
};

export default AuthRedirect;
