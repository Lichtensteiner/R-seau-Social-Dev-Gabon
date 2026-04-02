import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Sword, Zap, Target, Clock, Shield, CheckCircle2, Play, AlertCircle, Loader2, X, Send, Code2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { updateLeaderboardPoints } from '../lib/leaderboard';

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Elite';
  points: number;
  type: 'Flash' | 'Duel' | 'Hackathon';
  status: 'Active' | 'Closed' | 'Upcoming';
  createdAt: any;
}

export default function BattlegroundPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [solution, setSolution] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'challenges'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Challenge[];
      setChallenges(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSolveChallenge = async () => {
    if (!auth.currentUser || !activeChallenge || !solution.trim()) return;
    setSubmitting(true);

    try {
      const submissionRef = doc(collection(db, 'challenges', activeChallenge.id, 'submissions'), auth.currentUser.uid);
      await setDoc(submissionRef, {
        userId: auth.currentUser.uid,
        displayName: auth.currentUser.displayName || 'Anonyme',
        solution: solution,
        status: 'Completed',
        completedAt: serverTimestamp(),
        score: activeChallenge.points
      });

      // Update leaderboard
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : null;

      await updateLeaderboardPoints(
        auth.currentUser.uid,
        userData?.displayName || auth.currentUser.displayName || 'Anonyme',
        userData?.photoURL || auth.currentUser.photoURL || undefined,
        'challenge_complete'
      );

      setActiveChallenge(null);
      setSolution('');
      alert(`Félicitations ! Vous avez terminé le défi "${activeChallenge.title}" et gagné ${activeChallenge.points} points !`);
    } catch (error) {
      console.error("Error submitting solution:", error);
      alert("Erreur lors de la soumission. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-emerald-100 text-emerald-700';
      case 'Medium': return 'bg-amber-100 text-amber-700';
      case 'Hard': return 'bg-rose-100 text-rose-700';
      case 'Elite': return 'bg-purple-100 text-purple-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center gap-4 uppercase tracking-tighter">
            <Sword className="text-indigo-600" size={40} />
            Battleground
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
            Défis de code en temps réel. Prouvez votre puissance technique.
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 dark:shadow-none flex items-center gap-2 hover:bg-indigo-700 transition-all cursor-pointer">
            <Zap size={20} />
            Lancer un Duel
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge, index) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              key={challenge.id}
              className="bg-white dark:bg-dark-surface rounded-3xl border border-slate-100 dark:border-dark-border shadow-sm hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all overflow-hidden flex flex-col group"
            >
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty}
                  </span>
                  <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold">
                    <Zap size={14} />
                    {challenge.points}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {challenge.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3 mb-6">
                  {challenge.description}
                </p>

                <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    {challenge.type}
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield size={14} />
                    {challenge.status}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-dark-bg/50 border-t border-slate-100 dark:border-dark-border flex items-center justify-between">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-dark-surface bg-slate-200 dark:bg-slate-800" />
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-white dark:border-dark-surface bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-bold">
                    +12
                  </div>
                </div>
                
                <button 
                  onClick={() => setActiveChallenge(challenge)}
                  className="px-4 py-2 bg-white dark:bg-dark-surface text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 rounded-xl font-bold text-sm hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white dark:hover:text-white transition-all flex items-center gap-2"
                >
                  <Play size={14} fill="currentColor" />
                  Rejoindre
                </button>
              </div>
            </motion.div>
          ))}

          {challenges.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white dark:bg-dark-surface rounded-3xl border border-dashed border-slate-200 dark:border-dark-border">
              <AlertCircle className="mx-auto text-slate-300 dark:text-slate-700 mb-4" size={64} />
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Aucun défi actif</h3>
              <p className="text-slate-500 dark:text-slate-400">Revenez plus tard pour de nouveaux hackathons et duels.</p>
            </div>
          )}
        </div>
      )}

      {/* Solve Modal */}
      <AnimatePresence>
        {activeChallenge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-dark-surface w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-dark-border"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getDifficultyColor(activeChallenge.difficulty)}`}>
                        {activeChallenge.difficulty}
                      </span>
                      <span className="text-indigo-600 font-bold text-sm flex items-center gap-1">
                        <Zap size={14} />
                        {activeChallenge.points} pts
                      </span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                      {activeChallenge.title}
                    </h2>
                  </div>
                  <button 
                    onClick={() => setActiveChallenge(null)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-dark-bg rounded-full transition-colors"
                  >
                    <X size={24} className="text-slate-400" />
                  </button>
                </div>

                <div className="bg-slate-50 dark:bg-dark-bg p-6 rounded-2xl mb-8 border border-slate-100 dark:border-dark-border">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Énoncé du défi</h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {activeChallenge.description}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Code2 size={14} />
                      Votre Solution (Code ou Explication)
                    </label>
                  </div>
                  <textarea
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                    placeholder="Collez votre code ici ou expliquez votre approche..."
                    className="w-full h-48 p-6 bg-slate-900 text-emerald-400 font-mono text-sm rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                  />
                </div>

                <div className="mt-8 flex gap-4">
                  <button
                    onClick={() => setActiveChallenge(null)}
                    className="flex-1 px-8 py-4 bg-slate-100 dark:bg-dark-bg text-slate-600 dark:text-slate-400 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-dark-border transition-all"
                  >
                    Abandonner
                  </button>
                  <button
                    onClick={handleSolveChallenge}
                    disabled={submitting || !solution.trim()}
                    className="flex-[2] px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <Send size={20} />
                    )}
                    {submitting ? 'Envoi en cours...' : 'Soumettre la Solution'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
