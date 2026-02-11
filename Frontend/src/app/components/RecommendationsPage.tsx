import React from 'react';
import { TravelCard, Destination } from './TravelCard';
import { TourDetailsDialog } from './TourDetailsDialog';
import { useUser } from '../context/UserContext';

import { allDestinations } from '../data/destinations';

export const RecommendationsPage: React.FC = () => {
  const { user } = useUser();
  const [selectedDestination, setSelectedDestination] = React.useState<Destination | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const getRecommendations = (): Destination[] => {
    if (!user || user.userType !== 'tourist') return allDestinations;

    const profile = user.profile;
    return allDestinations
      .filter(dest => {
        const matchesActivities = dest.category.some(cat => profile.activities.includes(cat));
        const matchesTravelType = dest.travelType.includes(profile.travelType);
        return matchesActivities || matchesTravelType;
      })
      .sort((a, b) => {
        const aScore = a.category.filter(cat => profile.activities.includes(cat)).length;
        const bScore = b.category.filter(cat => profile.activities.includes(cat)).length;
        return bScore - aScore;
      });
  };

  const recommendations = getRecommendations();

  const handleViewDetails = (id: string) => {
    const destination = allDestinations.find(d => d.id === id);
    if (destination) {
      setSelectedDestination(destination);
      setIsDialogOpen(true);
    }
  };

  // Get activities for display
  const userActivities = user?.userType === 'tourist' ? user.profile.activities : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 sm:py-8 md:py-12 px-4">
        <div className="mb-6 sm:mb-8 md:mb-12">
          <h1 className="mb-2 sm:mb-3 text-brown-dark font-bold text-2xl sm:text-3xl md:text-4xl">
            Walk the Streets of Egypt
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
            Personalized paths and hidden gems based on your interest in <span className="font-semibold text-pine-primary">{userActivities.join(', ')}</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {recommendations.map((destination) => (
            <TravelCard
              key={destination.id}
              destination={destination}
              userActivities={userActivities}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>

        {recommendations.length === 0 && (
          <div className="text-center py-12 bg-card rounded-lg shadow-md border border-border">
            <p className="text-muted-foreground text-base sm:text-lg">
              No recommendations found. Try updating your preferences!
            </p>
          </div>
        )}
      </div>

      <TourDetailsDialog
        destination={selectedDestination}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
};