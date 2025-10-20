'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, LoginCredentials } from '../types';
import { authService } from '../services/authService';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Déplacer la fonction dans un useCallback pour éviter les dépendances cycliques
  const redirectBasedOnRole = useCallback((role: string) => {
    if (typeof window === 'undefined') return;
    
    const currentPath = window.location.pathname;
    
    // Ne rediriger que si on est sur la page d'accueil ou login
    if (currentPath === '/' || currentPath === '/login') {
      switch (role) {
        case 'secretaire':
          router.push('/dashboard/secretaire');
          break;
        case 'etudiant':
          router.push('/dashboard/etudiant');
          break;
        case 'admin_entite':
        case 'admin_general':
          router.push('/dashboard');
          break;
        default:
          router.push('/dashboard');
      }
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, []);

  // Redirection automatique quand l'utilisateur est connecté
  useEffect(() => {
    if (user && !loading) {
      redirectBasedOnRole(user.role);
    }
  }, [user, loading, redirectBasedOnRole]);

  const checkAuth = async () => {
    try {
      const storedUser = authService.getStoredUser();
      
      if (storedUser) {
        // Vérifier si l'utilisateur est toujours valide
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } catch (err) {
          // Si erreur, utiliser l'utilisateur stocké et essayer de rafraîchir plus tard
          setUser(storedUser);
        }
      }
    } catch (err) {
      console.error('Auth check error:', err);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await authService.login(credentials);
      setUser(data.user);
      // La redirection se fera automatiquement via l'useEffect
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Erreur de connexion';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    
    try {
      await authService.logout();
      setUser(null);
      router.push('/');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    loading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}