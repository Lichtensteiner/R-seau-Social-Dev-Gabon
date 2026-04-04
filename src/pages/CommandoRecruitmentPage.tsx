import { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, limit, where } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Target, Zap, Clock, AlertCircle, CheckCircle2, Play, Layout, 
  Code2, Users, Loader2, X, ChevronRight, Check, Trophy, Medal, 
  Flame, Star, Award, TrendingUp, Search, Filter, BookOpen, 
  Terminal, Cpu, Globe, Rocket
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { updateLeaderboardPoints } from '../lib/leaderboard';
import { formatDate, formatDistance } from '../lib/date-utils';
import confetti from 'canvas-confetti';

interface TechnicalTest {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: 'Junior' | 'Intermediate' | 'Senior' | 'Expert';
  category: string;
  questions: {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  }[];
  createdAt: any;
}

interface TestResult {
  id: string;
  testId: string;
  userId: string;
  displayName: string;
  score: number;
  passed: boolean;
  completedAt: any;
}

interface HallOfFamer {
  id: string;
  displayName: string;
  photoURL?: string;
  points: number;
}

export default function CommandoRecruitmentPage() {
  const navigate = useNavigate();
  const [tests, setTests] = useState<TechnicalTest[]>([]);
  const [recentResults, setRecentResults] = useState<TestResult[]>([]);
  const [hallOfFame, setHallOfFame] = useState<HallOfFamer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTest, setActiveTest] = useState<TechnicalTest | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [testResult, setTestResult] = useState<{ score: number; passed: boolean; correctAnswers: number } | null>(null);
  const [filter, setFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Real-time tests
  useEffect(() => {
    const q = query(collection(db, 'technical_tests'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TechnicalTest[];
      setTests(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'technical_tests');
    });
    return () => unsubscribe();
  }, []);

  // Real-time recent results
  useEffect(() => {
    const q = query(
      collection(db, 'test_results'), 
      where('passed', '==', true),
      orderBy('completedAt', 'desc'), 
      limit(5)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TestResult[];
      setRecentResults(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'test_results');
    });
    return () => unsubscribe();
  }, []);

  // Real-time Hall of Fame (Top 5 from leaderboard)
  useEffect(() => {
    const q = query(collection(db, 'leaderboard'), orderBy('points', 'desc'), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HallOfFamer[];
      setHallOfFame(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'leaderboard');
    });
    return () => unsubscribe();
  }, []);

  const filteredTests = useMemo(() => {
    return tests.filter(test => {
      const matchesFilter = filter === 'All' || test.difficulty === filter || test.category === filter;
      const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           test.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [tests, filter, searchQuery]);

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
      try {
        await addDoc(collection(db, 'test_results'), {
          testId: activeTest.id,
          testTitle: activeTest.title,
          userId: auth.currentUser.uid,
          displayName: auth.currentUser.displayName || 'Anonyme',
          score,
          passed,
          status: 'Completed',
          completedAt: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'test_results');
      }

      if (passed) {
        // Confetti effect
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4f46e5', '#10b981', '#f59e0b']
        });

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

      setTestResult({ score, passed, correctAnswers: correctCount });
    } catch (error) {
      console.error("Error submitting test:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToTests = () => {
    const element = document.getElementById('tests-grid');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const categories = ['All', 'Frontend', 'Backend', 'Fullstack', 'DevOps', 'Mobile', 'Expert'];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[3rem] bg-slate-900 dark:bg-dark-surface p-8 md:p-16 text-white border border-slate-800">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <Globe className="w-full h-full animate-pulse" />
        </div>
        
        <div className="relative z-10 max-w-3xl">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600/20 text-indigo-400 rounded-full text-xs font-black uppercase tracking-widest mb-8 border border-indigo-500/30"
          >
            <ShieldCheck size={14} />
            Elite Recruitment Program
          </motion.div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black mb-6 uppercase tracking-tighter leading-none"
          >
            Devenez un <span className="text-indigo-500">Commando</span> du Code.
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-xl mb-10 leading-relaxed"
          >
            Le Gabon a besoin de son élite technologique. Passez nos tests rigoureux, 
            prouvez votre valeur et soyez directement recruté par les meilleures entreprises du pays.
          </motion.p>

          <div className="flex flex-wrap gap-4">
            <button 
              onClick={scrollToTests}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all flex items-center gap-2 shadow-xl shadow-indigo-900/20 active:scale-95"
            >
              <Rocket size={20} />
              Commencer l'aventure
            </button>
            <div className="flex -space-x-4 items-center">
              {[1, 2, 3, 4].map(i => (
                <img 
                  key={i}
                  src={`https://picsum.photos/seed/user${i}/100/100`} 
                  className="w-12 h-12 rounded-full border-4 border-slate-900"
                  alt="User"
                  referrerPolicy="no-referrer"
                />
              ))}
              <div className="pl-6 text-sm font-bold text-slate-400">
                +45 Commandos recrutés
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Live Feed */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
              <Flame className="text-orange-500 animate-bounce" />
              Activités en Direct
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {recentResults.map((result, idx) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white dark:bg-dark-surface p-6 rounded-3xl border border-slate-100 dark:border-dark-border flex items-center gap-4 shadow-sm"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <div className="font-black text-slate-900 dark:text-white text-sm uppercase">
                      {result.displayName}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      A réussi le test avec <span className="text-emerald-600 font-bold">{result.score}%</span>
                    </div>
                  </div>
                  <div className="ml-auto text-[10px] font-bold text-slate-400 uppercase">
                    {formatDistance(result.completedAt)}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Search and Filter */}
          <div id="tests-grid" className="flex flex-col md:flex-row gap-4 pt-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text"
                placeholder="Rechercher un test..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-dark-surface border border-slate-100 dark:border-dark-border rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-6 py-4 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${
                    filter === cat 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' 
                      : 'bg-white dark:bg-dark-surface text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-dark-border hover:border-indigo-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTests.map((test, index) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={test.id}
                className="group bg-white dark:bg-dark-surface rounded-[2rem] border border-slate-100 dark:border-dark-border p-8 hover:shadow-2xl hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    test.difficulty === 'Expert' ? 'bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400' : 'bg-slate-100 dark:bg-dark-bg text-slate-700 dark:text-slate-400'
                  }`}>
                    {test.difficulty}
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-600 dark:text-indigo-400">
                    {test.category === 'Frontend' ? <Layout size={24} /> : 
                     test.category === 'Backend' ? <Terminal size={24} /> :
                     test.category === 'DevOps' ? <Cpu size={24} /> : <Code2 size={24} />}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                      {test.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                      <Clock size={14} /> {test.duration} min
                      <Users size={14} /> {test.questions.length} Qs
                    </div>
                  </div>
                </div>

                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 line-clamp-2">
                  {test.description}
                </p>

                <button 
                  onClick={() => handleStartTest(test)}
                  className="w-full py-4 bg-slate-900 dark:bg-dark-bg text-white rounded-2xl font-bold text-sm hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
                >
                  <Play size={14} fill="currentColor" />
                  Démarrer le Test
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar: Hall of Fame & Stats */}
        <div className="space-y-8">
          {/* Hall of Fame */}
          <div className="bg-white dark:bg-dark-surface rounded-[2.5rem] border border-slate-100 dark:border-dark-border p-8 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
              <Trophy className="text-yellow-500" />
              Hall of Fame
            </h2>
            
            <div className="space-y-6">
              {hallOfFame.map((famer, idx) => (
                <div key={famer.id} className="flex items-center gap-4 group">
                  <div className="relative">
                    <img 
                      src={famer.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${famer.displayName}`} 
                      className="w-12 h-12 rounded-2xl border-2 border-slate-100 dark:border-dark-border group-hover:border-indigo-500 transition-colors"
                      alt={famer.displayName}
                      referrerPolicy="no-referrer"
                    />
                    {idx < 3 && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-[10px] font-black text-white shadow-lg">
                        {idx + 1}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-black text-slate-900 dark:text-white text-sm uppercase truncate max-w-[120px]">
                      {famer.displayName}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {famer.points} Points Elite
                    </div>
                  </div>
                  <TrendingUp size={16} className="text-emerald-500" />
                </div>
              ))}
            </div>

            <button 
              onClick={() => navigate('/app/leaderboard')}
              className="w-full mt-8 py-4 border-2 border-dashed border-slate-200 dark:border-dark-border rounded-2xl text-slate-400 font-bold text-xs uppercase tracking-widest hover:border-indigo-500 hover:text-indigo-500 transition-all"
            >
              Voir le Classement Complet
            </button>
          </div>

          {/* Preparation Resources */}
          <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-900/20">
            <BookOpen size={32} className="mb-6" />
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">Se Préparer</h3>
            <p className="text-indigo-100 text-sm mb-8 leading-relaxed">
              Nos tests sont conçus pour être difficiles. Consultez nos ressources gratuites pour maximiser vos chances.
            </p>
            <div className="space-y-3">
              {[
                { name: 'Algorithmique Avancée', path: '/app/articles' },
                { name: 'Architecture Système', path: '/app/articles' },
                { name: 'Clean Code Gabon', path: '/app/articles' }
              ].map(item => (
                <div 
                  key={item.name} 
                  onClick={() => navigate(item.path)}
                  className="flex items-center gap-3 p-3 bg-white/10 rounded-xl text-sm font-bold hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <Medal size={16} className="text-indigo-300" />
                  {item.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Test Modal */}
      <AnimatePresence>
        {activeTest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-dark-surface w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-dark-border"
            >
              <div className="p-8 md:p-12">
                <div className="flex justify-between items-center mb-12">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">
                      {activeTest.title}
                    </h2>
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-full">
                        {activeTest.category}
                      </span>
                      <span>{activeTest.difficulty}</span>
                    </div>
                  </div>
                  
                  {!testResult && (
                    <div className="text-right">
                      <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                        {currentQuestion + 1}<span className="text-slate-300 dark:text-slate-700 mx-1">/</span>{activeTest.questions.length}
                      </div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Questions</div>
                    </div>
                  )}

                  <button 
                    onClick={() => setActiveTest(null)}
                    className="p-3 hover:bg-slate-100 dark:hover:bg-dark-bg rounded-full transition-colors ml-4"
                  >
                    <X size={24} className="text-slate-400" />
                  </button>
                </div>

                {!testResult ? (
                  <div className="space-y-10">
                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-slate-100 dark:bg-dark-bg rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentQuestion + 1) / activeTest.questions.length) * 100}%` }}
                        className="h-full bg-indigo-600"
                      />
                    </div>

                    <div className="bg-slate-50 dark:bg-dark-bg p-10 rounded-[2rem] border border-slate-100 dark:border-dark-border relative">
                      <div className="absolute -top-4 -left-4 w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-xl shadow-indigo-900/20">
                        ?
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-relaxed">
                        {activeTest.questions[currentQuestion].question}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeTest.questions[currentQuestion].options.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAnswer(idx)}
                          className={`p-8 rounded-3xl text-left font-bold transition-all border-2 relative group ${
                            answers[currentQuestion] === idx
                              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400'
                              : 'border-slate-100 dark:border-dark-border hover:border-indigo-200 dark:hover:border-indigo-900/40 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <div className="flex items-center gap-6">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 font-black transition-all ${
                              answers[currentQuestion] === idx 
                                ? 'border-indigo-600 bg-indigo-600 text-white scale-110' 
                                : 'border-slate-200 dark:border-dark-border group-hover:border-indigo-300'
                            }`}>
                              {String.fromCharCode(65 + idx)}
                            </div>
                            <span className="text-lg">{option}</span>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-10">
                      <button
                        onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestion === 0}
                        className="px-8 py-4 text-slate-400 font-black uppercase tracking-widest hover:text-slate-900 dark:hover:text-white disabled:opacity-0 transition-colors"
                      >
                        Précédent
                      </button>
                      
                      {currentQuestion === activeTest.questions.length - 1 ? (
                        <button
                          onClick={handleSubmitTest}
                          disabled={submitting || answers[currentQuestion] === undefined}
                          className="px-12 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-900/20 flex items-center gap-3 disabled:opacity-50"
                        >
                          {submitting ? <Loader2 className="animate-spin" size={24} /> : <Check size={24} />}
                          Finaliser le Recrutement
                        </button>
                      ) : (
                        <button
                          onClick={() => setCurrentQuestion(prev => prev + 1)}
                          disabled={answers[currentQuestion] === undefined}
                          className="px-12 py-5 bg-slate-900 dark:bg-dark-bg text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-3 disabled:opacity-50"
                        >
                          Suivant
                          <ChevronRight size={24} />
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl ${
                        testResult.passed 
                          ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 shadow-emerald-500/20' 
                          : 'bg-rose-100 dark:bg-rose-900/20 text-rose-600 shadow-rose-500/20'
                      }`}
                    >
                      {testResult.passed ? <Award size={64} /> : <AlertCircle size={64} />}
                    </motion.div>
                    
                    <h3 className="text-6xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter">
                      {testResult.score}%
                    </h3>
                    
                    <p className="text-2xl font-bold text-slate-500 dark:text-slate-400 mb-4">
                      {testResult.passed ? 'Félicitations Commando !' : 'Mission Échouée.'}
                    </p>
                    
                    <p className="text-slate-400 max-w-md mx-auto mb-12">
                      {testResult.passed 
                        ? `Vous avez répondu correctement à ${testResult.correctAnswers} questions sur ${activeTest.questions.length}. Votre profil est désormais visible par les recruteurs.` 
                        : 'Ne vous découragez pas. Étudiez les ressources de préparation et retentez votre chance dans 24 heures.'}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={() => setActiveTest(null)}
                        className="px-12 py-5 bg-slate-900 dark:bg-dark-bg text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                      >
                        Retour au Dashboard
                      </button>
                      {testResult.passed && (
                        <button 
                          onClick={() => navigate('/app/jobs')}
                          className="px-12 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/20"
                        >
                          Voir les Offres
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Recruitment Stats Section */}
      <section className="pt-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">L'Impact du Programme</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Nous mesurons notre succès par le nombre de talents gabonais qui trouvent leur place dans l'industrie.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { label: 'Placements Réussis', value: '45', icon: CheckCircle2, color: 'text-emerald-500' },
            { label: 'Entreprises Partenaires', value: '12', icon: Layout, color: 'text-indigo-500' },
            { label: 'Tests Complétés', value: '850', icon: Code2, color: 'text-orange-500' },
            { label: 'Score Moyen', value: '78%', icon: Target, color: 'text-rose-500' }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-dark-surface p-10 rounded-[2.5rem] text-center border border-slate-100 dark:border-dark-border group hover:shadow-2xl transition-all"
            >
              <div className={`w-16 h-16 rounded-2xl bg-slate-50 dark:bg-dark-bg flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform ${stat.color}`}>
                <stat.icon size={32} />
              </div>
              <div className="text-4xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter">{stat.value}</div>
              <div className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
