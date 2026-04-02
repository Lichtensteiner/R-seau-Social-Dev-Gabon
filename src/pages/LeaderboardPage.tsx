import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Trophy, Medal, Award, Star, Zap, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface LeaderboardEntry {
  userId: string;
  displayName: string;
  photoURL?: string;
  points: number;
  rank?: number;
  badges?: string[];
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'leaderboard'), orderBy('points', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc, index) => ({
        ...doc.data(),
        rank: index + 1
      })) as LeaderboardEntry[];
      setEntries(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="text-yellow-500" size={24} />;
      case 2: return <Medal className="text-slate-400" size={24} />;
      case 3: return <Award className="text-amber-600" size={24} />;
      default: return <span className="text-slate-400 font-mono font-bold">#{rank}</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Trophy className="text-indigo-600 dark:text-indigo-400" />
          Leaderboard d'Élite
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Le classement des meilleurs développeurs du Gabon. Points basés sur les contributions, l'impact et l'engagement.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={entry.userId}
              className={`bg-white dark:bg-dark-surface p-4 rounded-2xl border ${
                index < 3 
                  ? 'border-indigo-100 dark:border-indigo-900/30 shadow-lg shadow-indigo-50 dark:shadow-none' 
                  : 'border-slate-100 dark:border-dark-border shadow-sm'
              } flex items-center justify-between group hover:border-indigo-300 dark:hover:border-indigo-500 transition-all`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 flex justify-center">
                  {getRankIcon(index + 1)}
                </div>
                <img
                  src={entry.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.displayName)}&background=random`}
                  alt={entry.displayName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-dark-border shadow-sm"
                />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {entry.displayName}
                  </h3>
                  <div className="flex gap-2 mt-1">
                    {entry.badges?.map((badge) => (
                      <span key={badge} className="px-2 py-0.5 bg-slate-100 dark:bg-dark-bg text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-full uppercase tracking-wider border border-slate-200 dark:border-dark-border">
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold text-xl">
                  <Zap size={18} />
                  {entry.points.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Points d'Impact</span>
              </div>
            </motion.div>
          ))}

          {entries.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-dark-surface rounded-2xl border border-dashed border-slate-200 dark:border-dark-border">
              <Star className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
              <p className="text-slate-500 dark:text-slate-400">Le classement est en cours de calcul...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
