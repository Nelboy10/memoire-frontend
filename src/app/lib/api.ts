// lib/api.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Stockage des tokens
const TOKEN_KEY = 'auth_tokens';
const USER_KEY = 'user_data';

// Types pour les tokens
interface AuthTokens {
  access: string;
  refresh: string;
}

// Fonctions de gestion du stockage
export const storage = {
  // Tokens
  getTokens(): AuthTokens | null {
    if (typeof window === 'undefined') return null;
    try {
      const tokens = localStorage.getItem(TOKEN_KEY);
      return tokens ? JSON.parse(tokens) : null;
    } catch {
      return null;
    }
  },

  setTokens(tokens: AuthTokens): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
  },

  clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // Données utilisateur
  getUser(): any {
    if (typeof window === 'undefined') return null;
    try {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  setUser(user: any): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearUser(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(USER_KEY);
  },
};

// Intercepteur pour AJOUTER le token JWT aux requêtes
api.interceptors.request.use(
  (config) => {
    // Récupérer le token depuis le localStorage
    const tokens = storage.getTokens();
    if (tokens?.access) {
      config.headers.Authorization = `Bearer ${tokens.access}`;
    }
    
    // Ajouter le CSRF token si nécessaire (pour les sessions)
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs et rafraîchir les tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si erreur 401 et pas déjà en cours de rafraîchissement
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Rafraîchir le token
        const tokens = storage.getTokens();
        if (tokens?.refresh) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: tokens.refresh
          });
          
          const newTokens = response.data;
          storage.setTokens({
            access: newTokens.access,
            refresh: tokens.refresh // Garder le même refresh token
          });
          
          // Mettre à jour le header et relancer la requête
          originalRequest.headers.Authorization = `Bearer ${newTokens.access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Si le rafraîchissement échoue, déconnecter l'utilisateur
        console.error('Token refresh failed:', refreshError);
        storage.clearTokens();
        storage.clearUser();
        
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Gestion des autres erreurs
    if (error.response?.status === 403) {
      console.error('Accès refusé - Permissions insuffisantes');
      // Vous pouvez rediriger ou afficher un message d'erreur
    }

    if (error.response?.status === 500) {
      console.error('Erreur serveur interne');
    }

    return Promise.reject(error);
  }
);

// Fonction pour récupérer le CSRF token (nécessaire pour Django sessions)
function getCsrfToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Fonctions d'authentification
export const authAPI = {
  // Connexion avec vos vues personnalisées
  async login(credentials: { username: string; password: string }) {
    const response = await api.post('/auth/login/', credentials);
    
    if (response.data.access) {
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
  },

  // Connexion avec endpoints JWT standards
  async loginJWT(credentials: { username: string; password: string }) {
    const response = await api.post('/auth/token/', credentials);
    
    storage.setTokens({
      access: response.data.access,
      refresh: response.data.refresh
    });
    
    return response.data;
  },

  // Inscription étudiant
  async registerStudent(userData: any) {
    const response = await api.post('/auth/register-student/', userData);
    
    if (response.data.access) {
      storage.setTokens({
        access: response.data.access,
        refresh: response.data.refresh
      });
      
      if (response.data.user) {
        storage.setUser(response.data.user);
      }
    }
    
    return response.data;
  },

  // Déconnexion
  async logout() {
    try {
      const tokens = storage.getTokens();
      if (tokens?.refresh) {
        await api.post('/auth/logout/', { refresh: tokens.refresh });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      storage.clearTokens();
      storage.clearUser();
    }
  },

  // Rafraîchir le token manuellement
  async refreshToken() {
    const tokens = storage.getTokens();
    if (!tokens?.refresh) {
      throw new Error('No refresh token available');
    }

    const response = await api.post('/auth/token/refresh/', {
      refresh: tokens.refresh
    });

    const newTokens = {
      access: response.data.access,
      refresh: tokens.refresh // Le refresh token reste le même
    };

    storage.setTokens(newTokens);
    return newTokens;
  },

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated(): boolean {
    const tokens = storage.getTokens();
    return !!(tokens?.access);
  },

  // Récupérer l'utilisateur courant
  getCurrentUser() {
    return storage.getUser();
  },

  // Mettre à jour les données utilisateur
  updateUser(userData: any) {
    storage.setUser(userData);
  },
};

// Fonctions API pour les différentes ressources
export const memoireAPI = {
  // Mémoires
  getAllMemoires(params?: any) {
    return api.get('/memoires/', { params });
  },

  getMemoire(id: number) {
    return api.get(`/memoires/${id}/`);
  },

  createMemoire(data: any) {
    return api.post('/memoires/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  updateMemoire(id: number, data: any) {
    return api.patch(`/memoires/${id}/`, data);
  },

  deleteMemoire(id: number) {
    return api.delete(`/memoires/${id}/`);
  },

  // Recherche
  searchMemoires(query: string, filters?: any) {
    return api.get('/memoires/search/', {
      params: { q: query, ...filters }
    });
  },

  // Téléchargement
  downloadMemoire(memoireId: number, email: string) {
    return api.post(`/memoires/${memoireId}/download/`, { email });
  },

  // Mémoires publics
  getPublicMemoires() {
    return api.get('/memoires/public/');
  },

  // Mémoires de l'utilisateur connecté
  getMyMemoires() {
    return api.get('/memoires/mes_memoires/');
  },
};

export const userAPI = {
  // Utilisateurs
  getAllUsers() {
    return api.get('/users/');
  },

  getUser(id: number) {
    return api.get(`/users/${id}/`);
  },

  updateProfile(id: number, data: any) {
    return api.patch(`/users/${id}/update_profile/`, data);
  },

  getCurrentUser() {
    return api.get('/auth/current-user/');
  },

  changePassword(data: any) {
    return api.post('/auth/password/change/', data);
  },

  // Étudiants expirés
  getExpiredStudents() {
    return api.get('/users/expired_students/');
  },
};

export const adminAPI = {
  // Création de comptes admin
  createAdminEntite(data: any) {
    return api.post('/admin/creer-admin-entite/', data);
  },

  createSecretaire(data: any) {
    return api.post('/admin/creer-secretaire/', data);
  },

  createAdminGeneral(data: any) {
    return api.post('/admin/creer-admin-general/', data);
  },

  createSecretaireEntite(data: any) {
    return api.post('/admin/creer-secretaire-entite/', data);
  },
};

export const secretaireAPI = {
  // Dashboard secrétaire
  getDashboard() {
    return api.get('/secretaire/dashboard/');
  },

  getMemoiresEnAttente() {
    return api.get('/secretaire/memoires-en-attente/');
  },

  validerMemoire(memoireId: number) {
    return api.post(`/secretaire/valider-memoire/${memoireId}/`);
  },

  rejeterMemoire(memoireId: number) {
    return api.post(`/secretaire/rejeter-memoire/${memoireId}/`);
  },

  creerCompteEtudiant(data: any) {
    return api.post('/secretaire/creer-compte-etudiant/', data);
  },

  getEtudiantsExpires() {
    return api.get('/secretaire/etudiants-expires/');
  },

  prolongerCompte(userId: number) {
    return api.post(`/secretaire/prolonger-compte/${userId}/`);
  },
};

export const etudiantAPI = {
  // Dashboard étudiant
  getDashboard() {
    return api.get('/etudiant/dashboard/');
  },

  getMesMemoires() {
    return api.get('/etudiant/mes-memoires/');
  },

  deposerMemoire(data: any) {
    return api.post('/etudiant/deposer-memoire/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getStatistiquesPersonnelles() {
    return api.get('/etudiant/statistiques/');
  },
};

export const statsAPI = {
  // Statistiques
  getDashboardStats() {
    return api.get('/dashboard/stats/');
  },

  getGlobalStats() {
    return api.get('/statistiques/global_stats/');
  },
};

export default api;