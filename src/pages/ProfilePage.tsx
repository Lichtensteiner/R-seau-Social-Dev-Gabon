import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { User as UserIcon, Mail, MapPin, Github, Code2, Save, Edit2, Star, GitBranch, MessageSquare, Heart, Briefcase, Linkedin, Globe, UserPlus, UserMinus, Camera, Loader2, BookOpen, Library } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

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

export default function ProfilePage({ user }: { user: User }) {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const targetUserId = userId || user.uid;
  const isOwnProfile = targetUserId === user.uid;

  const [profile, setProfile] = useState<UserProfile | null>(null);
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
            experienceYears: data.experienceYears?.toString() || '',
            githubUrl: data.githubUrl || '',
            linkedInUrl: data.linkedInUrl || '',
            portfolioUrl: data.portfolioUrl || '',
            skills: data.skills ? data.skills.join(', ') : '',
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

  const handleSave = async () => {
    try {
      setSaving(true);
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(Boolean);
      
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
      if (formData.experienceYears) updateData.experienceYears = parseInt(formData.experienceYears);
      if (formData.linkedInUrl) updateData.linkedInUrl = formData.linkedInUrl;
      if (formData.portfolioUrl) updateData.portfolioUrl = formData.portfolioUrl;
      if (formData.photoURL) updateData.photoURL = formData.photoURL;

      await updateDoc(doc(db, 'users', user.uid), updateData);
      
      setProfile(prev => prev ? { ...prev, ...updateData } : null);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Erreur lors de la mise à jour du profil.");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
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
      alert("Erreur lors du téléchargement de l'image.");
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header Cover */}
        <div className="h-40 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        
        <div className="px-6 sm:px-8 pb-8">
          <div className="flex justify-between items-end -mt-16 mb-6">
            <div className="relative">
              <img 
                src={formData.photoURL || profile.photoURL || `https://ui-avatars.com/api/?name=${profile.displayName || profile.email}&background=random&size=128`} 
                alt="Avatar" 
                className={`w-32 h-32 rounded-full border-4 border-white bg-slate-200 object-cover shadow-md ${uploadingImage ? 'opacity-50' : ''}`}
              />
              {uploadingImage && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                </div>
              )}
              {isEditing && (
                <div 
                  className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 text-white rounded-full border-2 border-white shadow-sm cursor-pointer hover:bg-indigo-700 transition-colors"
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
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
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
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
                      onClick={() => navigate(`/messages?userId=${targetUserId}`)}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
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
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
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
                <h1 className="text-3xl font-bold text-slate-900">
                  {profile.displayName}
                  {profile.pseudo && <span className="text-xl font-normal text-slate-500 ml-2">@{profile.pseudo}</span>}
                </h1>
                <p className="text-slate-500 flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 capitalize">
                    {profile.role === 'dev' ? 'Développeur' : profile.role === 'writer' ? 'Écrivain / Auteur' : profile.role === 'recruiter' ? 'Recruteur' : 'Admin'}
                  </span>
                  {profile.status && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700">
                      {profile.status}
                    </span>
                  )}
                  {profile.experienceYears !== undefined && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700">
                      {profile.experienceYears} an{profile.experienceYears > 1 ? 's' : ''} d'exp.
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-4 mt-4 text-sm font-medium text-slate-600">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-900 font-bold">{profile.followers?.length || 0}</span> abonnés
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-900 font-bold">{profile.following?.length || 0}</span> abonnements
                  </div>
                </div>
              </div>

              {/* Stats Bento */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                  <BookOpen size={24} className="text-indigo-500 mb-2" />
                  <span className="text-2xl font-bold text-slate-900">{userStats.articles}</span>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Articles</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                  <Library size={24} className="text-amber-500 mb-2" />
                  <span className="text-2xl font-bold text-slate-900">{userStats.books}</span>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Livres</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                  <Code2 size={24} className="text-pink-500 mb-2" />
                  <span className="text-2xl font-bold text-slate-900">{profile.skills?.length || 0}</span>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Compétences</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                  <Github size={24} className="text-slate-700 mb-2" />
                  <span className="text-2xl font-bold text-slate-900">{repos.length}</span>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Dépôts publics</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Mail size={18} className="text-indigo-500" />
                  </div>
                  <span className="font-medium">{profile.email}</span>
                </div>
                {profile.location && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <MapPin size={18} className="text-purple-500" />
                    </div>
                    <span className="font-medium">{profile.location}</span>
                  </div>
                )}
                {profile.githubUrl && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Github size={18} className="text-slate-700" />
                    </div>
                    <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 hover:underline">
                      GitHub
                    </a>
                  </div>
                )}
                {profile.linkedInUrl && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Linkedin size={18} className="text-blue-600" />
                    </div>
                    <a href={profile.linkedInUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 hover:underline">
                      LinkedIn
                    </a>
                  </div>
                )}
                {profile.portfolioUrl && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Globe size={18} className="text-emerald-500" />
                    </div>
                    <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 hover:underline">
                      Portfolio
                    </a>
                  </div>
                )}
              </div>

              {profile.bio && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <UserIcon size={18} className="text-indigo-500" />
                    À propos
                  </h2>
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{profile.bio}</p>
                </div>
              )}

              {profile.skills && profile.skills.length > 0 && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Code2 size={18} className="text-purple-500" />
                    Compétences techniques
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map(skill => (
                      <span key={skill} className="px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-xl border border-indigo-100">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Articles Section */}
              {userArticles.length > 0 && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <BookOpen size={18} className="text-indigo-500" />
                    Articles publiés
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userArticles.map(article => (
                      <div key={article.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md transition-all">
                        <h3 className="font-bold text-slate-900 line-clamp-1">{article.title}</h3>
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{article.summary}</p>
                        <div className="flex items-center gap-3 mt-3 text-xs text-slate-400 font-medium">
                          <span className="flex items-center gap-1"><Heart size={12} /> {article.likes?.length || 0}</span>
                          <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Books Section */}
              {userBooks.length > 0 && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Library size={18} className="text-amber-500" />
                    Bibliothèque
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userBooks.map(book => (
                      <div key={book.id} className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md transition-all">
                        {book.coverImage && (
                          <img src={book.coverImage} alt={book.title} className="w-16 h-24 object-cover rounded shadow-sm" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-900 truncate">{book.title}</h3>
                          <p className="text-xs text-slate-500 mt-1">{book.genre}</p>
                          <p className="text-xs text-slate-600 mt-2 line-clamp-2">{book.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* GitHub Repositories */}
              {profile.githubUrl && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Github size={18} className="text-slate-700" />
                      {showAllRepos ? 'Tous les projets GitHub' : 'Derniers projets GitHub'}
                    </h2>
                    <button 
                      onClick={() => setShowAllRepos(!showAllRepos)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider transition-colors"
                    >
                      {showAllRepos ? 'Réduire' : 'Voir tout'}
                    </button>
                  </div>
                  
                  {loadingRepos ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
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
                            className="group block p-5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all bg-white"
                          >
                            <h3 className="font-bold text-indigo-600 truncate group-hover:text-indigo-700 transition-colors">{repo.name}</h3>
                            <p className="text-sm text-slate-600 mt-2 line-clamp-2 min-h-[40px] leading-relaxed">
                              {repo.description || "Aucune description"}
                            </p>
                            <div className="flex items-center gap-4 mt-4 text-xs text-slate-500 font-semibold">
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
                                <GitBranch size={14} className="text-slate-400" /> {repo.forks_count}
                              </span>
                            </div>
                          </a>
                        ))}
                      </div>
                      {!showAllRepos && repos.length >= 4 && (
                        <div className="text-center pt-2">
                          <button 
                            onClick={() => setShowAllRepos(true)}
                            className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
                          >
                            Afficher plus de dépôts...
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-sm text-slate-500 font-medium">Aucun dépôt public trouvé.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nom d'affichage *</label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={e => setFormData({...formData, displayName: e.target.value})}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Pseudo</label>
                  <input
                    type="text"
                    value={formData.pseudo}
                    onChange={e => setFormData({...formData, pseudo: e.target.value})}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="ex: dev_ninja"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Localisation</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Libreville, Gabon"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Années d'expérience</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.experienceYears}
                    onChange={e => setFormData({...formData, experienceYears: e.target.value})}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Lien GitHub</label>
                  <input
                    type="url"
                    value={formData.githubUrl}
                    onChange={e => setFormData({...formData, githubUrl: e.target.value})}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://github.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Lien LinkedIn</label>
                  <input
                    type="url"
                    value={formData.linkedInUrl}
                    onChange={e => setFormData({...formData, linkedInUrl: e.target.value})}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Portfolio</label>
                  <input
                    type="url"
                    value={formData.portfolioUrl}
                    onChange={e => setFormData({...formData, portfolioUrl: e.target.value})}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://mon-portfolio.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Biographie</label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Parlez-nous de vous..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Compétences (séparées par des virgules)</label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={e => setFormData({...formData, skills: e.target.value})}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="React, Node.js, Python, DevOps..."
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
