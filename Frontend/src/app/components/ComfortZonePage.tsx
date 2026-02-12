import React from 'react';
import { TravelCard, Destination } from './TravelCard';
import { TourDetailsDialog } from './TourDetailsDialog';
import { useUser } from '../context/UserContext';
import { Compass } from 'lucide-react';
import { allDestinations } from '../data/destinations';

export const ComfortZonePage: React.FC = () => {
  const { user } = useUser();
  const [selectedDestination, setSelectedDestination] =
    React.useState<Destination | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const userActivities =
    user?.userType === 'tourist' ? user.profile.activities : [];

  // 1️⃣ Get tags user does NOT have
  const inverseTags = React.useMemo((): string[] => {
    if (!user || user.userType !== 'tourist') return [];

    const allTags = allDestinations.flatMap(dest => {
      const categories = Array.isArray(dest.category) ? dest.category : [];
      return categories;
    });

    const uniqueTags = Array.from(new Set(allTags));

    return uniqueTags.filter(tag => !userActivities.includes(tag));
  }, [user, userActivities]);

  // 2️⃣ Get destinations that use those inverse tags
  const recommendations = React.useMemo((): Destination[] => {
    return allDestinations.filter(dest => {
      const categories = Array.isArray(dest.category) ? dest.category : [];
      return categories.some(cat => inverseTags.includes(cat));
    });
  }, [inverseTags]);

  const handleViewDetails = (id: string) => {
    const destination = allDestinations.find(d => d.id === id);
    if (destination) {
      setSelectedDestination(destination);
      setIsDialogOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 sm:py-8 md:py-12 px-4">
        <div className="mb-6 sm:mb-8 md:mb-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-papyrus/40 rounded-full border border-brown-medium/10">
              <Compass className="h-10 w-10 text-pine-primary" />
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Step Out of Your Comfort Zone
          </h1>

          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
            You usually prefer{' '}
            <span className="font-semibold text-pine-primary">
              {userActivities.join(', ')}
            </span>
            . Here are some experiences completely different from your usual
            style. Try something new!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {recommendations.map(destination => (
            <TravelCard
              key={destination.id}
              destination={destination}
              userActivities={[]} // no highlights on purpose
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>

        {recommendations.length === 0 && (
          <div className="text-center py-12 bg-card rounded-lg shadow-md border border-border">
            <p className="text-muted-foreground text-base sm:text-lg">
              Wow! You like everything! We couldn't find anything outside your
              preferences. Maybe try a random adventure?
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
