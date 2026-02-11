import React, { useState, useMemo } from 'react';
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
}

// Mock local profiles data
const mockLocalProfiles: LocalProfile[] = [
  {
    id: '1',
    name: 'Ahmed Hassan',
    age: '35',
    city: 'Cairo',
    occupation: 'neighborhood_tourguide',
    bio: 'Born and raised in Islamic Cairo. I love showing travelers the hidden mosques and sharing stories of our neighborhood that you won\'t find in guidebooks.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    spoken_languages: ['Arabic', 'English', 'French'],
    interests: ['History', 'Architecture', 'Food', 'Photography'],
    rating: 4.9,
    reviewCount: 127
  },
  {
    id: '2',
    name: 'Layla Ibrahim',
    age: '28',
    city: 'Alexandria',
    occupation: 'driver',
    bio: 'Professional driver in Alexandria for 8 years. I know every corner of this beautiful coastal city and love sharing local seafood spots with visitors.',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    spoken_languages: ['Arabic', 'English', 'Italian'],
    interests: ['Beach', 'Food', 'Music', 'Nature'],
    rating: 4.8,
    reviewCount: 89
  },
  {
    id: '3',
    name: 'Mohamed El-Sayed',
    age: '42',
    city: 'Luxor',
    occupation: 'neighborhood_tourguide',
    bio: 'Egyptologist and local guide in Luxor. My passion is ancient Egyptian history and I offer authentic experiences at the Valley of the Kings and Karnak Temple.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    spoken_languages: ['Arabic', 'English', 'German', 'Spanish'],
    interests: ['History', 'Museum', 'Architecture', 'Photography'],
    rating: 5.0,
    reviewCount: 203
  },
  {
    id: '4',
    name: 'Fatima Nour',
    age: '31',
    city: 'Cairo',
    occupation: 'shopkeeper',
    bio: 'I run a traditional spice shop in Khan el-Khalili bazaar. Come learn about Egyptian spices, teas, and take home authentic flavors of Egypt!',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    spoken_languages: ['Arabic', 'English'],
    interests: ['Food', 'Shopping', 'Culture', 'Cooking'],
    rating: 4.7,
    reviewCount: 156
  },
  {
    id: '5',
    name: 'Karim Zaki',
    age: '29',
    city: 'Aswan',
    occupation: 'driver',
    bio: 'Nubian driver from Aswan. I specialize in tours to Abu Simbel and Nubian villages. Let me show you the colorful culture of Upper Egypt!',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop',
    spoken_languages: ['Arabic', 'English', 'Nubian'],
    interests: ['Culture', 'Nature', 'Beach', 'Adventure'],
    rating: 4.9,
    reviewCount: 94
  },
  {
    id: '6',
    name: 'Nadia Samir',
    age: '26',
    city: 'Cairo',
    occupation: 'neighborhood_tourguide',
    bio: 'Young local guide passionate about contemporary Egyptian art and culture. I show visitors modern Cairo, street art, and the best cafes!',
    avatarUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop',
    spoken_languages: ['Arabic', 'English', 'French'],
    interests: ['Art', 'Food', 'Music', 'Nightlife', 'Photography'],
    rating: 4.8,
    reviewCount: 72
  },
  {
    id: '7',
    name: 'Youssef Mahmoud',
    age: '38',
    city: 'Hurghada',
    occupation: 'driver',
    bio: 'Red Sea specialist! I help visitors explore the best diving spots, beaches, and desert safaris around Hurghada and the Eastern Desert.',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
    spoken_languages: ['Arabic', 'English', 'Russian'],
    interests: ['Beach', 'Adventure', 'Nature', 'Sports'],
    rating: 4.9,
    reviewCount: 118
  },
  {
    id: '8',
    name: 'Salma Fathy',
    age: '33',
    city: 'Alexandria',
    occupation: 'shopkeeper',
    bio: 'Owner of a family jewelry shop in Alexandria. We create traditional Egyptian jewelry with modern designs. Each piece tells a story!',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop',
    spoken_languages: ['Arabic', 'English', 'French', 'Greek'],
    interests: ['Shopping', 'Art', 'Culture', 'Fashion'],
    rating: 4.8,
    reviewCount: 85
  }
];

// Mock tourist profiles data
const mockTouristProfiles: TouristProfile[] = [
  {
    id: 't1',
    name: 'Sarah Johnson',
    age: '29',
    country: 'United States',
    language: 'English',
    travelType: 'solo',
    activities: ['History', 'Photography', 'Museum', 'Food'],
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    interestedCities: ['Cairo', 'Luxor'],
    bio: 'History enthusiast planning my first trip to Egypt. Would love to connect with local guides who can share authentic stories!'
  },
  {
    id: 't2',
    name: 'Marco Rossi',
    age: '45',
    country: 'Italy',
    language: 'Italian',
    travelType: 'family',
    activities: ['Beach', 'Culture', 'Food', 'Shopping'],
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    interestedCities: ['Alexandria', 'Cairo'],
    bio: 'Planning a family vacation to Egypt. Looking for family-friendly guides and authentic local experiences.'
  },
  {
    id: 't3',
    name: 'Emma Thompson',
    age: '32',
    country: 'United Kingdom',
    language: 'English',
    travelType: 'solo',
    activities: ['Adventure', 'Nature', 'Beach', 'Photography'],
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    interestedCities: ['Hurghada', 'Aswan'],
    bio: 'Adventure seeker interested in diving in the Red Sea and exploring Nubian culture. Love outdoor activities!'
  },
  {
    id: 't4',
    name: 'Pierre Dubois',
    age: '38',
    country: 'France',
    language: 'French',
    travelType: 'solo',
    activities: ['Art', 'Culture', 'Food', 'Photography'],
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    interestedCities: ['Cairo'],
    bio: 'French photographer and food lover visiting Cairo. Interested in modern Egyptian art scene and local cuisine.'
  },
  {
    id: 't5',
    name: 'Hans Mueller',
    age: '52',
    country: 'Germany',
    language: 'German',
    travelType: 'family',
    activities: ['History', 'Museum', 'Architecture', 'Culture'],
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
    interestedCities: ['Luxor', 'Cairo'],
    bio: 'Egyptology enthusiast traveling with my family. Looking for knowledgeable guides for temple and museum tours.'
  },
  {
    id: 't6',
    name: 'Lisa Anderson',
    age: '27',
    country: 'United States',
    language: 'English',
    travelType: 'group',
    activities: ['Food', 'Shopping', 'Culture', 'Nightlife'],
    avatarUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop',
    interestedCities: ['Cairo', 'Alexandria'],
    bio: 'Traveling with friends! Interested in local markets, shopping, and experiencing Cairo\'s nightlife scene.'
  },
  {
    id: 't7',
    name: 'Maria Garcia',
    age: '35',
    country: 'Spain',
    language: 'Spanish',
    travelType: 'solo',
    activities: ['History', 'Architecture', 'Culture', 'Food'],
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop',
    interestedCities: ['Luxor', 'Aswan'],
    bio: 'Solo traveler passionate about ancient history. Planning to explore temples and archaeological sites in Upper Egypt.'
  },
  {
    id: 't8',
    name: 'Ivan Petrov',
    age: '41',
    country: 'Russia',
    language: 'Russian',
    travelType: 'family',
    activities: ['Beach', 'Adventure', 'Sports', 'Nature'],
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop',
    interestedCities: ['Hurghada'],
    bio: 'Beach holiday with family in Hurghada. Interested in water sports and desert excursions.'
  }
];

export const MatchWithLocalPage: React.FC = () => {
  const { user } = useUser();
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const isLocal = user?.userType === 'local';
  
  // If viewing as tourist - show local profiles
  if (!isLocal) {
    const touristLanguage = user?.userType === 'tourist' ? user.profile.language : 'English';
    const touristInterests = user?.userType === 'tourist' ? user.profile.activities : [];

    // Calculate match score for each local
    const matchedProfiles = useMemo(() => {
      return mockLocalProfiles.map(local => {
        let matchScore = 0;
        const matchReasons: string[] = [];

        // Language match (highest priority - 40 points)
        if (local.spoken_languages.includes(touristLanguage)) {
          matchScore += 40;
          matchReasons.push(`Speaks ${touristLanguage}`);
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
        matchScore += local.rating * 4;

        // Experience bonus based on review count (10 points max)
        matchScore += Math.min(10, local.reviewCount / 20);

        return {
          ...local,
          matchScore,
          matchReasons,
          matchingInterests
        };
      }).sort((a, b) => b.matchScore - a.matchScore);
    }, [touristLanguage, touristInterests]);

    // Filter profiles
    const filteredProfiles = useMemo(() => {
      return matchedProfiles.filter(profile => {
        const cityMatch = selectedCity === 'all' || profile.city === selectedCity;
        const occupationMatch = selectedFilter === 'all' || profile.occupation === selectedFilter;
        return cityMatch && occupationMatch;
      });
    }, [matchedProfiles, selectedCity, selectedFilter]);

    const cities = ['all', ...Array.from(new Set(mockLocalProfiles.map(p => p.city)))];
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
                        className={`font-bold ${
                          matchPercentage >= 80 ? 'bg-green-600' : 
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
                            variant={lang === touristLanguage ? 'default' : 'secondary'}
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
                    {local.matchReasons.length > 0 && (
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

  // If viewing as local - show tourist profiles
  const localLanguages = (user.profile as any).spoken_languages || ['Arabic', 'English'];
  const localCity = (user.profile as any).city;
  const localOccupation = (user.profile as any).occupation;

  // For locals, we'll manually set interests based on occupation
  const localInterests = localOccupation === 'neighborhood_tourguide' 
    ? ['History', 'Culture', 'Architecture'] 
    : localOccupation === 'driver'
    ? ['Adventure', 'Nature', 'Beach']
    : ['Shopping', 'Food', 'Culture'];

  // Calculate match score for each tourist
  const matchedTourists = useMemo(() => {
    return mockTouristProfiles.map(tourist => {
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
  }, [localLanguages, localCity, localInterests, localOccupation]);

  // Filter profiles
  const filteredTourists = useMemo(() => {
    return matchedTourists.filter(tourist => {
      const cityMatch = selectedCity === 'all' || tourist.interestedCities.includes(selectedCity);
      const typeMatch = selectedFilter === 'all' || tourist.travelType === selectedFilter;
      return cityMatch && typeMatch;
    });
  }, [matchedTourists, selectedCity, selectedFilter]);

  const cities = ['all', localCity, ...Array.from(new Set(mockTouristProfiles.flatMap(p => p.interestedCities)))].filter((v, i, a) => a.indexOf(v) === i);
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
                      className={`font-bold ${
                        matchPercentage >= 80 ? 'bg-green-600' : 
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
