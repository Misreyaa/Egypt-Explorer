import React from 'react';
import { useUser } from '../context/UserContext';
import { 
  Sparkles,
  MessageSquare,
  ArrowRight,
  Bell,
  Wallet,
  Users
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface LocalHomePageProps {
  onNavigate: (page: string) => void;
}

export const LocalHomePage: React.FC<LocalHomePageProps> = ({ onNavigate }) => {
  const { user } = useUser();

  const dashboardItems = [
    { 
      id: 'hidden-gem', 
      label: 'Uncover a Hidden Gem', 
      icon: Sparkles, 
      description: 'Share a special place with tourists. Your local knowledge helps travelers discover authentic Egypt.',
      color: 'bg-yellow-500' 
    },
    { 
      id: 'match-local', 
      label: 'Match with Tourists', 
      icon: Users, 
      description: 'Connect with tourists visiting your city. Offer your services and build meaningful connections.',
      color: 'bg-purple-600' 
    },
    { 
      id: 'local-blog', 
      label: 'The Local Blog', 
      icon: MessageSquare, 
      description: 'Connect with tourists and locals. Share stories, answer questions, and build community.',
      color: 'bg-blue-600' 
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: Bell, 
      description: 'Stay updated on new bookings, messages, and community interactions.',
      color: 'bg-purple-600' 
    },
    { 
      id: 'earnings', 
      label: 'My Earnings', 
      icon: Wallet, 
      description: 'Track your income and manage payment details for your services.',
      color: 'bg-green-600' 
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 sm:py-12 md:py-16 px-4">
        {/* Welcome Section */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Ahlan, {user?.profile.name}! 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Welcome to your local dashboard. Help tourists discover the real Egypt!
          </p>
          {user?.userType === 'local' && (
            <p className="text-sm text-primary mt-2 capitalize">
              {(user.profile as any).occupation?.replace('_', ' ')}
            </p>
          )}
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {dashboardItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card 
                key={item.id}
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

        {/* Info Banner */}
        <div className="mt-16 p-8 bg-gradient-to-r from-pine-primary to-pine-dark rounded-3xl text-papyrus-light text-center shadow-2xl relative overflow-hidden max-w-4xl mx-auto">
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Share Your Egypt</h2>
            <p className="text-papyrus max-w-xl mx-auto mb-8">
              Your local knowledge is invaluable. Help tourists experience the authentic Egypt by sharing hidden gems and local insights.
            </p>
            <Button 
              onClick={() => onNavigate('hidden-gem')}
              className="bg-white hover:bg-papyrus text-brown-dark px-8 py-6 rounded-full text-lg shadow-lg font-semibold"
            >
              Start Sharing
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};