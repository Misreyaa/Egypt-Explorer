import React from 'react';
import { TravelCard, Destination } from './TravelCard';
import { useUser } from '../context/UserContext';

const allDestinations: Destination[] = [
  {
    id: '1',
    name: 'Pyramids of Giza',
    description: 'Explore the last remaining wonder of the ancient world. Stand in awe before the Great Pyramid and the Sphinx.',
    imageUrl: 'https://images.unsplash.com/photo-1706651785622-5500a55197ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxweXJhbWlkcyUyMGdpemElMjBlZ3lwdHxlbnwxfHx8fDE3NzA0ODg2MjN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: ['historical', 'culture'],
    travelType: ['solo', 'group', 'family'],
    rating: 4.9,
    duration: 'Half day',
    groupSize: 'Any',
  },
  {
    id: '2',
    name: 'Luxor Temple',
    description: 'Walk through the ancient temple complex dedicated to the Theban Triad. Best visited at sunset for magical golden hour views.',
    imageUrl: 'https://images.unsplash.com/photo-1693654547147-24d94b4ed4ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXhvciUyMHRlbXBsZSUyMGVneXB0fGVufDF8fHx8MTc3MDQ4ODYyNHww&ixlib=rb-4.1.0&q=80&w=1080',
    category: ['historical', 'culture'],
    travelType: ['solo', 'group', 'family'],
    rating: 4.8,
    duration: '2-3 hours',
    groupSize: 'Any',
  },
  {
    id: '3',
    name: 'Cairo Streets Tour',
    description: 'Experience the vibrant energy of Cairo. Navigate bustling bazaars, taste authentic street food, and meet locals.',
    imageUrl: 'https://images.unsplash.com/photo-1709109021120-292795785de9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWlybyUyMGVneXB0JTIwc3RyZWV0c3xlbnwxfHx8fDE3NzA0ODg2MjR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: ['culture', 'culinary', 'shopping'],
    travelType: ['solo', 'group'],
    rating: 4.7,
    duration: 'Full day',
    groupSize: 'Small groups',
  },
  {
    id: '4',
    name: 'Red Sea Diving',
    description: 'Discover the underwater wonders of the Red Sea. Perfect for both beginners and experienced divers.',
    imageUrl: 'https://images.unsplash.com/photo-1650806140614-684f57e64de7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWQlMjBzZWElMjBlZ3lwdCUyMGRpdmluZ3xlbnwxfHx8fDE3NzA0ODg2MjV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: ['water', 'adventure'],
    travelType: ['solo', 'group', 'family'],
    rating: 4.9,
    duration: 'Full day',
    groupSize: 'Small groups',
  },
  {
    id: '5',
    name: 'Desert Safari Adventure',
    description: 'Experience the magic of the Egyptian desert. Ride camels, watch the sunset over the dunes, and enjoy a traditional Bedouin dinner.',
    imageUrl: 'https://images.unsplash.com/photo-1741213651580-f1a708aa3c7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZ3lwdGlhbiUyMGRlc2VydCUyMHNhZmFyaXxlbnwxfHx8fDE3NzA0ODg2MjV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: ['adventure', 'culture'],
    travelType: ['solo', 'group', 'family'],
    rating: 4.8,
    duration: 'Half day',
    groupSize: 'Medium groups',
  },
  {
    id: '6',
    name: 'Nile River Cruise',
    description: 'Sail along the historic Nile River. Enjoy luxurious accommodations while visiting temples and ancient sites along the way.',
    imageUrl: 'https://images.unsplash.com/photo-1716639154156-db53b75a22ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWxlJTIwcml2ZXIlMjBjcnVpc2UlMjBlZ3lwdHxlbnwxfHx8fDE3NzA0ODMwNTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: ['water', 'historical', 'culture'],
    travelType: ['solo', 'group', 'family'],
    rating: 4.9,
    duration: '3-7 days',
    groupSize: 'Any',
  },
  {
    id: '7',
    name: 'Egyptian Museum',
    description: 'Home to the world\'s largest collection of ancient Egyptian artifacts, including treasures from Tutankhamun\'s tomb.',
    imageUrl: 'https://images.unsplash.com/photo-1763657320693-780211ebe83e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZ3lwdGlhbiUyMG11c2V1bSUyMGFydGlmYWN0c3xlbnwxfHx8fDE3NzA0ODg2MjZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: ['historical', 'culture'],
    travelType: ['solo', 'group', 'family'],
    rating: 4.8,
    duration: '2-4 hours',
    groupSize: 'Any',
  },
];

export const HomePage: React.FC = () => {
  const { user } = useUser();

  const getRecommendations = (): Destination[] => {
    if (!user) return allDestinations;

    return allDestinations
      .filter(dest => {
        const matchesActivities = dest.category.some(cat => user.activities.includes(cat));
        const matchesTravelType = dest.travelType.includes(user.travelType);
        return matchesActivities || matchesTravelType;
      })
      .sort((a, b) => {
        const aScore = a.category.filter(cat => user.activities.includes(cat)).length;
        const bScore = b.category.filter(cat => user.activities.includes(cat)).length;
        return bScore - aScore;
      });
  };

  const recommendations = getRecommendations();

  return (
    <div className="min-h-screen bg-papyrus-light">
      <div className="container mx-auto py-6 sm:py-8 md:py-12 px-4">
        <div className="mb-6 sm:mb-8 md:mb-12">
          <h1 className="mb-2 sm:mb-3 text-brown-dark text-2xl sm:text-3xl md:text-4xl">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-brown-medium text-sm sm:text-base md:text-lg">
            Based on your preferences for <span className="font-semibold text-pine-primary">{user?.activities.join(', ')}</span> activities, here are our top recommendations for you.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {recommendations.map((destination) => (
            <TravelCard
              key={destination.id}
              destination={destination}
              userActivities={user?.activities}
              onViewDetails={(id) => console.log('View details for:', id)}
            />
          ))}
        </div>

        {recommendations.length === 0 && (
          <div className="text-center py-12 bg-papyrus rounded-lg shadow-md">
            <p className="text-brown-medium text-base sm:text-lg">
              No recommendations found. Try updating your preferences!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};