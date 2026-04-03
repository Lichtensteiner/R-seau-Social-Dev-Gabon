import { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, limit, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { 
  Users, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  Shield, 
  Clock, 
  Activity as ActivityIcon, 
  Download,
  X,
  AlertCircle,
  Database,
  Loader2,
  LayoutDashboard,
  Settings,
  TrendingUp,
  UserPlus,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDate } from '../lib/date-utils';

interface UserActivity {
  id: string;
  userId: string;
  userName: string;
  type: string;
  details: string;
  timestamp: any;
}

type AdminTab = 'overview' | 'users' | 'activity' | 'system';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editRole, setEditRole] = useState<string>('');
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallApp = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any as UserProfile));
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    const actQ = query(collection(db, 'activities'), orderBy('timestamp', 'desc'), limit(50));
    const unsubscribeAct = onSnapshot(actQ, (snapshot) => {
      const actData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserActivity));
      setActivities(actData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'activities');
    });

    return () => {
      unsubscribe();
      unsubscribeAct();
    };
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    return {
      total: users.length,
      admins: users.filter(u => u.role === 'admin').length,
      recruiters: users.filter(u => u.role === 'recruiter').length,
      newToday: users.filter(u => {
        const created = u.createdAt?.toDate ? u.createdAt.toDate() : new Date(u.createdAt);
        return created > last24h;
      }).length,
      activeToday: activities.filter(a => {
        const ts = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
        return ts > last24h;
      }).length
    };
  }, [users, activities]);

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      const challenges = [
        {
          title: "Optimisation de Performance React",
          description: "Optimisez un composant qui effectue trop de re-rendus inutiles. Utilisez useMemo et useCallback à bon escient.",
          difficulty: 'Medium',
          points: 150,
          type: 'Flash',
          status: 'Active',
          createdAt: serverTimestamp()
        },
        {
          title: "Algorithme de Tri Gabonnais",
          description: "Implémentez un algorithme de tri personnalisé qui priorise les éléments selon une logique spécifique au contexte local.",
          difficulty: 'Hard',
          points: 300,
          type: 'Hackathon',
          status: 'Active',
          createdAt: serverTimestamp()
        }
      ];

      for (const challenge of challenges) {
        await addDoc(collection(db, 'challenges'), challenge);
      }

      const tests = [
        {
          title: "Fondamentaux JavaScript",
          description: "Testez vos connaissances sur les fermetures (closures), les promesses et le prototype.",
          duration: 20,
          difficulty: 'Junior',
          questions: [
            {
              id: '1',
              question: "Quelle est la sortie de console.log(typeof []) ?",
              options: ["array", "object", "null", "undefined"],
              correctAnswer: 1
            },
            {
              id: '2',
              question: "Quelle méthode est utilisée pour ajouter un élément à la fin d'un tableau ?",
              options: ["push()", "pop()", "shift()", "unshift()"],
              correctAnswer: 0
            }
          ],
          createdAt: serverTimestamp()
        },
        {
          title: "Architecture Cloud & Firebase",
          description: "Maîtrisez les règles de sécurité et l'indexation Firestore.",
          duration: 30,
          difficulty: 'Senior',
          questions: [
            {
              id: '1',
              question: "Quelle règle de sécurité Firestore permet de restreindre l'accès au propriétaire ?",
              options: ["allow read: if true;", "allow read: if request.auth != null;", "allow read: if request.auth.uid == userId;", "allow read: if isAdmin();"],
              correctAnswer: 2
            }
          ],
          createdAt: serverTimestamp()
        }
      ];

      for (const test of tests) {
        await addDoc(collection(db, 'technical_tests'), test);
      }

      alert("Données de test générées avec succès !");
    } catch (error) {
      console.error("Error seeding data:", error);
      alert("Erreur lors de la génération des données.");
    } finally {
      setSeeding(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    try {
      await updateDoc(doc(db, 'users', selectedUser.uid), {
        role: editRole
      });
      setIsEditModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await deleteDoc(doc(db, 'users', selectedUser.uid));
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const filteredUsers = users.filter(user => 
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.pseudo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
              <Shield className="text-indigo-600 dark:text-indigo-400" size={32} />
              Administration
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Gérez les membres, surveillez l'activité et configurez le système.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 dark:bg-dark-surface p-1 rounded-xl border border-slate-200 dark:border-dark-border">
              {[
                { id: 'overview', icon: LayoutDashboard, label: 'Aperçu' },
                { id: 'users', icon: Users, label: 'Membres' },
                { id: 'activity', icon: ActivityIcon, label: 'Journal' },
                { id: 'system', icon: Settings, label: 'Système' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AdminTab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    activeTab === tab.id 
                      ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <tab.icon size={16} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Membres', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Nouveaux (24h)', value: stats.newToday, icon: UserPlus, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Actions (24h)', value: stats.activeToday, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Administrateurs', value: stats.admins, icon: Shield, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' }
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label} 
            className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <span className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</span>
            </div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Recent Users */}
            <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-dark-border overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-dark-border flex items-center justify-between">
                <h2 className="font-bold text-slate-900 dark:text-white">Nouveaux Membres</h2>
                <button onClick={() => setActiveTab('users')} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Voir tout</button>
              </div>
              <div className="divide-y divide-slate-50 dark:divide-dark-border">
                {users.slice(0, 5).map(user => (
                  <div key={user.uid} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-dark-bg/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} className="w-10 h-10 rounded-full border border-slate-100 dark:border-dark-border" />
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{user.displayName}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{user.role} • {formatDate(user.createdAt, 'dd MMM')}</div>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-300" />
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-dark-border overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-dark-border flex items-center justify-between">
                <h2 className="font-bold text-slate-900 dark:text-white">Activité Récente</h2>
                <button onClick={() => setActiveTab('activity')} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Voir tout</button>
              </div>
              <div className="p-4 space-y-4">
                {activities.slice(0, 6).map(activity => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                    <div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        <span className="font-bold">{activity.userName}</span> {activity.details || activity.type}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{formatDate(activity.timestamp, 'HH:mm')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Rechercher par nom, email ou pseudo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-dark-border overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-dark-bg/50 border-b border-slate-100 dark:border-dark-border">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Utilisateur</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rôle</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Dernière Connexion</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-dark-border">
                    {filteredUsers.map((user) => (
                      <tr key={user.uid} className="hover:bg-slate-50 dark:hover:bg-dark-bg/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=random`} 
                              className="w-10 h-10 rounded-xl object-cover border border-slate-100 dark:border-dark-border"
                            />
                            <div>
                              <div className="font-bold text-slate-900 dark:text-slate-100">{user.displayName}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                            user.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                            user.role === 'recruiter' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                            user.role === 'writer' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                            'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            <Shield size={10} />
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                          {user.lastLoginAt ? (
                            <div className="flex items-center gap-1.5">
                              <Clock size={14} className="text-slate-400" />
                              {formatDate(user.lastLoginAt, 'dd MMM yyyy HH:mm')}
                            </div>
                          ) : (
                            <span className="italic text-slate-400">Jamais</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => { setSelectedUser(user); setIsViewModalOpen(true); }}
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                            >
                              <Eye size={18} />
                            </button>
                            <button 
                              onClick={() => { setSelectedUser(user); setEditRole(user.role); setIsEditModalOpen(true); }}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button 
                              onClick={() => { setSelectedUser(user); setIsDeleteModalOpen(true); }}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'activity' && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-dark-border overflow-hidden shadow-sm"
          >
            <div className="px-6 py-4 border-b border-slate-100 dark:border-dark-border bg-slate-50 dark:bg-dark-bg/50 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ActivityIcon size={18} className="text-indigo-600 dark:text-indigo-400" />
                Journal d'Activité Système
              </h2>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Temps Réel</span>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-dark-border">
              {activities.map((activity) => (
                <div key={activity.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-dark-bg/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl ${
                      activity.type === 'login' ? 'bg-green-100 text-green-600' :
                      activity.type.includes('create') ? 'bg-blue-100 text-blue-600' :
                      activity.type.includes('delete') ? 'bg-red-100 text-red-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      <ActivityIcon size={16} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-900 dark:text-slate-100 font-medium">
                        <span className="font-bold">{activity.userName}</span> {activity.details || activity.type}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{activity.userId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{formatDate(activity.timestamp, 'HH:mm:ss')}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">{formatDate(activity.timestamp, 'dd MMM yyyy')}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'system' && (
          <motion.div
            key="system"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Seed Data Card */}
            <div className="bg-white dark:bg-dark-surface p-8 rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-6">
                <Database size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Génération de Données</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                Générez automatiquement des défis, des tests techniques et du contenu de démonstration pour peupler la plateforme.
              </p>
              <button
                onClick={handleSeedData}
                disabled={seeding}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 dark:shadow-none active:scale-95 disabled:opacity-50"
              >
                {seeding ? <Loader2 size={20} className="animate-spin" /> : <Database size={20} />}
                Générer les données de test
              </button>
            </div>

            {/* PWA Install Card */}
            <div className="bg-white dark:bg-dark-surface p-8 rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-6">
                <Download size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Installation Progressive</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                Installez l'interface d'administration en tant qu'application native sur votre bureau pour un accès plus rapide.
              </p>
              <button
                onClick={handleInstallApp}
                disabled={!installPrompt}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none active:scale-95 disabled:opacity-50"
              >
                <Download size={20} />
                {installPrompt ? "Installer l'Application" : "Déjà Installé"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {isEditModalOpen && selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-dark-surface rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-dark-border"
            >
              <div className="px-8 py-6 border-b border-slate-100 dark:border-dark-border flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Modifier le rôle</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-dark-bg rounded-full transition-colors dark:text-slate-400">
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-dark-bg rounded-2xl border border-slate-100 dark:border-dark-border">
                  <img src={selectedUser.photoURL || `https://ui-avatars.com/api/?name=${selectedUser.displayName}`} className="w-14 h-14 rounded-xl border-2 border-white dark:border-dark-border shadow-sm" />
                  <div>
                    <div className="font-black text-slate-900 dark:text-white">{selectedUser.displayName}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">{selectedUser.email}</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Choisir un nouveau rôle</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['dev', 'recruiter', 'writer', 'admin'].map((role) => (
                      <button
                        key={role}
                        onClick={() => setEditRole(role)}
                        className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
                          editRole === role 
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none' 
                            : 'bg-white dark:bg-dark-bg border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-400 hover:border-indigo-300'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-8 py-6 bg-slate-50 dark:bg-dark-bg/50 border-t border-slate-100 dark:border-dark-border flex justify-end gap-4">
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleUpdateRole}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none active:scale-95"
                >
                  Mettre à jour
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {isDeleteModalOpen && selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-dark-surface rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-dark-border"
            >
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <AlertCircle size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">Suppression Critique</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                  Êtes-vous absolument certain de vouloir supprimer <strong>{selectedUser.displayName}</strong> ? Cette action détruira toutes ses données de manière irréversible.
                </p>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleDeleteUser}
                    className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-all shadow-xl shadow-red-100 dark:shadow-none active:scale-95"
                  >
                    Confirmer la suppression
                  </button>
                  <button 
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="w-full py-4 bg-white dark:bg-dark-bg text-slate-600 dark:text-slate-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 dark:hover:bg-dark-surface transition-all border border-slate-200 dark:border-dark-border"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {isViewModalOpen && selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white dark:bg-dark-surface rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-dark-border"
            >
              <div className="h-40 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 relative">
                <button 
                  onClick={() => setIsViewModalOpen(false)}
                  className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors backdrop-blur-md"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="px-10 pb-10">
                <div className="relative -mt-16 mb-8 flex items-end gap-6">
                  <img 
                    src={selectedUser.photoURL || `https://ui-avatars.com/api/?name=${selectedUser.displayName}`} 
                    className="w-32 h-32 rounded-3xl border-8 border-white dark:border-dark-surface shadow-2xl object-cover"
                  />
                  <div className="pb-2">
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{selectedUser.displayName}</h3>
                    <p className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">{selectedUser.pseudo ? `@${selectedUser.pseudo}` : selectedUser.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Biographie</label>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{selectedUser.bio || 'Aucune biographie renseignée.'}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Localisation</label>
                      <p className="text-slate-900 dark:text-white font-bold">{selectedUser.location || 'Non spécifiée'}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Compétences</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.skills?.map(skill => (
                          <span key={skill} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-wider border border-indigo-100 dark:border-indigo-900/30">
                            {skill}
                          </span>
                        )) || <span className="text-slate-400 italic text-sm">Aucune compétence</span>}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="p-6 bg-slate-50 dark:bg-dark-bg rounded-3xl space-y-4 border border-slate-100 dark:border-dark-border">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Rôle Actuel</span>
                        <span className="px-3 py-1 bg-white dark:bg-dark-surface rounded-lg text-[10px] font-black text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-dark-border uppercase tracking-widest">{selectedUser.role}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Membre depuis</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {formatDate(selectedUser.createdAt, 'dd MMMM yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Expérience</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{selectedUser.experienceYears || 0} ans</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => { setIsViewModalOpen(false); setIsEditModalOpen(true); setEditRole(selectedUser.role); }}
                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 dark:shadow-none active:scale-95"
                      >
                        Modifier les privilèges
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
