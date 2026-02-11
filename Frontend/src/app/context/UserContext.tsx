import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://127.0.0.1:8080';

export interface VehicleInfo {
  vehicle_type: string;
  license_plate: string;
  city: string;
  capacity: string;
  description?: string;
}

export interface ShopInfo {
  name: string;
  city: string;
  address: string;
  phone: string;
  description?: string;
  opening_hours: string;
  categories: string[];
}

export interface LocalProfile {
  name: string;
  age: string;
  city: string;
  occupation: 'driver' | 'shopkeeper' | 'neighborhood_tourguide';
  bio?: string;
  avatarUrl?: string;
  national_id: string;
  phone: string;
  spoken_languages: string[];
  vehicle_info?: VehicleInfo;
  shop_info?: ShopInfo;
  hasSeenRules?: boolean;
  earnings?: number;
  instaPayDetails?: string;
}

export interface UserProfile {
  name: string;
  age: string;
  country: string;
  languages: string[];
  currency: string;
  appLanguage: string;
  travelType: 'group' | 'solo' | 'family';
  activities: string[];
  avatarUrl?: string;
  wishlist?: string[]; // Array of tour IDs
}

export type User = {
  userType: 'tourist';
  profile: UserProfile;
} | {
  userType: 'local';
  profile: LocalProfile;
};

interface UserContextType {
  user: User | null;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  signIn: (email: string, password: string) => boolean;
  signUp: (user: User, email: string, password: string) => void;
  signOut: () => void;
  updateProfile: (user: User) => void;
  toggleWishlist: (tourId: string) => void;
  markRulesAsSeen: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Initialize from localStorage
  useEffect(() => {
    try {
      // Load user
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        const userData = localStorage.getItem(`user_${currentUser}`);
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);

          // Apply RTL for Arabic (only for tourists)
          if (parsedUser.userType === 'tourist' && parsedUser.profile.appLanguage === 'Arabic') {
            document.documentElement.setAttribute('dir', 'rtl');
            document.documentElement.setAttribute('lang', 'ar');
          } else {
            document.documentElement.setAttribute('dir', 'ltr');
            document.documentElement.setAttribute('lang', 'en');
          }
        }
      }

      // Load theme
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme);
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      } else if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
        document.documentElement.classList.add('dark');
      }
    } catch (error) {
      console.error('Error initializing UserProvider:', error);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      return newTheme;
    });
  }, []);


  const signUp = useCallback(
    async (user: User, email: string, password: string) => {
      try {
        console.log('Signing up user:', { email, user });
        console.log('User profile details:', user.profile);
        // Send user data to your backend API
        const response = await axios.post(`${API_BASE}/tourist/signup`, {
          email,
          password, // backend should hash this
          profile: user,
        });

        // Example: backend returns the created user and a token
        const { data } = response;
        const { token, user: createdUser } = data;

        // Save token (JWT) in memory or localStorage
        localStorage.setItem('authToken', token);
        localStorage.setItem('currentUser', email);

        // Optionally store user profile locally for fast access
        localStorage.setItem('user_' + email, JSON.stringify(createdUser));

        return createdUser;
      } catch (error: any) {
        console.error('Sign up failed:', error.response?.data || error.message);
        throw error;
      }
    },
    []
  );



  const signIn = useCallback((email: string, password: string): boolean => {
    const storedPassword = localStorage.getItem(`auth_${email}`);
    if (storedPassword === password) {
      const userData = localStorage.getItem(`user_${email}`);
      if (userData) {
        setUser(JSON.parse(userData));
        localStorage.setItem('currentUser', email);
        return true;
      }
    }
    return false;
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('currentUser');
    setUser(null);
  }, []);

  const updateProfile = useCallback((user: User) => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      localStorage.setItem(`user_${currentUser}`, JSON.stringify(user));
      setUser(user);

      // Apply RTL for Arabic (only for tourists)
      if (user.userType === 'tourist' && user.profile.appLanguage === 'Arabic') {
        document.documentElement.setAttribute('dir', 'rtl');
        document.documentElement.setAttribute('lang', 'ar');
      } else {
        document.documentElement.setAttribute('dir', 'ltr');
        document.documentElement.setAttribute('lang', 'en');
      }
    }
  }, []);

  const toggleWishlist = useCallback((tourId: string) => {
    if (!user || user.userType !== 'tourist') return;

    const wishlist = user.profile.wishlist || [];
    const isAlreadyInWishlist = wishlist.includes(tourId);

    const newWishlist = isAlreadyInWishlist
      ? wishlist.filter(id => id !== tourId)
      : [...wishlist, tourId];

    const updatedProfile = { ...user.profile, wishlist: newWishlist };
    updateProfile({ ...user, profile: updatedProfile });
  }, [user, updateProfile]);

  const markRulesAsSeen = useCallback(() => {
    if (!user) return;

    if (user.userType === 'local') {
      const updatedProfile = { ...user.profile, hasSeenRules: true };
      updateProfile({ ...user, profile: updatedProfile });
    }
  }, [user, updateProfile]);

  return (
    <UserContext.Provider value={{
      user,
      theme,
      toggleTheme,
      signIn,
      signUp,
      signOut,
      updateProfile,
      toggleWishlist,
      markRulesAsSeen
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};