import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  name: string;
  age: string;
  travelType: 'group' | 'solo' | 'family';
  activities: string[];
  avatarUrl?: string;
}

interface UserContextType {
  user: UserProfile | null;
  signIn: (email: string, password: string) => boolean;
  signUp: (profile: UserProfile, email: string, password: string) => void;
  signOut: () => void;
  updateProfile: (profile: UserProfile) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const userData = localStorage.getItem(`user_${currentUser}`);
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
  }, []);

  const signUp = (profile: UserProfile, email: string, password: string) => {
    // Store user credentials and profile
    localStorage.setItem(`auth_${email}`, password);
    localStorage.setItem(`user_${email}`, JSON.stringify(profile));
    localStorage.setItem('currentUser', email);
    setUser(profile);
  };

  const signIn = (email: string, password: string): boolean => {
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
  };

  const signOut = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
  };

  const updateProfile = (profile: UserProfile) => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      localStorage.setItem(`user_${currentUser}`, JSON.stringify(profile));
      setUser(profile);
    }
  };

  return (
    <UserContext.Provider value={{ user, signIn, signUp, signOut, updateProfile }}>
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
