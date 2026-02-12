import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Combobox } from './ui/combobox';
import { MultiSelectCombobox } from './ui/multi-select-combobox';
import { UserProfile, useUser } from '../context/UserContext';
import { Users, User, Home, Palmtree, Utensils, Camera, Music, Mountain, Ship, ShoppingBag, Sun, Moon, Globe, Languages, Coins, CheckCircle2 } from 'lucide-react';
import { countries } from '../data/countries';
import { languages } from '../data/languages';
import { currencies } from '../data/currencies';

interface SignUpPageProps {
  onComplete: () => void;
  initialEmail?: string;
  initialPassword?: string;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ onComplete, initialEmail = '', initialPassword = '' }) => {
  const { signUp, theme, toggleTheme } = useUser();
  const [userType, setUserType] = useState<'tourist' | 'local' | null>(null);
  const [step, setStep] = useState(2); // Start at step 2 since email/password is in wrapper
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState(initialPassword);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  
  // New fields
  const [country, setCountry] = useState('');
  const [languagesList, setLanguagesList] = useState<string[]>([]);
  const [currency, setCurrency] = useState('');
  const [appLanguage, setAppLanguage] = useState('English');

  const [travelType, setTravelType] = useState<'group' | 'solo' | 'family'>('solo');
  const [activities, setActivities] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [isPharaohAvatar, setIsPharaohAvatar] = useState(false);

  const presetAvatars = [
    
      { id: 'm1', url: 'https://i.ibb.co/nN9GGZrN/ccc.png', label: 'King 1' },
      { id: 'm2', url: 'https://i.ibb.co/vvs7gNBP/Gemini-Generated-Image-lbyldslbyldslbyl.png', label: 'King 2' },
      { id: 'm3', url: 'https://i.ibb.co/TxqDyYP2/Gemini-Generated-Image-lbyldslbyldslbyl1.png', label: 'King 3' },
      { id: 'm4', url: 'https://i.ibb.co/SwXjVLNg/Gemini-Generated-Image-lbyldslbylwdslbyl.png', label: 'King 4' },
      { id: 'm5', url: 'https://i.ibb.co/zWhL0d3N/Gemini-Generated-Image-lbyldslbyldslbylkk.png', label: 'King 5' },
      { id: 'm6', url: 'https://i.ibb.co/5WLMHGsT/s.png', label: 'King 6' },
    
      { id: 'w1', url: 'https://i.ibb.co/6RHND89s/Gemini-Generated-Image-lbyldslbyldslbylxx.png', label: 'Queen 1' },
      { id: 'w2', url: 'https://i.ibb.co/LD035c81/Gemini-Generated-Image-lbyldslbyldslbylww.png', label: 'Queen 2' },
      { id: 'w3', url: 'https://i.ibb.co/N5GH4Zs/Gemini-Generated-Image-lbyldslbyldslbylx.png', label: 'Queen 3' },
      { id: 'w4', url: 'https://i.ibb.co/1JRS0K61/Gemini-Generated-Image-lbyldslbyldslbylq.png', label: 'Queen 4' },
      { id: 'w5', url: 'https://i.ibb.co/996Pkf2q/Gemini-Generated-Image-lbyldslbyldslbylnn.png', label: 'Queen 5' },
      { id: 'w6', url: 'https://i.ibb.co/TD0qJSkz/Gemini-Generated-Image-lbyldslbyldslbylc.png', label: 'Queen 6' },
    
  ];

  const pharaohAvatars = [
    'https://images.unsplash.com/photo-1738580430580-032946f59218?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1743963923776-71abd3fef92c?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1618403714739-7827a3d780b8?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1620925006172-e2c71bb99092?q=80&w=400&auto=format&fit=crop'
  ];

  const totalSteps = 5; // Reduced from 6 to 5 since we removed the email/password step
  const progress = ((step - 1) / totalSteps) * 100; // Adjusted calculation

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
        setIsPharaohAvatar(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setAvatarUrl('');
    setIsPharaohAvatar(false);
  };

  const generatePharaohAvatar = async () => {
    if (!avatarUrl) return;
    
    setIsGeneratingAvatar(true);
    
    try {
      // Mock delay to simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Select a random pharaoh avatar to simulate transformation
      const randomIndex = Math.floor(Math.random() * pharaohAvatars.length);
      setAvatarUrl(pharaohAvatars[randomIndex]);
      setIsPharaohAvatar(true);
      
    } catch (error) {
      console.error('Error generating pharaoh avatar:', error);
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const handleSubmit = () => {
  const payload = {
    name,
    email,
    password,
    age,             // number
    country,
    languages: languagesList,
    currency,
    appLanguage: appLanguage, // must be snake_case
    travelType: travelType,
    activities,
    avatarUrl: avatarUrl,
    bio: ''
  };
  signUp({userType:'tourist', profile: payload},email,password);  // <-- send exactly this
};


  const canProceedStep1 = email && password;
  const canProceedStep2 = name && age;
  const canProceedStep3 = country && languagesList.length > 0 && currency && appLanguage;
  const canProceedStep5 = activities.length > 0;

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
      <Card className="w-full max-w-2xl bg-card shadow-xl border-border">
        <CardHeader>
          <CardTitle className="text-center text-foreground">Welcome to Egypt Explorer</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Create your personalized Egyptian adventure
          </CardDescription>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
        <CardContent>
          {step === 0 && (
            <div className="space-y-4">
              <Label>Who are you?</Label>
              <RadioGroup value={userType || ''} onValueChange={(value) => setUserType(value as any)}>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="tourist" id="tourist" />
                  <Label htmlFor="tourist" className="flex items-center gap-2 cursor-pointer flex-1">
                    <User className="h-5 w-5" />
                    <div>
                      <div>Tourist</div>
                      <div className="text-sm text-muted-foreground">Exploring Egypt as a visitor</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="local" id="local" />
                  <Label htmlFor="local" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Home className="h-5 w-5" />
                    <div>
                      <div>Local</div>
                      <div className="text-sm text-muted-foreground">Living in Egypt</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
              <div className="flex gap-4">
                <Button onClick={() => setStep(1)} className="flex-1">
                  Next
                </Button>
              </div>
            </div>
          )}

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
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(3)} disabled={!canProceedStep2} className="flex-1">
                  Next
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="country" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" /> Country
                </Label>
                <Combobox
                  options={countries}
                  value={country}
                  onValueChange={setCountry}
                  placeholder="Select country"
                  searchPlaceholder="Search countries..."
                  emptyText="No country found."
                />
              </div>
              <div>
                <Label htmlFor="language" className="flex items-center gap-2">
                  <Languages className="h-4 w-4" /> Spoken Languages
                </Label>
                <MultiSelectCombobox
                  options={languages}
                  selected={languagesList}
                  onChange={setLanguagesList}
                  placeholder="Select languages"
                  searchPlaceholder="Search languages..."
                  emptyText="No language found."
                />
              </div>
              <div>
                <Label htmlFor="currency" className="flex items-center gap-2">
                  <Coins className="h-4 w-4" /> Currency
                </Label>
                <Combobox
                  options={currencies}
                  value={currency}
                  onValueChange={setCurrency}
                  placeholder="Select currency"
                  searchPlaceholder="Search currencies..."
                  emptyText="No currency found."
                />
              </div>
              <div>
                <Label htmlFor="appLanguage">Preferred App Language</Label>
                <Select value={appLanguage} onValueChange={setAppLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Arabic">Arabic</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="German">German</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(4)} disabled={!canProceedStep3} className="flex-1">
                  Next
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
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
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(5)} className="flex-1">
                  Next
                </Button>
              </div>
            </div>
          )}

          {step === 5 && (
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
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(4)} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(6)} disabled={!canProceedStep5} className="flex-1">
                  Next
                </Button>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6">
              <Label className="text-lg font-bold text-brown-dark">Choose Your Explorer Identity</Label>
              
              <div className="space-y-4">
                <Label className="text-sm font-medium text-muted-foreground">Select a Pharaoh Avatar</Label>
                <div className="grid grid-cols-6 gap-6">
                  {presetAvatars.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setAvatarUrl(preset.url);
                        setIsPharaohAvatar(true);
                      }}
                      className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all group ${
                        avatarUrl === preset.url ? 'border-yellow-500 scale-105 shadow-lg' : 'border-border hover:border-pine-primary/50'
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                      {avatarUrl === preset.url && (
                        <div className="absolute inset-0 bg-yellow-500/10 flex items-center justify-center">
                          <CheckCircle2 className="text-yellow-600 h-8 w-8" />
                        </div>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 py-1 text-[8px] text-white opacity-0 group-hover:opacity-100 transition-opacity uppercase font-bold text-center">
                        {preset.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or upload your own</span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Avatar className={`h-32 w-32 border-4 ${isPharaohAvatar ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'border-border'}`}>
                    <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
                    <AvatarFallback className="text-3xl">
                      {name.split(' ').map(n => n[0]).join('').toUpperCase() || <Camera className="h-12 w-12" />}
                    </AvatarFallback>
                  </Avatar>
                  {isPharaohAvatar && (
                    <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-yellow-950 text-[10px] font-bold px-2 py-1 rounded-full border-2 border-card uppercase tracking-tighter">
                      Pharaoh
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center gap-2 w-full">
                  <div className="flex gap-2 w-full justify-center">
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
                    {avatarUrl && (
                      <Button
                        variant="destructive"
                        onClick={handleRemovePhoto}
                        className="bg-red-900/20 text-red-900 hover:bg-red-900/30 border-red-900/20"
                      >
                        Remove Photo
                      </Button>
                    )}
                  </div>
                  
                  {avatarUrl && !isPharaohAvatar && (
                    <Button
                      variant="outline"
                      onClick={generatePharaohAvatar}
                      disabled={isGeneratingAvatar}
                      className="mt-2 w-full max-w-xs border-yellow-500/50 text-yellow-600 hover:bg-yellow-500/10"
                    >
                      {isGeneratingAvatar ? '🔄 Processing AI Magic...' : '✨ Transform to Pharaoh'}
                    </Button>
                  )}

                  {isPharaohAvatar && (
                    <div className="text-xs text-yellow-600 font-medium animate-pulse mt-1">
                      ✨ AI Transformation Complete! ✨
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground text-center max-w-xs">
                    {avatarUrl 
                      ? "Now transform yourself into an ancient pharaoh with our AI!"
                      : "Upload a photo and transform it into a pharaoh-themed avatar"}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(5)} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleSubmit} className="flex-1">
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