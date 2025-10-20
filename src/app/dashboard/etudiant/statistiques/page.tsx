'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../lib/api';
import { Memoire } from '../../../types';
import { BarChart3, Download, BookOpen, TrendingUp, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface StatistiquesPersonnelles {
  total_memoires: number;
  total_telechargements: number;
  memoires_publics: number;
  memoires_par_popularite: Memoire[];
}

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

export default function StatistiquesPersonnelles() {
  const [stats, setStats] = useState<StatistiquesPersonnelles | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStatistiques();
  }, []);

  const fetchStatistiques = async () => {
    try {
      const response = await api.get('/etudiant/statistiques/');
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

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 text-center max-w-2xl mx-auto">
          <h2 className="text-lg sm:text-xl font-semibold text-red-800 mb-2">Compte expiré</h2>
          <p className="text-red-600 mb-4 text-sm sm:text-base">{error}</p>
          <p className="text-gray-600 text-sm sm:text-base">
            Contactez la secrétaire de votre entité pour prolonger votre compte.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/3 sm:w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-24 sm:h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const memoiresPopulaires = stats?.memoires_par_popularite || [];
  const maxTelechargements = Math.max(...memoiresPopulaires.map(m => m.nb_telechargements), 1);

  return (
    <div className="p-4 sm:p-6">
      {/* Header avec navigation */}
      <div className="flex items-center mb-6">
        <Link
          href="/dashboard/etudiant"
          className="mr-3 sm:mr-4 p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Mes Statistiques</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Performance de vos mémoires</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Mémoires</p>
              <p className="text-xl sm:text-2xl font-semibold text-blue-600">
                {stats?.total_memoires || 0}
              </p>
            </div>
            <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Téléchargements Totaux</p>
              <p className="text-xl sm:text-2xl font-semibold text-green-600">
                {stats?.total_telechargements || 0}
              </p>
            </div>
            <Download className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Mémoires Publics</p>
              <p className="text-xl sm:text-2xl font-semibold text-purple-600">
                {stats?.memoires_publics || 0}
              </p>
            </div>
            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Mémoires par popularité */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mb-6">
        <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 flex items-center">
          <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
          Mémoires par Popularité
        </h3>

        {memoiresPopulaires.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <p className="text-gray-500 text-sm sm:text-base">Aucun mémoire avec des téléchargements</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {memoiresPopulaires.map((memoire) => (
              <div key={memoire.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                    {memoire.titre}
                  </h4>
                  <div className="flex flex-wrap items-center mt-1 gap-2 text-xs sm:text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded ${
                      memoire.est_public 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {memoire.est_public ? 'Public' : 'En attente'}
                    </span>
                    <span>{memoire.nb_telechargements} téléchargement(s)</span>
                  </div>
                </div>
                
                <div className="w-full sm:w-32 bg-gray-200 rounded-full h-2 flex-shrink-0">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${(memoire.nb_telechargements / maxTelechargements) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Résumé des performances */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2 text-sm sm:text-base">Taux de conversion</h4>
          <p className="text-xl sm:text-2xl font-semibold text-blue-600">
            {stats?.total_memoires ? Math.round((stats.total_telechargements / stats.total_memoires) * 100) : 0}%
          </p>
          <p className="text-xs sm:text-sm text-blue-700">
            Téléchargements moyens par mémoire
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-800 mb-2 text-sm sm:text-base">Taux de publication</h4>
          <p className="text-xl sm:text-2xl font-semibold text-green-600">
            {stats?.total_memoires ? Math.round((stats.memoires_publics / stats.total_memoires) * 100) : 0}%
          </p>
          <p className="text-xs sm:text-sm text-green-700">
            Mémoires validés et publics
          </p>
        </div>
      </div>

      {/* Message d'information pour mobile */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4 sm:hidden">
        <p className="text-xs text-gray-600 text-center">
          Faites défiler horizontalement pour voir toutes les informations
        </p>
      </div>
    </div>
  );
}