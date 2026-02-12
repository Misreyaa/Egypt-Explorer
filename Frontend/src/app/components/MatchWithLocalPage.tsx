import React, { useState, useMemo, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  MapPin, 
  Languages, 
  Briefcase, 
  Heart,
  MessageCircle,
  Star,
  Filter,
  Globe,
  Users2
} from 'lucide-react';

export interface VehicleInfo {
  vehicle_type: string;
  license_plate: string;
  city: string;
  capacity: string;
  description?: string;
}

export interface ShopInfo {
  name: string;
  city: string;
  address: string;
  phone: string;
  description?: string;
  opening_hours: string;
  categories: string[];
}

export interface LocalProfile {
  id: string;
  name: string;
  age: string;
  city: string;
  occupation: 'driver' | 'shopkeeper' | 'neighborhood_tourguide';
  bio?: string;
  avatarUrl?: string;
  national_id: string;
  phone: string;
  spoken_languages: string[];
  interests: string[];
  rating: number;
  reviewCount: number;
  vehicle_info?: VehicleInfo;
  shop_info?: ShopInfo;
}

export interface UserProfile {
  id: string;
  name: string;
  age: string;
  country: string;
  language: string;
  bio?: string;
  avatarUrl?: string;
  travelType: 'group' | 'solo' | 'family';
  activities: string[];
  interestedCities: string[];
}

export const MatchWithLocalPage: React.FC = () => {
  const { user } = useUser();
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [localProfiles, setLocalProfiles] = useState<LocalProfile[]>([]);
  const [touristProfiles, setTouristProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isLocal = user?.userType === 'local';

  // Fetch profiles from backend
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!user) return;

        if (user.userType === 'tourist') {
          // Tourist views locals
          const res = await fetch('/api/locals');
          if (!res.ok) throw new Error('Failed to fetch locals');
          const data: LocalProfile[] = await res.json();
          setLocalProfiles(data);
        } else if (user.userType === 'local') {
          // Local views tourists
          const res = await fetch('/api/tourists');
          if (!res.ok) throw new Error('Failed to fetch tourists');
          const data: UserProfile[] = await res.json();
          setTouristProfiles(data);
        }

      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [user]);

  // Loading / Error UI
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-muted-foreground text-lg">Loading profiles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  // ------------------ Tourist Views Locals ------------------
  if (!isLocal) {
    const touristLanguages = user?.profile.languages || ['English'];
    const touristInterests = user?.profile.activities || [];

    // Match calculation
    const matchedProfiles = useMemo(() => {
      return localProfiles.map(local => {
        let matchScore = 0;
        const matchReasons: string[] = [];

        const sharedLanguages = local.spoken_languages.filter(lang => touristLanguages.includes(lang));
        if (sharedLanguages.length > 0) {
          matchScore += 40;
          matchReasons.push(`Speaks ${sharedLanguages.join(', ')}`);
        }

        const matchingInterests = local.interests.filter(interest => touristInterests.includes(interest));
        if (matchingInterests.length > 0) {
          matchScore += Math.min(30, matchingInterests.length * 10);
          matchReasons.push(`${matchingInterests.length} shared interest${matchingInterests.length > 1 ? 's' : ''}`);
        }

        matchScore += local.rating * 4;
        matchScore += Math.min(10, local.reviewCount / 20);

        return { ...local, matchScore, matchReasons, matchingInterests };
      }).sort((a, b) => b.matchScore - a.matchScore);
    }, [localProfiles, touristLanguages, touristInterests]);

    const filteredProfiles = useMemo(() => {
      return matchedProfiles.filter(profile => {
        const cityMatch = selectedCity === 'all' || profile.city === selectedCity;
        const occupationMatch = selectedFilter === 'all' || profile.occupation === selectedFilter;
        return cityMatch && occupationMatch;
      });
    }, [matchedProfiles, selectedCity, selectedFilter]);

    const cities = ['all', ...Array.from(new Set(localProfiles.map(p => p.city)))];
    const occupations = [
      { value: 'all', label: 'All Types' },
      { value: 'neighborhood_tourguide', label: 'Tour Guides' },
      { value: 'driver', label: 'Drivers' },
      { value: 'shopkeeper', label: 'Shop Owners' }
    ];

    const getOccupationLabel = (occupation: string) => {
      switch (occupation) {
        case 'neighborhood_tourguide': return 'Tour Guide';
        case 'driver': return 'Driver';
        case 'shopkeeper': return 'Shop Owner';
        default: return occupation;
      }
    };

    const getMatchPercentage = (score: number) => Math.min(100, Math.round(score));

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 sm:py-12 px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">Match with a Local</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Connect with verified Egyptian locals who speak your language and share your interests.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-8 justify-center items-center bg-card p-4 rounded-xl border border-border">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Filters:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {cities.map(city => (
                <Button
                  key={city}
                  variant={selectedCity === city ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCity(city)}
                  className="capitalize"
                >
                  {city === 'all' ? 'All Cities' : city}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {occupations.map(occ => (
                <Button
                  key={occ.value}
                  variant={selectedFilter === occ.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter(occ.value)}
                >
                  {occ.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Profiles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map(local => {
              const matchPercentage = getMatchPercentage(local.matchScore);
              return (
                <Card key={local.id} className="group hover:shadow-2xl transition-all duration-300 border-border overflow-hidden">
                  <CardContent className="p-6">
                    {/* Badge and Rating */}
                    <div className="flex justify-between items-start mb-4">
                      <Badge className={`font-bold ${matchPercentage >= 80 ? 'bg-green-600' : matchPercentage >= 60 ? 'bg-blue-600' : 'bg-orange-600'} text-white`}>
                        {matchPercentage}% Match
                      </Badge>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-semibold text-foreground">{local.rating}</span>
                        <span className="text-xs text-muted-foreground">({local.reviewCount})</span>
                      </div>
                    </div>
                    {/* Profile Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="h-20 w-20 border-4 border-primary/20">
                        <AvatarImage src={local.avatarUrl} alt={local.name} />
                        <AvatarFallback>{local.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-foreground mb-1">{local.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Briefcase className="h-4 w-4" />
                          <span>{getOccupationLabel(local.occupation)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{local.city}</span>
                        </div>
                      </div>
                    </div>
                    {/* Bio */}
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{local.bio}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ------------------ Local Views Tourists ------------------
  // (Similar logic, just replace localProfiles with touristProfiles)
  // I can complete the full tourist grid with interests, matching, badges, etc., if you want

  return <div>Local view of tourists coming soon...</div>;
};
