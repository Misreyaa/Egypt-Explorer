import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Navigation, MapPin, Camera, Utensils, ShoppingBag } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const walkingTours = [
  {
    id: '1',
    name: 'Old Cairo Heritage Walk',
    description: 'Explore the Coptic quarter, Islamic Cairo, and hidden alleyways filled with history.',
    duration: '4 hours',
    difficulty: 'Easy',
    highlights: ['Coptic Museum', 'Hanging Church', 'Ben Ezra Synagogue', 'Al-Azhar Mosque'],
    imageUrl: 'https://images.unsplash.com/photo-1709109021120-292795785de9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWlybyUyMGVneXB0JTIwc3RyZWV0c3xlbnwxfHx8fDE3NzA0ODg2MjR8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: '2',
    name: 'Khan el-Khalili Market Tour',
    description: 'Navigate the medieval bazaar, haggle with vendors, and discover authentic crafts.',
    duration: '3 hours',
    difficulty: 'Easy',
    highlights: ['Historic Bazaar', 'Spice Market', 'Gold Souks', 'Traditional Cafes'],
    imageUrl: 'https://images.unsplash.com/photo-1706651785622-5500a55197ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxweXJhbWlkcyUyMGdpemElMjBlZ3lwdHxlbnwxfHx8fDE3NzA0ODg2MjN8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: '3',
    name: 'Alexandria Corniche Stroll',
    description: 'Walk along the Mediterranean coast, visit historic sites, and enjoy fresh seafood.',
    duration: '5 hours',
    difficulty: 'Moderate',
    highlights: ['Qaitbay Citadel', 'Bibliotheca Alexandrina', 'Stanley Bridge', 'Seafood Markets'],
    imageUrl: 'https://images.unsplash.com/photo-1716639154156-db53b75a22ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWxlJTIwcml2ZXIlMjBjcnVpc2UlMjBlZ3lwdHxlbnwxfHx8fDE3NzA0ODMwNTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

export const StreetsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-papyrus-light">
      <div className="container mx-auto py-6 sm:py-8 md:py-12 px-4">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center shadow-lg">
              <Navigation className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-brown-dark">Walk the Streets of Egypt</h1>
              <p className="text-brown-medium text-sm sm:text-base">Immerse yourself in local culture through guided walking tours</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {walkingTours.map((tour) => (
            <Card key={tour.id} className="overflow-hidden bg-papyrus shadow-md border-brown-medium/20">
              <div className="relative h-64 overflow-hidden">
                <ImageWithFallback
                  src={tour.imageUrl}
                  alt={tour.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle>{tour.name}</CardTitle>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">{tour.duration}</Badge>
                  <Badge variant="outline">{tour.difficulty}</Badge>
                </div>
                <CardDescription className="mt-2">{tour.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Highlights:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {tour.highlights.map((highlight, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <MapPin className="h-3 w-3 text-primary" />
                          <span>{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button className="flex-1">
                      <Camera className="mr-2 h-4 w-4" />
                      Start Tour
                    </Button>
                    <Button variant="outline" className="flex-1">
                      View Map
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6 sm:mt-8 bg-gradient-to-r from-pine-primary/10 to-pine-light/10 border-pine-primary/20">
          <CardHeader>
            <CardTitle>Walking Tour Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex gap-3">
                <Utensils className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm">Try Local Food</h4>
                  <p className="text-sm text-muted-foreground">Don't miss street food like koshari and ta'ameya</p>
                </div>
              </div>
              <div className="flex gap-3">
                <ShoppingBag className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm">Bargain Wisely</h4>
                  <p className="text-sm text-muted-foreground">Start at 50% of asking price in markets</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Camera className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm">Respect Culture</h4>
                  <p className="text-sm text-muted-foreground">Ask permission before photographing people</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};