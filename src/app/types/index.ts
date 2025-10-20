export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'etudiant' | 'admin_entite' | 'admin_general' | 'secretaire';
  entite?: Entite;
  date_expiration?: string;
  is_active: boolean;
  date_joined: string;
  
}

export interface Entite {
  id: number;
  nom: string;
  description?: string;
  utilisateurs_count?: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  message: string;
}
export interface Memoire {
  id: number;
  titre: string;
  resume: string;
  mots_cles: string;
  fichier: string;
  date_soumission: string;
  annee_soumission: string;
  filiere: string;
  est_public: boolean;
  nb_telechargements: number;
  auteur: User;
  entite: Entite;
}

export interface MemoireSearchParams {
  q?: string;
  filiere?: string;
  annee?: string;
  entite?: string;
}