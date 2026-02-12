import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { useUser } from '../context/UserContext';
import { MessageSquare, Send, Heart, User as UserIcon, Calendar, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface BlogPost {
  id: string;
  author: string;
  authorType: 'tourist' | 'local';
  authorAvatar?: string;
  title: string;
  content: string;
  timestamp: string;
  likes: string[]; // Array of user emails who liked
  comments: BlogComment[];
}

interface BlogComment {
  id: string;
  author: string;
  authorType: 'tourist' | 'local';
  authorAvatar?: string;
  content: string;
  timestamp: string;
}

export const LocalBlogPage: React.FC = () => {
  const { user } = useUser();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');

  const currentUserEmail = localStorage.getItem('currentUser') || '';

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = () => {
    const storedPosts = localStorage.getItem('blog_posts');
    if (storedPosts) {
      setPosts(JSON.parse(storedPosts));
    } else {
      // Initialize with some sample posts
      const samplePosts: BlogPost[] = [
        {
          id: 'post_1',
          author: 'Ahmed Mohamed',
          authorType: 'local',
          title: 'Hidden Gems in Islamic Cairo',
          content: 'As a local tour guide, I want to share some amazing spots in Islamic Cairo that most tourists miss. The Al-Muizz Street is beautiful, but try exploring the side alleys early in the morning...',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          likes: [],
          comments: []
        },
        {
          id: 'post_2',
          author: 'Sarah Johnson',
          authorType: 'tourist',
          title: 'My First Week in Egypt!',
          content: "I've been in Cairo for a week now and I'm absolutely amazed! The hospitality of locals, the food, the history - everything is incredible. Any recommendations for my second week?",
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          likes: [],
          comments: []
        }
      ];
      localStorage.setItem('blog_posts', JSON.stringify(samplePosts));
      setPosts(samplePosts);
    }
  };

  const savePosts = (updatedPosts: BlogPost[]) => {
    localStorage.setItem('blog_posts', JSON.stringify(updatedPosts));
    setPosts(updatedPosts);
  };

  const handleCreatePost = () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast.error('Please fill in both title and content');
      return;
    }

    const newPost: BlogPost = {
      id: `post_${Date.now()}`,
      author: user?.profile.name || 'Anonymous',
      authorType: user?.userType || 'tourist',
      authorAvatar: user?.profile.avatarUrl,
      title: newPostTitle,
      content: newPostContent,
      timestamp: new Date().toISOString(),
      likes: [],
      comments: []
    };

    const updatedPosts = [newPost, ...posts];
    savePosts(updatedPosts);
    setNewPostTitle('');
    setNewPostContent('');
    toast.success('Post created successfully!');
  };

  const handleLikePost = (postId: string) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const isLiked = post.likes.includes(currentUserEmail);
        return {
          ...post,
          likes: isLiked 
            ? post.likes.filter(email => email !== currentUserEmail)
            : [...post.likes, currentUserEmail]
        };
      }
      return post;
    });
    savePosts(updatedPosts);
  };

  const handleAddComment = (postId: string) => {
    const commentContent = commentInputs[postId]?.trim();
    if (!commentContent) {
      toast.error('Comment cannot be empty');
      return;
    }

    const newComment: BlogComment = {
      id: `comment_${Date.now()}`,
      author: user?.profile.name || 'Anonymous',
      authorType: user?.userType || 'tourist',
      authorAvatar: user?.profile.avatarUrl,
      content: commentContent,
      timestamp: new Date().toISOString()
    };

    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, newComment]
        };
      }
      return post;
    });

    savePosts(updatedPosts);
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    toast.success('Comment added!');
  };

  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === 'popular') {
      return (b.likes.length + b.comments.length) - (a.likes.length + a.comments.length);
    }
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-pine-primary to-pine-dark text-white border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold flex items-center gap-3">
              <MessageSquare className="h-8 w-8" />
              The Local Blog
            </CardTitle>
            <CardDescription className="text-papyrus-light">
              A space where tourists and locals share stories, tips, and experiences about Egypt
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Create Post */}
        <Card className="shadow-lg border-border">
          <CardHeader>
            <CardTitle className="text-xl">Share Your Story</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-10 w-10 border-2 border-primary">
                <AvatarImage src={user?.profile.avatarUrl} />
                <AvatarFallback>
                  {user?.profile.name.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">{user?.profile.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user?.userType === 'tourist' ? 'Tourist' : `Local ${(user?.profile as any).occupation || ''}`}
                </p>
              </div>
            </div>

            <Input
              placeholder="Post Title"
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              className="text-lg font-semibold"
            />
            
            <Textarea
              placeholder="What's on your mind? Share your experiences, ask questions, or give tips..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              rows={4}
            />
            
            <div className="flex justify-end">
              <Button 
                onClick={handleCreatePost}
                className="gap-2 bg-pine-primary hover:bg-pine-dark"
              >
                <Send className="h-4 w-4" />
                Post
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Button
            variant={sortBy === 'recent' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSortBy('recent')}
            className="gap-2"
          >
            <Calendar className="h-4 w-4" />
            Recent
          </Button>
          <Button
            variant={sortBy === 'popular' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSortBy('popular')}
            className="gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Popular
          </Button>
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {sortedPosts.map(post => (
            <Card key={post.id} className="shadow-lg border-border">
              <CardContent className="pt-6 space-y-4">
                {/* Post Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-primary">
                      <AvatarImage src={post.authorAvatar} />
                      <AvatarFallback>
                        {post.author.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{post.author}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className={`px-2 py-0.5 rounded-full ${
                          post.authorType === 'local' 
                            ? 'bg-pine-primary/10 text-pine-primary' 
                            : 'bg-blue-500/10 text-blue-500'
                        }`}>
                          {post.authorType === 'local' ? 'Local' : 'Tourist'}
                        </span>
                        <span>•</span>
                        <span>{formatTimestamp(post.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{post.title}</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{post.content}</p>
                </div>

                {/* Post Actions */}
                <div className="flex items-center gap-4 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLikePost(post.id)}
                    className={`gap-2 ${
                      post.likes.includes(currentUserEmail) 
                        ? 'text-red-900 hover:text-red-900' 
                        : 'text-muted-foreground'
                    }`}
                  >
                    <Heart 
                      className={`h-4 w-4 ${
                        post.likes.includes(currentUserEmail) ? 'fill-current' : ''
                      }`} 
                    />
                    {post.likes.length > 0 && post.likes.length}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-muted-foreground"
                  >
                    <MessageSquare className="h-4 w-4" />
                    {post.comments.length > 0 && post.comments.length}
                  </Button>
                </div>

                {/* Comments Section */}
                {post.comments.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      {post.comments.map(comment => (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar className="h-8 w-8 border border-border">
                            <AvatarImage src={comment.authorAvatar} />
                            <AvatarFallback className="text-xs">
                              {comment.author.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 bg-accent/50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm text-foreground">{comment.author}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                comment.authorType === 'local' 
                                  ? 'bg-pine-primary/10 text-pine-primary' 
                                  : 'bg-blue-500/10 text-blue-500'
                              }`}>
                                {comment.authorType === 'local' ? 'Local' : 'Tourist'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(comment.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-foreground">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Add Comment */}
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 border border-border">
                    <AvatarImage src={user?.profile.avatarUrl} />
                    <AvatarFallback className="text-xs">
                      {user?.profile.name.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex gap-2">
                    <Input
                      placeholder="Add a comment..."
                      value={commentInputs[post.id] || ''}
                      onChange={(e) => setCommentInputs(prev => ({ 
                        ...prev, 
                        [post.id]: e.target.value 
                      }))}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddComment(post.id);
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={() => handleAddComment(post.id)}
                      disabled={!commentInputs[post.id]?.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {sortedPosts.length === 0 && (
          <Card className="shadow-lg border-border">
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No posts yet. Be the first to share your story!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
