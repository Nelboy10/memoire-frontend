'use client';
import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../lib/api';
import { useRouter } from 'next/navigation';
import { Upload, BookOpen, ArrowLeft, FileText } from 'lucide-react';

interface MemoireFormData {
  titre: string;
  resume: string;
  mots_cles: string;
  filiere: string;
  annee_soumission: string;
  fichier: File | null;
}

export default function DeposerMemoire() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<MemoireFormData>({
    titre: '',
    resume: '',
    mots_cles: '',
    filiere: '',
    annee_soumission: new Date().getFullYear().toString(),
    fichier: null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.fichier) {
      setError('Veuillez sélectionner un fichier');
      setLoading(false);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('titre', formData.titre);
      submitData.append('resume', formData.resume);
      submitData.append('mots_cles', formData.mots_cles);
      submitData.append('filiere', formData.filiere);
      submitData.append('annee_soumission', formData.annee_soumission);
      submitData.append('fichier', formData.fichier);

      const response = await api.post('/etudiant/deposer-memoire/', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Mémoire déposé avec succès! Il est maintenant en attente de validation par la secrétaire.');
      router.push('/dashboard/etudiant/mes-memoires');
    } catch (error: any) {
      if (error.response?.data?.error === 'Compte expiré') {
        setError('Votre compte a expiré. Contactez la secrétaire pour le prolonger.');
      } else {
        setError(error.response?.data?.error || 'Erreur lors du dépôt du mémoire');
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
      const allowedTypes = ['.pdf', '.doc', '.docx'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedTypes.includes(fileExtension || '')) {
        setError('Seuls les fichiers PDF et Word sont autorisés');
        return;
      }
      setFormData({ ...formData, fichier: file });
      setError('');
    }
  };

  if (error && error.includes('expiré')) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Compte expiré</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-gray-600">
            Contactez la secrétaire de votre entité pour prolonger votre compte.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Déposer un Mémoire</h1>
            <p className="text-gray-600 mt-1">Remplissez les informations concernant votre mémoire</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="md:col-span-2">
              <label htmlFor="titre" className="block text-sm font-medium text-gray-700 mb-2">
                Titre du mémoire *
              </label>
              <input
                type="text"
                id="titre"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.titre}
                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                placeholder="Ex: Étude sur l'impact des nouvelles technologies..."
              />
            </div>

            <div>
              <label htmlFor="filiere" className="block text-sm font-medium text-gray-700 mb-2">
                Filière *
              </label>
              <input
                type="text"
                id="filiere"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.filiere}
                onChange={(e) => setFormData({ ...formData, filiere: e.target.value })}
                placeholder="Ex: Informatique, Gestion, etc."
              />
            </div>

            <div>
              <label htmlFor="annee_soumission" className="block text-sm font-medium text-gray-700 mb-2">
                Année de soumission *
              </label>
              <input
                type="number"
                id="annee_soumission"
                required
                min="2000"
                max={new Date().getFullYear()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.annee_soumission}
                onChange={(e) => setFormData({ ...formData, annee_soumission: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="mots_cles" className="block text-sm font-medium text-gray-700 mb-2">
                Mots-clés *
              </label>
              <input
                type="text"
                id="mots_cles"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.mots_cles}
                onChange={(e) => setFormData({ ...formData, mots_cles: e.target.value })}
                placeholder="Séparés par des virgules (Ex: technologie, innovation, développement)"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-2">
                Résumé *
              </label>
              <textarea
                id="resume"
                required
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.resume}
                onChange={(e) => setFormData({ ...formData, resume: e.target.value })}
                placeholder="Résumez brièvement le contenu de votre mémoire..."
              />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="fichier" className="block text-sm font-medium text-gray-700 mb-2">
              Fichier du mémoire *
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="fichier"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
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
                  <p className="text-sm text-green-600 flex items-center justify-center">
                    <FileText className="h-4 w-4 mr-1" />
                    Fichier sélectionné: {formData.fichier.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-yellow-800 mb-2">Information importante</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Votre mémoire sera soumis à validation par la secrétaire</li>
              <li>• Vous serez notifié lorsque votre mémoire sera validé et rendu public</li>
              <li>• Une fois validé, votre mémoire sera accessible à tous les visiteurs</li>
              <li>• Vous pourrez suivre le nombre de téléchargements de votre mémoire</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center transition-colors"
            >
              <BookOpen className="h-5 w-5 mr-2" />
              {loading ? 'Dépôt en cours...' : 'Déposer le mémoire'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}