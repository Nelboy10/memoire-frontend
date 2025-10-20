// lib/api.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour AJOUTER le token aux requêtes
api.interceptors.request.use(
  (config) => {
    // Récupérer le token depuis le localStorage ou le contexte d'auth
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          // Si vous utilisez token-based auth
          if (user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
          }
          // Ou si vous utilisez session-based auth, ajouter le CSRF token
          const csrfToken = getCsrfToken();
          if (csrfToken) {
            config.headers['X-CSRFToken'] = csrfToken;
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Rediriger vers login si non authentifié
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    if (error.response?.status === 403) {
      console.error('Accès refusé - Permissions insuffisantes');
      // Vous pouvez rediriger ou afficher un message d'erreur
    }
    return Promise.reject(error);
  }
);

// Fonction pour récupérer le CSRF token (nécessaire pour Django)
function getCsrfToken() {
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