'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import Link from 'next/link';
import { Memoire, Entite } from '../../types';
import { Search, Plus, Download, Filter, BookOpen, Mail, Users, FileText, TrendingUp, Clock } from 'lucide-react';

interface Stats {
  total_memoires: number;
  total_telechargements: number;
  memoires_publics: number;
  total_etudiants: number;
}

interface ApiError {
  response?: {
    status?: number;
    data?: {
      error?: string;
      message?: string;
      email_sent?: boolean;
    };
  };
}

export default function Memoires() {
  const { user } = useAuth();
  const [memoires, setMemoires] = useState<Memoire[]>([]);
  const [entites, setEntites] = useState<Entite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    filiere: '',
    annee: '',
    entite: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [downloading, setDownloading] = useState<number | null>(null);
  const [stats, setStats] = useState<Stats>({
    total_memoires: 0,
    total_telechargements: 0,
    memoires_publics: 0,
    total_etudiants: 0
  });

  useEffect(() => {
    fetchMemoires();
    fetchEntites();
    if (user?.role === 'admin_general' || user?.role === 'admin_entite') {
      fetchStats();
    }
  }, [user]);

  const fetchMemoires = async () => {
    try {
      const endpoint = user?.role === 'etudiant' ? 'etudiant/mes-memoires/' : 'memoires/public/';
      const response = await api.get(endpoint);
      setMemoires(response.data.results || response.data);
    } catch (err) {
      console.error('Error fetching memoires:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEntites = async () => {
    try {
      const response = await api.get('entites/');
      setEntites(response.data.results || response.data);
    } catch (err) {
      console.error('Error fetching entites:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('dashboard/stats/');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (filters.filiere) params.append('filiere', filters.filiere);
      if (filters.annee) params.append('annee', filters.annee);
      if (filters.entite) params.append('entite', filters.entite);

      const response = await api.get(`memoires/search/?${params}`);
      setMemoires(response.data.results || response.data);
    } catch (err) {
      console.error('Error searching memoires:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (memoireId: number, useDirectDownload = false) => {
    setDownloading(memoireId);
    
    try {
      if (useDirectDownload) {
        const downloadUrl = `/api/memoires/public/memoires/${memoireId}/telecharger/`;
        window.open(downloadUrl, '_blank');
      } else {
        const email = user?.email || prompt('Veuillez entrer votre email pour recevoir le lien de téléchargement:');
        if (!email) {
          setDownloading(null);
          return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          alert('Veuillez entrer une adresse email valide');
          setDownloading(null);
          return;
        }

        const response = await api.post(`memoires/${memoireId}/download/`, { email });
        
        if (response.data.email_sent) {
          alert(`✅ ${response.data.message}\n\nVérifiez votre boîte email (y compris les spams).`);
        } else {
          alert(`❌ ${response.data.message || 'Erreur lors de l&apos;envoi de l&apos;email'}`);
        }
      }

      fetchMemoires();
      
    } catch (err: unknown) {
      console.error('Download error:', err);
      const apiError = err as ApiError;
      
      if (apiError.response?.status === 400) {
        alert(apiError.response?.data?.error ?? 'Données invalides');
      } else if (apiError.response?.status === 404) {
        alert('Mémoire non trouvé');
      } else {
        alert(apiError.response?.data?.error ?? 'Erreur lors de la demande de téléchargement');
      }
    } finally {
      setDownloading(null);
    }
  };

  const resetFilters = () => {
    setFilters({ filiere: '', annee: '', entite: '' });
    setSearchQuery('');
    fetchMemoires();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const canViewStats = user?.role === 'admin_general' || user?.role === 'admin_entite';

  if (loading && memoires.length === 0) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/3 sm:w-1/4 mb-6"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 sm:h-20 bg-gray-200 rounded mb-4"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          {user?.role === 'etudiant' ? 'Mes Mémoires' : 'Mémoires'}
        </h1>
        {user?.role === 'etudiant' && (
          <Link
            href="/dashboard/memoires/ajouter"
            className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
            Déposer un mémoire
          </Link>
        )}
      </div>

      {/* Statistiques pour les administrateurs */}
      {canViewStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Mémoires</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total_memoires}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Download className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Téléchargements</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total_telechargements}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 flex-shrink-0" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Mémoires Publics</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.memoires_publics}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 flex-shrink-0" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Étudiants</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total_etudiants}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barre de recherche */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher par titre, auteur, mot-clé..."
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center transition-colors text-sm sm:text-base flex-1 sm:flex-none"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  <span className="hidden sm:inline">Recherche...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 flex-shrink-0" />
                  <span className="hidden sm:inline">Rechercher</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="border border-gray-300 text-gray-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center justify-center transition-colors text-sm sm:text-base"
            >
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">Filtres</span>
            </button>
          </div>
        </div>

        {/* Filtres avancés */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Filière
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                value={filters.filiere}
                onChange={(e) => setFilters({...filters, filiere: e.target.value})}
                placeholder="Informatique, Gestion..."
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Année
              </label>
              <input
                type="number"
                min="2000"
                max={new Date().getFullYear()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                value={filters.annee}
                onChange={(e) => setFilters({...filters, annee: e.target.value})}
                placeholder="2023, 2024..."
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Entité
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                value={filters.entite}
                onChange={(e) => setFilters({...filters, entite: e.target.value})}
              >
                <option value="">Toutes les entités</option>
                {entites.map((entite) => (
                  <option key={entite.id} value={entite.id}>
                    {entite.nom}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3 flex justify-end">
              <button
                type="button"
                onClick={resetFilters}
                className="px-3 sm:px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Liste des mémoires */}
      <div className="bg-white rounded-lg shadow-sm border">
        {memoires.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <p className="text-gray-500 text-sm sm:text-base">Aucun mémoire trouvé</p>
            {user?.role === 'etudiant' && (
              <Link
                href="/dashboard/memoires/ajouter"
                className="text-blue-600 hover:text-blue-500 mt-2 inline-block text-sm sm:text-base"
              >
                Déposer le premier mémoire
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {memoires.map((memoire) => (
              <div key={memoire.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 gap-2">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2">
                        {memoire.titre}
                      </h3>
                      {!memoire.est_public && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs flex-shrink-0 self-start">
                          En attente de validation
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2 line-clamp-2 text-sm sm:text-base">
                      {memoire.resume}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center text-xs sm:text-sm text-gray-500 gap-1 sm:gap-2 mb-2">
                      <span>Auteur: {memoire.auteur.first_name} {memoire.auteur.last_name}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>Filière: {memoire.filiere}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>Année: {memoire.annee_soumission}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500">
                      <span className="flex items-center">
                        <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                        {memoire.nb_telechargements} téléchargements
                      </span>
                      {memoire.est_public && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          Public
                        </span>
                      )}
                      <span className="text-gray-400">
                        Déposé le {formatDate(memoire.date_soumission)}
                      </span>
                    </div>
                  </div>
                  <div className="flex sm:flex-col gap-2 self-end sm:self-start">
                    {/* Bouton de téléchargement direct */}
                    <button
                      onClick={() => handleDownload(memoire.id, true)}
                      disabled={downloading === memoire.id}
                      className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center text-xs sm:text-sm transition-colors flex-1 sm:flex-none justify-center"
                    >
                      <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                      <span className="hidden sm:inline">Télécharger</span>
                    </button>
                    
                    {/* Bouton de réception par email */}
                    <button
                      onClick={() => handleDownload(memoire.id, false)}
                      disabled={downloading === memoire.id}
                      className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center text-xs sm:text-sm transition-colors flex-1 sm:flex-none justify-center"
                    >
                      {downloading === memoire.id ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-1 sm:mr-2"></div>
                          <span className="hidden sm:inline">Envoi...</span>
                        </>
                      ) : (
                        <>
                          <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                          <span className="hidden sm:inline">Recevoir</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Information sur le système de téléchargement */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-800 mb-1 text-sm sm:text-base">Système de téléchargement</h3>
            <p className="text-xs sm:text-sm text-blue-700 mb-2">
              <strong>Téléchargement direct :</strong> Disponible pour tous les mémoires publics. 
              Le fichier s&apos;ouvrira directement dans votre navigateur.
            </p>
            <p className="text-xs sm:text-sm text-blue-700">
              <strong>Reception par email :</strong> Le mémoire vous sera envoyé par email avec le fichier en pièce jointe. 
              Idéal pour une consultation ultérieure.
            </p>
          </div>
        </div>
      </div>

      {/* Avertissement pour les comptes étudiants expirés */}
      {user?.role === 'etudiant' && user.date_expiration && new Date(user.date_expiration) < new Date() && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-800 mb-1 text-sm sm:text-base">Compte expiré</h3>
              <p className="text-xs sm:text-sm text-red-700">
                Votre compte étudiant a expiré le {formatDate(user.date_expiration)}. 
                Veuillez contacter la secrétaire de votre entité pour le renouveler.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}