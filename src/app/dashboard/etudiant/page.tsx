'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import Link from 'next/link';
import { BookOpen, Download, Calendar, AlertTriangle, Plus, BarChart3 } from 'lucide-react';

interface EtudiantStats {
  mes_memoires: number;
  mes_memoires_publics: number;
  total_telechargements: number;
  jours_restants: number;
  date_expiration: string;
  dernier_memoire: {
    titre: string;
    resume: string;
    est_public: boolean;
    nb_telechargements: number;
    date_soumission: string;
  } | null;
}

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

export default function EtudiantDashboard() {
  const [stats, setStats] = useState<EtudiantStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEtudiantStats();
  }, []);

  const fetchEtudiantStats = async () => {
    try {
      const response = await api.get('/etudiant/dashboard/');
      if (response.data.error) {
        setError(response.data.error);
      } else {
        setStats(response.data);
      }
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.response?.data?.error || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const getJoursRestantsColor = (jours: number) => {
    if (jours > 3) return 'text-green-600';
    if (jours > 1) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/3 sm:w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-24 sm:h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 text-center max-w-2xl mx-auto">
          <AlertTriangle className="h-10 w-10 sm:h-12 sm:w-12 text-red-600 mx-auto mb-3 sm:mb-4" />
          <h2 className="text-lg sm:text-xl font-semibold text-red-800 mb-2">Compte expiré</h2>
          <p className="text-red-600 mb-4 text-sm sm:text-base">{error}</p>
          <p className="text-gray-600 text-sm sm:text-base">
            Votre compte a expiré le {stats?.date_expiration && new Date(stats.date_expiration).toLocaleDateString('fr-FR')}
          </p>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Contactez la secrétaire de votre entité pour prolonger votre compte.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Mon Tableau de bord</h1>
        {stats?.jours_restants !== undefined && (
          <p className={`text-base sm:text-lg font-semibold mt-1 ${getJoursRestantsColor(stats.jours_restants)}`}>
            {stats.jours_restants > 0 
              ? `${stats.jours_restants} jours restants (expire le ${new Date(stats.date_expiration).toLocaleDateString('fr-FR')})`
              : 'Compte expiré'
            }
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Mes mémoires</p>
              <p className="text-xl sm:text-2xl font-semibold text-blue-600">
                {stats?.mes_memoires || 0}
              </p>
            </div>
            <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
          </div>
          <Link 
            href="/dashboard/etudiant/mes-memoires" 
            className="text-blue-600 hover:text-blue-500 text-xs sm:text-sm mt-2 inline-block"
          >
            Voir mes mémoires →
          </Link>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Mémoires publics</p>
              <p className="text-xl sm:text-2xl font-semibold text-green-600">
                {stats?.mes_memoires_publics || 0}
              </p>
            </div>
            <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Téléchargements totaux</p>
              <p className="text-xl sm:text-2xl font-semibold text-purple-600">
                {stats?.total_telechargements || 0}
              </p>
            </div>
            <Download className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 flex-shrink-0" />
          </div>
          <Link 
            href="/dashboard/etudiant/statistiques" 
            className="text-purple-600 hover:text-purple-500 text-xs sm:text-sm mt-2 inline-block"
          >
            Voir détails →
          </Link>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Jours restants</p>
              <p className={`text-xl sm:text-2xl font-semibold ${getJoursRestantsColor(stats?.jours_restants || 0)}`}>
                {stats?.jours_restants || 0}
              </p>
            </div>
            <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Link
          href="/dashboard/etudiant/deposer-memoire"
          className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
        >
          <div className="flex items-center mb-3 sm:mb-4">
            <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
            <h3 className="text-base sm:text-lg font-semibold">Déposer un mémoire</h3>
          </div>
          <p className="text-gray-600 text-sm sm:text-base">
            Soumettre un nouveau mémoire pour validation par la secrétaire
          </p>
        </Link>

        <Link
          href="/dashboard/etudiant/statistiques"
          className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
        >
          <div className="flex items-center mb-3 sm:mb-4">
            <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mr-2 sm:mr-3 flex-shrink-0" />
            <h3 className="text-base sm:text-lg font-semibold">Mes statistiques</h3>
          </div>
          <p className="text-gray-600 text-sm sm:text-base">
            Voir les statistiques de téléchargement de mes mémoires
          </p>
        </Link>
      </div>

      {/* Dernier mémoire */}
      {stats?.dernier_memoire && (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Dernier mémoire déposé</h3>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                {stats.dernier_memoire.titre}
              </h4>
              <p className="text-gray-600 text-xs sm:text-sm mt-1 line-clamp-2">
                {stats.dernier_memoire.resume}
              </p>
              <div className="flex flex-wrap items-center mt-2 gap-2 text-xs sm:text-sm text-gray-500">
                <span className={`inline-flex px-2 py-1 rounded ${
                  stats.dernier_memoire.est_public 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {stats.dernier_memoire.est_public ? 'Public' : 'En attente de validation'}
                </span>
                <span className="hidden sm:inline">•</span>
                <span>{stats.dernier_memoire.nb_telechargements} téléchargements</span>
                <span className="hidden sm:inline">•</span>
                <span>Déposé le {new Date(stats.dernier_memoire.date_soumission).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message d'information pour mobile */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4 sm:hidden">
        <p className="text-xs text-gray-600 text-center">
          Faites défiler horizontalement pour voir toutes les statistiques
        </p>
      </div>
    </div>
  );
}