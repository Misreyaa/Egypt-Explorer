import React from 'react';
import { useUser } from '../context/UserContext';
import { 
  Navigation, 
  GraduationCap, 
  ShieldAlert, 
  MessageSquare, 
  Hash, 
  HelpCircle, 
  Sparkles,
  SearchCheck,
  ArrowRight,
  Compass,
  Bell,
  Users,
  Bot
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

import { PharaohAnimation } from './PharaohAnimation';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { user } = useUser();

  const dashboardItems = [
    { 
      id: 'recommendations', 
      label: 'Walk the Streets of Egypt', 
      icon: Navigation, 
      description: 'Personalized travel and cultural picks just for you.',
      color: 'bg-primary' 
    },
    { 
      id: 'lessons', 
      label: 'The Lessons in Egyptians', 
      icon: GraduationCap, 
      description: 'Deep dive into the wisdom of ancient and modern culture.',
      color: 'bg-brown-medium' 
    },
    { 
      id: 'bias', 
      label: 'Bias Detector', 
      icon: ShieldAlert, 
      description: 'Learn to identify stereotypes and cultural misrepresentations.',
      color: 'bg-red-900' 
    },
    { 
      id: 'llm', 
      label: 'Talk With Me', 
      icon: Bot, 
      description: 'Chat with our AI about Egyptian history and culture.',
      color: 'bg-blue-700' 
    },
    { 
      id: 'egyreal', 
      label: 'Explore #EGYREAL', 
      icon: Hash, 
      description: 'See the authentic Egypt through the lens of locals.',
      color: 'bg-orange-700' 
    },
    { 
      id: 'wishlist', 
      label: 'Wishlist', 
      icon: Sparkles, 
      description: 'Your saved Egyptian experiences and hidden gems.',
      color: 'bg-red-900' 
    },
    { 
      id: 'comfort-zone', 
      label: 'Go out of your comfort zone', 
      icon: Compass, 
      description: 'Explore destinations completely different from your usual style.',
      color: 'bg-amber-600' 
    },
    { 
      id: 'match-local', 
      label: 'Match with a Local', 
      icon: Users, 
      description: 'Connect with verified locals who speak your language and share your interests.',
      color: 'bg-purple-600' 
    },
    { 
      id: 'local-blog', 
      label: 'The Local Blog', 
      icon: MessageSquare, 
      description: 'Connect with the community. Share stories and get insider tips.',
      color: 'bg-blue-600' 
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: Bell, 
      description: 'Stay updated on new posts, matches, and community interactions.',
      color: 'bg-purple-600' 
    },
        { 
      id: 'help', 
      label: 'Help Me', 
      icon: HelpCircle, 
      description: 'Find guides, tips, and emergency contacts.',
      color: 'bg-pine-dark' 
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Breaking News Bar */}
      <div className="bg-red-900 dark:bg-red-900 text-white py-3 px-4 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto flex items-center justify-center gap-3 flex-wrap">
          <ShieldAlert className="h-5 w-5 animate-pulse" />
          <p className="text-sm sm:text-base font-bold text-center">
            <span className="uppercase tracking-wide">Breaking Bias:</span> Don't let stereotypes shape your view.
          </p>
          <Button 
            variant="secondary"
            size="sm"
            className="bg-white text-red-900 hover:bg-gray-100 font-bold text-xs sm:text-sm px-4"
            onClick={() => onNavigate('bias')}
          >
            Try Bias Detector →
          </Button>
        </div>
      </div>

      <div className="container mx-auto py-8 sm:py-12 md:py-16 px-4">
        <PharaohAnimation />
        
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Ahlan, {user?.profile.name}!
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed mb-6">
            Explore personalized recommendations, cultural lessons, and local connections. 
            But to truly understand Egypt, we invite you to see it <span className="font-bold text-primary italic">"sans myths, sans bias"</span>.
          </p>
          
          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border border-red-200 dark:border-red-900/50 p-4 rounded-xl inline-flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <ShieldAlert className="h-5 w-5 text-red-900 dark:text-red-900" />
            <p className="text-sm sm:text-base font-medium">
              Start your journey with clarity. 
              <Button 
                variant="link" 
                className="px-1.5 h-auto font-bold text-red-900 dark:text-red-900 underline decoration-2 underline-offset-4"
                onClick={() => onNavigate('bias')}
              >
                Try the Bias Detector
              </Button>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {dashboardItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card 
                key={item.label}
                className="group relative overflow-hidden border-border hover:border-primary/50 hover:shadow-xl transition-all duration-300 cursor-pointer bg-card"
                onClick={() => onNavigate(item.id)}
              >
                <CardContent className="p-6">
                  <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {item.label}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                    {item.description}
                  </p>
                  <div className="flex items-center text-primary font-semibold text-sm group-hover:translate-x-1 transition-transform">
                    Explore Now <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Icon className="h-16 w-16" />
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 p-8 bg-brown-dark rounded-3xl text-papyrus-light text-center shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Discover the Authentic Egypt</h2>
            <p className="text-papyrus max-w-xl mx-auto mb-8">
              Explore stories, places, and cultural nuances that define the Egyptian spirit.
            </p>
            <Button 
              onClick={() => onNavigate('egyreal')}
              className="bg-pine-primary hover:bg-pine-dark text-white px-8 py-6 rounded-full text-lg shadow-lg"
            >
              Start Exploring #EGYREAL
            </Button>
          </div>
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
            {/* Background pattern placeholder */}
            <div className="grid grid-cols-8 gap-4 p-4">
              {Array.from({ length: 16 }).map((_, i) => (
                <Hash key={i} className="w-12 h-12" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};