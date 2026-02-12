import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { 
  Hash, 
  Heart, 
  MessageCircle, 
  Share2, 
  Search, 
  MapPin, 
  Instagram, 
  Facebook, 
  Twitter, 
  Linkedin, 
  AtSign, // For Threads
  Music // For TikTok
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Post {
  id: string;
  author: string;
  authorAvatar: string;
  location: string;
  image: string;
  caption: string;
  likes: string | number;
  comments: string | number;
  tags: string[];
  timestamp: string;
  platform: 'instagram' | 'facebook' | 'x' | 'threads' | 'linkedin' | 'tiktok';
  postUrl: string;
}

const posts: Post[] = [
  {
    id: '1',
    author: 'Sara Abdelhady',
    authorAvatar: 'https://scontent.fcai19-3.fna.fbcdn.net/v/t39.30808-6/436405936_122097062930281504_1162436220330571068_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=bAExCsS69w4Q7kNvwF_7laH&_nc_oc=Adkz8i6v4_TmJKTJgxFFHIEuFuFVxn5m97KaRFivRK0po8041O-FM2ADqncfAMG4dXk&_nc_zt=23&_nc_ht=scontent.fcai19-3.fna&_nc_gid=wKiDgYh-wMCRLbydz2vfyw&oh=00_AfvxAMdeBqrNXiQyNZ1Zfy7SJjlQWHaL5BMKRB3DzzM6Gg&oe=69937E9D', 
    location: 'Caio, Egypt',
    image: 'https://i.ibb.co/3mymy7qH/Screenshot-2026-02-12-120445.png',
    caption: 'City lights and midnight heights. Navigating the streets of Egypt after dark.#EGYREAL #NIGHT',
    likes: '0',
    comments: 0,
    tags: ['EGYREAL', 'NIGHT'],
    timestamp: '12 hours ago',
    platform: 'facebook',
    postUrl: 'https://www.facebook.com/share/r/18DPTHdkf6/',
  },
  {
    id: '2',
    author: 'Sara Abdelhady',
    authorAvatar: 'https://scontent.fcai19-3.fna.fbcdn.net/v/t39.30808-6/436405936_122097062930281504_1162436220330571068_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=bAExCsS69w4Q7kNvwF_7laH&_nc_oc=Adkz8i6v4_TmJKTJgxFFHIEuFuFVxn5m97KaRFivRK0po8041O-FM2ADqncfAMG4dXk&_nc_zt=23&_nc_ht=scontent.fcai19-3.fna&_nc_gid=wKiDgYh-wMCRLbydz2vfyw&oh=00_AfvxAMdeBqrNXiQyNZ1Zfy7SJjlQWHaL5BMKRB3DzzM6Gg&oe=69937E9D', 
    location: 'Caio, Egypt',
    image: 'https://i.ibb.co/VczZ1BPm/Screenshot-2026-02-12-131616.png',
    caption: 'A look at Egyptian streets of Egypt. #EGYREAL #MORNING',
    likes: '0',
    comments: 0,
    tags: ['EGYREAL', 'MORNING'],
    timestamp: '12 hours ago',
    platform: 'facebook',
    postUrl: 'https://www.facebook.com/share/r/18DPTHdkf6/',
  },
  {
    id: '3',
    author: 'habibamostafakena',
    authorAvatar: 'https://p16-sign-sg.tiktokcdn.com/tos-alisg-avt-0068/afced9b29f019aff75572932460e61c4~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=cd6e3bf2&x-expires=1771059600&x-signature=2AGEE%2BDXFHYJDCrSiwdGQVlX79g%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my',
    location: 'Cairo, Egypt',
    image: 'https://i.ibb.co/wFSZ1nCD/Screenshot-2026-02-12-131747.png',
    caption: '#EGYREAL',
    likes: '8.7k',
    comments: 124,
    tags: ['EGYREAL'],
    timestamp: '2 hours ago',
    platform: 'tiktok',
    postUrl: 'https://www.tiktok.com/@habibamostafakena/video/7605895312204516616?_r=1&_t=ZS-93r65QRBI5n',
  },
];

export const EgyRealPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const toggleLike = (postId: string) => {
    setLikedPosts((prev) => {
      const newSet = new Set(prev);
      newSet.has(postId) ? newSet.delete(postId) : newSet.add(postId);
      return newSet;
    });
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return <Facebook className="h-3.5 w-3.5 text-blue-600" />;
      case 'instagram':
        return <Instagram className="h-3.5 w-3.5 text-pink-600" />;
      case 'x':
        return <Twitter className="h-3.5 w-3.5 text-black" />; // Using Twitter icon for X
      case 'linkedin':
        return <Linkedin className="h-3.5 w-3.5 text-blue-700" />;
      case 'tiktok':
        return <Music className="h-3.5 w-3.5 text-black" />;
      case 'threads':
        return <AtSign className="h-3.5 w-3.5 text-black" />;
      default:
        return <Hash className="h-3.5 w-3.5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-4 max-w-7xl">
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-rose-500 rounded-lg flex items-center justify-center shadow-md">
              <Hash className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Explore #EGYREAL</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by location or caption..."
              className="pl-10 h-12 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="p-4 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={post.authorAvatar} />
                    <AvatarFallback className="bg-muted">{post.author.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold leading-none">{post.author}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" /> {post.location}
                    </span>
                  </div>
                </div>
                {/* Platform Badge */}
                <Badge variant="secondary" className="flex gap-1.5 items-center px-2 py-1">
                  {getPlatformIcon(post.platform)}
                  <span className="capitalize text-[10px] font-bold tracking-wider">
                    {post.platform === 'x' ? 'X' : post.platform}
                  </span>
                </Badge>
              </CardHeader>

              <a href={post.postUrl} target="_blank" rel="noopener noreferrer" className="block relative aspect-square group overflow-hidden">
                <ImageWithFallback
                  src={post.image}
                  alt={post.caption}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm font-semibold border-2 border-white px-4 py-2 rounded-md">View Original Post</span>
                </div>
              </a>

              <CardContent className="p-5">
                <div className="flex items-center gap-4 mb-4">
                  <Button variant="ghost" size="sm" className="h-9 px-0 hover:bg-transparent" onClick={() => toggleLike(post.id)}>
                    <Heart className={`h-6 w-6 mr-1.5 ${likedPosts.has(post.id) ? 'fill-red-900 text-red-900' : ''}`} />
                    <span className="text-sm font-bold">{post.likes}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-9 px-0 hover:bg-transparent">
                    <MessageCircle className="h-6 w-6 mr-1.5" />
                    <span className="text-sm font-bold">{post.comments}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-9 px-0 ml-auto hover:bg-transparent">
                    <Share2 className="h-6 w-6" />
                  </Button>
                </div>

                <p className="text-sm leading-relaxed mb-4">
                  <span className="font-bold mr-2 text-foreground">{post.author}</span>
                  {post.caption}
                </p>

                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};