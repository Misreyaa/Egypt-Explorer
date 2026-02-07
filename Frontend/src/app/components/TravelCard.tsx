import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { MapPin, Star, Clock, Users } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export interface Destination {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string[];
  travelType: string[];
  rating: number;
  duration: string;
  groupSize: string;
}

interface TravelCardProps {
  destination: Destination;
  userActivities?: string[];
  onViewDetails?: (id: string) => void;
}

export const TravelCard: React.FC<TravelCardProps> = ({ 
  destination, 
  userActivities = [],
  onViewDetails 
}) => {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-papyrus border-papyrus-dark">
      <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
        <ImageWithFallback
          src={destination.imageUrl}
          alt={destination.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-900/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="text-sm font-semibold text-amber-50">{destination.rating}</span>
        </div>
      </div>
      
      <CardHeader className="space-y-3 pb-3">
        <CardTitle className="text-lg sm:text-xl line-clamp-2 text-brown-dark">
          {destination.name}
        </CardTitle>
        <div className="flex flex-wrap gap-1.5">
          {destination.category.map((cat) => (
            <Badge
              key={cat}
              variant={userActivities.includes(cat) ? 'default' : 'secondary'}
              className={`text-xs ${
                userActivities.includes(cat) 
                  ? 'bg-pine-primary text-white hover:bg-pine-dark' 
                  : 'bg-papyrus-dark text-brown-medium hover:bg-papyrus-darker'
              }`}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 pb-4">
        <CardDescription className="text-sm sm:text-base line-clamp-3 text-brown-medium">
          {destination.description}
        </CardDescription>
        <div className="flex flex-col gap-2 text-sm text-brown-medium">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 flex-shrink-0 text-pine-primary" />
            <span>{destination.duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 flex-shrink-0 text-pine-primary" />
            <span>{destination.groupSize}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button 
          className="w-full bg-pine-primary hover:bg-pine-dark text-white transition-colors"
          onClick={() => onViewDetails?.(destination.id)}
        >
          <MapPin className="mr-2 h-4 w-4" />
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};
