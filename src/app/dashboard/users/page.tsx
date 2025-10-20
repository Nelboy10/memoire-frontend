'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { User, Entite } from '../../types';
import { Users, Plus, Edit, Trash2, Search, Mail, User as UserIcon, MapPin, Shield, UserCheck } from 'lucide-react';

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [entites, setEntites] = useState<Entite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '', // Ajout du mot de passe pour la création
    role: 'etudiant',
    entite: '',
    is_active: true
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchEntites();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users/');
      // Gestion de différentes structures de réponse
      const usersData = response.data.results || response.data || [];
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Erreur lors du chargement des utilisateurs');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEntites = async () => {
    try {
      const response = await api.get('/entites/');
      const entitesData = response.data.results || response.data || [];
      setEntites(Array.isArray(entitesData) ? entitesData : []);
    } catch (error) {
      console.error('Error fetching entites:', error);
      setEntites([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');

      // Préparer les données pour l'API
      const submitData: any = {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
        is_active: formData.is_active
      };

      // Ajouter le mot de passe seulement pour la création
      if (!editingUser && formData.password) {
        submitData.password = formData.password;
      }

      // Ajouter l'entité seulement si le rôle n'est pas admin_general
      if (formData.role !== 'admin_general' && formData.entite) {
        submitData.entite = parseInt(formData.entite);
      }

      if (editingUser) {
        // Modification - utiliser PATCH pour les mises à jour partielles
        await api.patch(`/users/${editingUser.id}/`, submitData);
        setSuccess('Utilisateur modifié avec succès');
      } else {
        // Création
        await api.post('/users/', submitData);
        setSuccess('Utilisateur créé avec succès');
      }

      // Réinitialiser le formulaire
      setFormData({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        role: 'etudiant',
        entite: '',
        is_active: true
      });
      setEditingUser(null);
      setShowForm(false);
      fetchUsers(); // Recharger la liste
    } catch (error: any) {
      console.error('Error saving user:', error);
      
      // Debug détaillé
      console.log('Données envoyées:', {
        ...formData,
        entite: formData.role !== 'admin_general' ? parseInt(formData.entite) : null
      });
      
      if (error.response?.data) {
        // Afficher les erreurs de validation Django
        const errors = error.response.data;
        if (typeof errors === 'object') {
          const errorMessages = Object.values(errors).flat().join(', ');
          setError(`Erreur de validation: ${errorMessages}`);
        } else {
          setError(errors.error || errors.message || 'Erreur lors de l\'enregistrement');
        }
      } else {
        setError(`Erreur lors de ${editingUser ? 'la modification' : 'la création'} de l'utilisateur`);
      }
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      password: '', // Ne pas afficher le mot de passe existant
      role: user.role,
      entite: user.entite?.id?.toString() || '',
      is_active: user.is_active
    });
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setFormData({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      role: 'etudiant',
      entite: '',
      is_active: true
    });
    setEditingUser(null);
    setShowForm(false);
    setError('');
    setSuccess('');
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    try {
      await api.delete(`/users/${userId}/`);
      setUsers(users.filter(u => u.id !== userId));
      setSuccess('Utilisateur supprimé avec succès');
    } catch (error: any) {
      console.error('Error deleting user:', error);
      if (error.response?.status === 404) {
        setError('Utilisateur non trouvé');
      } else if (error.response?.status === 403) {
        setError('Accès refusé');
      } else {
        setError('Erreur lors de la suppression');
      }
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      const newStatus = !user.is_active;
      await api.patch(`/users/${user.id}/`, { is_active: newStatus });
      setUsers(users.map(u => u.id === user.id ? { ...u, is_active: newStatus } : u));
      setSuccess(`Utilisateur ${newStatus ? 'activé' : 'désactivé'} avec succès`);
    } catch (error: any) {
      console.error('Error toggling user active status:', error);
      setError('Erreur lors de la modification du statut');
    }
  };

  // Filtrage des utilisateurs selon le rôle
  const getFilteredUsers = () => {
    let filtered = users;

    // Admin Entité ne voit que les utilisateurs de son entité
    if (currentUser?.role === 'admin_entite') {
      filtered = filtered.filter(user => 
        user.entite?.id === currentUser.entite?.id || user.role === 'admin_general'
      );
    }

    // Filtre de recherche
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin_general': return 'bg-purple-100 text-purple-800';
      case 'admin_entite': return 'bg-blue-100 text-blue-800';
      case 'secretaire': return 'bg-green-100 text-green-800';
      case 'etudiant': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin_general': return <Shield className="h-4 w-4" />;
      case 'admin_entite': return <UserCheck className="h-4 w-4" />;
      case 'secretaire': return <Mail className="h-4 w-4" />;
      case 'etudiant': return <Users className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const filteredUsers = getFilteredUsers();

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded mb-4"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
        {(currentUser?.role === 'admin_general' || currentUser?.role === 'admin_entite') && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouvel Utilisateur
          </button>
        )}
      </div>

      {/* Messages d'alerte */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Formulaire de création/édition */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingUser ? 'Modifier l\'Utilisateur' : 'Nouvel Utilisateur'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom d'utilisateur *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {!editingUser && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe *
                </label>
                <input
                  type="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 8 caractères"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rôle *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  {currentUser?.role === 'admin_general' ? (
                    <>
                      <option value="etudiant">Étudiant</option>
                      <option value="secretaire">Secrétaire</option>
                      <option value="admin_entite">Admin Entité</option>
                      <option value="admin_general">Admin Général</option>
                    </>
                  ) : (
                    <>
                      <option value="etudiant">Étudiant</option>
                      <option value="secretaire">Secrétaire</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entité {formData.role !== 'admin_general' && '*'}
                </label>
                <select
                  required={formData.role !== 'admin_general'}
                  disabled={formData.role === 'admin_general'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.entite}
                  onChange={(e) => setFormData({ ...formData, entite: e.target.value })}
                >
                  <option value="">Sélectionner une entité</option>
                  {entites.map(entite => (
                    <option key={entite.id} value={entite.id}>
                      {entite.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {editingUser && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  Compte actif
                </label>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
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
                {editingUser ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div className="bg-white rounded-lg shadow-sm border">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  {(currentUser?.role === 'admin_general' || currentUser?.role === 'admin_entite') && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <UserIcon className="h-3 w-3 mr-1" />
                          {user.username}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getRoleIcon(user.role)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getRoleColor(user.role)}`}>
                          {user.role.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.entite ? (
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                          {user.entite.nom}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    {(currentUser?.role === 'admin_general' || currentUser?.role === 'admin_entite') && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {/* Admin Entité ne peut pas modifier les Admin Généraux */}
                          {!(currentUser?.role === 'admin_entite' && user.role === 'admin_general') && (
                            <>
                              <button
                                onClick={() => handleEdit(user)}
                                className="text-blue-600 hover:text-blue-900 p-1"
                                title="Modifier"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              
                              <button
                                onClick={() => handleToggleActive(user)}
                                className={`p-1 ${user.is_active ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}`}
                                title={user.is_active ? 'Désactiver' : 'Activer'}
                              >
                                <Edit className="h-4 w-4" />
                              </button>

                              {/* Admin Entité ne peut pas supprimer les Admin Généraux */}
                              {!(currentUser?.role === 'admin_entite' && user.role === 'admin_general') && currentUser?.id !== user.id && (
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="text-red-600 hover:text-red-900 p-1"
                                  title="Supprimer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}