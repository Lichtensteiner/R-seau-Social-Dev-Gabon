import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, getDocs, where, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';
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
  Check,
  X,
  AlertCircle,
  MoreVertical,
  ChevronRight,
  Filter
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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editRole, setEditRole] = useState<string>('');
  const [installPrompt, setInstallPrompt] = useState<any>(null);

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
    });

    const actQ = query(collection(db, 'activities'), orderBy('timestamp', 'desc'), limit(50));
    const unsubscribeAct = onSnapshot(actQ, (snapshot) => {
      const actData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserActivity));
      setActivities(actData);
    });

    return () => {
      unsubscribe();
      unsubscribeAct();
    };
  }, []);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="text-indigo-600" />
            Gestion des Utilisateurs
          </h1>
          <p className="text-slate-500">Administrez les membres du réseau DevGabon</p>
        </div>
        
        <div className="flex items-center gap-3">
          {installPrompt && (
            <button
              onClick={handleInstallApp}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-md active:scale-95"
            >
              <Download size={18} />
              Installer l'App
            </button>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Utilisateur</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rôle</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Dernière Connexion</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.uid} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=random`} 
                            alt={user.displayName}
                            className="w-10 h-10 rounded-full object-cover border border-slate-100"
                          />
                          <div>
                            <div className="font-medium text-slate-900">{user.displayName}</div>
                            <div className="text-xs text-slate-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                          user.role === 'recruiter' ? 'bg-blue-100 text-blue-700' :
                          user.role === 'writer' ? 'bg-green-100 text-green-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          <Shield size={12} />
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {user.lastLoginAt ? (
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            {formatDate(user.lastLoginAt, 'dd MMM yyyy HH:mm', 'Invalide')}
                          </div>
                        ) : (
                          <span className="italic text-slate-400">Jamais</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { setSelectedUser(user); setIsViewModalOpen(true); }}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Voir détails"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            onClick={() => { setSelectedUser(user); setEditRole(user.role); setIsEditModalOpen(true); }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Modifier rôle"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => { setSelectedUser(user); setIsDeleteModalOpen(true); }}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
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
        </div>

        {/* Real-time Activity Log */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-full max-h-[700px]">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <ActivityIcon size={18} className="text-indigo-600" />
                Activités en temps réel
              </h2>
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activities.length === 0 ? (
                <div className="text-center py-8 text-slate-400 italic">
                  Aucune activité récente
                </div>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <div className={`mt-1 p-1.5 rounded-lg ${
                      activity.type === 'login' ? 'bg-green-100 text-green-600' :
                      activity.type.includes('create') ? 'bg-blue-100 text-blue-600' :
                      activity.type.includes('delete') ? 'bg-red-100 text-red-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      <ActivityIcon size={14} />
                    </div>
                    <div>
                      <div className="text-sm">
                        <span className="font-bold text-slate-900">{activity.userName}</span>
                        <span className="text-slate-600"> {activity.details || activity.type}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <Clock size={10} />
                        {formatDate(activity.timestamp, 'HH:mm:ss', 'A l\'instant')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Role Modal */}
      <AnimatePresence>
        {isEditModalOpen && selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Modifier le rôle</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <img src={selectedUser.photoURL} className="w-12 h-12 rounded-full" />
                  <div>
                    <div className="font-bold text-slate-900">{selectedUser.displayName}</div>
                    <div className="text-sm text-slate-500">{selectedUser.email}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Sélectionner un rôle</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['dev', 'recruiter', 'writer', 'admin'].map((role) => (
                      <button
                        key={role}
                        onClick={() => setEditRole(role)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                          editRole === role 
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                            : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                        }`}
                      >
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:text-slate-900"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleUpdateRole}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-95"
                >
                  Enregistrer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Supprimer l'utilisateur ?</h3>
                <p className="text-slate-500 mb-6">
                  Cette action est irréversible. Toutes les données de <strong>{selectedUser.displayName}</strong> seront définitivement supprimées.
                </p>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={handleDeleteUser}
                    className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100 active:scale-95"
                  >
                    Oui, supprimer définitivement
                  </button>
                  <button 
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="w-full py-3 bg-white text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Details Modal */}
      <AnimatePresence>
        {isViewModalOpen && selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden"
            >
              <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600 relative">
                <button 
                  onClick={() => setIsViewModalOpen(false)}
                  className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="px-8 pb-8">
                <div className="relative -mt-12 mb-6">
                  <img 
                    src={selectedUser.photoURL} 
                    className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg object-cover"
                  />
                  <div className="mt-4">
                    <h3 className="text-2xl font-bold text-slate-900">{selectedUser.displayName}</h3>
                    <p className="text-slate-500">{selectedUser.pseudo ? `@${selectedUser.pseudo}` : selectedUser.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Biographie</label>
                      <p className="text-slate-700 mt-1">{selectedUser.bio || 'Aucune biographie renseignée.'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Localisation</label>
                      <p className="text-slate-700 mt-1">{selectedUser.location || 'Non spécifiée'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Compétences</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedUser.skills?.map(skill => (
                          <span key={skill} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                            {skill}
                          </span>
                        )) || <span className="text-slate-400 italic text-sm">Aucune compétence</span>}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Rôle</span>
                        <span className="font-bold text-indigo-600 uppercase">{selectedUser.role}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Inscrit le</span>
                        <span className="font-medium text-slate-900">
                          {formatDate(selectedUser.createdAt, 'dd/MM/yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Expérience</span>
                        <span className="font-medium text-slate-900">{selectedUser.experienceYears || 0} ans</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <button className="w-full py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">
                        Voir le profil public
                      </button>
                      <button 
                        onClick={() => { setIsViewModalOpen(false); setIsEditModalOpen(true); setEditRole(selectedUser.role); }}
                        className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-md"
                      >
                        Modifier le rôle
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
