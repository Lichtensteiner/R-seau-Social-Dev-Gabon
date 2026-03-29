import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { User } from 'firebase/auth';
import { collection, addDoc, query, orderBy, onSnapshot, doc, deleteDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Briefcase, MapPin, Clock, Plus, Trash2, Building2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Job {
  id: string;
  authorId: string;
  companyName: string;
  title: string;
  type: string;
  location: string;
  description: string;
  skills: string[];
  createdAt: any;
}

export default function JobsPage({ user }: { user: User }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState('dev');

  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    type: 'CDI',
    location: '',
    description: '',
    skills: ''
  });

  useEffect(() => {
    // Fetch user role
    const fetchRole = async () => {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserRole(userSnap.data().role || 'dev');
      }
    };
    fetchRole();

    // Fetch jobs
    const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Job[];
      setJobs(jobsData);
    }, (error) => {
      console.error("Error fetching jobs:", error);
    });

    return () => unsubscribe();
  }, [user.uid]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(Boolean);
      
      await addDoc(collection(db, 'jobs'), {
        authorId: user.uid,
        title: formData.title,
        companyName: formData.companyName,
        type: formData.type,
        location: formData.location,
        description: formData.description,
        skills: skillsArray,
        createdAt: serverTimestamp()
      });
      
      setShowForm(false);
      setFormData({
        title: '', companyName: '', type: 'CDI', location: '', description: '', skills: ''
      });
    } catch (error) {
      console.error("Error creating job:", error);
      alert("Erreur lors de la création de l'offre.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette offre ?")) return;
    try {
      await deleteDoc(doc(db, 'jobs', jobId));
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Opportunités</h1>
          <p className="text-slate-500 mt-1">Trouvez votre prochaine mission au Gabon</p>
        </div>
        
        {(userRole === 'recruiter' || userRole === 'admin' || userRole === 'dev') && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            {showForm ? <Trash2 size={18} /> : <Plus size={18} />}
            {showForm ? 'Annuler' : 'Publier une offre'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Nouvelle opportunité</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Titre du poste</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Développeur React Native"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Entreprise</label>
                <input
                  required
                  type="text"
                  value={formData.companyName}
                  onChange={e => setFormData({...formData, companyName: e.target.value})}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="TechGabon"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type de contrat</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="Stage">Stage</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Localisation</label>
                <input
                  required
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Libreville, Gabon (ou Remote)"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Décrivez la mission, les responsabilités..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Compétences (séparées par des virgules)</label>
              <input
                type="text"
                value={formData.skills}
                onChange={e => setFormData({...formData, skills: e.target.value})}
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="React, Node.js, TypeScript"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Publication...' : 'Publier'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {jobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <p className="text-slate-500">Aucune offre pour le moment.</p>
          </div>
        ) : (
          jobs.map(job => (
            <div key={job.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{job.title}</h2>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <Building2 size={16} className="text-slate-400" />
                      {job.companyName}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={16} className="text-slate-400" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase size={16} className="text-slate-400" />
                      {job.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={16} className="text-slate-400" />
                      {job.createdAt ? formatDistanceToNow(job.createdAt?.toDate ? job.createdAt.toDate() : new Date(job.createdAt), { addSuffix: true, locale: fr }) : "à l'instant"}
                    </span>
                  </div>
                </div>
                {(job.authorId === user.uid || userRole === 'admin') && (
                  <button 
                    onClick={() => handleDelete(job.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-2"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              
              <div className="mt-4 text-slate-700 whitespace-pre-wrap line-clamp-3">
                {job.description}
              </div>

              {job.skills && job.skills.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {job.skills.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                  Postuler
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
