'use client';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { User, Mail, Calendar, Building, Save, Edit, Lock } from 'lucide-react';

export default function ProfilPage() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
  });
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password1: '',
    new_password2: '',
  });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await api.patch(`/users/${user?.id}/update_profile/`, formData);
      
      // Mettre à jour localement les données du formulaire (le contexte n'expose pas updateUser)
      if (response.data) {
        setFormData({
          first_name: response.data.first_name || formData.first_name,
          last_name: response.data.last_name || formData.last_name,
          email: response.data.email || formData.email,
        });
        setMessage('Profil mis à jour avec succès');
      }
      
      setIsEditing(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.detail || 
                          'Erreur lors de la mise à jour';
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setMessage('');

    // Validation des mots de passe
    if (passwordData.new_password1 !== passwordData.new_password2) {
      setMessage('Les nouveaux mots de passe ne correspondent pas');
      setPasswordLoading(false);
      return;
    }

    try {
      await api.post('/auth/password/change/', {
        old_password: passwordData.old_password,
        new_password1: passwordData.new_password1,
        new_password2: passwordData.new_password2,
      });
      
      setMessage('Mot de passe modifié avec succès');
      setPasswordData({
        old_password: '',
        new_password1: '',
        new_password2: '',
      });
      setIsChangingPassword(false);
    } catch (error: any) {
      const errorData = error.response?.data;
      let errorMessage = 'Erreur lors du changement de mot de passe';
      
      if (errorData?.old_password) {
        errorMessage = errorData.old_password[0];
      } else if (errorData?.new_password2) {
        errorMessage = errorData.new_password2[0];
      } else if (errorData?.error) {
        errorMessage = errorData.error;
      }
      
      setMessage(errorMessage);
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <p className="text-gray-600">Chargement du profil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
          {!isEditing && !isChangingPassword && (
            <div className="flex space-x-3">
              <button
                onClick={() => setIsChangingPassword(true)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center transition-colors"
              >
                <Lock className="h-5 w-5 mr-2" />
                Changer le mot de passe
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
              >
                <Edit className="h-5 w-5 mr-2" />
                Modifier
              </button>
            </div>
          )}
        </div>

        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.includes('succès') 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border p-6">
          {isChangingPassword ? (
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">Changer le mot de passe</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={passwordData.old_password}
                    onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={passwordData.new_password1}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password1: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={passwordData.new_password2}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password2: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordData({
                      old_password: '',
                      new_password1: '',
                      new_password2: '',
                    });
                    setMessage('');
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center transition-colors"
                >
                  <Save className="h-5 w-5 mr-2" />
                  {passwordLoading ? 'Changement...' : 'Changer le mot de passe'}
                </button>
              </div>
            </form>
          ) : isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">Modifier le profil</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
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

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      first_name: user.first_name,
                      last_name: user.last_name,
                      email: user.email,
                    });
                    setMessage('');
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center transition-colors"
                >
                  <Save className="h-5 w-5 mr-2" />
                  {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Informations personnelles */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Informations Personnelles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Nom complet</p>
                      <p className="font-medium">{user.first_name} {user.last_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Nom d'utilisateur</p>
                      <p className="font-medium">{user.username}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Building className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Rôle</p>
                      <p className="font-medium capitalize">{user.role?.replace('_', ' ') || 'Utilisateur'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations de l'entité */}
              {user.entite && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Informations de l'Entité</h3>
                  <div className="flex items-center">
                    <Building className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Entité</p>
                      <p className="font-medium">{user.entite.nom}</p>
                      {user.entite.description && (
                        <p className="text-sm text-gray-600 mt-1">{user.entite.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Informations du compte */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Informations du Compte</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Date de création</p>
                      <p className="font-medium">
                        {new Date(user.date_joined || '').toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  
                  {user.date_expiration && (
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Date d'expiration</p>
                        <p className="font-medium">
                          {new Date(user.date_expiration).toLocaleDateString('fr-FR')}
                        </p>
                        {user.role === 'etudiant' && (
                          <p className={`text-sm mt-1 ${
                            new Date(user.date_expiration) > new Date() 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {new Date(user.date_expiration) > new Date() 
                              ? 'Compte actif' 
                              : 'Compte expiré'}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-3 ${
                      user.is_active ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="text-sm text-gray-600">Statut</p>
                      <p className={`font-medium ${
                        user.is_active ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {user.is_active ? 'Compte actif' : 'Compte inactif'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}