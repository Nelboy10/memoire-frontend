'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { api } from './lib/api';
import Link from 'next/link';
import { Memoire, Entite } from './types';
import { 
  BookOpen, 
  Search, 
  Download, 
  Users, 
  LogOut, 
  Filter, 
  Mail, 
  Eye, 
  Calendar, 
  TrendingUp, 
  Sparkles, 
  GraduationCap, 
  User, 
  Shield, 
  BookText, 
  ArrowRight, 
  University, 
  Award, 
  FileText,
  Plus,
  ChevronDown,
  X
} from 'lucide-react';

export default function Home() {
  const { user, loading, logout } = useAuth();
  const [memoires, setMemoires] = useState<Memoire[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    filiere: '',
    annee: '',
    entite: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [downloading, setDownloading] = useState<number | null>(null);
  const [memoiresLoading, setMemoiresLoading] = useState(true);

  useEffect(() => {
    fetchMemoires();
  }, []);

  const fetchMemoires = async () => {
    try {
      const response = await api.get('memoires/public/');
      setMemoires(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching memoires:', error);
    } finally {
      setMemoiresLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setMemoiresLoading(true);
    
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (filters.filiere) params.append('filiere', filters.filiere);
      if (filters.annee) params.append('annee', filters.annee);
      if (filters.entite) params.append('entite', filters.entite);

      const response = await api.get(`memoires/search/?${params}`);
      setMemoires(response.data.results || response.data);
    } catch (error) {
      console.error('Error searching memoires:', error);
    } finally {
      setMemoiresLoading(false);
    }
  };

  const handleDownload = async (memoireId: number) => {
    setDownloading(memoireId);
    
    try {
      const email = prompt('Veuillez entrer votre email pour recevoir le mémoire:');
      if (!email) {
        setDownloading(null);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('Veuillez entrer une adresse email valide');
        setDownloading(null);
        return;
      }

      const response = await api.post(`memoires/${memoireId}/download/`, { email });
      
      if (response.data.email_sent) {
        alert(` ${response.data.message}\n\nVérifiez votre boîte email (y compris les spams).`);
      } else {
        alert(` ${response.data.message || 'Erreur lors de l\'envoi de l\'email'}`);
      }

      fetchMemoires();
      
    } catch (error: any) {
      console.error('Download error:', error);
      
      if (error.response?.status === 400) {
        alert(error.response.data.error || 'Données invalides');
      } else if (error.response?.status === 404) {
        alert('Mémoire non trouvé');
      } else {
        alert(error.response?.data?.error || 'Erreur lors de la demande de téléchargement');
      }
    } finally {
      setDownloading(null);
    }
  };

  const resetFilters = () => {
    setFilters({ filiere: '', annee: '', entite: '' });
    setSearchQuery('');
    fetchMemoires();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600 mx-auto"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-emerald-400 opacity-20 mx-auto"></div>
          </div>
          <p className="text-gray-700 font-medium mt-4 animate-pulse">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-emerald-50/10">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center space-x-3 group cursor-pointer">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-xl shadow-lg group-hover:shadow-emerald-500/25 transition-all duration-300">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-emerald-700 bg-clip-text text-transparent">
                    MemoireUP
                  </h1>
                  <p className="text-xs text-gray-500 hidden sm:block">Excellence Académique</p>
                </div>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">{user.first_name} {user.last_name}</p>
                  <p className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full capitalize">
                    {user.role?.replace('_', ' ')}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                  title="Déconnexion"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 px-4 py-2 rounded-full border border-emerald-200/50 mb-4">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">Bienvenue sur votre espace</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Bonjour, <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{user.first_name}</span> 👋
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Accédez à toutes les fonctionnalités de la plateforme MemoireUP
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="bg-blue-500/10 p-3 rounded-xl">
                  <BookText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{memoires.length}</p>
                  <p className="text-sm text-gray-600">Mémoires disponibles</p>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-500/10 p-3 rounded-xl">
                  <Download className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {memoires.reduce((acc, mem) => acc + mem.nb_telechargements, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Téléchargements totaux</p>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="bg-purple-500/10 p-3 rounded-xl">
                  <University className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                  <p className="text-sm text-gray-600">Départements</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Link
              href="/dashboard/memoires"
              className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/60 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <BookText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors">Parcourir les mémoires</h3>
                  <p className="text-sm text-gray-600">Explorez la bibliothèque complète</p>
                </div>
              </div>
            </Link>

            {user.role === 'etudiant' && (
              <Link
                href="/dashboard/memoires/ajouter"
                className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/60 hover:border-blue-300 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">Déposer un mémoire</h3>
                    <p className="text-sm text-gray-600">Partagez votre travail</p>
                  </div>
                </div>
              </Link>
            )}

            <Link
              href="/dashboard"
              className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/60 hover:border-purple-300 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-purple-700 transition-colors">Tableau de bord</h3>
                  <p className="text-sm text-gray-600">Vos statistiques personnelles</p>
                </div>
              </div>
            </Link>

            {(user.role === 'admin_general' || user.role === 'admin_entite') && (
              <Link
                href="/dashboard/users"
                className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/60 hover:border-orange-300 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-orange-700 transition-colors">Gérer les utilisateurs</h3>
                    <p className="text-sm text-gray-600">Administration complète</p>
                  </div>
                </div>
              </Link>
            )}

            {(user.role === 'secretaire' || user.role === 'admin_entite') && (
              <Link
                href="/dashboard/validation"
                className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/60 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-indigo-700 transition-colors">Validation</h3>
                    <p className="text-sm text-gray-600">Approuver les mémoires</p>
                  </div>
                </div>
              </Link>
            )}
          </div>

          {/* Recent Activity Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Derniers mémoires ajoutés</h2>
              <Link 
                href="/dashboard/memoires" 
                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1"
              >
                Voir tout <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {memoires.slice(0, 4).map((memoire, index) => (
                <div key={memoire.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50/50 transition-all duration-200 group">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 p-3 rounded-lg group-hover:scale-105 transition-transform duration-200">
                      <FileText className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm group-hover:text-emerald-700 transition-colors">
                        {memoire.titre}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {memoire.auteur.first_name} {memoire.auteur.last_name} • {memoire.filiere}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {memoire.annee_soumission}
                    </span>
                    <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      {memoire.nb_telechargements}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Public facing page - RESTAURÉ avec l'image originale et couleurs jolies
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-xl shadow-lg group-hover:shadow-emerald-500/25 transition-all duration-300">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-emerald-700 bg-clip-text text-transparent">
                  MemoireUP
                </span>
                <p className="text-xs text-gray-500 hidden sm:block">Excellence Académique</p>
              </div>
            </div>
            <Link
              href="/login"
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium flex items-center gap-2 shadow-lg shadow-emerald-500/25"
            >
              <User className="h-4 w-4" />
              Espace Personnel
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - AVEC L'IMAGE ORIGINALE */}
      <div 
        className="relative bg-gray-900 min-h-[90vh] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.8)), url('https://lh3.googleusercontent.com/gps-cs-s/AC9h4nohuuVNkAZFogLIMIS416vfaQTcNHwZ6udEIn0z0jh_S9HJ1IYaRtMeaJRJWq6wfewJE-8vlCvPKBURmbwKf-CaswkpfnFcVmf-RqzfO6yZNQSfnmSHOjebkq9g_GPTi6L3XUpP=s1360-w1360-h1020-rw')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-blue-500/10 animate-pulse"></div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white relative z-10">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md text-emerald-100 px-6 py-3 rounded-2xl text-sm font-medium mb-8 border border-white/20">
            <Sparkles className="h-5 w-5" />
            <span>Plateforme Universitaire d'Excellence</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
            <span className="block">Bibliothèque de</span>
            <span className="block bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent mt-4">
              Mémoires Universitaires
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-200 max-w-4xl mx-auto mb-12 leading-relaxed">
            Découvrez, partagez et excellez. Accédez à la connaissance de générations 
            d'étudiants et contribuez à l'enrichissement de notre patrimoine académique.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Link
              href="#explorer"
              className="group bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-12 py-4 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-semibold flex items-center gap-3 text-lg shadow-2xl shadow-emerald-500/30"
            >
              Explorer la Bibliothèque
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="group border-2 border-white/40 text-white px-12 py-4 rounded-2xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 font-semibold text-lg flex items-center gap-3">
              <University className="h-5 w-5" />
              Notre Université
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {[
              { number: memoires.length, label: 'Mémoires', icon: BookText },
              { number: memoires.reduce((acc, mem) => acc + mem.nb_telechargements, 0), label: 'Téléchargements', icon: Download },
              { number: '24/7', label: 'Disponibilité', icon: Award },
              { number: '100%', label: 'Qualité', icon: Award }
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-emerald-300/50 transition-all duration-300 group-hover:scale-105">
                  <stat.icon className="h-8 w-8 text-emerald-300 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-white mb-1">{stat.number}</div>
                  <div className="text-emerald-100 text-sm">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center gap-2">
            <span className="text-white/70 text-sm">Découvrir</span>
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/70 rounded-full mt-2"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main id="explorer" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Search Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200/60 p-8 mb-16 transform hover:shadow-3xl transition-all duration-500">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Explorez le <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Savoir</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Recherchez parmi {memoires.length} mémoires universitaires de qualité
            </p>
          </div>

          {/* Search Section */}
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un mémoire, un auteur, un mot-clé..."
                    className="w-full pl-12 pr-4 py-5 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 text-lg shadow-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={memoiresLoading}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-10 py-5 rounded-2xl hover:shadow-2xl hover:scale-105 disabled:opacity-50 transition-all duration-300 font-semibold flex items-center text-lg min-w-[160px] justify-center shadow-xl shadow-emerald-500/25"
                >
                  {memoiresLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-2"></div>
                      Recherche...
                    </>
                  ) : (
                    <>
                      <Search className="h-6 w-6 mr-2" />
                      Explorer
                    </>
                  )}
                </button>
              </div>

              {/* Filters */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-emerald-600 hover:text-emerald-700 flex items-center text-base font-semibold bg-emerald-50 px-6 py-3 rounded-xl transition-all duration-300 hover:bg-emerald-100"
                >
                  <Filter className="h-5 w-5 mr-2" />
                  {showFilters ? 'Masquer les filtres' : 'Filtres avancés'}
                </button>
                
                {showFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                  >
                    Tout effacer
                  </button>
                )}
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-gradient-to-br from-gray-50 to-emerald-50/30 rounded-2xl border-2 border-emerald-200/50">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      📚 Filière
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      value={filters.filiere}
                      onChange={(e) => setFilters({...filters, filiere: e.target.value})}
                      placeholder="Informatique, Gestion..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      📅 Année
                    </label>
                    <input
                      type="number"
                      min="2000"
                      max={new Date().getFullYear()}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      value={filters.annee}
                      onChange={(e) => setFilters({...filters, annee: e.target.value})}
                      placeholder="2023, 2024..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      🏛️ Entité
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      value={filters.entite}
                      onChange={(e) => setFilters({...filters, entite: e.target.value})}
                      placeholder="UFR, Département..."
                    />
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Memoires List */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200/60 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-emerald-50/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Mémoires Disponibles
                </h2>
                <p className="text-gray-600 mt-2 text-lg">
                  {memoires.length} trésors académiques à découvrir
                </p>
              </div>
              <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 px-6 py-3 rounded-xl border border-emerald-200">
                <Download className="h-6 w-6" />
                <span className="font-semibold text-lg">
                  {memoires.reduce((acc, mem) => acc + mem.nb_telechargements, 0)} téléchargements
                </span>
              </div>
            </div>
          </div>

          {memoiresLoading ? (
            <div className="p-8 space-y-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-7 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-3/4 mb-4"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-full mb-3"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-5/6 mb-4"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : memoires.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-2xl font-semibold text-gray-600 mb-3">Aucun mémoire trouvé</p>
              <p className="text-gray-500 text-lg">
                {searchQuery || Object.values(filters).some(f => f) 
                  ? "Essayez d'élargir vos critères de recherche"
                  : "La bibliothèque s'enrichit chaque jour"
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {memoires.map((memoire) => (
                <div key={memoire.id} className="p-8 hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-emerald-50/20 transition-all duration-300 group">
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-emerald-700 transition-colors leading-tight">
                        {memoire.titre}
                      </h3>
                      <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                        {memoire.resume}
                      </p>
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="font-semibold text-gray-700 bg-gray-100 px-4 py-2 rounded-xl text-sm">
                          👤 {memoire.auteur.first_name} {memoire.auteur.last_name}
                        </span>
                        <span className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-xl font-semibold text-sm">
                          🎓 {memoire.filiere}
                        </span>
                        <span className="flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-xl font-semibold text-sm">
                          <Calendar className="h-4 w-4" />
                          {memoire.annee_soumission}
                        </span>
                        <span className="flex items-center gap-2 text-gray-600 bg-gray-100 px-4 py-2 rounded-xl font-semibold text-sm">
                          <Download className="h-4 w-4" />
                          {memoire.nb_telechargements} téléchargements
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(memoire.id)}
                      disabled={downloading === memoire.id}
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-2xl hover:shadow-2xl hover:scale-105 disabled:opacity-50 transition-all duration-300 flex items-center text-base font-semibold whitespace-nowrap shadow-xl shadow-emerald-500/25 min-w-[160px] justify-center"
                    >
                      {downloading === memoire.id ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                          Envoi...
                        </>
                      ) : (
                        <>
                          <Mail className="h-5 w-5 mr-2" />
                          Télécharger
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-16 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border-2 border-emerald-200/50 p-12">
          <div className="flex flex-col lg:flex-row items-start gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <Mail className="h-12 w-12 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-3xl font-bold text-gray-900 mb-8">
                Comment <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">télécharger</span> un mémoire ?
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-6 p-4 bg-white/50 rounded-2xl hover:bg-white transition-all duration-300">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl w-12 h-12 flex items-center justify-center text-lg font-bold flex-shrink-0 shadow-lg">
                      1
                    </div>
                    <p className="text-gray-700 leading-relaxed text-lg pt-2">
                      Cliquez sur <span className="font-semibold text-emerald-600">"Télécharger"</span> du mémoire qui vous intéresse
                    </p>
                  </div>
                  <div className="flex items-start gap-6 p-4 bg-white/50 rounded-2xl hover:bg-white transition-all duration-300">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl w-12 h-12 flex items-center justify-center text-lg font-bold flex-shrink-0 shadow-lg">
                      2
                    </div>
                    <p className="text-gray-700 leading-relaxed text-lg pt-2">
                      Entrez votre <span className="font-semibold text-emerald-600">adresse email valide</span> dans la fenêtre qui s'ouvre
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-start gap-6 p-4 bg-white/50 rounded-2xl hover:bg-white transition-all duration-300">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl w-12 h-12 flex items-center justify-center text-lg font-bold flex-shrink-0 shadow-lg">
                      3
                    </div>
                    <p className="text-gray-700 leading-relaxed text-lg pt-2">
                      Recevez le mémoire directement dans votre <span className="font-semibold text-emerald-600">boîte email</span>
                    </p>
                  </div>
                  <div className="flex items-start gap-6 p-4 bg-white/50 rounded-2xl hover:bg-white transition-all duration-300">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl w-12 h-12 flex items-center justify-center text-lg font-bold flex-shrink-0 shadow-lg">
                      4
                    </div>
                    <p className="text-gray-700 leading-relaxed text-lg pt-2">
                      Consultez et téléchargez le fichier depuis votre email <span className="font-semibold text-emerald-600">(vérifiez les spams)</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}