import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, limit, updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';
import { Search, MapPin, Code2, Github, Mail, User as UserIcon, UserPlus, UserMinus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { User } from 'firebase/auth';

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  bio: string;
  skills: string[];
  location: string;
  githubUrl: string;
  role: string;
  followers?: string[];
  following?: string[];
}

export default function NetworkPage({ user }: { user: User }) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);
      const usersData = querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleFollowToggle = async (targetUser: UserProfile) => {
    const isFollowing = targetUser.followers?.includes(user.uid);
    try {
      await updateDoc(doc(db, 'users', targetUser.uid), {
        followers: isFollowing ? arrayRemove(user.uid) : arrayUnion(user.uid)
      });
      await updateDoc(doc(db, 'users', user.uid), {
        following: isFollowing ? arrayRemove(targetUser.uid) : arrayUnion(targetUser.uid)
      });
      
      // Update local state
      setUsers(prev => prev.map(u => {
        if (u.uid === targetUser.uid) {
          const newFollowers = isFollowing 
            ? (u.followers || []).filter(id => id !== user.uid)
            : [...(u.followers || []), user.uid];
          return { ...u, followers: newFollowers };
        }
        return u;
      }));
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.skills || []).some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.location || '').toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Annuaire des Talents</h1>
        <p className="text-slate-500 mt-1">Découvrez et connectez-vous avec les professionnels IT du Gabon</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom, compétence (ex: React) ou ville..."
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="w-full md:w-48">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">Tous les profils</option>
            <option value="dev">Développeurs</option>
            <option value="writer">Écrivains / Auteurs</option>
            <option value="recruiter">Recruteurs</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-xl border border-slate-200">
              <p className="text-slate-500">Aucun profil ne correspond à votre recherche.</p>
            </div>
          ) : (
            filteredUsers.map(u => (
              <div key={u.uid} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="h-16 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                <div className="px-6 pb-6 flex-1 flex flex-col">
                  <div className="-mt-8 mb-3 flex justify-between items-end">
                    <Link to={`/app/profile/${u.uid}`}>
                      <img 
                        src={u.photoURL || `https://ui-avatars.com/api/?name=${u.displayName || u.email}&background=random`} 
                        alt={u.displayName}
                        className="w-16 h-16 rounded-full border-4 border-white bg-slate-200 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    </Link>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 capitalize">
                      {u.role === 'dev' ? 'Développeur' : u.role === 'writer' ? 'Écrivain' : u.role === 'recruiter' ? 'Recruteur' : 'Admin'}
                    </span>
                  </div>
                  
                  <Link to={`/app/profile/${u.uid}`}>
                    <h3 className="text-lg font-bold text-slate-900 truncate hover:text-indigo-600 transition-colors cursor-pointer">{u.displayName}</h3>
                  </Link>
                  
                  <div className="mt-2 space-y-2 text-sm text-slate-600 flex-1">
                    {u.location && (
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-slate-400 shrink-0" />
                        <span className="truncate">{u.location}</span>
                      </div>
                    )}
                    {u.bio && (
                      <p className="line-clamp-2 text-slate-500 mt-2">{u.bio}</p>
                    )}
                  </div>

                  {u.skills && u.skills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {u.skills.slice(0, 3).map(skill => (
                        <span key={skill} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-md">
                          {skill}
                        </span>
                      ))}
                      {u.skills.length > 3 && (
                        <span className="px-2 py-0.5 bg-slate-50 text-slate-500 text-xs font-medium rounded-md">
                          +{u.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
                    {u.uid !== user.uid && (
                      <button 
                        onClick={() => handleFollowToggle(u)}
                        className={`flex-1 flex justify-center items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          u.followers?.includes(user.uid)
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        {u.followers?.includes(user.uid) ? <UserMinus size={16} /> : <UserPlus size={16} />}
                        {u.followers?.includes(user.uid) ? 'Suivi' : 'Suivre'}
                      </button>
                    )}
                    <Link 
                      to={`/app/profile/${u.uid}`}
                      className="flex-1 flex justify-center items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                    >
                      <UserIcon size={16} />
                      Profil
                    </Link>
                    <a 
                      href={`mailto:${u.email}`}
                      className="flex justify-center items-center p-2 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Envoyer un email"
                    >
                      <Mail size={18} />
                    </a>
                    {u.githubUrl && (
                      <a 
                        href={u.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex justify-center items-center p-2 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                        title="GitHub"
                      >
                        <Github size={18} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
