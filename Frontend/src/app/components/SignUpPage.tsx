import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { UserProfile, useUser } from '../context/UserContext';
import { Users, User, Home, Palmtree, Utensils, Camera, Music, Mountain, Ship, ShoppingBag } from 'lucide-react';

interface SignUpPageProps {
  onComplete: () => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ onComplete }) => {
  const { signUp } = useUser();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [travelType, setTravelType] = useState<'group' | 'solo' | 'family'>('solo');
  const [activities, setActivities] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const activityOptions = [
    { value: 'historical', label: 'Historical Sites', icon: Palmtree },
    { value: 'adventure', label: 'Adventure & Safari', icon: Mountain },
    { value: 'culinary', label: 'Food & Cuisine', icon: Utensils },
    { value: 'culture', label: 'Cultural Events', icon: Music },
    { value: 'shopping', label: 'Shopping & Markets', icon: ShoppingBag },
    { value: 'water', label: 'Water Activities', icon: Ship },
  ];

  const handleActivityToggle = (activity: string) => {
    setActivities(prev =>
      prev.includes(activity)
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    const profile: UserProfile = {
      name,
      age,
      travelType,
      activities,
      avatarUrl,
    };
    signUp(profile, email, password);
    onComplete();
  };

  const canProceedStep1 = email && password;
  const canProceedStep2 = name && age;
  const canProceedStep4 = activities.length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-papyrus-light p-4">
      <Card className="w-full max-w-2xl bg-papyrus shadow-xl border-brown-medium/20">
        <CardHeader>
          <CardTitle className="text-center text-brown-dark">Welcome to Egypt Explorer</CardTitle>
          <CardDescription className="text-center text-brown-medium">
            Create your personalized Egyptian adventure
          </CardDescription>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
        <CardContent>
          {step === 1 && (
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
              <Button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className="w-full"
              >
                Next
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">What's your name?</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Your age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="w-full">
                  Back
                </Button>
                <Button onClick={() => setStep(3)} disabled={!canProceedStep2} className="w-full">
                  Next
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Label>How do you prefer to travel?</Label>
              <RadioGroup value={travelType} onValueChange={(value) => setTravelType(value as any)}>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="solo" id="solo" />
                  <Label htmlFor="solo" className="flex items-center gap-2 cursor-pointer flex-1">
                    <User className="h-5 w-5" />
                    <div>
                      <div>Solo Traveler</div>
                      <div className="text-sm text-muted-foreground">Explore at your own pace</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="group" id="group" />
                  <Label htmlFor="group" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Users className="h-5 w-5" />
                    <div>
                      <div>Group Travel</div>
                      <div className="text-sm text-muted-foreground">Meet new people and share experiences</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="family" id="family" />
                  <Label htmlFor="family" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Home className="h-5 w-5" />
                    <div>
                      <div>Family Travel</div>
                      <div className="text-sm text-muted-foreground">Activities suitable for all ages</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="w-full">
                  Back
                </Button>
                <Button onClick={() => setStep(4)} className="w-full">
                  Next
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <Label>What activities interest you? (Select at least one)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activityOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <div
                      key={option.value}
                      className={`flex items-center space-x-2 p-4 border rounded-lg cursor-pointer transition-colors ${
                        activities.includes(option.value) ? 'bg-primary/10 border-primary' : 'hover:bg-accent'
                      }`}
                      onClick={() => handleActivityToggle(option.value)}
                    >
                      <Checkbox
                        checked={activities.includes(option.value)}
                        onCheckedChange={() => handleActivityToggle(option.value)}
                      />
                      <Icon className="h-5 w-5" />
                      <Label className="cursor-pointer flex-1">{option.label}</Label>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(3)} className="w-full">
                  Back
                </Button>
                <Button onClick={() => setStep(5)} disabled={!canProceedStep4} className="w-full">
                  Next
                </Button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <Label>Add a profile photo (optional)</Label>
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={avatarUrl} alt={name} />
                  <AvatarFallback className="text-3xl">
                    {name.split(' ').map(n => n[0]).join('').toUpperCase() || <Camera className="h-12 w-12" />}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-center gap-2">
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <div className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors">
                      Choose Photo
                    </div>
                  </Label>
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <p className="text-sm text-muted-foreground">Upload a photo or we'll create an avatar for you</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(4)} className="w-full">
                  Back
                </Button>
                <Button onClick={handleSubmit} className="w-full">
                  Complete Sign Up
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};