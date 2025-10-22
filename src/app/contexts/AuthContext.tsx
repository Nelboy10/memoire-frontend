'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, LoginCredentials, RegisterCredentials, AuthResponse } from '../types';
import { authService } from '../services/authService';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  registerStudent: (credentials: RegisterCredentials) => Promise<AuthResponse>;
  refreshUser: () => Promise<void>;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Routes publiques qui ne nécessitent pas d'authentification
const PUBLIC_ROUTES = ['/', '/login', '/register', '/memoires-publics', '/recherche'];

// Routes par rôle
const ROLE_ROUTES = {
  admin_general: ['/dashboard', '/dashboard/users', '/dashboard/entites', '/dashboard/memoires', '/dashboard/statistiques'],
  admin_entite: ['/dashboard', '/dashboard/users', '/dashboard/memoires', '/dashboard/statistiques'],
  secretaire: ['/dashboard/secretaire', '/dashboard/secretaire/memoires-attente'],
  etudiant: ['/dashboard/etudiant', '/dashboard/etudiant/mes-memoires'],
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Vérifier l'authentification au chargement
  useEffect(() => {
    initializeAuth();
  }, []);

  // Redirection et protection de routes
  useEffect(() => {
    if (!initialized) return;

    handleRouteProtection();
  }, [pathname, user, initialized]);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      
      // Vérifier si on a des tokens valides
      const tokens = authService.getStoredTokens();
      const storedUser = authService.getStoredUser();

      if (tokens?.access && storedUser) {
        // Vérifier si le token est expiré
        if (authService.isTokenExpired(tokens.access)) {
          // Essayer de rafraîchir le token
          try {
            await authService.refreshToken();
            // Récupérer les données utilisateur fraîches
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            // Token invalide, déconnecter
            await handleInvalidAuth();
          }
        } else {
          // Token valide, utiliser l'utilisateur stocké
          setUser(storedUser);
        }
      } else {
        // Pas d'authentification valide
        setUser(null);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      await handleInvalidAuth();
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  const handleInvalidAuth = async () => {
    authService.forceLogout();
    setUser(null);
  };

  const handleRouteProtection = () => {
    // Si l'authentification n'est pas encore initialisée, attendre
    if (!initialized) return;

    const isPublicRoute = PUBLIC_ROUTES.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );

    // Utilisateur non connecté sur une route privée
    if (!user && !isPublicRoute) {
      router.push('/login');
      return;
    }

    // Utilisateur connecté sur une route publique (hors accueil)
    if (user && (pathname === '/login' || pathname === '/register')) {
      redirectToDashboard(user.role);
      return;
    }

    // Vérifier les permissions par rôle
    if (user && !isPublicRoute) {
      const userRoleRoutes = ROLE_ROUTES[user.role as keyof typeof ROLE_ROUTES] || [];
      const hasAccess = userRoleRoutes.some(route => 
        pathname === route || pathname.startsWith(route + '/')
      );

      if (!hasAccess && pathname !== '/dashboard/profil' && pathname !== '/dashboard/parametres') {
        // Rediriger vers le dashboard approprié si accès refusé
        redirectToDashboard(user.role);
      }
    }
  };

  const redirectToDashboard = (role: string) => {
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
  };

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await authService.login(credentials);
      setUser(data.user);
      
      // Rediriger vers le dashboard approprié
      redirectToDashboard(data.user.role);
      
      return data;
    } catch (error: any) {
      let errorMessage = 'Erreur de connexion';
      
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const registerStudent = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await authService.registerStudent(credentials);
      setUser(data.user);
      
      // Rediriger vers le dashboard étudiant
      router.push('/dashboard/etudiant');
      
      return data;
    } catch (error: any) {
      let errorMessage = 'Erreur lors de l\'inscription';
      
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data) {
        // Gérer les erreurs de validation Django
        if (typeof error.response.data === 'object') {
          const errors = Object.values(error.response.data).flat();
          errorMessage = errors.join(', ');
        } else {
          errorMessage = error.response.data;
        }
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    
    try {
      await authService.logout();
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Forcer la déconnexion même en cas d'erreur
      authService.forceLogout();
      setUser(null);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Refresh user error:', error);
      // Si erreur, déconnecter
      await handleInvalidAuth();
    }
  };

  const clearError = (): void => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    registerStudent,
    refreshUser,
    loading,
    initialized,
    error,
    clearError,
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

// Hook pour vérifier les permissions
export function useAuthGuard(requiredRole?: string) {
  const { user, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      // Rediriger vers le dashboard approprié si mauvais rôle
      switch (user.role) {
        case 'secretaire':
          router.push('/dashboard/secretaire');
          break;
        case 'etudiant':
          router.push('/dashboard/etudiant');
          break;
        default:
          router.push('/dashboard');
      }
    }
  }, [user, initialized, requiredRole, router]);

  return { user, hasAccess: !requiredRole || user?.role === requiredRole };
}

// Hook pour les pages publiques seulement
export function usePublicOnly() {
  const { user, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initialized && user) {
      // Rediriger vers le dashboard si déjà connecté
      switch (user.role) {
        case 'secretaire':
          router.push('/dashboard/secretaire');
          break;
        case 'etudiant':
          router.push('/dashboard/etudiant');
          break;
        default:
          router.push('/dashboard');
      }
    }
  }, [user, initialized, router]);

  return { user, isPublic: !user };
}