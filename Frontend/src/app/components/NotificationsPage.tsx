import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useUser } from '../context/UserContext';
import { Bell, Check, MessageSquare, Heart, MapPin, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'booking' | 'review' | 'gem_approved' | 'message';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  icon: 'heart' | 'message' | 'mappin' | 'star' | 'bell';
}

export const NotificationsPage: React.FC = () => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const currentUserEmail = localStorage.getItem('currentUser') || '';

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    const storedNotifications = localStorage.getItem(`notifications_${currentUserEmail}`);
    if (storedNotifications) {
      setNotifications(JSON.parse(storedNotifications));
    } else {
      // Initialize with sample notifications
      const sampleNotifications: Notification[] = [
        {
          id: 'notif_1',
          type: 'like',
          title: 'New Like',
          message: 'Someone liked your blog post about Islamic Cairo',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: false,
          icon: 'heart'
        },
        {
          id: 'notif_2',
          type: 'comment',
          title: 'New Comment',
          message: 'Sarah commented on your post: "Thanks for the tips!"',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          read: false,
          icon: 'message'
        },
        ...(user?.userType === 'local' ? [
          {
            id: 'notif_3',
            type: 'gem_approved' as const,
            title: 'Hidden Gem Approved!',
            message: 'Your submission "Al-Azhar Park" has been approved and is now visible to tourists.',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            read: false,
            icon: 'mappin' as const
          }
        ] : []),
        ...(user?.userType === 'tourist' ? [
          {
            id: 'notif_4',
            type: 'review' as const,
            title: 'New Recommendation',
            message: 'Based on your interests, we found 3 new places you might love!',
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            read: true,
            icon: 'star' as const
          }
        ] : [])
      ];
      localStorage.setItem(`notifications_${currentUserEmail}`, JSON.stringify(sampleNotifications));
      setNotifications(sampleNotifications);
    }
  };

  const saveNotifications = (updatedNotifications: Notification[]) => {
    localStorage.setItem(`notifications_${currentUserEmail}`, JSON.stringify(updatedNotifications));
    setNotifications(updatedNotifications);
  };

  const markAsRead = (notifId: string) => {
    const updated = notifications.map(n => 
      n.id === notifId ? { ...n, read: true } : n
    );
    saveNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
    toast.success('All notifications marked as read');
  };

  const deleteNotification = (notifId: string) => {
    const updated = notifications.filter(n => n.id !== notifId);
    saveNotifications(updated);
    toast.success('Notification deleted');
  };

  const clearAll = () => {
    saveNotifications([]);
    toast.success('All notifications cleared');
  };

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

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'heart': return <Heart className="h-5 w-5" />;
      case 'message': return <MessageSquare className="h-5 w-5" />;
      case 'mappin': return <MapPin className="h-5 w-5" />;
      case 'star': return <Star className="h-5 w-5" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const getIconColor = (iconType: string) => {
    switch (iconType) {
      case 'heart': return 'bg-red-500';
      case 'message': return 'bg-blue-500';
      case 'mappin': return 'bg-green-500';
      case 'star': return 'bg-yellow-500';
      default: return 'bg-purple-500';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-3xl space-y-6">
        {/* Header */}
        <Card className="shadow-lg border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center relative">
                  <Bell className="h-6 w-6 text-white" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div>
                  <CardTitle className="text-2xl">Notifications</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {unreadCount > 0 
                      ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                      : 'All caught up!'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={markAllAsRead}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Mark all read
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={clearAll}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <Card className="shadow-lg border-border">
              <CardContent className="py-16 text-center">
                <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground text-lg mb-2">No notifications yet</p>
                <p className="text-sm text-muted-foreground">
                  We'll notify you when something happens
                </p>
              </CardContent>
            </Card>
          ) : (
            notifications.map(notif => (
              <Card 
                key={notif.id}
                className={`shadow-md border-border transition-all cursor-pointer hover:shadow-lg ${
                  !notif.read ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                }`}
                onClick={() => !notif.read && markAsRead(notif.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`h-10 w-10 ${getIconColor(notif.icon)} rounded-full flex items-center justify-center flex-shrink-0 text-white`}>
                      {getIcon(notif.icon)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                            {notif.title}
                            {!notif.read && (
                              <span className="h-2 w-2 bg-primary rounded-full"></span>
                            )}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notif.message}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(notif.timestamp)}
                          </span>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                          }}
                          className="flex-shrink-0 h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
