import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Combobox } from './ui/combobox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { UserProfile, LocalProfile, useUser } from '../context/UserContext';
import { Users, User, Home, Palmtree, Utensils, Camera, Music, Mountain, Ship, ShoppingBag, Globe, Languages, Coins, Save, Heart, ArrowRight, Wallet, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { countries } from '../data/countries';
import { languages } from '../data/languages';
import { currencies } from '../data/currencies';
import { allDestinations } from '../data/destinations';

export const UserProfilePage: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate }) => {
  const { user, updateProfile } = useUser();
  const [formData, setFormData] = useState<UserProfile | LocalProfile | null>(null);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [showInstaPayDialog, setShowInstaPayDialog] = useState(false);
  const [instaPayInput, setInstaPayInput] = useState('');

  // Handle both tourist and local profiles
  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Please log in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLocal = user.userType === 'local';
  const isTourist = user.userType === 'tourist';

  const presetAvatars = [
    {
      id: 'bw-curly',
      url: 'https://images.unsplash.com/photo-1763742937405-1b172cfa6cd7?q=80&w=400&auto=format&fit=crop',
      label: 'B&W Curly'
    },
    {
      id: 'blue-straight',
      url: 'https://images.unsplash.com/photo-1678544119978-8e253d5f3ecb?q=80&w=400&auto=format&fit=crop',
      label: 'Blue Eyes Straight'
    },
    {
      id: 'brown-man',
      url: 'https://images.unsplash.com/photo-1723701170346-f025b9f85906?q=80&w=400&auto=format&fit=crop',
      label: 'Brown Man'
    },
    {
      id: 'brown-woman',
      url: 'https://images.unsplash.com/photo-1748188166844-d0cdc843499a?q=80&w=400&auto=format&fit=crop',
      label: 'Brown Woman'
    }
  ];

  const pharaohAvatars = [
    'https://images.unsplash.com/photo-1738580430580-032946f59218?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1743963923776-71abd3fef92c?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1618403714739-7827a3d780b8?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1620925006172-e2c71bb99092?q=80&w=400&auto=format&fit=crop'
  ];

  useEffect(() => {
    if (user) {
      setFormData({ ...user.profile });
    }
  }, [user]);

  const handleSave = () => {
    if (formData && user) {
      updateProfile({ userType: user.userType, profile: formData });
      toast.success("Profile updated successfully!");
    }
  };

  if (!formData) return <div>Loading...</div>;

  const wishlist = user.userType === 'tourist' ? user.profile.wishlist || [] : [];
  const wishlistDestinations = allDestinations.filter(dest => 
    wishlist.includes(dest.id)
  );

  const activityOptions = [
    { value: 'historical', label: 'Historical Sites', icon: Palmtree },
    { value: 'adventure', label: 'Adventure & Safari', icon: Mountain },
    { value: 'culinary', label: 'Food & Cuisine', icon: Utensils },
    { value: 'culture', label: 'Cultural Events', icon: Music },
    { value: 'shopping', label: 'Shopping & Markets', icon: ShoppingBag },
    { value: 'water', label: 'Water Activities', icon: Ship },
  ];

  const handleActivityToggle = (activity: string) => {
    setFormData(prev => {
      if (!prev || !('activities' in prev)) return null;
      const newActivities = prev.activities.includes(activity)
        ? prev.activities.filter(a => a !== activity)
        : [...prev.activities, activity];
      return { ...prev, activities: newActivities };
    });
  };

  const handleCollectEarnings = () => {
    if (isLocal && formData && 'instaPayDetails' in formData) {
      if (!formData.instaPayDetails) {
        setShowInstaPayDialog(true);
      } else {
        // Simulate collecting earnings
        toast.success(`Earnings of ${formData.earnings || 0} EGP sent to your InstaPay account!`);
        const updatedProfile = { ...formData, earnings: 0 } as LocalProfile;
        setFormData(updatedProfile);
        updateProfile({ userType: 'local', profile: updatedProfile });
      }
    }
  };

  const handleSaveInstaPay = () => {
    if (!instaPayInput.trim()) {
      toast.error('Please enter your InstaPay details');
      return;
    }
    
    if (isLocal && formData) {
      const updatedProfile = { ...formData, instaPayDetails: instaPayInput } as LocalProfile;
      setFormData(updatedProfile);
      updateProfile({ userType: 'local', profile: updatedProfile });
      setShowInstaPayDialog(false);
      setInstaPayInput('');
      toast.success('InstaPay details saved!');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => prev ? { ...prev, avatarUrl: reader.result as string } : null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setFormData(prev => prev ? { ...prev, avatarUrl: '' } : null);
  };

  const generatePharaohAvatar = async () => {
    if (!formData?.avatarUrl) return;
    
    setIsGeneratingAvatar(true);
    
    try {
      // Mock delay for AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const randomIndex = Math.floor(Math.random() * pharaohAvatars.length);
      setFormData(prev => prev ? { ...prev, avatarUrl: pharaohAvatars[randomIndex] } : null);
      toast.success("AI Pharaoh Avatar generated!");
    } catch (error) {
      console.error('Error generating pharaoh avatar:', error);
      toast.error("Failed to generate avatar");
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl space-y-8">
      <Card className="bg-card shadow-lg border-border">
        <CardHeader>
          <CardTitle className="text-2xl text-foreground flex items-center gap-2">
            <User className="h-6 w-6" />
            Edit Profile
          </CardTitle>
          <CardDescription>Update your personal information{isTourist && ' and travel preferences'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* Section 1: Personal Info */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Personal Information</h3>
            
            <div className="space-y-4">
              <Label className="text-sm font-medium text-muted-foreground">Quick Select Avatar</Label>
              <div className="grid grid-cols-4 sm:grid-cols-4 gap-4 max-w-md">
                {presetAvatars.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setFormData({ ...formData, avatarUrl: preset.url })}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      formData.avatarUrl === preset.url ? 'border-yellow-500 scale-105 shadow-md' : 'border-border hover:border-pine-primary/30'
                    }`}
                  >
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start pt-4">
              <div className="flex flex-col items-center gap-3">
                <Avatar className="h-24 w-24 border-2 border-primary">
                  <AvatarImage src={formData.avatarUrl} alt={formData.name} className="object-cover" />
                  <AvatarFallback className="text-2xl">
                    {formData.name.split(' ').map(n => n[0]).join('').toUpperCase() || <Camera className="h-8 w-8" />}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1 w-full items-center">
                  <div className="flex gap-2">
                    <Label htmlFor="profile-upload" className="cursor-pointer text-sm text-primary hover:underline">
                      Change Photo
                    </Label>
                    {formData.avatarUrl && (
                      <button 
                        onClick={handleRemovePhoto}
                        className="text-sm text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {formData.avatarUrl && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={generatePharaohAvatar}
                      disabled={isGeneratingAvatar}
                      className="mt-1 text-[10px] h-7 px-2 border-yellow-500/50 text-yellow-600"
                    >
                      {isGeneratingAvatar ? '...' : '✨ Pharaoh AI'}
                    </Button>
                  )}
                </div>
                <Input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 w-full">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Only show localization and travel preferences for tourists */}
          {isTourist && (
            <>
              {/* Section 2: Localization */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Localization</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="country" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" /> Country
                    </Label>
                    <Combobox
                      options={countries}
                      value={'country' in formData ? formData.country : ''}
                      onValueChange={(val) => setFormData({ ...formData, country: val })}
                      placeholder="Select country"
                      searchPlaceholder="Search countries..."
                      emptyText="No country found."
                    />
                  </div>
                  <div>
                    <Label htmlFor="language" className="flex items-center gap-2">
                      <Languages className="h-4 w-4" /> Native Language
                    </Label>
                    <Combobox
                      options={languages}
                      value={'language' in formData ? formData.language : ''}
                      onValueChange={(val) => setFormData({ ...formData, language: val })}
                      placeholder="Select language"
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
                      value={'currency' in formData ? formData.currency : ''}
                      onValueChange={(val) => setFormData({ ...formData, currency: val })}
                      placeholder="Select currency"
                      searchPlaceholder="Search currencies..."
                      emptyText="No currency found."
                    />
                  </div>
                  <div>
                    <Label htmlFor="appLanguage">App Language</Label>
                    <Select 
                      value={'appLanguage' in formData ? formData.appLanguage || 'English' : 'English'} 
                      onValueChange={(val) => setFormData({ ...formData, appLanguage: val })}
                    >
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
                </div>
              </div>

              {/* Section 3: Travel Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Travel Preferences</h3>
                <div className="space-y-4">
                  <Label>Travel Style</Label>
                  <RadioGroup 
                    value={'travelType' in formData ? formData.travelType : 'solo'} 
                    onValueChange={(val) => setFormData({ ...formData, travelType: val as any })}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <div className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-accent ${'travelType' in formData && formData.travelType === 'solo' ? 'border-primary bg-primary/5' : ''}`}>
                      <RadioGroupItem value="solo" id="edit-solo" />
                      <Label htmlFor="edit-solo" className="flex items-center gap-2 cursor-pointer w-full">
                        <User className="h-4 w-4" /> Solo
                      </Label>
                    </div>
                    <div className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-accent ${'travelType' in formData && formData.travelType === 'group' ? 'border-primary bg-primary/5' : ''}`}>
                      <RadioGroupItem value="group" id="edit-group" />
                      <Label htmlFor="edit-group" className="flex items-center gap-2 cursor-pointer w-full">
                        <Users className="h-4 w-4" /> Group
                      </Label>
                    </div>
                    <div className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-accent ${'travelType' in formData && formData.travelType === 'family' ? 'border-primary bg-primary/5' : ''}`}>
                      <RadioGroupItem value="family" id="edit-family" />
                      <Label htmlFor="edit-family" className="flex items-center gap-2 cursor-pointer w-full">
                        <Home className="h-4 w-4" /> Family
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
            
                <div className="space-y-4 mt-4">
                  <Label>Interests</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {activityOptions.map((option) => {
                      const Icon = option.icon;
                      const isSelected = 'activities' in formData ? formData.activities.includes(option.value) : false;
                      return (
                        <div
                          key={option.value}
                          className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                            isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-accent'
                          }`}
                          onClick={() => handleActivityToggle(option.value)}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleActivityToggle(option.value)}
                          />
                          <Icon className="h-4 w-4" />
                          <Label className="cursor-pointer flex-1 text-sm">{option.label}</Label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="pt-4 flex justify-end">
            <Button onClick={handleSave} className="w-full md:w-auto gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Local Earnings Card */}
      {isLocal && (
        <Card className="bg-card shadow-lg border-border">
          <CardHeader>
            <CardTitle className="text-xl text-foreground flex items-center gap-2">
              <Wallet className="h-5 w-5 text-green-600" />
              My Earnings
            </CardTitle>
            <CardDescription>Track your income from services provided</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
                  <p className="text-4xl font-bold text-green-600 flex items-center gap-2">
                    <DollarSign className="h-8 w-8" />
                    {'earnings' in formData ? (formData.earnings || 0) : 0} EGP
                  </p>
                </div>
              </div>
              
              {('instaPayDetails' in formData && formData.instaPayDetails) && (
                <div className="mb-4 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <span className="font-semibold">InstaPay:</span>
                    <span>{formData.instaPayDetails}</span>
                  </p>
                </div>
              )}

              <Button 
                onClick={handleCollectEarnings}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={!('earnings' in formData) || !formData.earnings || formData.earnings === 0}
              >
                <Wallet className="h-4 w-4 mr-2" />
                Collect Earnings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Wishlist Summary - Only for tourists */}
      {isTourist && (
        <Card className="bg-card shadow-lg border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl text-foreground flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                My Wishlist ({wishlistDestinations.length})
              </CardTitle>
              <CardDescription>Quick view of your saved Egyptian experiences</CardDescription>
            </div>
            {onNavigate && (
              <Button variant="ghost" size="sm" onClick={() => onNavigate('wishlist')} className="text-primary">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {wishlistDestinations.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {wishlistDestinations.map((dest) => (
                  <div 
                    key={dest.id} 
                    className="flex-shrink-0 w-32 group cursor-pointer"
                    onClick={() => onNavigate?.('wishlist')}
                  >
                    <div className="aspect-square rounded-xl overflow-hidden mb-2 border border-border group-hover:border-primary transition-colors">
                      <img src={dest.imageUrl} alt={dest.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xs font-medium truncate text-foreground">{dest.name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-accent/30 rounded-xl">
                <p className="text-muted-foreground text-sm">Your wishlist is empty.</p>
                <Button 
                  variant="link" 
                  onClick={() => onNavigate?.('recommendations')}
                  className="text-primary text-sm"
                >
                  Find something to add!
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* InstaPay Dialog */}
      <Dialog open={showInstaPayDialog} onOpenChange={setShowInstaPayDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add InstaPay Details</DialogTitle>
            <DialogDescription>
              Please provide your InstaPay account details to receive your earnings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="instapay">InstaPay Phone Number or Account</Label>
              <Input
                id="instapay"
                placeholder="+20 123 456 7890"
                value={instaPayInput}
                onChange={(e) => setInstaPayInput(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowInstaPayDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveInstaPay}>
                Save Details
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};