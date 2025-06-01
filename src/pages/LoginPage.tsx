
import React, { useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import { useToast } from '@/hooks/use-toast';
import { authApi, SignupRequest } from '@/services/api';
import { secureTokenStorage } from '@/services/secureTokenStorage';

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if user is already authenticated
  if (secureTokenStorage.getToken()) {
    return <Navigate to="/chat" replace />;
  }

  const defaultTab = searchParams.get('tab') === 'signup' ? 'signup' : 'login';

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password });
      
      secureTokenStorage.setToken(response.access_token);
      
      toast({
        title: "Success",
        description: "Logged in successfully!"
      });
      
      window.location.href = '/chat';
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

  const handleSignup = async (data: SignupRequest) => {
    setIsLoading(true);
    try {
      await authApi.signup(data);
      
      toast({
        title: "Success",
        description: "Account created successfully! Please log in."
      });
      
      // Switch to login tab after successful signup
      const url = new URL(window.location.href);
      url.searchParams.set('tab', 'login');
      window.history.pushState({}, '', url.toString());
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome to Learnly
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your AI-powered learning companion
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Get Started</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <LoginForm onLogin={handleLogin} isLoading={isLoading} />
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <SignupForm onSignup={handleSignup} isLoading={isLoading} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
