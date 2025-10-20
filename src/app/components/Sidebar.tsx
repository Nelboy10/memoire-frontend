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
  X
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Détection de la taille d'écran pour le responsive
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsCollapsed(false);
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

  // Navigation de base
  const baseNavigation: NavigationItem[] = [
   
  ];

  // Navigation par rôle
  const roleNavigation: Record<string, NavigationItem[]> = {
    admin_general: [
      { name: 'Tableau de bord', href: '/dashboard', icon: Home },
      { name: 'Utilisateurs', href: '/dashboard/users', icon: Users },
      { name: 'Entités', href: '/dashboard/entites', icon: Building },
      { name: 'Statistiques', href: '/dashboard/statistiques', icon: BarChart3 },
      { name: 'Téléchargements', href: '/dashboard/telechargements', icon: Download },
      { name: 'Mon Profil', href: '/dashboard/profil', icon: User },
       { name: 'Mémoires', href: '/dashboard/memoires', icon: BookOpen },
    ],
    admin_entite: [
      { name: 'Tableau de bord', href: '/dashboard', icon: Home },
      { name: 'Utilisateurs', href: '/dashboard/users', icon: Users },
      { name: 'Statistiques', href: '/dashboard/statistiques', icon: BarChart3 },
      { name: 'Téléchargements', href: '/dashboard/telechargements', icon: Download },
      { name: 'Mon Profil', href: '/dashboard/profil', icon: User },
      { name: 'Mémoires', href: '/dashboard/memoires', icon: BookOpen },
    ],
    secretaire: [
      { name: 'Dashboard Secrétaire', href: '/dashboard/secretaire', icon: Home },
      { name: 'Mémoires en Attente', href: '/dashboard/secretaire/memoires-attente', icon: Clock },
      { name: 'Créer Compte Étudiant', href: '/dashboard/secretaire/creer-compte', icon: UserPlus },
      { name: 'Comptes Expirés', href: '/dashboard/secretaire/etudiants-expires', icon: Calendar },
      { name: 'Téléchargements', href: '/dashboard/telechargements', icon: Download },
      
    ],
    etudiant: [
      { name: 'Mon Dashboard', href: '/dashboard/etudiant', icon: Home },
      { name: 'Déposer un Mémoire', href: '/dashboard/etudiant/deposer-memoire', icon: Plus },
      { name: 'Mes Statistiques', href: '/dashboard/etudiant/statistiques', icon: BarChart3 },
    ],
  };

  // Navigation personnelle
  const personalNavigation: NavigationItem[] = [
    
    { name: 'Paramètres', href: '/dashboard/parametres', icon: Settings },
  ];

  // Génération de la navigation en fonction du rôle
  const getNavigation = (): NavigationItem[] => {
    const roleNav = user?.role ? roleNavigation[user.role] || [] : [];
    return [...baseNavigation, ...roleNav, ...personalNavigation];
  };

  const filteredNavigation = getNavigation();

  return (
    <div
      className={`bg-gray-800 text-white flex flex-col h-screen transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      } ${isMobile && isCollapsed ? 'absolute z-50' : 'relative'}`}
    >
      {/* Bouton pour réduire/étendre la sidebar (mobile) */}
      {isMobile && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 absolute -right-10 top-4 bg-gray-700 rounded-r-lg text-white"
        >
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      )}

      {/* Logo */}
      <div className="flex items-center justify-center h-16 bg-gray-900 border-b border-gray-700">
        {!isCollapsed ? (
          <>
            <BookOpen className="h-8 w-8" />
            <span className="ml-2 font-bold text-lg">Mémoires</span>
          </>
        ) : (
          <BookOpen className="h-8 w-8" />
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
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <IconComponent className="h-5 w-5" />
              {!isCollapsed && <span className="ml-3">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Infos utilisateur et déconnexion */}
      <div className="px-3 py-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className={`flex-1 min-w-0 ${isCollapsed ? 'hidden' : 'block'}`}>
            <p className="text-sm font-medium truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-gray-300 capitalize truncate">
              {user?.role?.replace('_', ' ')}
            </p>
            {user?.entite && (
              <p className="text-xs text-gray-400 truncate">{user.entite.nom}</p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-300 hover:text-white transition-colors p-1.5 flex-shrink-0"
            title="Déconnexion"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
