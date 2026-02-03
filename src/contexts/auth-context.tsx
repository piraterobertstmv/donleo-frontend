'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import {
  signUp,
  signIn,
  signOut,
  onAuthStateChange,
  getAuthErrorMessage,
} from '@/lib/auth-helpers';
import { getUserProfile, UserProfile } from '@/lib/firestore-helpers';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from Firestore
  const fetchProfile = async (uid: string) => {
    try {
      const userProfile = await getUserProfile(uid);
      setProfile(userProfile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Refresh profile (useful after updates)
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.uid);
    }
  };

  // Sign up wrapper - also create profile on backend
  const handleSignUp = async (
    email: string,
    password: string,
    displayName?: string
  ) => {
    console.log('🔐 Starting signup...');
    const userCredential = await signUp(email, password, displayName);
    console.log('✅ Firebase auth user created:', userCredential.user.uid);
    
    // Create profile on backend MongoDB
    if (userCredential.user) {
      try {
        const token = await userCredential.user.getIdToken();
        console.log('🔑 Got Firebase ID token');
        
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        console.log('📍 Backend URL:', backendUrl);
        
        const createProfileUrl = `${backendUrl}/api/auth/create-profile`;
        console.log('📤 Calling:', createProfileUrl);
        
        const response = await fetch(createProfileUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ displayName: displayName || email.split('@')[0] }),
        });

        console.log('📬 Backend response status:', response.status);
        const responseText = await response.text();
        console.log('📬 Backend response:', responseText);

        if (!response.ok) {
          console.error('❌ Failed to create backend profile:', responseText);
        } else {
          console.log('✅ MongoDB profile created successfully');
        }
      } catch (error) {
        console.error('❌ Error creating backend profile:', error);
      }
    }
    // Auth state change listener will handle setting user/profile
  };

  // Sign in wrapper
  const handleSignIn = async (email: string, password: string) => {
    await signIn(email, password);
    // Auth state change listener will handle setting user/profile
  };

  // Sign out wrapper
  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setProfile(null);
  };

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChange(async (user) => {
      setUser(user);

      if (user) {
        // Fetch user profile from Firestore
        await fetchProfile(user.uid);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextValue = {
    user,
    profile,
    loading,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { getAuthErrorMessage };
