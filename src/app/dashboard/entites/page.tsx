'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { Entite } from '../../types';
import { Building, Plus, Edit, Trash2, Users } from 'lucide-react';

interface ApiError {
  response?: {
    status: number;
    data?: {
      error?: string;
    };
  };
}

export default function EntitesPage() {
  const { user } = useAuth();
  const [entites, setEntites] = useState<Entite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    description: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'admin_general') {
      fetchEntites();
    }
  }, [user]);

  const fetchEntites = async () => {
    try {
      setError('');
      const response = await api.get('/entites/');
      
      // Gestion de différentes structures de réponse
      let entitesData = response.data;
      
      // Si la réponse est paginée (structure commune avec 'results')
      if (response.data && Array.isArray(response.data.results)) {
        entitesData = response.data.results;
      }
      // Si la réponse a une propriété 'data'
      else if (response.data && Array.isArray(response.data.data)) {
        entitesData = response.data.data;
      }
      // Si response.data n'est pas un tableau
      else if (!Array.isArray(response.data)) {
        console.error('Expected array but got:', typeof response.data, response.data);
        setEntites([]);
        setLoading(false);
        return;
      }
      
      // S'assurer que les données sont bien un tableau
      if (Array.isArray(entitesData)) {
        setEntites(entitesData);
      } else {
        console.error('Invalid data format after processing:', entitesData);
        setEntites([]);
      }
    } catch (err: unknown) {
      console.error('Error fetching entites:', err);
      const apiError = err as ApiError;
      if (apiError.response?.status === 403) {
        setError('Accès refusé. Vous n&apos;avez pas les permissions nécessaires.');
      } else {
        setError('Erreur lors du chargement des entités');
      }
      setEntites([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      
      if (editingId) {
        // Mode édition
        await api.put(`/entites/${editingId}/`, formData);
      } else {
        // Mode création
        await api.post('/entites/', formData);
      }
      
      setFormData({ nom: '', description: '' });
      setEditingId(null);
      setShowForm(false);
      fetchEntites();
    } catch (err: unknown) {
      console.error('Error saving entite:', err);
      const apiError = err as ApiError;
      if (apiError.response?.status === 403) {
        setError('Accès refusé. Vous n&apos;avez pas les permissions pour effectuer cette action.');
      } else {
        setError(`Erreur lors de ${editingId ? 'la modification' : 'la création'} de l&apos;entité`);
      }
    }
  };

  const handleEdit = (entite: Entite) => {
    setFormData({
      nom: entite.nom,
      description: entite.description || ''
    });
    setEditingId(entite.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({ nom: '', description: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette entité ?')) {
      return;
    }

    try {
      setError('');
      await api.delete(`/entites/${id}/`);
      setEntites(entites.filter(e => e.id !== id));
    } catch (err: unknown) {
      console.error('Error deleting entite:', err);
      const apiError = err as ApiError;
      if (apiError.response?.status === 403) {
        setError('Accès refusé. Vous n&apos;avez pas les permissions pour supprimer cette entité.');
      } else {
        setError('Erreur lors de la suppression');
      }
    }
  };

  if (user?.role !== 'admin_general') {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Accès non autorisé. Réservé aux administrateurs généraux.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Entités</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouvelle Entité
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Modifier l&apos;Entité' : 'Nouvelle Entité'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de l&apos;entité *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingId ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Entités List */}
      {!Array.isArray(entites) || entites.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune entité</h3>
          <p className="text-gray-500 mb-4">
            Commencez par créer votre première entité.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Créer une entité
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entites.map((entite) => (
            <div key={entite.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <Building className="h-8 w-8 text-blue-600" />
                <div className="flex space-x-2">
                  <button 
                    className="text-blue-600 hover:text-blue-900 p-1"
                    onClick={() => handleEdit(entite)}
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(entite.id)}
                    className="text-red-600 hover:text-red-900 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {entite.nom}
              </h3>
              {entite.description && (
                <p className="text-gray-600 text-sm mb-4">
                  {entite.description}
                </p>
              )}
              <div className="flex items-center text-sm text-gray-500">
                <Users className="h-4 w-4 mr-1" />
                Utilisateurs: {entite.utilisateurs_count || 0}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}