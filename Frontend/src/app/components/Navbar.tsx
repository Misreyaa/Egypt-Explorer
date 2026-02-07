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
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { useUser } from '../context/UserContext';
import { Pyramid, Navigation, GraduationCap, ShieldAlert, MessageSquare, Hash, HelpCircle, LogOut, Menu } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const { user, signOut } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Pyramid },
    { id: 'streets', label: 'Walk the Streets', icon: Navigation },
    { id: 'lessons', label: 'Egyptian Lessons', icon: GraduationCap },
    { id: 'bias', label: 'Bias Detector', icon: ShieldAlert },
    { id: 'llm', label: 'Talk to LLM', icon: MessageSquare },
    { id: 'egyreal', label: '#EGYREAL', icon: Hash },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ];

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-brown-medium/20 bg-brown-dark shadow-md">
      <div className="container flex h-16 items-center px-4">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => handleNavigate('home')}
        >
          <div className="h-10 w-10 bg-gradient-to-br from-pine-primary to-pine-dark rounded-full flex items-center justify-center shadow-lg">
            <Pyramid className="h-6 w-6 text-white" />
          </div>
          <span className="hidden sm:inline-block font-semibold text-papyrus-light text-lg">
            Egypt Explorer
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex flex-1 items-center justify-center gap-1 mx-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={currentPage === item.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleNavigate(item.id)}
                className={`flex items-center gap-2 ${
                  currentPage === item.id 
                    ? 'bg-pine-primary hover:bg-pine-dark text-white' 
                    : 'text-papyrus hover:bg-brown-light hover:text-papyrus-light'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden xl:inline">{item.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex-1 flex lg:hidden justify-end">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-papyrus-light hover:bg-brown-light">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-papyrus w-[280px] sm:w-[350px]">
              <div className="flex flex-col gap-4 mt-8">
                <div className="flex items-center gap-3 pb-4 border-b border-brown-medium/20">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                    <AvatarFallback className="bg-pine-primary text-white">
                      {user?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-brown-dark">{user?.name}</div>
                    <div className="text-sm text-brown-medium capitalize">{user?.travelType} traveler</div>
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
                          ? 'bg-pine-primary hover:bg-pine-dark text-white' 
                          : 'text-brown-dark hover:bg-papyrus-dark'
                      }`}
                      onClick={() => handleNavigate(item.id)}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Button>
                  );
                })}
                <Button
                  variant="ghost"
                  className="justify-start gap-3 h-12 text-destructive hover:bg-red-50"
                  onClick={signOut}
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* User Menu (Desktop) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full ml-4 hover:bg-brown-light">
              <Avatar className="h-10 w-10 border-2 border-pine-primary">
                <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                <AvatarFallback className="bg-pine-primary text-white">
                  {user?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-papyrus border-brown-medium/20">
            <DropdownMenuLabel>
              <div className="text-brown-dark">{user?.name}</div>
              <div className="text-sm font-normal text-brown-medium">
                {user?.age} years old • {user?.travelType} traveler
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-brown-medium/20" />
            <DropdownMenuItem onClick={signOut} className="text-destructive hover:bg-red-50">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};