import React, { useState } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { useUser } from '../context/UserContext';
import { Pyramid, Navigation, GraduationCap, ShieldAlert, MessageSquare, Hash, HelpCircle, LogOut, Menu, Sun, Moon, Sparkles, User, Settings, Compass, Bell, Users, Bot } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const { user, signOut, theme, toggleTheme } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get profile data regardless of user type
  const profile = user?.profile;
  const userName = profile?.name || '';
  const userAvatar = profile?.avatarUrl || '';
  const userAge = profile?.age || '';
  const userType = user?.userType === 'tourist' 
    ? `${(profile as any).travelType} traveler` 
    : user?.userType === 'local' 
      ? `${(profile as any).occupation}` 
      : '';

  // Different nav items for tourists vs locals
  const touristNavItems = [
    { id: 'recommendations', label: 'Walk the Streets of Egypt', icon: Navigation },
    { id: 'lessons', label: 'The Lessons in Egyptians', icon: GraduationCap },
    { id: 'bias', label: 'Bias Detector', icon: ShieldAlert },
    { id: 'llm', label: 'Talk With Me', icon: Bot },
    { id: 'egyreal', label: 'Explore #EGYREAL', icon: Hash },
    { id: 'help', label: 'Help Me', icon: HelpCircle },
    { id: 'wishlist', label: 'Wishlist', icon: Sparkles },
    { id: 'comfort-zone', label: 'Go out of your comfort zone', icon: Compass },
    { id: 'match-local', label: 'Match with a Local', icon: Users },
    { id: 'local-blog', label: 'The Local Blog', icon: MessageSquare },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const localNavItems = [
    { id: 'hidden-gem', label: 'Uncover a Hidden Gem', icon: Sparkles },
    { id: 'match-local', label: 'Match with Tourists', icon: Users },
    { id: 'local-blog', label: 'The Local Blog', icon: MessageSquare },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const navItems = user?.userType === 'local' ? localNavItems : touristNavItems;

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-brown-medium/20 bg-brown-dark shadow-md">
      <div className="w-full max-w-[100vw] mx-auto flex h-16 items-center px-4 overflow-x-hidden">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer shrink-0" 
          onClick={() => handleNavigate('home')}
        >
          <div className="h-10 w-10 bg-gradient-to-br from-pine-primary to-pine-dark rounded-full flex items-center justify-center shadow-lg">
            <Pyramid className="h-6 w-6 text-white" />
          </div>
          <span className="hidden sm:inline-block font-semibold text-papyrus-light text-lg">
            Egypt Explorer
          </span>
        </div>

        {/* Desktop Navigation - Centered */}
        <div className="hidden lg:flex flex-1 items-center justify-center gap-1 mx-4 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={currentPage === item.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleNavigate(item.id)}
                className={`group flex items-center shrink-0 ${
                  currentPage === item.id 
                    ? 'bg-pine-primary hover:bg-pine-dark text-white shadow-sm' 
                    : 'text-papyrus hover:bg-brown-light/40 hover:text-papyrus-light transition-colors'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="max-w-0 opacity-0 ml-0 overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out group-hover:max-w-[300px] group-hover:opacity-100 group-hover:ml-2">
                  {item.label}
                </span>
              </Button>
            );
          })}
        </div>

        {/* Right Actions - Rightmost */}
        <div className="flex items-center gap-2 sm:gap-4 ml-auto lg:ml-0 shrink-0">
          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-papyrus-light hover:bg-brown-light/40">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-background w-[280px] sm:w-[350px] border-r border-border">
                <SheetHeader>
                  <SheetTitle className="text-left text-lg font-bold">Menu</SheetTitle>
                  <SheetDescription className="sr-only">
                    Mobile navigation menu
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-4">
                  <div 
                    className="flex items-center gap-3 pb-4 border-b border-border cursor-pointer hover:bg-accent/50 p-2 rounded-md transition-colors"
                    onClick={() => handleNavigate('profile')}
                  >
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                      <AvatarImage src={userAvatar} alt={userName} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {userName ? userName.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-foreground">{userName}</div>
                      <div className="text-sm text-muted-foreground capitalize">{userType}</div>
                    </div>
                  </div>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.id}
                        variant={currentPage === item.id ? 'default' : 'ghost'}
                        className={`justify-start gap-3 h-12 ${
                          currentPage === item.id 
                            ? 'bg-primary text-primary-foreground shadow-sm' 
                            : 'text-foreground hover:bg-accent'
                        }`}
                        onClick={() => handleNavigate(item.id)}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Button>
                    );
                  })}
                  <DropdownMenuSeparator className="my-2" />
                  <Button
                    variant="ghost"
                    className="justify-start gap-3 h-12 text-destructive hover:bg-destructive/10"
                    onClick={signOut}
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-papyrus hover:bg-brown-light/40 hover:text-papyrus-light transition-all rounded-full"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>

          {/* User Menu (Desktop) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-brown-light/40 transition-all p-0 overflow-hidden">
                <Avatar className="h-10 w-10 border-2 border-pine-primary">
                  <AvatarImage src={userAvatar} alt={userName} />
                  <AvatarFallback className="bg-pine-primary text-white">
                    {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-border shadow-xl">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-foreground">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userAge} years old • {userType}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem onClick={() => handleNavigate('profile')} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem onClick={signOut} className="text-destructive hover:bg-destructive/10 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};