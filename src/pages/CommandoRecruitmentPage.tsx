import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { ShieldCheck, Target, Zap, Clock, AlertCircle, CheckCircle2, Play, Layout, Code2, Users, Loader2, X, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { updateLeaderboardPoints } from '../lib/leaderboard';

interface TechnicalTest {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: 'Junior' | 'Intermediate' | 'Senior' | 'Expert';
  questions: {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
  createdAt: any;
}

export default function CommandoRecruitmentPage() {
  const [tests, setTests] = useState<TechnicalTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTest, setActiveTest] = useState<TechnicalTest | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [testResult, setTestResult] = useState<{ score: number; passed: boolean } | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'technical_tests'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TechnicalTest[];
      setTests(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleStartTest = (test: TechnicalTest) => {
    setActiveTest(test);
    setCurrentQuestion(0);
    setAnswers([]);
    setTestResult(null);
  };

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSubmitTest = async () => {
    if (!auth.currentUser || !activeTest) return;
    setSubmitting(true);

    try {
      let correctCount = 0;
      activeTest.questions.forEach((q, index) => {
        if (answers[index] === q.correctAnswer) {
          correctCount++;
        }
      });

      const score = Math.round((correctCount / activeTest.questions.length) * 100);
      const passed = score >= 70;

      // Save result
      await addDoc(collection(db, 'test_results'), {
        testId: activeTest.id,
        userId: auth.currentUser.uid,
        displayName: auth.currentUser.displayName || 'Anonyme',
        score,
        passed,
        status: 'Completed',
        completedAt: serverTimestamp()
      });

      if (passed) {
        // Update leaderboard
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.exists() ? userSnap.data() : null;

        await updateLeaderboardPoints(
          auth.currentUser.uid,
          userData?.displayName || auth.currentUser.displayName || 'Anonyme',
          userData?.photoURL || auth.currentUser.photoURL || undefined,
          'test_pass'
        );
      }

      setTestResult({ score, passed });
    } catch (error) {
      console.error("Error submitting test:", error);
      alert("Erreur lors de la soumission du test.");
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
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-dark-surface text-white rounded-full text-xs font-black uppercase tracking-widest mb-6 shadow-xl shadow-slate-200 dark:shadow-none border dark:border-dark-border"
        >
          <ShieldCheck size={14} className="text-indigo-400" />
          Recrutement Commando
        </motion.div>
        <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter">
          L'Élite du Gabon
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xl max-w-2xl mx-auto">
          Tests techniques rigoureux pour filtrer les meilleurs talents. Seuls les plus robustes seront sélectionnés par les entreprises.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tests.map((test, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={test.id}
              className="bg-white dark:bg-dark-surface rounded-3xl border border-slate-100 dark:border-dark-border shadow-sm hover:shadow-2xl hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all p-8 flex flex-col group relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                  <Clock size={16} />
                  {test.duration} min
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  test.difficulty === 'Expert' ? 'bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400' : 'bg-slate-100 dark:bg-dark-bg text-slate-700 dark:text-slate-400'
                }`}>
                  {test.difficulty}
                </span>
              </div>

              <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {test.title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 line-clamp-3">
                {test.description}
              </p>

              <div className="mt-auto pt-8 border-t border-slate-50 dark:border-dark-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  <Users size={16} />
                  {test.questions.length} Questions
                </div>
                
                <button 
                  onClick={() => handleStartTest(test)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-xl shadow-indigo-100 dark:shadow-none"
                >
                  <Play size={14} fill="currentColor" />
                  Démarrer
                </button>
              </div>
            </motion.div>
          ))}

          {tests.length === 0 && (
            <div className="col-span-full py-32 text-center bg-white dark:bg-dark-surface rounded-3xl border border-dashed border-slate-200 dark:border-dark-border">
              <AlertCircle className="mx-auto text-slate-200 dark:text-slate-700 mb-6" size={80} />
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter">Aucun Test Disponible</h3>
              <p className="text-slate-500 dark:text-slate-400 text-lg max-w-md mx-auto">Les entreprises n'ont pas encore publié de tests techniques pour le moment.</p>
            </div>
          )}
        </div>
      )}

      {/* Test Modal */}
      <AnimatePresence>
        {activeTest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-dark-surface w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-dark-border"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                    {activeTest.title}
                  </h2>
                  {!testResult && (
                    <div className="flex items-center gap-2 text-indigo-600 font-bold">
                      <Clock size={18} />
                      <span>Question {currentQuestion + 1} / {activeTest.questions.length}</span>
                    </div>
                  )}
                  <button 
                    onClick={() => setActiveTest(null)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-dark-bg rounded-full transition-colors"
                  >
                    <X size={24} className="text-slate-400" />
                  </button>
                </div>

                {!testResult ? (
                  <div className="space-y-8">
                    <div className="bg-slate-50 dark:bg-dark-bg p-8 rounded-3xl border border-slate-100 dark:border-dark-border">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
                        {activeTest.questions[currentQuestion].question}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {activeTest.questions[currentQuestion].options.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAnswer(idx)}
                          className={`p-6 rounded-2xl text-left font-bold transition-all border-2 ${
                            answers[currentQuestion] === idx
                              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400'
                              : 'border-slate-100 dark:border-dark-border hover:border-indigo-200 dark:hover:border-indigo-900/40 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                              answers[currentQuestion] === idx ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 dark:border-dark-border'
                            }`}>
                              {String.fromCharCode(65 + idx)}
                            </div>
                            {option}
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-8 border-t border-slate-100 dark:border-dark-border">
                      <button
                        onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestion === 0}
                        className="px-6 py-3 text-slate-400 font-bold hover:text-slate-600 disabled:opacity-0 transition-colors"
                      >
                        Précédent
                      </button>
                      
                      {currentQuestion === activeTest.questions.length - 1 ? (
                        <button
                          onClick={handleSubmitTest}
                          disabled={submitting || answers[currentQuestion] === undefined}
                          className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-2 disabled:opacity-50"
                        >
                          {submitting ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                          Terminer le Test
                        </button>
                      ) : (
                        <button
                          onClick={() => setCurrentQuestion(prev => prev + 1)}
                          disabled={answers[currentQuestion] === undefined}
                          className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                          Suivant
                          <ChevronRight size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 ${
                      testResult.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                    }`}>
                      {testResult.passed ? <CheckCircle2 size={48} /> : <AlertCircle size={48} />}
                    </div>
                    <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter">
                      {testResult.score}%
                    </h3>
                    <p className="text-xl font-bold text-slate-500 mb-8">
                      {testResult.passed ? 'Félicitations ! Vous avez réussi le test.' : 'Dommage ! Vous n\'avez pas atteint le score requis.'}
                    </p>
                    <button
                      onClick={() => setActiveTest(null)}
                      className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                    >
                      Fermer
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Recruitment Stats */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: 'Placements Réussis', value: '45', icon: CheckCircle2 },
          { label: 'Entreprises Partenaires', value: '12', icon: Layout },
          { label: 'Tests Complétés', value: '850', icon: Code2 },
          { label: 'Score Moyen', value: '78%', icon: Target }
        ].map((stat, i) => (
          <div key={i} className="bg-slate-50 dark:bg-dark-surface p-8 rounded-3xl text-center border border-slate-100 dark:border-dark-border group hover:bg-white dark:hover:bg-dark-bg hover:shadow-xl transition-all">
            <stat.icon size={32} className="mx-auto text-indigo-500 mb-4 group-hover:scale-110 transition-transform" />
            <div className="text-3xl font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tighter">{stat.value}</div>
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
