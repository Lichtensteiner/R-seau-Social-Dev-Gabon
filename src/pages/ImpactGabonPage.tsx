import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Target, Zap, Globe, Users, TrendingUp, Star, Layout, Code2, ShieldCheck, CheckCircle2, Plus, X as CloseIcon, Loader2, Rocket, Github, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImpactProject {
  id: string;
  title: string;
  description: string;
  authorId: string;
  authorName: string;
  impactScore: number;
  status: 'Draft' | 'Published' | 'Featured';
  tags: string[];
  link?: string;
  github?: string;
  createdAt: any;
}

export default function ImpactGabonPage() {
  const [projects, setProjects] = useState<ImpactProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    github: '',
    tags: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'impact_projects'), orderBy('impactScore', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ImpactProject[];
      setProjects(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setSubmitting(true);

    try {
      await addDoc(collection(db, 'impact_projects'), {
        title: formData.title,
        description: formData.description,
        link: formData.link,
        github: formData.github,
        tags: formData.tags.split(',').map(t => t.trim()),
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || 'Anonyme',
        impactScore: 0,
        status: 'Draft',
        createdAt: serverTimestamp()
      });
      setShowModal(false);
      setFormData({ title: '', description: '', link: '', github: '', tags: '' });
      alert('Projet soumis avec succès ! Il sera examiné par l\'équipe.');
    } catch (error) {
      console.error("Error submitting project:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <div className="mb-16 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-black uppercase tracking-widest mb-6"
        >
          <Target size={14} />
          Showcase de Projets
        </motion.div>
        <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter">
          Impact Gabon
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xl max-w-2xl mx-auto mb-8">
          Mise en avant des architectures les plus robustes et des déploiements réussis qui transforment le Gabon.
        </p>
        <button 
          onClick={() => setShowModal(true)}
          className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 dark:shadow-none flex items-center gap-2 mx-auto"
        >
          <Plus size={20} />
          Soumettre mon Projet
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <motion.div
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              key={project.id}
              className="bg-white dark:bg-dark-surface rounded-3xl border border-slate-100 dark:border-dark-border shadow-sm hover:shadow-2xl hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all p-8 flex flex-col group relative overflow-hidden"
            >
              {/* Impact Score Badge */}
              <div className="absolute top-0 right-0 p-6">
                <div className="flex flex-col items-center justify-center w-16 h-16 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 dark:shadow-none transform rotate-3 group-hover:rotate-0 transition-transform">
                  <span className="text-xs font-black uppercase tracking-widest leading-none mb-1">Impact</span>
                  <span className="text-xl font-black leading-none">{project.impactScore}</span>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex gap-2 mb-6">
                  {project.tags?.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-slate-50 dark:bg-dark-bg text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>

                <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {project.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed mb-8">
                  {project.description}
                </p>

                <div className="grid grid-cols-3 gap-4 py-6 border-y border-slate-50 dark:border-dark-border mb-8">
                  <div className="flex flex-col items-center text-center">
                    <Users size={20} className="text-indigo-500 mb-2" />
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Utilisateurs</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">12k+</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <TrendingUp size={20} className="text-indigo-500 mb-2" />
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Croissance</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">+45%</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <Globe size={20} className="text-indigo-500 mb-2" />
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Portée</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">Nationale</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-dark-bg border border-white dark:border-dark-border shadow-sm" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Architecte</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{project.authorName || 'DevGabon Elite'}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {project.github && (
                    <a href={project.github} target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-50 dark:bg-dark-bg text-slate-400 dark:text-slate-500 rounded-2xl hover:bg-slate-900 dark:hover:bg-indigo-600 hover:text-white transition-all">
                      <Github size={20} />
                    </a>
                  )}
                  {project.link && (
                    <a href={project.link} target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-50 dark:bg-dark-bg text-slate-400 dark:text-slate-500 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all">
                      <ExternalLink size={20} />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {projects.length === 0 && (
            <div className="col-span-full py-32 text-center bg-white dark:bg-dark-surface rounded-3xl border border-dashed border-slate-200 dark:border-dark-border">
              <Star className="mx-auto text-slate-200 dark:text-slate-700 mb-6" size={80} />
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter">Wall of Fame Vide</h3>
              <p className="text-slate-500 dark:text-slate-400 text-lg max-w-md mx-auto">Soyez le premier à soumettre un projet à fort impact pour le Gabon.</p>
              <button 
                onClick={() => setShowModal(true)}
                className="mt-8 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 dark:shadow-none"
              >
                Soumettre mon Projet
              </button>
            </div>
          )}
        </div>
      )}

      {/* Submission Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white dark:bg-dark-surface rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border dark:border-dark-border"
            >
              <div className="p-6 border-b border-slate-100 dark:border-dark-border flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Soumettre un Projet</h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-dark-bg rounded-xl transition-colors">
                  <CloseIcon size={20} className="text-slate-400" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Titre du Projet</label>
                  <input 
                    required
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-medium"
                    placeholder="Ex: Gabon Health Connect"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
                  <textarea 
                    required
                    rows={4}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-medium resize-none"
                    placeholder="Expliquez l'impact de votre projet..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Lien Live</label>
                    <input 
                      value={formData.link}
                      onChange={e => setFormData({...formData, link: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-medium"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">GitHub</label>
                    <input 
                      value={formData.github}
                      onChange={e => setFormData({...formData, github: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-medium"
                      placeholder="https://github.com/..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Tags (séparés par des virgules)</label>
                  <input 
                    value={formData.tags}
                    onChange={e => setFormData({...formData, tags: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-medium"
                    placeholder="React, Firebase, Santé..."
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                >
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Envoyer la Soumission'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
