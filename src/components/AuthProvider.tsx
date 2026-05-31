'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { GoogleOAuthProvider, googleLogout } from '@react-oauth/google';
import { useRouter } from '@/routing';
import { TeacherResponse } from '@/app/types/api';

interface AuthContextType {
  token: string | null;
  teacher: TeacherResponse | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'fake-client-id';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [teacher, setTeacher] = useState<TeacherResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTeacher = async (t: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/teachers/me', {
        headers: {
          'Authorization': `Bearer ${t}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTeacher(data);
        setToken(t);
        return true;
      } else {
        localStorage.removeItem('google_token');
        localStorage.removeItem('studentName');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('studentNameUpdated'));
        }
        setToken(null);
        return false;
      }
    } catch (error) {
      console.error('Failed to fetch teacher', error);
      localStorage.removeItem('google_token');
      localStorage.removeItem('studentName');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('studentNameUpdated'));
      }
      setToken(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('google_token');
    if (savedToken) {
      setTimeout(() => fetchTeacher(savedToken), 0);
    } else {
      setTimeout(() => setIsLoading(false), 0);
    }
  }, []);

  const login = async (t: string) => {
    localStorage.setItem('google_token', t);
    const success = await fetchTeacher(t);
    if (success) {
      router.push('/teachers/exercises');
    }
  };

  const logout = () => {
    googleLogout();
    localStorage.removeItem('google_token');
    localStorage.removeItem('studentName');
    // Notify same-tab listeners (e.g., MenuBar)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('studentNameUpdated'));
    }
    setToken(null);
    setTeacher(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ token, teacher, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function GoogleAuthProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
