'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import Link from 'next/link';
import { Users, BookOpen, Download, Clock, Plus, Check, X, Calendar, AlertTriangle } from 'lucide-react';

interface SecretaireStats {
  entite: string;
  memoires_en_attente: number;
  memoires_ce_mois: number;
  telechargements_ce_mois: number;
  etudiants_actifs: number;
  etudiants_expires_recent: number;
  total_memoires: number;
}

export default function SecretaireDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<SecretaireStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSecretaireStats();
  }, []);

  const fetchSecretaireStats = async () => {
    try {
      const response = await api.get('/secretaire/dashboard/');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching secretaire stats:', error);
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Tableau de bord Secrétaire - {stats?.entite}
        </h1>
        <p className="text-gray-600 mt-1">Gestion des mémoires et des comptes étudiants</p>
      </div>

      {/* Alert si pas d'entité */}
      {!user?.entite && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <p className="text-yellow-800">
              Vous n'êtes pas assigné à une entité. Contactez l'administrateur.
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mémoires en attente</p>
              <p className="text-2xl font-semibold text-yellow-600">
                {stats?.memoires_en_attente || 0}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
          <Link href="/dashboard/secretaire/memoires-attente" className="text-blue-600 hover:text-blue-500 text-sm mt-2 inline-block">
            Voir la liste →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mémoires ce mois</p>
              <p className="text-2xl font-semibold text-blue-600">
                {stats?.memoires_ce_mois || 0}
              </p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Téléchargements ce mois</p>
              <p className="text-2xl font-semibold text-green-600">
                {stats?.telechargements_ce_mois || 0}
              </p>
            </div>
            <Download className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Étudiants actifs</p>
              <p className="text-2xl font-semibold text-purple-600">
                {stats?.etudiants_actifs || 0}
              </p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
          <Link href="/dashboard/secretaire/etudiants" className="text-blue-600 hover:text-blue-500 text-sm mt-2 inline-block">
            Gérer les comptes →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/dashboard/secretaire/memoires-attente"
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
        >
          <div className="flex items-center mb-4">
            <Clock className="h-8 w-8 text-yellow-600 mr-3" />
            <h3 className="text-lg font-semibold">Mémoires en attente</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Valider ou rejeter les mémoires soumis par les étudiants
          </p>
          <div className="flex items-center text-yellow-600">
            <span>{stats?.memoires_en_attente || 0} en attente</span>
          </div>
        </Link>

        <Link
          href="/dashboard/secretaire/creer-compte"
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
        >
          <div className="flex items-center mb-4">
            <Plus className="h-8 w-8 text-green-600 mr-3" />
            <h3 className="text-lg font-semibold">Créer un compte étudiant</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Créer un nouveau compte étudiant temporaire (4 jours)
          </p>
          <div className="flex items-center text-green-600">
            <span>Nouveau compte</span>
          </div>
        </Link>

        <Link
          href="/dashboard/secretaire/etudiants-expires"
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
        >
          <div className="flex items-center mb-4">
            <Calendar className="h-8 w-8 text-red-600 mr-3" />
            <h3 className="text-lg font-semibold">Comptes expirés</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Consulter et prolonger les comptes étudiants expirés
          </p>
          <div className="flex items-center text-red-600">
            <span>{stats?.etudiants_expires_recent || 0} récents</span>
          </div>
        </Link>
      </div>
    </div>
  );
}