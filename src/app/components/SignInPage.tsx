import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useUser } from '../context/UserContext';
import { Alert, AlertDescription } from './ui/alert';
import { Pyramid } from 'lucide-react';

interface SignInPageProps {
  onSignUpClick: () => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onSignUpClick }) => {
  const { signIn } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = signIn(email, password);
    if (!success) {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-papyrus-light p-4">
      <Card className="w-full max-w-md bg-papyrus shadow-xl border-brown-medium/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-gradient-to-br from-pine-primary to-pine-dark rounded-full flex items-center justify-center shadow-lg">
              <Pyramid className="h-10 w-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-brown-dark">Welcome Back</CardTitle>
          <CardDescription className="text-brown-medium">Sign in to continue your Egyptian adventure</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Sign In
            </Button>
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Button variant="link" className="p-0" onClick={onSignUpClick}>
                  Sign up here
                </Button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};