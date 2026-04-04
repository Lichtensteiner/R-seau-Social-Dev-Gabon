import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, arrayUnion, arrayRemove, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { User as UserIcon, Mail, MapPin, Github, Code2, Save, Edit2, Star, GitBranch, MessageSquare, Heart, Briefcase, Linkedin, Globe, UserPlus, UserMinus, Camera, Loader2, BookOpen, Library, X, Users, Trophy, Medal, AlertCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { logActivity } from '../lib/activity';
import { motion, AnimatePresence } from 'motion/react';
import { formatDate } from '../lib/date-utils';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

interface Repo {
  id: number;
  name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
}

interface UserProfile {
  uid: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  pseudo?: string;
  email: string;
  photoURL: string;
  bio: string;
  skills: string[];
  location: string;
  status?: string;
  experienceYears?: number;
  githubUrl: string;
  linkedInUrl?: string;
  portfolioUrl?: string;
  role: string;
  createdAt: string;
  followers?: string[];
  following?: string[];
}

interface LeaderboardData {
  points: number;
  badges: string[];
}

export default function ProfilePage({ user }: { user: User }) {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const targetUserId = userId || user.uid;
  const isOwnProfile = targetUserId === user.uid;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [showAllRepos, setShowAllRepos] = useState(false);
  const [userStats, setUserStats] = useState({ posts: 0, jobs: 0, articles: 0, books: 0 });
  const [userArticles, setUserArticles] = useState<any[]>([]);
  const [userBooks, setUserBooks] = useState<any[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followListData, setFollowListData] = useState<UserProfile[]>([]);
  const [loadingFollowList, setLoadingFollowList] = useState(false);
  
  const [formData, setFormData] = useState({
    displayName: '',
    firstName: '',
    lastName: '',
    pseudo: '',
    bio: '',
    location: '',
    status: '',
    experienceYears: '',
    githubUrl: '',
    linkedInUrl: '',
    portfolioUrl: '',
    skills: '',
    photoURL: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'users', targetUserId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          setProfile(data);
          setFormData({
            displayName: data.displayName || '',
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            pseudo: data.pseudo || '',
            bio: data.bio || '',
            location: data.location || '',
            status: data.status || '',
            experienceYears: data.experienceYears !== undefined && data.experienceYears !== null ? data.experienceYears.toString() : '',
            githubUrl: data.githubUrl || '',
            linkedInUrl: data.linkedInUrl || '',
            portfolioUrl: data.portfolioUrl || '',
            skills: Array.isArray(data.skills) ? data.skills.join(', ') : (typeof data.skills === 'string' ? data.skills : ''),
            photoURL: data.photoURL || ''
          });
        }

        // Fetch stats
        const postsQuery = query(collection(db, 'posts'), where('authorId', '==', targetUserId));
        const postsSnap = await getDocs(postsQuery);
        
        const jobsQuery = query(collection(db, 'jobs'), where('authorId', '==', targetUserId));
        const jobsSnap = await getDocs(jobsQuery);

        const articlesQuery = query(collection(db, 'articles'), where('authorId', '==', targetUserId));
        const articlesSnap = await getDocs(articlesQuery);
        setUserArticles(articlesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const booksQuery = query(collection(db, 'books'), where('authorId', '==', targetUserId));
        const booksSnap = await getDocs(booksQuery);
        setUserBooks(booksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        setUserStats({
          posts: postsSnap.size,
          jobs: jobsSnap.size,
          articles: articlesSnap.size,
          books: booksSnap.size
        });

      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    // Real-time leaderboard points
    const unsubscribeLeaderboard = onSnapshot(doc(db, 'leaderboard', targetUserId), (snap) => {
      if (snap.exists()) {
        setLeaderboard(snap.data() as LeaderboardData);
      }
    });

    return () => unsubscribeLeaderboard();
  }, [targetUserId]);

  useEffect(() => {
    const fetchRepos = async () => {
      if (!profile?.githubUrl) return;
      
      const match = profile.githubUrl.match(/github\.com\/([^/]+)/);
      const username = match ? match[1] : null;
      
      if (username) {
        setLoadingRepos(true);
        try {
          const limit = showAllRepos ? 100 : 4;
          const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=${limit}`);
          if (res.ok) {
            const data = await res.json();
            setRepos(data);
          }
        } catch (error) {
          console.error("Error fetching repos:", error);
        } finally {
          setLoadingRepos(false);
        }
      }
    };

    fetchRepos();
  }, [profile?.githubUrl, showAllRepos]);

  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveError(null);
      const skillsArray = (formData.skills || '').split(',').map(s => s.trim()).filter(Boolean);
      
      const updateData: any = {
        displayName: formData.displayName,
        bio: formData.bio,
        location: formData.location,
        githubUrl: formData.githubUrl,
        skills: skillsArray
      };

      if (formData.firstName) updateData.firstName = formData.firstName;
      if (formData.lastName) updateData.lastName = formData.lastName;
      if (formData.pseudo) updateData.pseudo = formData.pseudo;
      if (formData.status) updateData.status = formData.status;
      if (formData.experienceYears) {
        const parsed = parseInt(formData.experienceYears);
        if (!isNaN(parsed)) {
          updateData.experienceYears = parsed;
        }
      }
      if (formData.linkedInUrl) updateData.linkedInUrl = formData.linkedInUrl;
      if (formData.portfolioUrl) updateData.portfolioUrl = formData.portfolioUrl;
      if (formData.photoURL) updateData.photoURL = formData.photoURL;

      await updateDoc(doc(db, 'users', user.uid), updateData);
      
      await logActivity(user.uid, formData.displayName, 'profile_update', 'A mis à jour son profil');

      setProfile(prev => prev ? { ...prev, ...updateData } : null);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setSaveError("Erreur lors de la mise à jour du profil.");
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setSaveError(null);
      const storageRef = ref(storage, `profile_pictures/${user.uid}_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      setFormData(prev => ({ ...prev, photoURL: downloadURL }));
      
      // Also update the profile immediately if editing
      if (profile) {
        setProfile(prev => prev ? { ...prev, photoURL: downloadURL } : null);
        await updateDoc(doc(db, 'users', user.uid), { photoURL: downloadURL });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setSaveError("Erreur lors du téléchargement de l'image.");
      handleFirestoreError(error, OperationType.WRITE, `profile_pictures/${user.uid}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!profile) return;
    const isFollowing = profile.followers?.includes(user.uid);
    try {
      await updateDoc(doc(db, 'users', targetUserId), {
        followers: isFollowing ? arrayRemove(user.uid) : arrayUnion(user.uid)
      });
      await updateDoc(doc(db, 'users', user.uid), {
        following: isFollowing ? arrayRemove(targetUserId) : arrayUnion(targetUserId)
      });
      setProfile(prev => {
        if (!prev) return prev;
        const newFollowers = isFollowing 
          ? (prev.followers || []).filter(id => id !== user.uid)
          : [...(prev.followers || []), user.uid];
        return { ...prev, followers: newFollowers };
      });
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  const fetchFollowListData = async (uids: string[]) => {
    if (!uids || uids.length === 0) {
      setFollowListData([]);
      return;
    }
    setLoadingFollowList(true);
    try {
      const usersRef = collection(db, 'users');
      // Firestore 'in' query is limited to 10 items, but for now it's okay for a prototype
      // or we can fetch them one by one if needed. Let's do a simple version.
      const q = query(usersRef, where('uid', 'in', uids.slice(0, 10)));
      const querySnapshot = await getDocs(q);
      const usersData = querySnapshot.docs.map(doc => doc.data() as UserProfile);
      setFollowListData(usersData);
    } catch (error) {
      console.error("Error fetching follow list data:", error);
    } finally {
      setLoadingFollowList(false);
    }
  };

  const openFollowersModal = () => {
    setShowFollowersModal(true);
    fetchFollowListData(profile?.followers || []);
  };

  const openFollowingModal = () => {
    setShowFollowingModal(true);
    fetchFollowListData(profile?.following || []);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-12 text-slate-500">Profil introuvable</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 transition-colors duration-300">
      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-slate-200 dark:border-dark-border overflow-hidden">
        {/* Header Cover */}
        <div className="h-40 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        
        <div className="px-6 sm:px-8 pb-8">
          <div className="flex justify-between items-end -mt-16 mb-6">
            <div className="relative">
              <img 
                src={formData.photoURL || profile.photoURL || `https://ui-avatars.com/api/?name=${profile.displayName || profile.email}&background=random&size=128`} 
                alt="Avatar" 
                className={`w-32 h-32 rounded-full border-4 border-white dark:border-dark-surface bg-slate-200 dark:bg-dark-bg object-cover shadow-md ${uploadingImage ? 'opacity-50' : ''}`}
              />
              {uploadingImage && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                </div>
              )}
              {isEditing && (
                <div 
                  className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 text-white rounded-full border-2 border-white dark:border-dark-surface shadow-sm cursor-pointer hover:bg-indigo-700 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera size={16} />
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
            
            {!isEditing ? (
              <div className="flex gap-2">
                {isOwnProfile ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-bg border border-slate-300 dark:border-dark-border text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-dark-surface transition-colors"
                  >
                    <Edit2 size={16} />
                    Modifier
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={handleFollowToggle}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        profile.followers?.includes(user.uid)
                          ? 'bg-slate-100 dark:bg-dark-bg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-surface'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {profile.followers?.includes(user.uid) ? (
                        <><UserMinus size={16} /> Ne plus suivre</>
                      ) : (
                        <><UserPlus size={16} /> Suivre</>
                      )}
                    </button>
                    <button 
                      onClick={() => navigate(`/app/messages?userId=${targetUserId}`)}
                      className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-bg border border-slate-300 dark:border-dark-border text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-dark-surface transition-colors"
                    >
                      <MessageSquare size={16} />
                      Message
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-white dark:bg-dark-bg border border-slate-300 dark:border-dark-border text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-dark-surface transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  <Save size={16} />
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            )}
          </div>

          {!isEditing ? (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {profile.displayName}
                  {profile.pseudo && <span className="text-xl font-normal text-slate-500 dark:text-slate-400 ml-2">@{profile.pseudo}</span>}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 capitalize">
                    {profile.role === 'dev' ? 'Développeur' : profile.role === 'writer' ? 'Écrivain / Auteur' : profile.role === 'recruiter' ? 'Recruteur' : 'Admin'}
                  </span>
                  {profile.status && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 dark:bg-dark-bg text-slate-700 dark:text-slate-300">
                      {profile.status}
                    </span>
                  )}
                  {profile.experienceYears !== undefined && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 dark:bg-dark-bg text-slate-700 dark:text-slate-300">
                      {profile.experienceYears} an{profile.experienceYears > 1 ? 's' : ''} d'exp.
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-4 mt-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                  <button 
                    onClick={openFollowersModal}
                    className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <span className="text-slate-900 dark:text-white font-bold">{profile.followers?.length || 0}</span> abonnés
                  </button>
                  <button 
                    onClick={openFollowingModal}
                    className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <span className="text-slate-900 dark:text-white font-bold">{profile.following?.length || 0}</span> abonnements
                  </button>
                </div>
              </div>

              {/* Stats Bento */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-slate-50 dark:bg-dark-bg p-4 rounded-xl border border-slate-100 dark:border-dark-border flex flex-col items-center justify-center text-center">
                  <Trophy size={24} className="text-yellow-500 mb-2" />
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">{leaderboard?.points || 0}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mt-1">Points</span>
                </div>
                <div className="bg-slate-50 dark:bg-dark-bg p-4 rounded-xl border border-slate-100 dark:border-dark-border flex flex-col items-center justify-center text-center">
                  <BookOpen size={24} className="text-indigo-500 mb-2" />
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">{userStats.articles}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mt-1">Articles</span>
                </div>
                <div className="bg-slate-50 dark:bg-dark-bg p-4 rounded-xl border border-slate-100 dark:border-dark-border flex flex-col items-center justify-center text-center">
                  <Library size={24} className="text-amber-500 mb-2" />
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">{userStats.books}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mt-1">Livres</span>
                </div>
                <div className="bg-slate-50 dark:bg-dark-bg p-4 rounded-xl border border-slate-100 dark:border-dark-border flex flex-col items-center justify-center text-center">
                  <Code2 size={24} className="text-pink-500 mb-2" />
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">{profile.skills?.length || 0}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mt-1">Compétences</span>
                </div>
                <div className="bg-slate-50 dark:bg-dark-bg p-4 rounded-xl border border-slate-100 dark:border-dark-border flex flex-col items-center justify-center text-center">
                  <Github size={24} className="text-slate-700 dark:text-slate-300 mb-2" />
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">{repos.length}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mt-1">Dépôts</span>
                </div>
              </div>

              {/* Badges Section */}
              {leaderboard?.badges && leaderboard.badges.length > 0 && (
                <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-slate-200 dark:border-dark-border shadow-sm">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Medal size={18} className="text-amber-500" />
                    Badges & Trophées
                  </h2>
                  <div className="flex flex-wrap gap-4">
                    {leaderboard.badges.map((badge, index) => (
                      <div key={index} className="flex flex-col items-center gap-1">
                        <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center border border-amber-100 dark:border-amber-900/30 shadow-sm">
                          <Trophy size={20} className="text-amber-600 dark:text-amber-400" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase text-center">{badge}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-dark-bg p-4 rounded-xl border border-slate-100 dark:border-dark-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-dark-surface rounded-lg shadow-sm">
                    <Mail size={18} className="text-indigo-500" />
                  </div>
                  <span className="font-medium">{profile.email}</span>
                </div>
                {profile.location && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-dark-surface rounded-lg shadow-sm">
                      <MapPin size={18} className="text-purple-500" />
                    </div>
                    <span className="font-medium">{profile.location}</span>
                  </div>
                )}
                {profile.githubUrl && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-dark-surface rounded-lg shadow-sm">
                      <Github size={18} className="text-slate-700 dark:text-slate-300" />
                    </div>
                    <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                      GitHub
                    </a>
                  </div>
                )}
                {profile.linkedInUrl && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-dark-surface rounded-lg shadow-sm">
                      <Linkedin size={18} className="text-blue-600" />
                    </div>
                    <a href={profile.linkedInUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                      LinkedIn
                    </a>
                  </div>
                )}
                {profile.portfolioUrl && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-dark-surface rounded-lg shadow-sm">
                      <Globe size={18} className="text-emerald-500" />
                    </div>
                    <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                      Portfolio
                    </a>
                  </div>
                )}
              </div>

              {profile.bio && (
                <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-slate-200 dark:border-dark-border shadow-sm">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <UserIcon size={18} className="text-indigo-500" />
                    À propos
                  </h2>
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{profile.bio}</p>
                </div>
              )}

              {profile.skills && profile.skills.length > 0 && (
                <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-slate-200 dark:border-dark-border shadow-sm">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Code2 size={18} className="text-purple-500" />
                    Compétences techniques
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {(profile.skills || []).map(skill => (
                      <span key={skill} className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-sm font-semibold rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Articles Section */}
              {userArticles.length > 0 && (
                <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-slate-200 dark:border-dark-border shadow-sm">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <BookOpen size={18} className="text-indigo-500" />
                    Articles publiés
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userArticles.map(article => (
                      <div key={article.id} className="p-4 rounded-xl border border-slate-100 dark:border-dark-border bg-slate-50 dark:bg-dark-bg hover:bg-white dark:hover:bg-dark-surface hover:shadow-md transition-all">
                        <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">{article.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{article.summary}</p>
                        <div className="flex items-center gap-3 mt-3 text-xs text-slate-400 dark:text-slate-500 font-medium">
                          <span className="flex items-center gap-1"><Heart size={12} /> {article.likes?.length || 0}</span>
                          <span>{formatDate(article.createdAt, 'dd/MM/yyyy')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Books Section */}
              {userBooks.length > 0 && (
                <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-slate-200 dark:border-dark-border shadow-sm">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Library size={18} className="text-amber-500" />
                    Bibliothèque
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userBooks.map(book => (
                      <div key={book.id} className="flex gap-4 p-4 rounded-xl border border-slate-100 dark:border-dark-border bg-slate-50 dark:bg-dark-bg hover:bg-white dark:hover:bg-dark-surface hover:shadow-md transition-all">
                        {book.coverImage && (
                          <img src={book.coverImage} alt={book.title} className="w-16 h-24 object-cover rounded shadow-sm" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-900 dark:text-white truncate">{book.title}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{book.genre}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">{book.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* GitHub Repositories */}
              {profile.githubUrl && (
                <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-slate-200 dark:border-dark-border shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <Github size={18} className="text-slate-700 dark:text-slate-300" />
                      {showAllRepos ? 'Tous les projets GitHub' : 'Derniers projets GitHub'}
                    </h2>
                    <button 
                      onClick={() => setShowAllRepos(!showAllRepos)}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 uppercase tracking-wider transition-colors"
                    >
                      {showAllRepos ? 'Réduire' : 'Voir tout'}
                    </button>
                  </div>
                  
                  {loadingRepos ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
                    </div>
                  ) : repos.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {repos.map(repo => (
                          <a 
                            key={repo.id} 
                            href={repo.html_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="group block p-5 rounded-xl border border-slate-200 dark:border-dark-border hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all bg-white dark:bg-dark-bg"
                          >
                            <h3 className="font-bold text-indigo-600 dark:text-indigo-400 truncate group-hover:text-indigo-700 transition-colors">{repo.name}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 min-h-[40px] leading-relaxed">
                              {repo.description || "Aucune description"}
                            </p>
                            <div className="flex items-center gap-4 mt-4 text-xs text-slate-500 dark:text-slate-500 font-semibold">
                              {repo.language && (
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                                  {repo.language}
                                </span>
                              )}
                              <span className="flex items-center gap-1.5">
                                <Star size={14} className="text-yellow-500" /> {repo.stargazers_count}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <GitBranch size={14} className="text-slate-400 dark:text-slate-600" /> {repo.forks_count}
                              </span>
                            </div>
                          </a>
                        ))}
                      </div>
                      {!showAllRepos && repos.length >= 4 && (
                        <div className="text-center pt-2">
                          <button 
                            onClick={() => setShowAllRepos(true)}
                            className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          >
                            Afficher plus de dépôts...
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-slate-50 dark:bg-dark-bg rounded-xl border border-slate-100 dark:border-dark-border">
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Aucun dépôt public trouvé.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              {saveError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  {saveError}
                </div>
              )}

              <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom d'affichage *</label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={e => setFormData({...formData, displayName: e.target.value})}
                    className="w-full rounded-md border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-bg text-slate-900 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pseudo</label>
                  <input
                    type="text"
                    value={formData.pseudo}
                    onChange={e => setFormData({...formData, pseudo: e.target.value})}
                    className="w-full rounded-md border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-bg text-slate-900 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="ex: dev_ninja"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prénom</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                    className="w-full rounded-md border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-bg text-slate-900 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                    className="w-full rounded-md border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-bg text-slate-900 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Localisation</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                    className="w-full rounded-md border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-bg text-slate-900 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Libreville, Gabon"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Statut</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full rounded-md border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-bg text-slate-900 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Sélectionner...</option>
                    <option value="Étudiant">Étudiant</option>
                    <option value="Junior">Junior</option>
                    <option value="Confirmé">Confirmé</option>
                    <option value="Senior">Senior</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Années d'expérience</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.experienceYears}
                    onChange={e => setFormData({...formData, experienceYears: e.target.value})}
                    className="w-full rounded-md border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-bg text-slate-900 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Lien GitHub</label>
                  <input
                    type="url"
                    value={formData.githubUrl}
                    onChange={e => setFormData({...formData, githubUrl: e.target.value})}
                    className="w-full rounded-md border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-bg text-slate-900 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://github.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Lien LinkedIn</label>
                  <input
                    type="url"
                    value={formData.linkedInUrl}
                    onChange={e => setFormData({...formData, linkedInUrl: e.target.value})}
                    className="w-full rounded-md border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-bg text-slate-900 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Portfolio</label>
                  <input
                    type="url"
                    value={formData.portfolioUrl}
                    onChange={e => setFormData({...formData, portfolioUrl: e.target.value})}
                    className="w-full rounded-md border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-bg text-slate-900 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://mon-portfolio.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Biographie</label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                  className="w-full rounded-md border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-bg text-slate-900 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Parlez-nous de vous..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Compétences (séparées par des virgules)</label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={e => setFormData({...formData, skills: e.target.value})}
                  className="w-full rounded-md border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-bg text-slate-900 dark:text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="React, Node.js, Python, DevOps..."
                />
              </div>
            </div>
          </>
        )}
        </div>
      </div>

      {/* Followers/Following Modal */}
      <AnimatePresence>
        {(showFollowersModal || showFollowingModal) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-dark-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-dark-border"
            >
              <div className="px-6 py-4 border-b border-slate-100 dark:border-dark-border flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {showFollowersModal ? 'Abonnés' : 'Abonnements'}
                </h3>
                <button 
                  onClick={() => { setShowFollowersModal(false); setShowFollowingModal(false); }} 
                  className="p-2 hover:bg-slate-100 dark:hover:bg-dark-bg rounded-full transition-colors text-slate-500 dark:text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 max-h-[400px] overflow-y-auto">
                {loadingFollowList ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
                  </div>
                ) : followListData.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400 italic">
                    Aucun utilisateur trouvé
                  </div>
                ) : (
                  <div className="space-y-3">
                    {followListData.map((userItem) => (
                      <div 
                        key={userItem.uid} 
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-bg transition-colors cursor-pointer"
                        onClick={() => {
                          navigate(`/app/profile/${userItem.uid}`);
                          setShowFollowersModal(false);
                          setShowFollowingModal(false);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src={userItem.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userItem.displayName)}&background=random`} 
                            alt={userItem.displayName}
                            className="w-10 h-10 rounded-full object-cover border border-slate-100 dark:border-dark-border"
                          />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{userItem.displayName}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">{userItem.role}</div>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-400 dark:text-slate-600" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChevronRight({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
