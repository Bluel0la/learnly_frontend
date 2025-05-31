
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { authApi } from '@/services/api';
import { loginFormSchema, signupFormSchema, type LoginFormData, type SignupFormData } from '@/lib/validation';
import { sanitizeText } from '@/lib/security';

// Import the new components
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';

const LoginPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Form states
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Loading states
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isSignupLoading, setIsSignupLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form data
      const formData: LoginFormData = {
        email: sanitizeText(email),
        password: password // Don't sanitize password as it might contain special chars
      };
      
      const validatedData = loginFormSchema.parse(formData);
      
      setIsLoginLoading(true);
      const response = await authApi.login(validatedData);
      
      toast({
        title: "Login successful",
        description: "Welcome back to Learnly"
      });
      
      // Redirect to home page or dashboard
      navigate('/');
    } catch (error: any) {
      if (error.errors) {
        // Zod validation errors
        const firstError = error.errors[0];
        toast({
          title: "Validation Error",
          description: firstError.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Login failed",
          description: error instanceof Error ? error.message : "Please check your credentials and try again",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form data
      const formData: SignupFormData = {
        firstname: sanitizeText(firstname),
        lastname: sanitizeText(lastname),
        email: sanitizeText(email),
        password: password,
        confirmPassword: confirmPassword
      };
      
      const validatedData = signupFormSchema.parse(formData);
      
      setIsSignupLoading(true);
      
      // Create the account
      await authApi.signup({
        firstname: validatedData.firstname,
        lastname: validatedData.lastname,
        email: validatedData.email,
        password: validatedData.password
      });
      
      // Automatically log in the user with their new credentials
      const loginResponse = await authApi.login({ 
        email: validatedData.email, 
        password: validatedData.password 
      });
      
      toast({
        title: "Account created successfully",
        description: "Welcome to Learnly! You've been automatically signed in."
      });
      
      // Redirect to home page
      navigate('/');
    } catch (error: any) {
      if (error.errors) {
        // Zod validation errors
        const firstError = error.errors[0];
        toast({
          title: "Validation Error",
          description: firstError.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Registration failed",
          description: error instanceof Error ? error.message : "Please try again with different information",
          variant: "destructive"
        });
      }
    } finally {
      setIsSignupLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-serif">Learnly</CardTitle>
            <CardDescription>
              Your personal AI tutor for better learning
            </CardDescription>
          </CardHeader>
          
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <LoginForm 
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                handleLogin={handleLogin}
                isLoginLoading={isLoginLoading}
              />
            </TabsContent>
            
            <TabsContent value="signup">
              <SignupForm 
                firstname={firstname}
                setFirstname={setFirstname}
                lastname={lastname}
                setLastname={setLastname}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                handleSignUp={handleSignUp}
                isSignupLoading={isSignupLoading}
              />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
