'use client';
import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../lib/api';
import { useRouter } from 'next/navigation';
import { BookOpen, Upload } from 'lucide-react';

interface MemoireFormData {
  titre: string;
  resume: string;
  mots_cles: string;
  filiere: string;
  annee_soumission: string;
  est_public: boolean;
  fichier: File | null;
}

export default function AjouterMemoire() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<MemoireFormData>({
    titre: '',
    resume: '',
    mots_cles: '',
    filiere: '',
    annee_soumission: new Date().getFullYear().toString(),
    est_public: false, // Changé à false par défaut (doit être validé)
    fichier: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (!formData.fichier) {
      setError('Veuillez sélectionner un fichier');
      setLoading(false);
      return;
    }

    if (!user) {
      setError('Vous devez être connecté pour déposer un mémoire');
      setLoading(false);
      return;
    }

    try {
      const submitData = new FormData();
      
      // Ajouter les champs textuels
      submitData.append('titre', formData.titre);
      submitData.append('resume', formData.resume);
      submitData.append('mots_cles', formData.mots_cles);
      submitData.append('filiere', formData.filiere);
      submitData.append('annee_soumission', formData.annee_soumission);
      submitData.append('est_public', formData.est_public.toString());
      
      // Ajouter le fichier
      submitData.append('fichier', formData.fichier);

      console.log('Envoi du mémoire...', {
        titre: formData.titre,
        filiere: formData.filiere,
        annee: formData.annee_soumission,
        est_public: formData.est_public,
        fichier: formData.fichier.name
      });

      // Utiliser l'endpoint étudiant spécifique
      const response = await api.post('/etudiant/deposer-memoire/', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Réponse du serveur:', response.data);
      
      setError(null);
      router.push('/dashboard/memoires');
    } catch (error: any) {
      console.error('Erreur détaillée:', error);
      
      // Gestion détaillée des erreurs
      if (error.response?.data) {
        const errors = error.response.data;
        if (typeof errors === 'object') {
          const errorMessages = Object.values(errors).flat().join(', ');
          setError(`Erreur de validation: ${errorMessages}`);
        } else if (typeof errors === 'string') {
          setError(errors);
        } else {
          setError('Erreur lors du dépôt du mémoire');
        }
      } else if (error.response?.status === 403) {
        setError('Accès refusé. Votre compte étudiant a peut-être expiré.');
      } else if (error.response?.status === 400) {
        setError('Données invalides. Vérifiez tous les champs.');
      } else {
        setError('Erreur de connexion au serveur');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille du fichier (max 20MB)
      if (file.size > 20 * 1024 * 1024) {
        setError('Le fichier ne doit pas dépasser 20MB');
        return;
      }
      
      // Vérifier le type de fichier
      const allowedTypes = ['application/pdf', 
                           'application/msword', 
                           'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const fileType = file.type;
      
      if (!allowedTypes.includes(fileType)) {
        setError('Seuls les fichiers PDF (.pdf) et Word (.doc, .docx) sont autorisés');
        return;
      }
      
      setFormData({ ...formData, fichier: file });
      setError(null);
    }
  };

  // Vérifier si l'utilisateur est un étudiant
  if (user?.role !== 'etudiant') {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-red-800 mb-2">Accès non autorisé</h2>
            <p className="text-red-600">
              Cette fonctionnalité est réservée aux étudiants.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Déposer un mémoire</h1>
          <p className="text-gray-600 mt-1">
            Remplissez les informations concernant votre mémoire
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="md:col-span-2">
              <label htmlFor="titre" className="block text-sm font-medium text-gray-700 mb-1">
                Titre du mémoire *
              </label>
              <input
                type="text"
                id="titre"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.titre}
                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                placeholder="Titre complet de votre mémoire"
              />
            </div>

            <div>
              <label htmlFor="filiere" className="block text-sm font-medium text-gray-700 mb-1">
                Filière *
              </label>
              <input
                type="text"
                id="filiere"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.filiere}
                onChange={(e) => setFormData({ ...formData, filiere: e.target.value })}
                placeholder="Informatique, Gestion, Marketing, etc."
              />
            </div>

            <div>
              <label htmlFor="annee_soumission" className="block text-sm font-medium text-gray-700 mb-1">
                Année de soumission *
              </label>
              <input
                type="number"
                id="annee_soumission"
                required
                min="2000"
                max={new Date().getFullYear()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.annee_soumission}
                onChange={(e) => setFormData({ ...formData, annee_soumission: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="mots_cles" className="block text-sm font-medium text-gray-700 mb-1">
                Mots-clés *
              </label>
              <input
                type="text"
                id="mots_cles"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.mots_cles}
                onChange={(e) => setFormData({ ...formData, mots_cles: e.target.value })}
                placeholder="Séparés par des virgules (ex: intelligence artificielle, machine learning, données)"
              />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-1">
              Résumé *
            </label>
            <textarea
              id="resume"
              required
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.resume}
              onChange={(e) => setFormData({ ...formData, resume: e.target.value })}
              placeholder="Décrivez brièvement le contenu de votre mémoire, les objectifs, la méthodologie et les résultats principaux..."
            />
          </div>

          <div className="mb-6">
            <label className="flex items-start">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                checked={formData.est_public}
                onChange={(e) => setFormData({ ...formData, est_public: e.target.checked })}
              />
              <span className="ml-2 text-sm text-gray-700">
                Rendre ce mémoire public immédiatement après validation
                <br />
                <span className="text-gray-500 text-xs">
                  Si coché, le mémoire sera visible par tous après validation par la secrétaire. 
                  Sinon, il restera privé.
                </span>
              </span>
            </label>
          </div>

          <div className="mb-6">
            <label htmlFor="fichier" className="block text-sm font-medium text-gray-700 mb-1">
              Fichier du mémoire *
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="fichier"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500"
                  >
                    <span>Téléversez un fichier</span>
                    <input
                      id="fichier"
                      name="fichier"
                      type="file"
                      required
                      accept=".pdf,.doc,.docx"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">ou glissez-déposez</p>
                </div>
                <p className="text-xs text-gray-500">
                  PDF, DOC, DOCX jusqu'à 20MB
                </p>
                {formData.fichier && (
                  <p className="text-sm text-green-600 font-medium">
                    ✓ Fichier sélectionné: {formData.fichier.name} 
                    ({(formData.fichier.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Dépôt en cours...
                </>
              ) : (
                <>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Déposer le mémoire
                </>
              )}
            </button>
          </div>
        </form>

        {/* Informations importantes */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Informations importantes</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Votre mémoire sera soumis à validation par la secrétaire de votre entité</li>
            <li>• Le fichier doit être au format PDF ou Word</li>
            <li>• La taille maximale autorisée est de 20MB</li>
            <li>• Vous serez notifié par email une fois le mémoire validé</li>
          </ul>
        </div>
      </div>
    </div>
  );
}