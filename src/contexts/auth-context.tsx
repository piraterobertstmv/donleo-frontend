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
import type { UserProfile } from '@/lib/firestore-helpers';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string, affiliateCode?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Fetch profile from backend MongoDB (source of truth for isPremium)
const fetchProfileFromBackend = async (token: string): Promise<UserProfile | null> => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) return null;
  const res = await fetch(`${backendUrl}/api/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return {
    uid: data.firebaseUid ?? data.uid,
    email: data.email,
    displayName: data.displayName,
    isPremium: data.isPremium ?? false,
    subscription: data.subscription,
    createdAt: typeof data.createdAt === 'string' ? Date.parse(data.createdAt) : data.createdAt,
    updatedAt: typeof data.updatedAt === 'string' ? Date.parse(data.updatedAt) : data.updatedAt,
    lastLoginAt: data.lastLoginAt,
  };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from backend MongoDB (includes isPremium from Stripe webhook)
  const fetchProfile = async (firebaseUser: User) => {
    try {
      const token = await firebaseUser.getIdToken();
      let userProfile = await fetchProfileFromBackend(token);
      // If no profile (e.g. user signed up before MongoDB), try to create one
      if (!userProfile) {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (backendUrl) {
          const createRes = await fetch(`${backendUrl}/api/auth/create-profile`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
            }),
          });
          if (createRes.ok) {
            userProfile = await fetchProfileFromBackend(token);
          }
        }
      }
      setProfile(userProfile ?? null);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setProfile(null);
    }
  };

  // Refresh profile (useful after payment, etc.)
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  // Sign up wrapper - also create profile on backend, optionally apply affiliate code
  const handleSignUp = async (
    email: string,
    password: string,
    displayName?: string,
    affiliateCode?: string
  ) => {
    console.log('🔐 Starting signup...');
    const userCredential = await signUp(email, password, displayName);
    console.log('✅ Firebase auth user created:', userCredential.user.uid);
    
    // Create profile on backend MongoDB
    if (userCredential.user) {
      try {
        const token = await userCredential.user.getIdToken();
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        
        const createProfileRes = await fetch(`${backendUrl}/api/auth/create-profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            displayName: displayName || email.split('@')[0],
            referredByCode: affiliateCode?.trim() || undefined,
          }),
        });

        if (!createProfileRes.ok) {
          const text = await createProfileRes.text();
          console.error('❌ Failed to create backend profile:', text);
          throw new Error('Failed to create profile');
        }
      } catch (error) {
        console.error('❌ Error during signup:', error);
        throw error;
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
    const unsubscribe = onAuthStateChange(async (authUser) => {
      setUser(authUser);

      if (authUser) {
        // Fetch profile from backend MongoDB (source of truth for isPremium)
        await fetchProfile(authUser);
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
