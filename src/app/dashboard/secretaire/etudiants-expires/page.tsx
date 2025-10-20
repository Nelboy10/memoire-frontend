'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../lib/api';
import { User } from '../../../types';
import { Calendar, RefreshCw, User as UserIcon, Mail, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EtudiantsExpires() {
  const { user } = useAuth();
  const [etudiants, setEtudiants] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchEtudiantsExpires();
  }, []);

  const fetchEtudiantsExpires = async () => {
    try {
      const response = await api.get('/secretaire/etudiants-expires/');
      setEtudiants(response.data);
    } catch (error) {
      console.error('Error fetching expired students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProlonger = async (userId: number) => {
    setActionLoading(userId);
    try {
      const response = await api.post(`/secretaire/prolonger-compte/${userId}/`);
      setEtudiants(etudiants.filter(e => e.id !== userId));
      alert(`Compte prolongé jusqu'au ${new Date(response.data.nouvelle_date_expiration).toLocaleDateString('fr-FR')}`);
    } catch (error) {
      console.error('Error prolonging account:', error);
      alert('Erreur lors de la prolongation du compte');
    } finally {
      setActionLoading(null);
    }
  };

  const getDaysSinceExpiration = (dateExpiration: string) => {
    const expiration = new Date(dateExpiration);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - expiration.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded mb-4"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link
            href="/dashboard/secretaire"
            className="mr-4 p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Comptes Étudiants Expirés</h1>
            <p className="text-gray-600 mt-1">
              {etudiants.length} compte(s) étudiant(s) expiré(s)
            </p>
          </div>
        </div>
      </div>

      {etudiants.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Calendar className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun compte expiré</h3>
          <p className="text-gray-600">Tous les comptes étudiants sont actifs.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {etudiants.map((etudiant) => {
            const joursDepuisExpiration = getDaysSinceExpiration(etudiant.date_expiration!);
            
            return (
              <div key={etudiant.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {etudiant.first_name} {etudiant.last_name}
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        <span>{etudiant.email}</span>
                      </div>
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-2" />
                        <span>{etudiant.username}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Expiré le {new Date(etudiant.date_expiration!).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        joursDepuisExpiration <= 7 
                          ? 'bg-yellow-100 text-yellow-800'
                          : joursDepuisExpiration <= 30
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        <Clock className="h-3 w-3 mr-1" />
                        Expiré depuis {joursDepuisExpiration} jour(s)
                      </span>
                    </div>
                  </div>

                  <div className="ml-6">
                    <button
                      onClick={() => handleProlonger(etudiant.id)}
                      disabled={actionLoading === etudiant.id}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center transition-colors"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${actionLoading === etudiant.id ? 'animate-spin' : ''}`} />
                      {actionLoading === etudiant.id ? 'Prolongation...' : 'Prolonger 4 jours'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Information sur la prolongation */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Information sur la prolongation</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• La prolongation ajoute 4 jours supplémentaires au compte étudiant</li>
          <li>• L'étudiant pourra à nouveau déposer des mémoires</li>
          <li>• Les mémoires déjà déposés restent accessibles</li>
          <li>• Vous pouvez prolonger un compte autant de fois que nécessaire</li>
        </ul>
      </div>
    </div>
  );
}