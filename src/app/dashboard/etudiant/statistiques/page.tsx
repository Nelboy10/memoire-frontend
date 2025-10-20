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

export default function StatistiquesPersonnelles() {
  const { user } = useAuth();
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
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Compte expiré</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-gray-600">
            Contactez la secrétaire de votre entité pour prolonger votre compte.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const memoiresPopulaires = stats?.memoires_par_popularite || [];
  const maxTelechargements = Math.max(...memoiresPopulaires.map(m => m.nb_telechargements), 1);

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Link
          href="/dashboard/etudiant"
          className="mr-4 p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Statistiques</h1>
          <p className="text-gray-600 mt-1">Performance de vos mémoires</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Mémoires</p>
              <p className="text-2xl font-semibold text-blue-600">
                {stats?.total_memoires || 0}
              </p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Téléchargements Totaux</p>
              <p className="text-2xl font-semibold text-green-600">
                {stats?.total_telechargements || 0}
              </p>
            </div>
            <Download className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mémoires Publics</p>
              <p className="text-2xl font-semibold text-purple-600">
                {stats?.memoires_publics || 0}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Mémoires par popularité */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Mémoires par Popularité
        </h3>

        {memoiresPopulaires.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucun mémoire avec des téléchargements</p>
          </div>
        ) : (
          <div className="space-y-4">
            {memoiresPopulaires.map((memoire) => (
              <div key={memoire.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{memoire.titre}</h4>
                  <div className="flex items-center mt-1 space-x-4 text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded text-xs ${
                      memoire.est_public 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {memoire.est_public ? 'Public' : 'En attente'}
                    </span>
                    <span>{memoire.nb_telechargements} téléchargement(s)</span>
                  </div>
                </div>
                
                <div className="w-32 bg-gray-200 rounded-full h-2">
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
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Taux de conversion</h4>
          <p className="text-2xl font-semibold text-blue-600">
            {stats?.total_memoires ? Math.round((stats.total_telechargements / stats.total_memoires) * 100) : 0}%
          </p>
          <p className="text-sm text-blue-700">
            Téléchargements moyens par mémoire
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-800 mb-2">Taux de publication</h4>
          <p className="text-2xl font-semibold text-green-600">
            {stats?.total_memoires ? Math.round((stats.memoires_publics / stats.total_memoires) * 100) : 0}%
          </p>
          <p className="text-sm text-green-700">
            Mémoires validés et publics
          </p>
        </div>
      </div>
    </div>
  );
}