'use client';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { Download, Search, Calendar, FileText, User, Building, Filter, X, AlertCircle } from 'lucide-react';

interface Auteur {
  id: number;
  first_name: string;
  last_name: string;
}

interface Memoire {
  id: number;
  titre: string;
  auteur: Auteur | null;
}

interface Entite {
  id: number;
  nom: string;
}

interface DownloadLog {
  id: number;
  email: string;
  memoire: Memoire;
  entite: Entite;
  date_telechargement: string;
}

// Fonctions utilitaires pour gérer les données manquantes
const getAuteurName = (auteur: Auteur | null | undefined): string => {
  if (!auteur) return 'Auteur inconnu';
  if (auteur.first_name && auteur.last_name) {
    return `${auteur.first_name} ${auteur.last_name}`;
  }
  if (auteur.first_name) return auteur.first_name;
  if (auteur.last_name) return auteur.last_name;
  return 'Auteur inconnu';
};

const getMemoireTitre = (memoire: Memoire | null | undefined): string => {
  return memoire?.titre || 'Titre non disponible';
};

const getEntiteName = (entite: Entite | null | undefined): string => {
  return entite?.nom || 'Entité inconnue';
};

export default function TelechargementsPage() {
  const { user } = useAuth();
  const [downloads, setDownloads] = useState<DownloadLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [entiteFilter, setEntiteFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchDownloads();
  }, [currentPage]);

  const fetchDownloads = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Construire les paramètres de requête
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('page_size', itemsPerPage.toString());
      
      const response = await api.get(`/downloads/?${params}`);
      
      // Debug: afficher la structure de la réponse
      console.log('Response structure:', response.data);
      
      if (response.data.results) {
        // Si pagination DRF standard
        setDownloads(response.data.results);
        setTotalCount(response.data.count);
        setTotalPages(Math.ceil(response.data.count / itemsPerPage));
      } else if (Array.isArray(response.data)) {
        // Si pas de pagination, réponse directe en array
        setDownloads(response.data);
        setTotalCount(response.data.length);
        setTotalPages(1);
      } else {
        // Structure inattendue
        console.warn('Unexpected response structure:', response.data);
        setDownloads([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (error: any) {
      console.error('Error fetching downloads:', error);
      
      if (error.response?.status === 403) {
        setError('Vous n\'avez pas les permissions pour accéder aux téléchargements');
      } else if (error.response?.status === 401) {
        setError('Veuillez vous reconnecter');
      } else if (error.response?.status === 404) {
        setError('La ressource demandée n\'existe pas');
      } else {
        setError('Erreur lors du chargement des téléchargements');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredDownloads = useMemo(() => {
    let filtered = downloads;

    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(download => {
        const emailMatch = download.email?.toLowerCase().includes(query);
        const titreMatch = getMemoireTitre(download.memoire).toLowerCase().includes(query);
        const auteurMatch = getAuteurName(download.memoire?.auteur).toLowerCase().includes(query);
        const entiteMatch = getEntiteName(download.entite).toLowerCase().includes(query);
        
        return emailMatch || titreMatch || auteurMatch || entiteMatch;
      });
    }

    // Filtre par date
    if (dateFilter) {
      filtered = filtered.filter(download =>
        download.date_telechargement?.startsWith(dateFilter)
      );
    }

    // Filtre par entité (si admin général)
    if (entiteFilter && user?.role === 'admin_general') {
      filtered = filtered.filter(download =>
        getEntiteName(download.entite).toLowerCase().includes(entiteFilter.toLowerCase())
      );
    }

    return filtered;
  }, [downloads, searchQuery, dateFilter, entiteFilter, user?.role]);

  const clearFilters = () => {
    setSearchQuery('');
    setDateFilter('');
    setEntiteFilter('');
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date inconnue';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date invalide';
    }
  };

  const getUniqueEntities = () => {
    const entities = downloads
      .map(download => getEntiteName(download.entite))
      .filter(Boolean);
    return [...new Set(entities)];
  };

  const paginate = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (loading && downloads.length === 0) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded mb-4"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Historique des Téléchargements</h1>
        <div className="text-sm text-gray-600">
          Total: {totalCount} téléchargements
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtres
          </h2>
          {(searchQuery || dateFilter || entiteFilter) && (
            <button
              onClick={clearFilters}
              className="flex items-center text-sm text-gray-600 hover:text-gray-800"
            >
              <X className="h-4 w-4 mr-1" />
              Effacer les filtres
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Rechercher par email, mémoire, auteur..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="date"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          {user?.role === 'admin_general' && (
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                value={entiteFilter}
                onChange={(e) => setEntiteFilter(e.target.value)}
              >
                <option value="">Toutes les entités</option>
                {getUniqueEntities().map((entite, index) => (
                  <option key={index} value={entite}>
                    {entite}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Statistiques des filtres */}
      {(searchQuery || dateFilter || entiteFilter) && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            Affichage de {filteredDownloads.length} téléchargement(s) sur {totalCount} total
            {(searchQuery || dateFilter || entiteFilter) && ' (avec filtres appliqués)'}
          </p>
        </div>
      )}

      {/* Gestion des erreurs */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="text-red-600">
              <AlertCircle className="h-5 w-5" />
            </div>
            <p className="ml-2 text-red-800">{error}</p>
          </div>
          <button
            onClick={fetchDownloads}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Liste des téléchargements */}
      <div className="bg-white rounded-lg shadow-sm border">
        {filteredDownloads.length === 0 ? (
          <div className="text-center py-12">
            <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">Aucun téléchargement trouvé</p>
            <p className="text-gray-400 text-sm">
              {searchQuery || dateFilter || entiteFilter 
                ? "Essayez de modifier vos critères de recherche" 
                : "Aucun téléchargement n'a été enregistré pour le moment"
              }
            </p>
            {(searchQuery || dateFilter || entiteFilter) && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Effacer les filtres
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-200">
              {filteredDownloads.map((download) => (
                <div key={download.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <FileText className="h-5 w-5 text-blue-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                          {getMemoireTitre(download.memoire)}
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">
                            {getAuteurName(download.memoire?.auteur)}
                          </span>
                        </div>
                        
                        <div className="flex items-center">
                          <span className="font-medium mr-2 whitespace-nowrap">Email:</span>
                          <span className="truncate">{download.email || 'Email non disponible'}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{getEntiteName(download.entite)}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="whitespace-nowrap">
                            {formatDate(download.date_telechargement)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Page {currentPage} sur {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded border ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Précédent
                    </button>
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded border ${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}