import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Star,
  Clock,
  Users,
  MapPin,
  DollarSign,
  Calendar,
  Info,
  Heart,
  Compass,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Destination } from "./TravelCard";
import { useUser } from "../context/UserContext";
import { toast } from "sonner";

interface TourDetailsDialogProps {
  destination: Destination | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TourDetailsDialog: React.FC<
  TourDetailsDialogProps
> = ({ destination, open, onOpenChange }) => {
  const { user, toggleWishlist } = useUser();
  if (!destination) return null;

  const isInWishlist = user?.wishlist?.includes(destination.id);

  const handleToggleWishlist = () => {
    toggleWishlist(destination.id);
    if (!isInWishlist) {
      toast.success(
        `${destination.name} added to your wishlist!`,
      );
    } else {
      toast.info(
        `${destination.name} removed from your wishlist.`,
      );
    }
  };

  const handleBook = () => {
    toast.success(
      `Booking request sent for ${destination.name}! A local "Gad3" guide will contact you shortly.`,
    );
  };

  const handleViewLocation = () => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination.name + " Egypt")}`,
      "_blank",
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[50vw] md:max-w-[85vw] lg:max-w-[600px] w-full max-h-[90vh] overflow-y-auto overflow-x-hidden">
  
  <DialogHeader>
    <DialogTitle className="text-2xl font-bold text-brown-dark">{destination.name}</DialogTitle>
    <DialogDescription className="sr-only">Tour details</DialogDescription>
  </DialogHeader>

  <div className="space-y-6">
    {/* Image with fixed aspect ratio to prevent layout shifts */}
    <div className="relative aspect-[16/7] w-full overflow-hidden rounded-lg shadow-inner">
      <ImageWithFallback
        src={destination.imageUrl}
        alt={destination.name}
        className="w-full h-full object-cover"
      />
    </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {destination.category.map((cat) => (
              <Badge
                key={cat}
                variant="default"
                className="text-sm px-3 py-1 bg-pine-primary hover:bg-pine-dark"
              >
                {cat}
              </Badge>
            ))}
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-start gap-3 p-4 bg-papyrus/40 rounded-lg border border-brown-medium/10">
              <Clock className="h-5 w-5 text-pine-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Duration
                </p>
                <p className="font-semibold text-brown-dark">
                  {destination.duration}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-papyrus/40 rounded-lg border border-brown-medium/10">
              <Users className="h-5 w-5 text-pine-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Group Size
                </p>
                <p className="font-semibold text-brown-dark">
                  {destination.groupSize}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-papyrus/40 rounded-lg border border-brown-medium/10">
              <DollarSign className="h-5 w-5 text-pine-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Price
                </p>
                <p className="font-semibold text-brown-dark">
                  From $99
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-papyrus/40 rounded-lg border border-brown-medium/10">
              <Calendar className="h-5 w-5 text-pine-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Availability
                </p>
                <p className="font-semibold text-brown-dark">
                  Daily
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold flex items-center gap-2 text-brown-dark">
              <Info className="h-5 w-5 text-pine-primary" />
              About This Experience
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {destination.description}
            </p>
          </div>

          {/* What's Included */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-brown-dark">
              What's Included
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                "Professional tour guide",
                "All entrance fees and tickets",
                "Transportation to and from meeting point",
                "Bottled water and light refreshments",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-pine-primary font-bold mt-1">
                    ✓
                  </span>
                  <span className="text-muted-foreground">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Perfect For */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-brown-dark">
              Perfect For
            </h3>
            <div className="flex flex-wrap gap-2">
              {destination.travelType.map((type) => (
                <Badge
                  key={type}
                  variant="outline"
                  className="text-sm px-3 py-1 capitalize border-brown-medium/30 text-brown-medium"
                >
                  {type} travelers
                </Badge>
              ))}
            </div>
          </div>

          {/* Action Buttons Row */}
    {/* Use flex-row (no wrap) and gap-2 to keep them on one line */}
    <div className="flex flex-row items-center gap-2 pt-6 border-t border-brown-medium/10 w-full">
      <Button 
        className="flex-1 bg-pine-primary hover:bg-pine-dark text-white font-bold h-12 px-2 sm:px-4 text-xs sm:text-sm" 
        onClick={handleBook}
      >
        <Compass className="mr-1 sm:mr-2 h-4 w-4 shrink-0" />
        <span className="truncate">Book With Gad3</span>
      </Button>
      
      <Button 
        variant="outline" 
        className="flex-1 border-brown-medium text-brown-dark hover:bg-brown-light/20 h-12 px-2 sm:px-4 text-xs sm:text-sm" 
        onClick={handleViewLocation}
      >
        <MapPin className="mr-1 sm:mr-2 h-4 w-4 text-pine-primary shrink-0" />
        <span className="truncate">Location</span>
      </Button>

      <Button 
        variant={isInWishlist ? "default" : "outline"}
        className={`flex-1 h-12 px-2 sm:px-4 text-xs sm:text-sm ${
          isInWishlist ? 'bg-red-500 text-white' : 'border-red-200 text-red-500'
        }`} 
        onClick={handleToggleWishlist}
      >
        <Heart className={`mr-1 sm:mr-2 h-4 w-4 shrink-0 ${isInWishlist ? 'fill-current' : ''}`} />
        <span className="truncate">{isInWishlist ? 'Wishlist' : 'Add'}</span>
      </Button>
    </div>
  </div>
</DialogContent>
    </Dialog>
  );
};