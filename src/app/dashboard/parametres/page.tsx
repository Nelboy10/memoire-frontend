'use client';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { Key, Bell, Shield } from 'lucide-react';

export default function ParametresPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('security');
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password1: '',
    new_password2: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // Validation
    if (passwordData.new_password1 !== passwordData.new_password2) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    if (passwordData.new_password1.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      setLoading(false);
      return;
    }

    try {
      // Utiliser l'endpoint correct selon votre API
      const response = await api.post('/auth/password/change/', {
        old_password: passwordData.old_password,
        new_password1: passwordData.new_password1,
        new_password2: passwordData.new_password2,
      });
      
      setPasswordData({
        old_password: '',
        new_password1: '',
        new_password2: '',
      });
      setMessage('Mot de passe modifié avec succès');
    } catch (error: any) {
      console.error('Password change error:', error);
      
      // Gestion détaillée des erreurs
      if (error.response?.data) {
        const errors = error.response.data;
        if (typeof errors === 'object') {
          // Extraire tous les messages d'erreur
          const errorMessages = Object.values(errors).flat().join(', ');
          setError(`Erreur: ${errorMessages}`);
        } else if (typeof errors === 'string') {
          setError(errors);
        } else {
          setError('Erreur lors du changement de mot de passe');
        }
      } else {
        setError('Erreur de connexion au serveur');
      }
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'security', name: 'Sécurité', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
  ];

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-600 mt-1">Gérez vos préférences et paramètres de compte</p>
        </div>

        {/* Messages d'alerte */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        
        {message && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800">{message}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border">
          {/* Navigation par onglets */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Contenu des onglets */}
          <div className="p-6">
            {activeTab === 'security' && (
              <div className="max-w-md">
                <h3 className="text-lg font-semibold mb-4">Changer le mot de passe</h3>
                
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label htmlFor="old_password" className="block text-sm font-medium text-gray-700 mb-1">
                      Mot de passe actuel *
                    </label>
                    <input
                      id="old_password"
                      type="password"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={passwordData.old_password}
                      onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                      placeholder="Entrez votre mot de passe actuel"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="new_password1" className="block text-sm font-medium text-gray-700 mb-1">
                      Nouveau mot de passe *
                    </label>
                    <input
                      id="new_password1"
                      type="password"
                      required
                      minLength={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={passwordData.new_password1}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password1: e.target.value })}
                      placeholder="Minimum 8 caractères"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="new_password2" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmer le nouveau mot de passe *
                    </label>
                    <input
                      id="new_password2"
                      type="password"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={passwordData.new_password2}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password2: e.target.value })}
                      placeholder="Confirmez votre nouveau mot de passe"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                  >
                    <Key className="h-5 w-5 mr-2" />
                    {loading ? 'Changement en cours...' : 'Changer le mot de passe'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Préférences de notifications</h3>
                <div className="space-y-4 max-w-2xl">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Notifications par email</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Recevoir des notifications importantes par email
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        defaultChecked 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Nouveaux mémoires</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Être notifié lorsqu'un nouveau mémoire est déposé
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        defaultChecked 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Activité du compte</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Recevoir des notifications concernant la sécurité de votre compte
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        defaultChecked 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Informations du compte */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Informations du compte</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Nom complet</p>
              <p className="font-medium">{user?.first_name} {user?.last_name}</p>
            </div>
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Nom d'utilisateur</p>
              <p className="font-medium">{user?.username}</p>
            </div>
            <div>
              <p className="text-gray-600">Rôle</p>
              <p className="font-medium capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
            {user?.entite && (
              <div>
                <p className="text-gray-600">Entité</p>
                <p className="font-medium">{user.entite.nom}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}