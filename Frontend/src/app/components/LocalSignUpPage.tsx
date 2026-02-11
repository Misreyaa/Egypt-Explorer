import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { LocalProfile, VehicleInfo, ShopInfo, useUser } from '../context/UserContext';
import { Camera, Car, Store, Map, Sun, Moon } from 'lucide-react';

interface LocalSignUpPageProps {
  onComplete: () => void;
  email: string;
  password: string;
}

export const LocalSignUpPage: React.FC<LocalSignUpPageProps> = ({ onComplete, email, password }) => {
  const { signUp, theme, toggleTheme } = useUser();
  const [step, setStep] = useState(1);
  
  // Basic info
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [city, setCity] = useState('');
  const [occupation, setOccupation] = useState<'driver' | 'shopkeeper' | 'neighborhood_tourguide'>('neighborhood_tourguide');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('');
  const [spokenLanguages, setSpokenLanguages] = useState<string[]>([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // Vehicle info (for drivers)
  const [vehicleType, setVehicleType] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [vehicleCity, setVehicleCity] = useState('');
  const [capacity, setCapacity] = useState('');
  const [vehicleDescription, setVehicleDescription] = useState('');
  
  // Shop info (for shopkeepers)
  const [shopName, setShopName] = useState('');
  const [shopCity, setShopCity] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [shopPhone, setShopPhone] = useState('');
  const [shopDescription, setShopDescription] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  const totalSteps = occupation === 'driver' ? 4 : occupation === 'shopkeeper' ? 4 : 3;
  const progress = (step / totalSteps) * 100;

  const languageOptions = ['Arabic', 'English', 'French', 'German', 'Spanish', 'Italian', 'Chinese', 'Russian'];
  const categoryOptions = ['souvenir', 'food', 'clothing', 'jewelry', 'antiques', 'crafts', 'spices', 'textiles'];

  const handleLanguageToggle = (lang: string) => {
    setSpokenLanguages(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const handleCategoryToggle = (cat: string) => {
    setCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
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
    const localProfile: LocalProfile = {
      name,
      age,
      city,
      occupation,
      bio,
      avatarUrl,
      national_id: nationalId,
      phone,
      spoken_languages: spokenLanguages,
      hasSeenRules: false,
      earnings: 250  // Initialize with some earnings for demo
    };

    if (occupation === 'driver') {
      const vehicleInfo: VehicleInfo = {
        vehicle_type: vehicleType,
        license_plate: licensePlate,
        city: vehicleCity,
        capacity,
        description: vehicleDescription
      };
      localProfile.vehicle_info = vehicleInfo;
    }

    if (occupation === 'shopkeeper') {
      const shopInfo: ShopInfo = {
        name: shopName,
        city: shopCity,
        address: shopAddress,
        phone: shopPhone,
        description: shopDescription,
        opening_hours: openingHours,
        categories
      };
      localProfile.shop_info = shopInfo;
    }

    signUp({ userType: 'local', profile: localProfile }, email, password);
    onComplete();
  };

  const canProceedStep1 = name && age && city && nationalId && phone && spokenLanguages.length > 0 && agreedToTerms;
  const canProceedStep3Driver = vehicleType && licensePlate && vehicleCity && capacity;
  const canProceedStep3Shop = shopName && shopCity && shopAddress && shopPhone && openingHours && categories.length > 0;

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
          <CardTitle className="text-center text-foreground">Join as a Local</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Share your knowledge and connect with tourists
          </CardDescription>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-4 pb-4 border-b">
                <Avatar className="h-24 w-24 border-4 border-border">
                  <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
                  <AvatarFallback className="text-2xl">
                    {name.split(' ').map(n => n[0]).join('').toUpperCase() || <Camera className="h-8 w-8" />}
                  </AvatarFallback>
                </Avatar>
                <Label htmlFor="local-avatar-upload" className="cursor-pointer">
                  <div className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors">
                    {avatarUrl ? 'Change Photo' : 'Upload Photo'}
                  </div>
                </Label>
                <Input
                  id="local-avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Your age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="e.g., Cairo, Alexandria"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="national-id">National ID *</Label>
                <Input
                  id="national-id"
                  placeholder="Your national ID number"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+20 XXX XXX XXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio (Optional)</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell tourists about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label className="mb-3 block">Spoken Languages * (Select at least one)</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {languageOptions.map((lang) => (
                    <div
                      key={lang}
                      className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                        spokenLanguages.includes(lang) ? 'bg-primary/10 border-primary' : 'hover:bg-accent'
                      }`}
                      onClick={() => handleLanguageToggle(lang)}
                    >
                      <Checkbox
                        checked={spokenLanguages.includes(lang)}
                        onCheckedChange={() => handleLanguageToggle(lang)}
                      />
                      <Label className="cursor-pointer text-sm">{lang}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                    className="mt-1"
                  />
                  <Label htmlFor="terms" className="text-sm cursor-pointer leading-relaxed">
                    I have read, understood, and agree to the{' '}
                    <span className="font-bold text-primary">Terms and Conditions</span> for local service providers *
                  </Label>
                </div>
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
              <Label>Select Your Occupation *</Label>
              <div className="grid gap-3">
                <div
                  className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    occupation === 'driver' ? 'bg-primary/10 border-primary' : 'hover:bg-accent'
                  }`}
                  onClick={() => setOccupation('driver')}
                >
                  <Car className="h-6 w-6" />
                  <div className="flex-1">
                    <div className="font-medium">Driver</div>
                    <div className="text-sm text-muted-foreground">Transport tourists around Egypt</div>
                  </div>
                </div>

                <div
                  className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    occupation === 'shopkeeper' ? 'bg-primary/10 border-primary' : 'hover:bg-accent'
                  }`}
                  onClick={() => setOccupation('shopkeeper')}
                >
                  <Store className="h-6 w-6" />
                  <div className="flex-1">
                    <div className="font-medium">Shopkeeper</div>
                    <div className="text-sm text-muted-foreground">Sell authentic Egyptian products</div>
                  </div>
                </div>

                <div
                  className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    occupation === 'neighborhood_tourguide' ? 'bg-primary/10 border-primary' : 'hover:bg-accent'
                  }`}
                  onClick={() => setOccupation('neighborhood_tourguide')}
                >
                  <Map className="h-6 w-6" />
                  <div className="flex-1">
                    <div className="font-medium">Neighborhood Tour Guide</div>
                    <div className="text-sm text-muted-foreground">Share local secrets and hidden gems</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={() => {
                    if (occupation === 'neighborhood_tourguide') {
                      handleSubmit();
                    } else {
                      setStep(3);
                    }
                  }}
                  className="flex-1"
                >
                  {occupation === 'neighborhood_tourguide' ? 'Complete Sign Up' : 'Next'}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && occupation === 'driver' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Vehicle Information</h3>
              
              <div>
                <Label htmlFor="vehicle-type">Vehicle Type *</Label>
                <Select value={vehicleType} onValueChange={setVehicleType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedan">Sedan</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="van">Van</SelectItem>
                    <SelectItem value="minibus">Minibus</SelectItem>
                    <SelectItem value="luxury">Luxury Car</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="license-plate">License Plate *</Label>
                  <Input
                    id="license-plate"
                    placeholder="ABC 1234"
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="vehicle-city">City *</Label>
                  <Input
                    id="vehicle-city"
                    placeholder="Operating city"
                    value={vehicleCity}
                    onChange={(e) => setVehicleCity(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="capacity">Passenger Capacity *</Label>
                <Input
                  id="capacity"
                  type="number"
                  placeholder="Number of passengers"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="vehicle-description">Description (Optional)</Label>
                <Textarea
                  id="vehicle-description"
                  placeholder="Describe your vehicle and services..."
                  value={vehicleDescription}
                  onChange={(e) => setVehicleDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceedStep3Driver}
                  className="flex-1"
                >
                  Complete Sign Up
                </Button>
              </div>
            </div>
          )}

          {step === 3 && occupation === 'shopkeeper' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Shop Information</h3>
              
              <div>
                <Label htmlFor="shop-name">Shop Name *</Label>
                <Input
                  id="shop-name"
                  placeholder="Your shop name"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shop-city">City *</Label>
                  <Input
                    id="shop-city"
                    placeholder="Shop city"
                    value={shopCity}
                    onChange={(e) => setShopCity(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="shop-phone">Phone *</Label>
                  <Input
                    id="shop-phone"
                    type="tel"
                    placeholder="Shop phone"
                    value={shopPhone}
                    onChange={(e) => setShopPhone(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="shop-address">Address *</Label>
                <Input
                  id="shop-address"
                  placeholder="Full shop address"
                  value={shopAddress}
                  onChange={(e) => setShopAddress(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="opening-hours">Opening Hours *</Label>
                <Input
                  id="opening-hours"
                  placeholder="e.g., 9 AM - 9 PM"
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
                />
              </div>

              <div>
                <Label className="mb-3 block">Shop Categories * (Select at least one)</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categoryOptions.map((cat) => (
                    <div
                      key={cat}
                      className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                        categories.includes(cat) ? 'bg-primary/10 border-primary' : 'hover:bg-accent'
                      }`}
                      onClick={() => handleCategoryToggle(cat)}
                    >
                      <Checkbox
                        checked={categories.includes(cat)}
                        onCheckedChange={() => handleCategoryToggle(cat)}
                      />
                      <Label className="cursor-pointer text-sm capitalize">{cat}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="shop-description">Description (Optional)</Label>
                <Textarea
                  id="shop-description"
                  placeholder="Describe your shop and products..."
                  value={shopDescription}
                  onChange={(e) => setShopDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceedStep3Shop}
                  className="flex-1"
                >
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