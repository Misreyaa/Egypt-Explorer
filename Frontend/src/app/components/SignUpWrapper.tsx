import React, { useState } from 'react';
import { SignUpPage } from './SignUpPage';
import { LocalSignUpPage } from './LocalSignUpPage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Input } from './ui/input';
import { User, Home, Sun, Moon, Plane, MapPin } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface SignUpWrapperProps {
  onComplete: () => void;
}

export const SignUpWrapper: React.FC<SignUpWrapperProps> = ({ onComplete }) => {
  const { theme, toggleTheme } = useUser();
  const [userType, setUserType] = useState<'tourist' | 'local' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showAuthStep, setShowAuthStep] = useState(false);

  if (userType === 'local' && showAuthStep) {
    return <LocalSignUpPage onComplete={onComplete} email={email} password={password} />;
  }

  if (userType === 'tourist' && showAuthStep) {
    return <SignUpPage onComplete={onComplete} initialEmail={email} initialPassword={password} />;
  }

  const canProceed = email && password;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-foreground hover:bg-accent transition-all rounded-full"
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>
      </div>
      <Card className="w-full max-w-2xl bg-card shadow-xl border-border">
        <CardHeader>
          <CardTitle className="text-center text-foreground">Welcome to Egypt Explorer</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            {!userType ? 'Join our community' : 'Create your account'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!userType && (
            <>
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Who are you?</Label>
                <RadioGroup value={userType || ''} onValueChange={(value) => setUserType(value as any)}>
                  <div 
                    className="flex items-center space-x-3 p-6 border-2 rounded-xl hover:bg-accent cursor-pointer transition-all group"
                    onClick={() => setUserType('tourist')}
                  >
                    <RadioGroupItem value="tourist" id="tourist" />
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plane className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="tourist" className="text-lg font-semibold cursor-pointer">Tourist</Label>
                        <div className="text-sm text-muted-foreground">Exploring Egypt as a visitor</div>
                      </div>
                    </div>
                  </div>
                  <div 
                    className="flex items-center space-x-3 p-6 border-2 rounded-xl hover:bg-accent cursor-pointer transition-all group"
                    onClick={() => setUserType('local')}
                  >
                    <RadioGroupItem value="local" id="local" />
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <MapPin className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="local" className="text-lg font-semibold cursor-pointer">Local</Label>
                        <div className="text-sm text-muted-foreground">Living in Egypt and want to help tourists</div>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </div>
              <Button onClick={() => userType && setShowAuthStep(true)} disabled={!userType} className="w-full">
                Continue
              </Button>
            </>
          )}

          {userType && !showAuthStep && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setUserType(null)} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setShowAuthStep(true)} disabled={!canProceed} className="flex-1">
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
