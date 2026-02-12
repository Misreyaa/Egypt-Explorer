import React from "react";
import { useUser } from "../context/UserContext";
import { TravelCard, Destination } from "./TravelCard";
import { TourDetailsDialog } from "./TourDetailsDialog";
import { allDestinations } from "../data/destinations";
import { Heart, Navigation } from "lucide-react";
import { Button } from "./ui/button";

export const WishlistPage: React.FC<{
  onNavigate: (page: string) => void;
}> = ({ onNavigate }) => {
  const { user } = useUser();
  const [selectedDestination, setSelectedDestination] =
    React.useState<Destination | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const wishlist =
    user?.userType === "tourist" ? user.profile.wishlist : [];
  const userActivities =
    user?.userType === "tourist" ? user.profile.activities : [];

  const wishlistDestinations = allDestinations.filter((dest) =>
    wishlist?.includes(dest.id),
  );

  const handleViewDetails = (id: string) => {
    const destination = allDestinations.find((d) => d.id === id);
    if (destination) {
      setSelectedDestination(destination);
      setIsDialogOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 sm:py-8 md:py-12 px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            <Heart className="h-8 w-8 text-red-900 fill-current" />
            Your Wishlist
          </h1>
          <p className="text-muted-foreground mt-2">
            The places and experiences you've saved for your
            Egyptian journey.
          </p>
        </div>

        {wishlistDestinations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistDestinations.map((destination) => (
              <TravelCard
                key={destination.id}
                destination={destination}
                userActivities={userActivities}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-papyrus/20 rounded-3xl border-2 border-dashed border-brown-medium/20">
            <div className="w-20 h-20 bg-papyrus/40 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-10 w-10 text-brown-medium/40" />
            </div>
            <h2 className="text-2xl font-bold text-brown-dark mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8 px-4">
              Explore the streets of Egypt and save your
              favorite experiences to build your dream
              itinerary.
            </p>
            <Button
              onClick={() => onNavigate("recommendations")}
              className="bg-pine-primary hover:bg-pine-dark text-white px-8 py-6 rounded-full text-lg shadow-lg"
            >
              <Navigation className="mr-2 h-5 w-5" />
              Explore Recommendations
            </Button>
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