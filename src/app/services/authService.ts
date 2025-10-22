import { api, authAPI, storage } from '../lib/api';
import { 
  LoginCredentials, 
  AuthResponse, 
  User, 
  RegisterCredentials,
  AuthTokens,
  TokenResponse 
} from '../types';

export const authService = {
  /**
   * Connexion avec gestion des tokens JWT
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Utiliser votre endpoint de login personnalisé qui retourne les tokens
      const response = await api.post<AuthResponse>('/auth/login/', credentials);
      
      if (response.data.access && response.data.refresh) {
        // Stocker les tokens
        storage.setTokens({
          access: response.data.access,
          refresh: response.data.refresh
        });
        
        // Stocker les données utilisateur
        if (response.data.user) {
          storage.setUser(response.data.user);
        }
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Gestion d'erreur spécifique
      if (error.response?.status === 401) {
        throw new Error('Identifiants incorrects');
      } else if (error.response?.status === 403) {
        throw new Error('Compte désactivé ou expiré');
      } else {
        throw new Error('Erreur de connexion. Veuillez réessayer.');
      }
    }
  },

  /**
   * Connexion avec l'endpoint JWT standard
   */
  async loginJWT(credentials: LoginCredentials): Promise<TokenResponse> {
    try {
      const response = await api.post<TokenResponse>('/auth/token/', credentials);
      
      // Stocker les tokens
      storage.setTokens({
        access: response.data.access,
        refresh: response.data.refresh
      });
      
      // Récupérer les données utilisateur
      const user = await this.getCurrentUser();
      storage.setUser(user);
      
      return response.data;
    } catch (error: any) {
      console.error('JWT Login error:', error);
      throw new Error('Erreur d\'authentification');
    }
  },

  /**
   * Déconnexion avec blacklist du token
   */
  async logout(): Promise<void> {
    try {
      const tokens = storage.getTokens();
      if (tokens?.refresh) {
        await api.post('/auth/logout/', { refresh: tokens.refresh });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Nettoyer le stockage local quoi qu'il arrive
      storage.clearTokens();
      storage.clearUser();
    }
  },

  /**
   * Récupérer l'utilisateur actuel
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<User>('/auth/current-user/');
      
      // Mettre à jour le stockage avec les données fraîches
      storage.setUser(response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Get current user error:', error);
      
      // Si erreur d'authentification, nettoyer le stockage
      if (error.response?.status === 401) {
        storage.clearTokens();
        storage.clearUser();
      }
      
      throw error;
    }
  },

  /**
   * Inscription d'un étudiant
   */
  async registerStudent(userData: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register-student/', userData);
      
      if (response.data.access && response.data.refresh) {
        storage.setTokens({
          access: response.data.access,
          refresh: response.data.refresh
        });
        
        if (response.data.user) {
          storage.setUser(response.data.user);
        }
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Register error:', error);
      
      if (error.response?.data) {
        throw new Error(JSON.stringify(error.response.data));
      }
      
      throw new Error('Erreur lors de l\'inscription');
    }
  },

  /**
   * Rafraîchir le token d'accès
   */
  async refreshToken(): Promise<AuthTokens> {
    try {
      const tokens = storage.getTokens();
      if (!tokens?.refresh) {
        throw new Error('No refresh token available');
      }

      const response = await api.post<TokenResponse>('/auth/token/refresh/', {
        refresh: tokens.refresh
      });

      const newTokens = {
        access: response.data.access,
        refresh: tokens.refresh // Le refresh token reste le même
      };

      storage.setTokens(newTokens);
      return newTokens;
    } catch (error: any) {
      console.error('Token refresh error:', error);
      
      // Si le rafraîchissement échoue, déconnecter l'utilisateur
      storage.clearTokens();
      storage.clearUser();
      
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }
  },

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    return authAPI.isAuthenticated();
  },

  /**
   * Récupérer l'utilisateur depuis le stockage local
   */
  getStoredUser(): User | null {
    return storage.getUser();
  },

  /**
   * Récupérer les tokens depuis le stockage local
   */
  getStoredTokens(): AuthTokens | null {
    return storage.getTokens();
  },

  /**
   * Vérifier si le token est expiré
   */
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  },

  /**
   * Vérifier si le compte étudiant est expiré
   */
  isStudentAccountExpired(user: User): boolean {
    if (user.role !== 'etudiant' || !user.date_expiration) {
      return false;
    }
    
    return new Date(user.date_expiration) < new Date();
  },

  /**
   * Changer le mot de passe
   */
  async changePassword(passwordData: {
    old_password: string;
    new_password1: string;
    new_password2: string;
  }): Promise<void> {
    try {
      await api.post('/auth/password/change/', passwordData);
    } catch (error: any) {
      console.error('Change password error:', error);
      
      if (error.response?.data) {
        throw new Error(JSON.stringify(error.response.data));
      }
      
      throw new Error('Erreur lors du changement de mot de passe');
    }
  },

  /**
   * Mettre à jour le profil utilisateur
   */
  async updateProfile(userId: number, userData: Partial<User>): Promise<User> {
    try {
      const response = await api.patch<User>(`/users/${userId}/update_profile/`, userData);
      
      // Mettre à jour le stockage local
      storage.setUser(response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Update profile error:', error);
      
      if (error.response?.data) {
        throw new Error(JSON.stringify(error.response.data));
      }
      
      throw new Error('Erreur lors de la mise à jour du profil');
    }
  },

  /**
   * Vérifier la validité du token
   */
  async verifyToken(token: string): Promise<boolean> {
    try {
      await api.post('/auth/token/verify/', { token });
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Forcer la déconnexion (en cas d'erreur)
   */
  forceLogout(): void {
    storage.clearTokens();
    storage.clearUser();
    
    // Rediriger vers la page de login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
};

// Export des fonctions principales pour une utilisation simplifiée
export const {
  login,
  logout,
  getCurrentUser,
  registerStudent,
  refreshToken,
  isAuthenticated,
  getStoredUser,
  changePassword,
  updateProfile
} = authService;

export default authService;