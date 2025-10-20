'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import Link from 'next/link';
import { 
  Users, 
  BookOpen, 
  Download, 
  Eye, 
  Calendar, 
  BarChart3, 
  Clock, 
  AlertTriangle,
  FileText,
  CheckCircle,
  XCircle,
  ChevronRight,
  TrendingUp,
  Activity
} from 'lucide-react';

interface DashboardStats {
  // Stats communes
  total_memoires?: number;
  total_telechargements?: number;
  memoires_publics?: number;
  entite?: string;
  
  // Stats admin général
  total_users?: number;
  total_etudiants?: number;
  etudiants_expires?: number;
  
  // Stats admin entité & secrétaire
  etudiants_actifs?: number;
  memoires_en_attente?: number;
  memoires_ce_mois?: number;
  telechargements_ce_mois?: number;
  etudiants_expires_recent?: number;
  
  // Stats étudiant
  mes_memoires?: number;
  mes_memoires_publics?: number;
  jours_restants?: number;
  date_expiration?: string;
  dernier_memoire?: any;
  
  // Stats mensuelles
  memoires_par_mois?: Array<{mois: string, count: number}>;
  telechargements_par_mois?: Array<{mois: string, count: number}>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      setError(null);
      const response = await api.get('/dashboard/stats/');
      setStats(response.data);
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      if (error.response?.status === 403) {
        setError('Accès refusé - Vous n\'avez pas les permissions nécessaires pour voir le dashboard');
      } else if (error.response?.status === 401) {
        setError('Veuillez vous connecter pour accéder au dashboard');
      } else {
        setError('Erreur lors du chargement des statistiques');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded-lg w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-300 h-32 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl mr-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Erreur</h3>
                <p className="text-gray-700 mt-1">{error}</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-900">
                Rôle actuel: <span className="text-gray-700 capitalize">{user?.role?.replace('_', ' ') || 'Non connecté'}</span>
              </p>
              {user?.role === 'etudiant' && (
                <p className="text-sm text-gray-600 mt-2">
                  Les étudiants ont accès à un dashboard simplifié avec leurs mémoires et statistiques personnelles.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Configuration des cartes de statistiques selon le rôle
  const getStatCards = () => {
    const cards = [];
    
    if (user?.role === 'admin_general') {
      cards.push(
        {
          title: 'Total Utilisateurs',
          value: stats.total_users || 0,
          icon: Users,
          color: 'blue',
          description: 'Tous les utilisateurs de la plateforme',
          trend: 'up'
        },
        {
          title: 'Total Mémoires',
          value: stats.total_memoires || 0,
          icon: BookOpen,
          color: 'emerald',
          description: 'Mémoires déposés sur la plateforme',
          trend: 'up'
        },
        {
          title: 'Téléchargements',
          value: stats.total_telechargements || 0,
          icon: Download,
          color: 'violet',
          description: 'Total des téléchargements',
          trend: 'up'
        },
        {
          title: 'Mémoires Publics',
          value: stats.memoires_publics || 0,
          icon: Eye,
          color: 'amber',
          description: 'Mémoires validés et publics',
          trend: 'stable'
        },
        {
          title: 'Total Étudiants',
          value: stats.total_etudiants || 0,
          icon: Users,
          color: 'indigo',
          description: 'Comptes étudiants créés',
          trend: 'up'
        },
        {
          title: 'Étudiants Expirés',
          value: stats.etudiants_expires || 0,
          icon: Calendar,
          color: 'rose',
          description: 'Comptes étudiants expirés',
          trend: 'down'
        }
      );
    } else if (user?.role === 'admin_entite') {
      cards.push(
        {
          title: 'Total Mémoires',
          value: stats.total_memoires || 0,
          icon: BookOpen,
          color: 'blue',
          description: `Mémoires de ${stats.entite}`,
          trend: 'up'
        },
        {
          title: 'Téléchargements',
          value: stats.total_telechargements || 0,
          icon: Download,
          color: 'emerald',
          description: 'Téléchargements pour votre entité',
          trend: 'up'
        },
        {
          title: 'Mémoires Publics',
          value: stats.memoires_publics || 0,
          icon: Eye,
          color: 'violet',
          description: 'Mémoires validés et publics',
          trend: 'stable'
        },
        {
          title: 'Étudiants Actifs',
          value: stats.etudiants_actifs || 0,
          icon: Users,
          color: 'amber',
          description: 'Étudiants avec compte actif',
          trend: 'up'
        }
      );
    } else if (user?.role === 'secretaire') {
      cards.push(
        {
          title: 'Mémoires en Attente',
          value: stats.memoires_en_attente || 0,
          icon: FileText,
          color: 'amber',
          description: 'Mémoires à valider',
          trend: 'up'
        },
        {
          title: 'Mémoires ce Mois',
          value: stats.memoires_ce_mois || 0,
          icon: BookOpen,
          color: 'blue',
          description: 'Nouveaux mémoires ce mois',
          trend: 'up'
        },
        {
          title: 'Téléchargements ce Mois',
          value: stats.telechargements_ce_mois || 0,
          icon: Download,
          color: 'emerald',
          description: 'Téléchargements récents',
          trend: 'up'
        },
        {
          title: 'Étudiants Actifs',
          value: stats.etudiants_actifs || 0,
          icon: Users,
          color: 'violet',
          description: 'Étudiants avec compte actif',
          trend: 'stable'
        },
        {
          title: 'Étudiants Expirés Récent',
          value: stats.etudiants_expires_recent || 0,
          icon: Calendar,
          color: 'rose',
          description: 'Comptes expirés récemment',
          trend: 'down'
        },
        {
          title: 'Total Mémoires',
          value: stats.total_memoires || 0,
          icon: BookOpen,
          color: 'indigo',
          description: 'Total des mémoires',
          trend: 'up'
        }
      );
    } else if (user?.role === 'etudiant') {
      const isExpired = stats.jours_restants !== undefined && stats.jours_restants <= 0;
      
      cards.push(
        {
          title: 'Mes Mémoires',
          value: stats.mes_memoires || 0,
          icon: BookOpen,
          color: 'blue',
          description: 'Mémoires que j\'ai déposés',
          trend: 'up'
        },
        {
          title: 'Mémoires Publics',
          value: stats.mes_memoires_publics || 0,
          icon: CheckCircle,
          color: 'emerald',
          description: 'Mes mémoires validés',
          trend: 'stable'
        },
        {
          title: 'Téléchargements',
          value: stats.total_telechargements || 0,
          icon: Download,
          color: 'violet',
          description: 'Téléchargements de mes mémoires',
          trend: 'up'
        },
        {
          title: 'Jours Restants',
          value: isExpired ? 'Expiré' : (stats.jours_restants || 0),
          icon: Clock,
          color: isExpired ? 'rose' : (stats.jours_restants && stats.jours_restants < 3 ? 'amber' : 'indigo'),
          description: isExpired ? 'Compte expiré' : 'Jours restants sur votre compte',
          trend: isExpired ? 'down' : 'stable'
        }
      );
    }
    
    return cards;
  };

  const statCards = getStatCards();

  const getColorClasses = (color: string, type: 'bg' | 'text' | 'border' = 'bg') => {
    const colors: any = {
      blue: {
        bg: 'bg-blue-500',
        light: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-200'
      },
      emerald: {
        bg: 'bg-emerald-500',
        light: 'bg-emerald-50',
        text: 'text-emerald-600',
        border: 'border-emerald-200'
      },
      violet: {
        bg: 'bg-violet-500',
        light: 'bg-violet-50',
        text: 'text-violet-600',
        border: 'border-violet-200'
      },
      amber: {
        bg: 'bg-amber-500',
        light: 'bg-amber-50',
        text: 'text-amber-600',
        border: 'border-amber-200'
      },
      rose: {
        bg: 'bg-rose-500',
        light: 'bg-rose-50',
        text: 'text-rose-600',
        border: 'border-rose-200'
      },
      indigo: {
        bg: 'bg-indigo-500',
        light: 'bg-indigo-50',
        text: 'text-indigo-600',
        border: 'border-indigo-200'
      }
    };
    return colors[color]?.[type] || colors.blue[type];
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') {
      return <TrendingUp className="h-4 w-4 text-emerald-600" />;
    }
    if (trend === 'down') {
      return <TrendingUp className="h-4 w-4 text-rose-600 rotate-180" />;
    }
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  const getQuickActions = () => {
    const actions = [];
    
    // Actions communes à tous
    actions.push({
      href: "/dashboard/memoires",
      icon: BookOpen,
      title: "Voir les mémoires",
      description: "Parcourir la bibliothèque de mémoires",
      color: "blue"
    });

    // Actions selon le rôle
    if (user?.role === 'etudiant') {
      actions.push({
        href: "/dashboard/memoires/ajouter",
        icon: FileText,
        title: "Déposer un mémoire",
        description: "Ajouter votre mémoire à la bibliothèque",
        color: "emerald"
      });
      actions.push({
        href: "/dashboard/mes-memoires",
        icon: BookOpen,
        title: "Mes mémoires",
        description: "Voir mes mémoires déposés",
        color: "violet"
      });
    }

    if (user?.role === 'admin_general' || user?.role === 'admin_entite') {
      actions.push({
        href: "/statistiques",
        icon: BarChart3,
        title: "Statistiques",
        description: "Voir les statistiques détaillées",
        color: "amber"
      });
      actions.push({
        href: "/users",
        icon: Users,
        title: "Gérer les utilisateurs",
        description: "Gérer les comptes utilisateurs",
        color: "indigo"
      });
    }

    if (user?.role === 'secretaire') {
      actions.push({
        href: "/secretaire/memoires-en-attente",
        icon: FileText,
        title: "Mémoires en attente",
        description: "Valider les mémoires soumis",
        color: "amber"
      });
      actions.push({
        href: "/secretaire/creer-etudiant",
        icon: Users,
        title: "Créer compte étudiant",
        description: "Créer un compte temporaire étudiant",
        color: "emerald"
      });
      actions.push({
        href: "/secretaire/etudiants-expires",
        icon: Calendar,
        title: "Étudiants expirés",
        description: "Gérer les comptes expirés",
        color: "rose"
      });
    }

    return actions;
  };

  const quickActions = getQuickActions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Tableau de bord
              </h1>
              <div className="flex items-center space-x-4">
                {stats.entite && (
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <p className="text-gray-700 font-medium">Entité: {stats.entite}</p>
                  </div>
                )}
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                  <p className="text-gray-600 capitalize">
                    Connecté en tant que <span className="font-semibold text-gray-800">{user?.role?.replace('_', ' ')}</span>
                  </p>
                </div>
              </div>
            </div>
            {user?.role === 'etudiant' && stats.date_expiration && (
              <div className={`px-6 py-3 rounded-xl border-2 ${
                stats.jours_restants && stats.jours_restants <= 0 
                  ? 'bg-rose-50 border-rose-200 text-rose-800' 
                  : stats.jours_restants && stats.jours_restants < 3 
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}>
                <p className="text-sm font-semibold">
                  {stats.jours_restants && stats.jours_restants <= 0 
                    ? 'Compte expiré' 
                    : `Expire dans ${stats.jours_restants} jour(s)`}
                </p>
                <p className="text-xs font-medium opacity-90">
                  {new Date(stats.date_expiration).toLocaleDateString('fr-FR')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Grid des statistiques */}
        <div className={`grid grid-cols-1 md:grid-cols-2 ${
          statCards.length > 4 ? 'lg:grid-cols-3 xl:grid-cols-6' : 'lg:grid-cols-4'
        } gap-6 mb-8`}>
          {statCards.map((stat, index) => (
            <div key={stat.title} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${getColorClasses(stat.color, 'bg')}`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(stat.trend)}
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{stat.title}</p>
                  <p className={`text-3xl font-bold mt-2 ${
                    stat.color === 'rose' ? 'text-rose-600' : 'text-gray-900'
                  }`}>
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-600 mt-3 font-medium">{stat.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dernier mémoire pour étudiant */}
        {user?.role === 'etudiant' && stats.dernier_memoire && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Dernier mémoire déposé</h2>
              <Link
                href="/dashboard/mes-memoires"
                className="text-gray-600 hover:text-gray-900 font-semibold text-sm flex items-center transition-colors"
              >
                Voir tous <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">{stats.dernier_memoire.titre}</h3>
                <p className="text-gray-600 mt-2 font-medium">
                  Déposé le {new Date(stats.dernier_memoire.date_soumission).toLocaleDateString('fr-FR')}
                </p>
                <div className="flex items-center mt-3 space-x-4">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    stats.dernier_memoire.est_public 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {stats.dernier_memoire.est_public ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Public
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 mr-2" />
                        En attente
                      </>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {stats.dernier_memoire.nb_telechargements || 0} téléchargements
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions rapides */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Actions Rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={action.href}
                href={action.href}
                className="group p-5 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-xl ${getColorClasses(action.color, 'bg')} group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="font-bold text-gray-900 group-hover:text-gray-800 text-lg">
                      {action.title}
                    </h3>
                    <p className="text-gray-600 mt-2 font-medium">
                      {action.description}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Statistiques mensuelles (pour admins) */}
        {(stats.memoires_par_mois || stats.telechargements_par_mois) && 
         (user?.role === 'admin_general' || user?.role === 'admin_entite') && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Statistiques Mensuelles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {stats.memoires_par_mois && stats.memoires_par_mois.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-700 mb-4 flex items-center text-lg">
                    <BookOpen className="h-5 w-5 text-blue-600 mr-3" />
                    Mémoires déposés par mois
                  </h3>
                  <div className="space-y-3">
                    {stats.memoires_par_mois.slice(-6).reverse().map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors">
                        <span className="text-sm font-semibold text-gray-700">
                          {new Date(item.mois).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                        </span>
                        <span className="font-bold text-blue-600 text-lg">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {stats.telechargements_par_mois && stats.telechargements_par_mois.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-700 mb-4 flex items-center text-lg">
                    <Download className="h-5 w-5 text-emerald-600 mr-3" />
                    Téléchargements par mois
                  </h3>
                  <div className="space-y-3">
                    {stats.telechargements_par_mois.slice(-6).reverse().map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors">
                        <span className="text-sm font-semibold text-gray-700">
                          {new Date(item.mois).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                        </span>
                        <span className="font-bold text-emerald-600 text-lg">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}