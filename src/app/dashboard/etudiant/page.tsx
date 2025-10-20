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
  dernier_memoire: any;
}

export default function EtudiantDashboard() {
  const { user } = useAuth();
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
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Compte expiré</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-gray-600">
            Votre compte a expiré le {stats?.date_expiration && new Date(stats.date_expiration).toLocaleDateString('fr-FR')}
          </p>
          <p className="text-gray-600 mt-2">
            Contactez la secrétaire de votre entité pour prolonger votre compte.
          </p>
        </div>
      </div>
    );
  }

  const getJoursRestantsColor = (jours: number) => {
    if (jours > 3) return 'text-green-600';
    if (jours > 1) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mon Tableau de bord</h1>
        {stats?.jours_restants !== undefined && (
          <p className={`text-lg font-semibold mt-1 ${getJoursRestantsColor(stats.jours_restants)}`}>
            {stats.jours_restants > 0 
              ? `${stats.jours_restants} jours restants (expire le ${new Date(stats.date_expiration).toLocaleDateString('fr-FR')})`
              : 'Compte expiré'
            }
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mes mémoires</p>
              <p className="text-2xl font-semibold text-blue-600">
                {stats?.mes_memoires || 0}
              </p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-600" />
          </div>
          <Link href="/dashboard/etudiant/mes-memoires" className="text-blue-600 hover:text-blue-500 text-sm mt-2 inline-block">
            Voir mes mémoires →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mémoires publics</p>
              <p className="text-2xl font-semibold text-green-600">
                {stats?.mes_memoires_publics || 0}
              </p>
            </div>
            <BookOpen className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Téléchargements totaux</p>
              <p className="text-2xl font-semibold text-purple-600">
                {stats?.total_telechargements || 0}
              </p>
            </div>
            <Download className="h-8 w-8 text-purple-600" />
          </div>
          <Link href="/dashboard/etudiant/statistiques" className="text-purple-600 hover:text-purple-500 text-sm mt-2 inline-block">
            Voir détails →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Jours restants</p>
              <p className={`text-2xl font-semibold ${getJoursRestantsColor(stats?.jours_restants || 0)}`}>
                {stats?.jours_restants || 0}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          href="/dashboard/etudiant/deposer-memoire"
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
        >
          <div className="flex items-center mb-4">
            <Plus className="h-8 w-8 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold">Déposer un mémoire</h3>
          </div>
          <p className="text-gray-600">
            Soumettre un nouveau mémoire pour validation par la secrétaire
          </p>
        </Link>

        <Link
          href="/dashboard/etudiant/statistiques"
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
        >
          <div className="flex items-center mb-4">
            <BarChart3 className="h-8 w-8 text-green-600 mr-3" />
            <h3 className="text-lg font-semibold">Mes statistiques</h3>
          </div>
          <p className="text-gray-600">
            Voir les statistiques de téléchargement de mes mémoires
          </p>
        </Link>
      </div>

      {/* Dernier mémoire */}
      {stats?.dernier_memoire && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Dernier mémoire déposé</h3>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{stats.dernier_memoire.titre}</h4>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {stats.dernier_memoire.resume}
              </p>
              <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                <span className={`inline-flex px-2 py-1 rounded text-xs ${
                  stats.dernier_memoire.est_public 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {stats.dernier_memoire.est_public ? 'Public' : 'En attente de validation'}
                </span>
                <span>•</span>
                <span>{stats.dernier_memoire.nb_telechargements} téléchargements</span>
                <span>•</span>
                <span>Déposé le {new Date(stats.dernier_memoire.date_soumission).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}