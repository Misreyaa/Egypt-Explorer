import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useUser } from '../context/UserContext';
import { Alert, AlertDescription } from './ui/alert';
import { Pyramid, Sun, Moon } from 'lucide-react';

interface SignInPageProps {
  onSignUpClick: () => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onSignUpClick }) => {
  const { signIn, theme, toggleTheme } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  try {
    const res = await fetch("http://127.0.0.1:8000/locals/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: email,   // your backend expects "username"
        password: password,
      }),
    });

    if (!res.ok) {
      throw new Error("Invalid credentials");
    }

    const data = await res.json();

    // store token
    localStorage.setItem("token", data.access_token);

    // tell app user is logged in
    signIn(email, data.access_token); 
  } catch (err) {
    setError("Invalid email or password. Please try again.");
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-foreground hover:bg-accent transition-all rounded-full"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>
      </div>
      <Card className="w-full max-w-md bg-card shadow-xl border-border">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-gradient-to-br from-pine-primary to-pine-dark rounded-full flex items-center justify-center shadow-lg">
              <Pyramid className="h-10 w-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-foreground">Welcome Back</CardTitle>
          <CardDescription className="text-muted-foreground">Sign in to continue your Egyptian adventure</CardDescription>
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