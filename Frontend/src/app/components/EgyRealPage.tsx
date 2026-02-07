import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Hash, Heart, MessageCircle, Share2, Search, MapPin } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Post {
  id: string;
  author: string;
  authorAvatar: string;
  location: string;
  image: string;
  caption: string;
  likes: number;
  comments: number;
  tags: string[];
  timestamp: string;
}

const posts: Post[] = [
  {
    id: '1',
    author: 'Sarah_Travels',
    authorAvatar: '',
    location: 'Pyramids of Giza',
    image: 'https://images.unsplash.com/photo-1706651785622-5500a55197ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxweXJhbWlkcyUyMGdpemElMjBlZ3lwdHxlbnwxfHx8fDE3NzA0ODg2MjN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    caption: 'Standing before the Great Pyramid, feeling the weight of 4500 years of history. The engineering brilliance is mind-blowing! #EGYREAL',
    likes: 234,
    comments: 45,
    tags: ['EGYREAL', 'Pyramids', 'History'],
    timestamp: '2 hours ago',
  },
  {
    id: '2',
    author: 'Marco_Explorer',
    authorAvatar: '',
    location: 'Khan el-Khalili, Cairo',
    image: 'https://images.unsplash.com/photo-1709109021120-292795785de9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWlybyUyMGVneXB0JTIwc3RyZWV0c3xlbnwxfHx8fDE3NzA0ODg2MjR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    caption: 'Lost in the maze of Khan el-Khalili! The colors, smells, and sounds are overwhelming in the best way. Just haggled for some beautiful spices 🌶️',
    likes: 189,
    comments: 32,
    tags: ['EGYREAL', 'Cairo', 'Markets'],
    timestamp: '5 hours ago',
  },
  {
    id: '3',
    author: 'DiveLife_Amy',
    authorAvatar: '',
    location: 'Red Sea, Hurghada',
    image: 'https://images.unsplash.com/photo-1650806140614-684f57e64de7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWQlMjBzZWElMjBlZ3lwdCUyMGRpdmluZ3xlbnwxfHx8fDE3NzA0ODg2MjV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    caption: 'The Red Sea is a diver\'s paradise! Crystal clear waters and incredible marine life. Saw a sea turtle today 🐢 #EGYREAL #RedSea',
    likes: 456,
    comments: 67,
    tags: ['EGYREAL', 'RedSea', 'Diving'],
    timestamp: '1 day ago',
  },
  {
    id: '4',
    author: 'History_Buff_Joe',
    authorAvatar: '',
    location: 'Luxor Temple',
    image: 'https://images.unsplash.com/photo-1693654547147-24d94b4ed4ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXhvciUyMHRlbXBsZSUyMGVneXB0fGVufDF8fHx8MTc3MDQ4ODYyNHww&ixlib=rb-4.1.0&q=80&w=1080',
    caption: 'Luxor Temple at sunset = pure magic ✨ The hieroglyphics tell stories from millennia ago. Egypt never stops amazing me!',
    likes: 312,
    comments: 54,
    tags: ['EGYREAL', 'Luxor', 'Ancient'],
    timestamp: '1 day ago',
  },
  {
    id: '5',
    author: 'Foodie_Adventures',
    authorAvatar: '',
    location: 'Downtown Cairo',
    image: 'https://images.unsplash.com/photo-1716639154156-db53b75a22ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWxlJTIwcml2ZXIlMjBjcnVpc2UlMjBlZ3lwdHxlbnwxfHx8fDE3NzA0ODMwNTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    caption: 'Dinner cruise on the Nile! Traditional Egyptian dishes and live music under the stars. This is what dreams are made of 🌟',
    likes: 278,
    comments: 41,
    tags: ['EGYREAL', 'Food', 'Nile'],
    timestamp: '2 days ago',
  },
  {
    id: '6',
    author: 'Desert_Wanderer',
    authorAvatar: '',
    location: 'White Desert, Egypt',
    image: 'https://images.unsplash.com/photo-1741213651580-f1a708aa3c7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZ3lwdGlhbiUyMGRlc2VydCUyMHNhZmFyaXxlbnwxfHx8fDE3NzA0ODg2MjV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    caption: 'Camping in the White Desert tonight! These limestone formations look like they\'re from another planet. Egypt\'s natural beauty is underrated 🏜️',
    likes: 523,
    comments: 89,
    tags: ['EGYREAL', 'Desert', 'Adventure'],
    timestamp: '3 days ago',
  },
];

export const EgyRealPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const toggleLike = (postId: string) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const filteredPosts = posts.filter(post =>
    post.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-papyrus-light">
      <div className="container mx-auto py-6 sm:py-8 md:py-12 px-4 max-w-7xl">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
            <div className="h-12 w-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center shadow-lg">
              <Hash className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-brown-dark">Explore #EGYREAL</h1>
              <p className="text-brown-medium text-sm sm:text-base">See authentic experiences from real travelers in Egypt</p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts by location, tags, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-papyrus border-brown-medium/20">
              <CardHeader className="p-3">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={post.authorAvatar} />
                    <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{post.author}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{post.location}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <div className="relative aspect-square overflow-hidden">
                <ImageWithFallback
                  src={post.image}
                  alt={post.location}
                  className="w-full h-full object-cover"
                />
              </div>

              <CardContent className="p-3">
                <div className="flex gap-4 mb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => toggleLike(post.id)}
                  >
                    <Heart className={`h-4 w-4 mr-1 ${likedPosts.has(post.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    <span className="text-xs">{post.likes + (likedPosts.has(post.id) ? 1 : 0)}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    <span className="text-xs">{post.comments}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>

                <p className="text-sm mb-2 line-clamp-3">{post.caption}</p>

                <div className="flex flex-wrap gap-1 mb-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground">{post.timestamp}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <Card className="p-12 text-center">
            <Hash className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No posts found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms</p>
          </Card>
        )}

        <Card className="mt-6 sm:mt-8 bg-gradient-to-r from-pink-500/10 to-rose-600/10 border-pink-500/20">
          <CardHeader>
            <h3 className="font-semibold">Share Your #EGYREAL Experience</h3>
            <p className="text-sm text-muted-foreground">
              Post your authentic Egyptian travel moments on social media with #EGYREAL to inspire other travelers!
            </p>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};