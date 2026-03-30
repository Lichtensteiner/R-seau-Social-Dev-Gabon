import React, { useState } from 'react';
import { Search, Github, Star, GitBranch, ExternalLink, Loader2, Code2, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Repo {
  id: number;
  name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  updated_at: string;
}

interface GithubUser {
  login: string;
  avatar_url: string;
  name: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
}

export default function GitHubExplorerPage() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<GithubUser | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [error, setError] = useState('');

  const fetchGithubData = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError('');
    setUser(null);
    setRepos([]);

    try {
      // Fetch user info
      const userRes = await fetch(`https://api.github.com/users/${username}`);
      if (!userRes.ok) {
        if (userRes.status === 404) throw new Error('Utilisateur non trouvé');
        throw new Error('Erreur lors de la récupération de l\'utilisateur');
      }
      const userData = await userRes.json();
      setUser(userData);

      // Fetch repos
      const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
      if (reposRes.ok) {
        const reposData = await reposRes.json();
        setRepos(reposData);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-slate-900 text-white rounded-xl">
            <Github size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Explorateur GitHub</h1>
            <p className="text-slate-500">Recherchez n'importe quel développeur pour voir ses projets publics.</p>
          </div>
        </div>

        <form onSubmit={fetchGithubData} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Entrez un nom d'utilisateur GitHub..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Rechercher'}
          </button>
        </form>

        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-red-500 text-sm font-medium"
          >
            {error}
          </motion.p>
        )}
      </div>

      <AnimatePresence mode="wait">
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* User Profile Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6 items-center md:items-start">
              <img 
                src={user.avatar_url} 
                alt={user.login} 
                className="w-24 h-24 rounded-2xl border-4 border-slate-50 shadow-sm"
              />
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold text-slate-900">{user.name || user.login}</h2>
                  <a 
                    href={user.html_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline text-sm font-medium flex items-center justify-center md:justify-start gap-1"
                  >
                    @{user.login} <ExternalLink size={14} />
                  </a>
                </div>
                <p className="text-slate-600 mb-4 max-w-2xl">{user.bio || "Pas de biographie disponible."}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-medium text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <BookOpen size={16} className="text-indigo-500" />
                    <span className="text-slate-900">{user.public_repos}</span> dépôts
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star size={16} className="text-yellow-500" />
                    <span className="text-slate-900">{user.followers}</span> abonnés
                  </div>
                  <div className="flex items-center gap-1.5">
                    <GitBranch size={16} className="text-purple-500" />
                    <span className="text-slate-900">{user.following}</span> abonnements
                  </div>
                </div>
              </div>
            </div>

            {/* Repositories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {repos.map((repo, index) => (
                <motion.a
                  key={repo.id}
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate pr-4">
                        {repo.name}
                      </h3>
                      <ExternalLink size={16} className="text-slate-300 group-hover:text-indigo-400" />
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-4 h-10">
                      {repo.description || "Aucune description fournie pour ce projet."}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                      {repo.language && (
                        <div className="flex items-center gap-1.5">
                          <Code2 size={14} className="text-indigo-500" />
                          {repo.language}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Star size={14} className="text-yellow-500" />
                        {repo.stargazers_count}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Mis à jour le {new Date(repo.updated_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </motion.a>
              ))}
            </div>

            {repos.length === 0 && !loading && (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                <p className="text-slate-500">Aucun dépôt public trouvé pour cet utilisateur.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
