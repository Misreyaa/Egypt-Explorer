import React, { useState, useEffect, useMemo } from 'react';
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
  Users2,
  Loader2,
  AlertCircle
} from 'lucide-react';

// --- Interfaces ---

interface LocalProfile {
  id: string;
  name: string;
  age: string;
  city: string;
  occupation: 'driver' | 'shopkeeper' | 'neighborhood_tourguide';
  bio: string;
  avatarUrl: string;
  spoken_languages: string[];
  interests: string[];
  rating: number;
  reviewCount: number;
  // Optional: Backend might send these, but we calculate them on frontend for consistency
  matchScore?: number;
  matchReasons?: string[];
  matchingInterests?: string[];
}

interface TouristProfile {
  id: string;
  name: string;
  age: string;
  country: string;
  language: string;
  travelType: 'group' | 'solo' | 'family';
  activities: string[];
  avatarUrl: string;
  interestedCities: string[];
  bio: string;
  // Optional
  matchScore?: number;
  matchReasons?: string[];
  matchingInterests?: string[];
}

export const MatchWithLocalPage: React.FC = () => {
  const { user } = useUser();
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Data State
  const [localProfiles, setLocalProfiles] = useState<LocalProfile[]>([]);
  const [touristProfiles, setTouristProfiles] = useState<TouristProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isLocal = user?.userType === 'local';

  // --- Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      const userEmail = (user as any)?.email || (user as any)?.profile?.email;

      if (!user || !userEmail) {
        console.warn("User or email missing, skipping fetch");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);

      try {
        const endpoint = isLocal 
          ? `http://localhost:8000/${userEmail}/match_tourists`
          : `http://localhost:8000/${userEmail}/match_locals`;

        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error('Failed to fetch matches');
        }

        const data = await response.json();

        if (isLocal) {
          // Map backend tourist data to frontend interface
          const mappedTourists: TouristProfile[] = data.map((t: any) => ({
            id: t.id || t._id,
            name: t.name || 'Unknown',
            age: t.age || 'N/A',
            country: t.country || 'Unknown',
            // Backend sends "languages" array, Frontend expects single "language" string for main display
            language: t.languages?.[0] || 'English',
            travelType: t.travelType || 'solo',
            activities: t.activities || [],
            avatarUrl: t.avatarUrl || '',
            interestedCities: t.interestedCities || [],
            bio: t.bio || '',
            // We can preserve backend calculations if they exist, or let frontend recalc
            matchScore: t.matchScore,
            matchReasons: t.matchReasons,
            matchingInterests: t.matchingInterests
          }));
          setTouristProfiles(mappedTourists);
        } else {
          // Map backend local data to frontend interface
          const mappedLocals: LocalProfile[] = data.map((l: any) => ({
            id: l.id || l._id,
            name: l.name || 'Unknown',
            age: l.age || 'N/A',
            city: l.city || 'Cairo',
            occupation: l.occupation || 'neighborhood_tourguide',
            bio: l.bio || '',
            avatarUrl: l.avatarUrl || '',
            spoken_languages: l.spoken_languages || [],
            interests: l.interests || [],
            rating: l.rating || 5.0,
            reviewCount: l.reviewCount || 0
          }));
          setLocalProfiles(mappedLocals);
        }
      } catch (err) {
        console.error("Error loading matches:", err);
        setError("Could not load matches. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, isLocal]);

  // --- Loading / Error / Auth States ---

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Finding your perfect matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-2">Something went wrong</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // --- View: Tourist Looking for Locals ---
  if (!isLocal) {
    const touristLanguage = user.profile?.languages || 'English';
    const touristInterests = user.profile?.activities || [];

    // Calculate match score for each local (Using Frontend Logic)
    const matchedProfiles = localProfiles.map(local => {
      let matchScore = 0;
      const matchReasons: string[] = [];

      const hasLanguageMatch = touristLanguage.some(lang =>
        local.spoken_languages.includes(lang)
      );

      if (hasLanguageMatch) {
        matchScore += 40;
        // Join the matching languages into a string for the reason
        const sharedLangs = touristLanguage.filter(lang =>
          local.spoken_languages.includes(lang)
        );
        matchReasons.push(`Speaks ${sharedLangs.join(', ')}`);
      }


      // Interest match (30 points total)
      const matchingInterests = local.interests.filter(interest =>
        touristInterests.includes(interest)
      );
      if (matchingInterests.length > 0) {
        matchScore += Math.min(30, matchingInterests.length * 10);
        matchReasons.push(`${matchingInterests.length} shared interest${matchingInterests.length > 1 ? 's' : ''}`);
      }

      // Rating bonus (20 points)
      matchScore += (local.rating || 0) * 4;

      // Experience bonus based on review count (10 points max)
      matchScore += Math.min(10, (local.reviewCount || 0) / 20);

      return {
        ...local,
        matchScore,
        matchReasons,
        matchingInterests
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    // Filter profiles
    const filteredProfiles = matchedProfiles.filter(profile => {
      const cityMatch = selectedCity === 'all' || profile.city === selectedCity;
      const occupationMatch = selectedFilter === 'all' || profile.occupation === selectedFilter;
      return cityMatch && occupationMatch;
    });

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
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              Match with a Local
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Connect with verified Egyptian locals who speak your language and share your interests.
              Get authentic experiences and insider knowledge!
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

          {/* Match Info */}
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-primary">{filteredProfiles.length}</span> locals
              matching your profile • Your language: <span className="font-semibold">{touristLanguage}</span>
              {touristInterests.length > 0 && (
                <> • Your interests: <span className="font-semibold">{touristInterests.join(', ')}</span></>
              )}
            </p>
          </div>

          {/* Profiles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((local) => {
              const matchPercentage = getMatchPercentage(local.matchScore);

              return (
                <Card
                  key={local.id}
                  className="group hover:shadow-2xl transition-all duration-300 border-border overflow-hidden"
                >
                  <CardContent className="p-6">
                    {/* Match Badge */}
                    <div className="flex justify-between items-start mb-4">
                      <Badge
                        className={`font-bold ${matchPercentage >= 80 ? 'bg-green-600' :
                            matchPercentage >= 60 ? 'bg-blue-600' :
                              'bg-orange-600'
                          } text-white`}
                      >
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
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {local.bio}
                    </p>

                    {/* Languages */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Languages className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold text-foreground">Languages:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {local.spoken_languages.map(lang => (
                          <Badge
                            key={lang}
                            variant={touristLanguage.includes(lang) ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Interests */}
                    {local.matchingInterests && local.matchingInterests.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Heart className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-semibold text-foreground">Shared Interests:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {local.matchingInterests.map(interest => (
                            <Badge key={interest} variant="outline" className="text-xs border-primary/50">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Match Reasons */}
                    {local.matchReasons && local.matchReasons.length > 0 && (
                      <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <p className="text-xs text-muted-foreground mb-1">Why this match?</p>
                        <ul className="text-xs text-foreground space-y-1">
                          {local.matchReasons.map((reason, idx) => (
                            <li key={idx}>✓ {reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-primary hover:bg-primary/90"
                        size="sm"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-primary text-primary hover:bg-primary/10"
                      >
                        View Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* No Results */}
          {filteredProfiles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No locals found matching your filters. Try adjusting your search criteria.
              </p>
            </div>
          )}

          {/* Info Banner */}
          <div className="mt-12 p-8 bg-gradient-to-r from-pine-primary to-pine-dark rounded-3xl text-papyrus-light text-center shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Connect Authentically</h2>
            <p className="text-papyrus max-w-2xl mx-auto mb-6">
              All our locals are verified community members who are passionate about sharing their Egypt with you.
              Connect, chat, and plan unique experiences together!
            </p>
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                <span>Verified Profiles</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                <span>Real Reviews</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                <span>Secure Messaging</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- View: Local Looking for Tourists ---

  // Safely access local profile data
  const localLanguages = (user.profile as any)?.spoken_languages || ['Arabic', 'English'];
  const localCity = (user.profile as any)?.city || 'Cairo';
  const localOccupation = (user.profile as any)?.occupation || 'neighborhood_tourguide';

  const localInterests = localOccupation === 'neighborhood_tourguide'
    ? ['History', 'Culture', 'Architecture']
    : localOccupation === 'driver'
      ? ['Adventure', 'Nature', 'Beach']
      : ['Shopping', 'Food', 'Culture'];

  // Calculate match score for each tourist (Frontend Logic Re-applied for Consistency)
  const matchedTourists = touristProfiles.map(tourist => {
    // If backend provided scores, we could use them, 
    // but calculating here ensures the UI logic is identical to the manual file.
    let matchScore = 0;
    const matchReasons: string[] = [];

    // Language match (highest priority - 40 points)
    if (localLanguages.includes(tourist.language)) {
      matchScore += 40;
      matchReasons.push(`Speaks ${tourist.language}`);
    }

    // City interest match (30 points)
    if (tourist.interestedCities.includes(localCity)) {
      matchScore += 30;
      matchReasons.push(`Visiting ${localCity}`);
    }

    // Interest match (20 points)
    const matchingInterests = tourist.activities.filter(activity =>
      localInterests.includes(activity)
    );
    if (matchingInterests.length > 0) {
      matchScore += Math.min(20, matchingInterests.length * 7);
      matchReasons.push(`${matchingInterests.length} matching interest${matchingInterests.length > 1 ? 's' : ''}`);
    }

    // Travel type bonus (10 points for group/family if you're a driver)
    if (localOccupation === 'driver' && tourist.travelType !== 'solo') {
      matchScore += 10;
      matchReasons.push(`${tourist.travelType} travel`);
    }

    return {
      ...tourist,
      matchScore,
      matchReasons,
      matchingInterests
    };
  }).sort((a, b) => b.matchScore - a.matchScore);

  // Filter profiles
  const filteredTourists = matchedTourists.filter(tourist => {
    const cityMatch = selectedCity === 'all' || tourist.interestedCities.includes(selectedCity);
    const typeMatch = selectedFilter === 'all' || tourist.travelType === selectedFilter;
    return cityMatch && typeMatch;
  });

  // Extract unique cities from data safely
  const cities = ['all', localCity, ...Array.from(new Set(touristProfiles.flatMap(p => p.interestedCities)))].filter((v, i, a) => a.indexOf(v) === i);

  const travelTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'solo', label: 'Solo Travelers' },
    { value: 'family', label: 'Families' },
    { value: 'group', label: 'Groups' }
  ];

  const getTravelTypeLabel = (type: string) => {
    switch (type) {
      case 'solo': return 'Solo Traveler';
      case 'family': return 'Family';
      case 'group': return 'Group';
      default: return type;
    }
  };

  const getMatchPercentage = (score: number) => Math.min(100, Math.round(score));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 sm:py-12 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Match with Tourists
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Connect with tourists visiting {localCity} who speak your languages and match your expertise.
            Grow your business and share authentic Egyptian experiences!
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
            {travelTypes.map(type => (
              <Button
                key={type.value}
                variant={selectedFilter === type.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter(type.value)}
              >
                {type.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Match Info */}
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-primary">{filteredTourists.length}</span> tourists
            • Your city: <span className="font-semibold">{localCity}</span>
            • Your languages: <span className="font-semibold">{localLanguages.join(', ')}</span>
          </p>
        </div>

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTourists.map((tourist) => {
            const matchPercentage = getMatchPercentage(tourist.matchScore);

            return (
              <Card
                key={tourist.id}
                className="group hover:shadow-2xl transition-all duration-300 border-border overflow-hidden"
              >
                <CardContent className="p-6">
                  {/* Match Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <Badge
                      className={`font-bold ${matchPercentage >= 80 ? 'bg-green-600' :
                          matchPercentage >= 60 ? 'bg-blue-600' :
                            'bg-orange-600'
                        } text-white`}
                    >
                      {matchPercentage}% Match
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {getTravelTypeLabel(tourist.travelType)}
                    </Badge>
                  </div>

                  {/* Profile Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="h-20 w-20 border-4 border-primary/20">
                      <AvatarImage src={tourist.avatarUrl} alt={tourist.name} />
                      <AvatarFallback>{tourist.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-1">{tourist.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Globe className="h-4 w-4" />
                        <span>{tourist.country}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users2 className="h-4 w-4" />
                        <span>{tourist.age} years old</span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {tourist.bio}
                  </p>

                  {/* Language */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Languages className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">Language:</span>
                    </div>
                    <Badge
                      variant={localLanguages.includes(tourist.language) ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {tourist.language}
                    </Badge>
                  </div>

                  {/* Interested Cities */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">Visiting:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tourist.interestedCities.map(city => (
                        <Badge
                          key={city}
                          variant={city === localCity ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {city}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Interests */}
                  {tourist.matchingInterests && tourist.matchingInterests.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-semibold text-foreground">Matching Interests:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {tourist.matchingInterests.map(interest => (
                          <Badge key={interest} variant="outline" className="text-xs border-primary/50">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Match Reasons */}
                  {tourist.matchReasons.length > 0 && (
                    <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                      <p className="text-xs text-muted-foreground mb-1">Why this match?</p>
                      <ul className="text-xs text-foreground space-y-1">
                        {tourist.matchReasons.map((reason, idx) => (
                          <li key={idx}>✓ {reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-primary hover:bg-primary/90"
                      size="sm"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Reach Out
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-primary text-primary hover:bg-primary/10"
                    >
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* No Results */}
        {filteredTourists.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No tourists found matching your filters. Try adjusting your search criteria.
            </p>
          </div>
        )}

        {/* Info Banner */}
        <div className="mt-12 p-8 bg-gradient-to-r from-pine-primary to-pine-dark rounded-3xl text-papyrus-light text-center shadow-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Grow Your Business</h2>
          <p className="text-papyrus max-w-2xl mx-auto mb-6">
            Connect with tourists who match your language skills and location. Build your reputation, earn more, and share the real Egypt!
          </p>
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-400 rounded-full"></div>
              <span>Smart Matching</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-400 rounded-full"></div>
              <span>Direct Messaging</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-400 rounded-full"></div>
              <span>Secure Payments</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};