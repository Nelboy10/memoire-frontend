'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  Users,
  BarChart3,
  LogOut,
  Home,
  Building,
  Download,
  User,
  Settings,
  UserPlus,
  Clock,
  Calendar,
  Plus,
  FileText,
  Menu,
  X,
  Search,
  FileDown,
  CheckCircle,
  RefreshCw,
  TrendingUp
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Détection de la taille d'écran pour le responsive
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      if (mobile) {
        // Sur mobile, la sidebar est fermée par défaut
        setIsCollapsed(true);
        setIsOpen(false);
      } else {
        // Sur desktop, la sidebar est ouverte par défaut
        setIsCollapsed(false);
        setIsOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const closeMobileSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  // Navigation de base
  const baseNavigation: NavigationItem[] = [
    { name: 'Accueil', href: '/', icon: Home },
  ];

  // Navigation par rôle
  const roleNavigation: Record<string, NavigationItem[]> = {
    admin_general: [
      { name: 'Tableau de bord', href: '/dashboard', icon: Home },
      { name: 'Utilisateurs', href: '/dashboard/users', icon: Users },
      { name: 'Entités', href: '/dashboard/entites', icon: Building },
      { name: 'Mémoires', href: '/dashboard/memoires', icon: BookOpen },
      { name: 'Recherche', href: '/dashboard/recherche', icon: Search },
      { name: 'Statistiques', href: '/dashboard/statistiques', icon: BarChart3 },
      { name: 'Téléchargements', href: '/dashboard/telechargements', icon: Download },
     
    ],
    admin_entite: [
      { name: 'Tableau de bord', href: '/dashboard', icon: Home },
      { name: 'Utilisateurs', href: '/dashboard/users', icon: Users },
      { name: 'Mémoires', href: '/dashboard/memoires', icon: BookOpen },
      { name: 'Recherche', href: '/dashboard/recherche', icon: Search },
      { name: 'Statistiques', href: '/dashboard/statistiques', icon: BarChart3 },
      { name: 'Téléchargements', href: '/dashboard/telechargements', icon: Download },
    ],
    secretaire: [
      { name: 'Dashboard Secrétaire', href: '/dashboard/secretaire', icon: Home },
      { name: 'Mémoires en Attente', href: '/dashboard/secretaire/memoires-attente', icon: Clock, badge: 'pending' },
      { name: 'Créer Compte Étudiant', href: '/dashboard/secretaire/creer-compte', icon: UserPlus },
      { name: 'Comptes Expirés', href: '/dashboard/secretaire/etudiants-expires', icon: Calendar, badge: 'expired' },
      { name: 'Téléchargements', href: '/dashboard/telechargements', icon: Download },
      { name: 'Mémoires', href: '/dashboard/memoires', icon: BookOpen },
    ],
    etudiant: [
      { name: 'Mon Dashboard', href: '/dashboard/etudiant', icon: Home },
      { name: 'Déposer un Mémoire', href: '/dashboard/etudiant/deposer-memoire', icon: Plus },
      { name: 'Statistiques Personnelles', href: '/dashboard/etudiant/statistiques', icon: TrendingUp },
      { name: 'Recherche Mémoires', href: '/dashboard/etudiant/recherche', icon: Search },
      { name: 'Téléchargements', href: '/dashboard/etudiant/telechargements', icon: FileDown },
    ],
  };

  // Navigation publique (pour les visiteurs non connectés)
  const publicNavigation: NavigationItem[] = [
    { name: 'Mémoires Publics', href: '/memoires-publics', icon: BookOpen },
    { name: 'Recherche', href: '/recherche', icon: Search },
    { name: 'Connexion', href: '/login', icon: User },
  ];

  // Navigation personnelle
  const personalNavigation: NavigationItem[] = [
    { name: 'Mon Profil', href: '/dashboard/profil', icon: User },
    { name: 'Paramètres', href: '/dashboard/parametres', icon: Settings },
  ];

  // Génération de la navigation en fonction du rôle et de l'authentification
  const getNavigation = (): NavigationItem[] => {
    if (!user) {
      return [...baseNavigation, ...publicNavigation];
    }

    const roleNav = user?.role ? roleNavigation[user.role] || [] : [];
    return [...baseNavigation, ...roleNav, ...personalNavigation];
  };

  const filteredNavigation = getNavigation();

  // Fonction pour afficher les badges
  const renderBadge = (badge: string) => {
    const badgeStyles = {
      pending: 'bg-yellow-500 text-white',
      expired: 'bg-red-500 text-white',
      new: 'bg-green-500 text-white'
    };

    return (
      <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${badgeStyles[badge as keyof typeof badgeStyles] || 'bg-gray-500'}`}>
        {badge === 'pending' && '!'}
        {badge === 'expired' && '!'}
        {badge === 'new' && 'Nouveau'}
      </span>
    );
  };

  // Classes conditionnelles pour le sidebar
  const sidebarClasses = `
    bg-gray-800 text-white flex flex-col h-screen transition-all duration-300 z-40
    ${isMobile 
      ? `fixed top-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} w-64`
      : `relative ${isCollapsed ? 'w-16' : 'w-64'}`
    }
  `;

  return (
    <>
      {/* Bouton hamburger pour mobile */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-lg shadow-lg md:hidden"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Overlay pour mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={sidebarClasses}>
        {/* En-tête du sidebar */}
        <div className="flex items-center justify-between h-16 bg-gray-900 border-b border-gray-700 px-4">
          {(!isCollapsed || isMobile) ? (
            <div className="flex items-center">
              <BookOpen className="h-8 w-8" />
              <span className="ml-2 font-bold text-lg">Mémoires</span>
            </div>
          ) : (
            <BookOpen className="h-8 w-8 mx-auto" />
          )}
          
          {/* Bouton fermer pour mobile */}
          {isMobile && (
            <button
              onClick={closeMobileSidebar}
              className="text-gray-300 hover:text-white p-1"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href;
            const IconComponent = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeMobileSidebar}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                title={(isCollapsed && !isMobile) ? item.name : undefined}
              >
                <IconComponent className="h-5 w-5 flex-shrink-0" />
                {(!isCollapsed || isMobile) && (
                  <div className="flex items-center justify-between flex-1 min-w-0">
                    <span className="ml-3 truncate">{item.name}</span>
                    {item.badge && renderBadge(item.badge)}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Infos utilisateur et déconnexion */}
        {user && (
          <div className="px-3 py-4 border-t border-gray-700 bg-gray-750">
            <div className="flex items-center justify-between">
              <div className={`flex-1 min-w-0 ${(isCollapsed && !isMobile) ? 'hidden' : 'block'}`}>
                <p className="text-sm font-medium truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-300 capitalize truncate">
                  {user?.role?.replace('_', ' ')}
                </p>
                {user?.entite_nom && (
                  <p className="text-xs text-gray-400 truncate">{user.entite_nom}</p>
                )}
                {user?.date_expiration && user.role === 'etudiant' && (
                  <p className="text-xs text-yellow-300 truncate">
                    Expire: {new Date(user.date_expiration).toLocaleDateString()}
                  </p>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-300 hover:text-white transition-colors p-1.5 flex-shrink-0 ml-2"
                title="Déconnexion"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Espace réservé pour le bouton hamburger sur mobile */}
      {isMobile && <div className="h-16 md:h-0"></div>}
    </>
  );
}