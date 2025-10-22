// types/index.ts

// Interfaces principales
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'etudiant' | 'admin_entite' | 'admin_general' | 'secretaire';
  entite?: Entite;
  entite_nom?: string; // Pour faciliter l'accès au nom de l'entité
  date_expiration?: string;
  is_active: boolean;
  date_joined: string;
  last_login?: string;
}

export interface Entite {
  id: number;
  nom: string;
  description?: string;
  utilisateurs_count?: number;
  memoires_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Memoire {
  id: number;
  titre: string;
  resume: string;
  mots_cles: string;
  fichier: string;
  fichier_url?: string; // URL complète du fichier
  date_soumission: string;
  annee_soumission: string;
  filiere: string;
  est_public: boolean;
  nb_telechargements: number;
  auteur: User;
  entite: Entite;
  nom_auteur?: string; // Nom complet de l'auteur pour faciliter l'affichage
}

export interface DownloadLog {
  id: number;
  email: string;
  date_telechargement: string;
  memoire: Memoire;
  entite: Entite;
  user_agent?: string;
  ip_address?: string;
}

export interface Statistiques {
  id: number;
  entite?: Entite;
  date_debut: string;
  date_fin: string;
  total_memoires: number;
  total_telechargements: number;
  memoires_publics: number;
  etudiants_actifs: number;
  created_at: string;
}

// Interfaces pour l'authentification
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  entite?: number;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
  message: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

// Interfaces pour les requêtes de recherche
export interface MemoireSearchParams {
  q?: string;
  filiere?: string;
  annee?: string;
  entite?: string;
  page?: number;
  page_size?: number;
}

export interface UserSearchParams {
  q?: string;
  role?: string;
  entite?: string;
  is_active?: boolean;
  page?: number;
  page_size?: number;
}

// Interfaces pour les réponses paginées
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
  page?: number;
  total_pages?: number;
}

// Interfaces pour les formulaires
export interface MemoireFormData {
  titre: string;
  resume: string;
  mots_cles: string;
  fichier: File | null;
  annee_soumission: string;
  filiere: string;
  est_public: boolean;
}

export interface UserFormData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: User['role'];
  entite?: number;
  password?: string;
  is_active: boolean;
}

export interface PasswordChangeData {
  old_password: string;
  new_password1: string;
  new_password2: string;
}

// Interfaces pour les tableaux de bord
export interface DashboardStats {
  total_users?: number;
  total_memoires: number;
  total_telechargements: number;
  memoires_publics: number;
  total_etudiants?: number;
  etudiants_expires?: number;
  entite?: string;
  etudiants_actifs?: number;
  etudiants_expires_recent?: number;
  memoires_en_attente?: number;
  memoires_ce_mois?: number;
  telechargements_ce_mois?: number;
  memoires_par_mois?: Array<{ mois: string; count: number }>;
  telechargements_par_mois?: Array<{ mois: string; count: number }>;
}

export interface SecretaireDashboardStats {
  entite: string;
  memoires_en_attente: number;
  memoires_ce_mois: number;
  telechargements_ce_mois: number;
  etudiants_actifs: number;
  etudiants_expires_recent: number;
  total_memoires: number;
}

export interface EtudiantDashboardStats {
  mes_memoires: number;
  mes_memoires_publics: number;
  total_telechargements: number;
  jours_restants: number;
  date_expiration: string;
  dernier_memoire?: Memoire;
}

// Interfaces pour les réponses d'API
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  status: number;
}

export interface ErrorResponse {
  error: string;
  details?: Record<string, string[]>;
  status: number;
}

// Interfaces pour les filtres
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FiliereFilter extends FilterOption {}
export interface AnneeFilter extends FilterOption {}
export interface EntiteFilter extends FilterOption {}

// Interfaces pour les statistiques avancées
export interface MonthlyStats {
  mois: string;
  count: number;
}

export interface StatsComparison {
  current_period: number;
  previous_period: number;
  percentage_change: number;
}

export interface PopularMemoire extends Memoire {
  rank: number;
  growth: number;
}

// Interfaces pour les notifications et alertes
export interface Notification {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface SystemAlert {
  id: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
}

// Types utilitaires
export type UserRole = User['role'];

export type SortDirection = 'asc' | 'desc';

export interface SortOption {
  field: string;
  direction: SortDirection;
  label: string;
}

// Enums pour une meilleure typage
export enum UserRoles {
  ETUDIANT = 'etudiant',
  ADMIN_ENTITE = 'admin_entite',
  ADMIN_GENERAL = 'admin_general',
  SECRETAIRE = 'secretaire'
}

export enum MemoireStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PUBLIC = 'public'
}

export enum Filiere {
  INFORMATIQUE = 'Informatique',
  GENIE_CIVIL = 'Génie Civil',
  MANAGEMENT = 'Management',
  DROIT = 'Droit',
  MEDECINE = 'Médecine',
  AUTRE = 'Autre'
}

// Types pour les props des composants
export interface PageProps {
  params?: Record<string, string>;
  searchParams?: Record<string, string | string[]>;
}

export interface LayoutProps {
  children: React.ReactNode;
}

// Types pour les hooks personnalisés
export interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  refreshToken: () => Promise<void>;
}

export interface UseMemoiresReturn {
  memoires: Memoire[];
  isLoading: boolean;
  error: string | null;
  searchMemoires: (params: MemoireSearchParams) => Promise<void>;
  createMemoire: (data: MemoireFormData) => Promise<void>;
  updateMemoire: (id: number, data: Partial<MemoireFormData>) => Promise<void>;
  deleteMemoire: (id: number) => Promise<void>;
}

