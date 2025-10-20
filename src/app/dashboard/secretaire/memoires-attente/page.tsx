'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../lib/api';
import { Memoire } from '../../../types';
import { Check, X, Eye, Download, Clock } from 'lucide-react';

export default function MemoiresAttente() {
  const { user } = useAuth();
  const [memoires, setMemoires] = useState<Memoire[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchMemoiresEnAttente();
  }, []);

  const fetchMemoiresEnAttente = async () => {
    try {
      const response = await api.get('/secretaire/memoires-en-attente/');
      setMemoires(response.data);
    } catch (error) {
      console.error('Error fetching memoires en attente:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValider = async (memoireId: number) => {
    setActionLoading(memoireId);
    try {
      await api.post(`/secretaire/valider-memoire/${memoireId}/`);
      setMemoires(memoires.filter(m => m.id !== memoireId));
    } catch (error) {
      console.error('Error validating memoire:', error);
      alert('Erreur lors de la validation du mémoire');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejeter = async (memoireId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir rejeter ce mémoire ? Cette action est irréversible.')) {
      return;
    }

    setActionLoading(memoireId);
    try {
      await api.post(`/secretaire/rejeter-memoire/${memoireId}/`);
      setMemoires(memoires.filter(m => m.id !== memoireId));
    } catch (error) {
      console.error('Error rejecting memoire:', error);
      alert('Erreur lors du rejet du mémoire');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded mb-4"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mémoires en Attente de Validation</h1>
          <p className="text-gray-600 mt-1">
            {memoires.length} mémoire(s) en attente de validation
          </p>
        </div>
      </div>

      {memoires.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun mémoire en attente</h3>
          <p className="text-gray-600">Tous les mémoires ont été validés.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {memoires.map((memoire) => (
            <div key={memoire.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {memoire.titre}
                  </h3>
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {memoire.resume}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500 mb-4">
                    <div>
                      <span className="font-medium">Auteur:</span>{' '}
                      {memoire.auteur.first_name} {memoire.auteur.last_name}
                    </div>
                    <div>
                      <span className="font-medium">Filière:</span> {memoire.filiere}
                    </div>
                    <div>
                      <span className="font-medium">Année:</span> {memoire.annee_soumission}
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-500">
                    <span className="flex items-center mr-4">
                      <Clock className="h-4 w-4 mr-1" />
                      Déposé le {new Date(memoire.date_soumission).toLocaleDateString('fr-FR')}
                    </span>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                      En attente de validation
                    </span>
                  </div>
                </div>

                <div className="ml-6 flex space-x-2">
                  <button
                    onClick={() => handleValider(memoire.id)}
                    disabled={actionLoading === memoire.id}
                    className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    title="Valider le mémoire"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                  
                  <button
                    onClick={() => handleRejeter(memoire.id)}
                    disabled={actionLoading === memoire.id}
                    className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                    title="Rejeter le mémoire"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {memoire.mots_cles && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Mots-clés:</span>
                  <p className="text-sm text-gray-600 mt-1">{memoire.mots_cles}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}