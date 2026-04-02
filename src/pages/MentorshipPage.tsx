import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, getDocs, limit } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { GraduationCap, Users, Star, MessageCircle, ShieldCheck, Heart, Zap, Award, CheckCircle2, Plus, X as CloseIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Mentorship {
  id: string;
  mentorId: string;
  menteeId: string;
  status: 'Pending' | 'Active' | 'Completed' | 'Cancelled';
  startDate: any;
  endDate?: any;
}

interface UserProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  role: string;
}

export default function MentorshipPage() {
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [mentees, setMentees] = useState<Mentorship[]>([]);
  const [availableMentors, setAvailableMentors] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;
    
    // As a mentor
    const qMentor = query(
      collection(db, 'mentorships'),
      where('mentorId', '==', auth.currentUser.uid)
    );
    const unsubscribeMentor = onSnapshot(qMentor, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Mentorship[];
      setMentorships(data);
    });

    // As a mentee
    const qMentee = query(
      collection(db, 'mentorships'),
      where('menteeId', '==', auth.currentUser.uid)
    );
    const unsubscribeMentee = onSnapshot(qMentee, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Mentorship[];
      setMentees(data);
      setLoading(false);
    });

    // Fetch potential mentors (simplified for now)
    const fetchMentors = async () => {
      const q = query(collection(db, 'users'), where('role', '==', 'dev'), limit(10));
      const snap = await getDocs(q);
      const data = snap.docs
        .map(doc => doc.data() as UserProfile)
        .filter(u => u.uid !== auth.currentUser?.uid);
      setAvailableMentors(data);
    };
    fetchMentors();

    return () => {
      unsubscribeMentor();
      unsubscribeMentee();
    };
  }, []);

  const handleRequestMentorship = async (mentorId: string) => {
    if (!auth.currentUser) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'mentorships'), {
        mentorId,
        menteeId: auth.currentUser.uid,
        status: 'Pending',
        startDate: serverTimestamp()
      });
      setShowModal(false);
      alert('Demande de mentorat envoyée !');
    } catch (error) {
      console.error("Error requesting mentorship:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <div className="mb-16">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center gap-4 uppercase tracking-tighter">
          <GraduationCap className="text-indigo-600 dark:text-indigo-400" size={48} />
          Programme Héritage
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-xl max-w-2xl">
          La transmission du savoir est le signe ultime de leadership. Devenez mentor ou trouvez un parrain pour votre carrière.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stats Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-100 dark:shadow-indigo-900/20 relative overflow-hidden group">
            <Zap className="absolute top-0 right-0 p-4 text-indigo-400 opacity-20 group-hover:scale-110 transition-transform" size={120} />
            <h3 className="text-xl font-bold mb-2">Mon Influence</h3>
            <div className="text-5xl font-black mb-4">Level 4</div>
            <p className="text-indigo-100 text-sm leading-relaxed">
              Vous avez guidé 12 développeurs juniors vers leur premier poste senior au Gabon.
            </p>
            <div className="mt-8 pt-8 border-t border-indigo-500 flex justify-between items-center">
              <div className="text-center">
                <div className="text-2xl font-black">12</div>
                <div className="text-[10px] uppercase font-bold text-indigo-200">Filleuls</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black">450</div>
                <div className="text-[10px] uppercase font-bold text-indigo-200">Heures</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black">15</div>
                <div className="text-[10px] uppercase font-bold text-indigo-200">Badges</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-surface rounded-3xl p-8 border border-slate-100 dark:border-dark-border shadow-sm">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tighter">Certifications Internes</h3>
            <div className="space-y-4">
              {[
                { title: 'Architecte Cloud Gabon', date: 'Jan 2026', icon: ShieldCheck },
                { title: 'Maître du Backend', date: 'Dec 2025', icon: Award },
                { title: 'Gardien du Code', date: 'Oct 2025', icon: CheckCircle2 }
              ].map((cert, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-dark-bg transition-colors cursor-pointer group">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <cert.icon size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{cert.title}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{cert.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mentorship List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Relations Actives</h2>
            <button 
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              <Plus size={16} />
              Nouvelle Demande
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Mentorships as Mentor */}
              {mentorships.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">En tant que Mentor</h3>
                  {mentorships.map((m, index) => (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      key={m.id}
                      className="bg-white dark:bg-dark-surface p-6 rounded-3xl border border-slate-100 dark:border-dark-border shadow-sm flex items-center justify-between group hover:border-indigo-200 dark:hover:border-indigo-500/50 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-dark-bg border border-white dark:border-dark-border shadow-sm" />
                        <div>
                          <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Développeur Junior</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                              m.status === 'Active' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                            }`}>
                              {m.status}
                            </span>
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Depuis le {new Date(m.startDate?.seconds * 1000).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button className="p-3 bg-slate-50 dark:bg-dark-bg text-slate-400 dark:text-slate-500 rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">
                          <MessageCircle size={20} />
                        </button>
                        <button className="p-3 bg-slate-50 dark:bg-dark-bg text-slate-400 dark:text-slate-500 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 dark:hover:text-rose-400 transition-all">
                          <Heart size={20} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Mentorships as Mentee */}
              {mentees.length > 0 && (
                <div className="space-y-4 mt-8">
                  <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">En tant que Filleul</h3>
                  {mentees.map((m, index) => (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      key={m.id}
                      className="bg-white dark:bg-dark-surface p-6 rounded-3xl border border-slate-100 dark:border-dark-border shadow-sm flex items-center justify-between group hover:border-indigo-200 dark:hover:border-indigo-500/50 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-white dark:border-dark-border shadow-sm" />
                        <div>
                          <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Mentor Expert</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                              m.status === 'Active' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                            }`}>
                              {m.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className="p-3 bg-slate-50 dark:bg-dark-bg text-slate-400 dark:text-slate-500 rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">
                        <MessageCircle size={20} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}

              {mentorships.length === 0 && mentees.length === 0 && (
                <div className="text-center py-20 bg-white dark:bg-dark-surface rounded-3xl border border-dashed border-slate-200 dark:border-dark-border">
                  <Users className="mx-auto text-slate-200 dark:text-slate-800 mb-4" size={64} />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Aucun parrainage en cours</h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">Commencez à transmettre votre savoir ou demandez de l'aide à un expert.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Request Modal */}
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
              className="relative bg-white dark:bg-dark-surface rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 dark:border-dark-border flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Trouver un Mentor</h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-dark-bg rounded-xl transition-colors">
                  <CloseIcon size={20} className="text-slate-400 dark:text-slate-500" />
                </button>
              </div>
              
              <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                  {availableMentors.map((mentor) => (
                    <div key={mentor.uid} className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 dark:border-dark-border hover:border-indigo-200 dark:hover:border-indigo-500/50 transition-all group">
                      <div className="flex items-center gap-3">
                        <img 
                          src={mentor.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.displayName)}&background=random`} 
                          alt="" 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">{mentor.displayName}</div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Expert Backend</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRequestMentorship(mentor.uid)}
                        disabled={submitting}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
                      >
                        {submitting ? <Loader2 className="animate-spin" size={14} /> : 'Solliciter'}
                      </button>
                    </div>
                  ))}
                  {availableMentors.length === 0 && (
                    <p className="text-center text-slate-500 dark:text-slate-400 py-8">Aucun mentor disponible pour le moment.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
