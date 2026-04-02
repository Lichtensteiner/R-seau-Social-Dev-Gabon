import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { BookOpen, Plus, Search, Tag, Calendar, User as UserIcon, ChevronRight, Loader2, X, Image as ImageIcon, Send, ThumbsUp, Eye, Upload, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { logActivity } from '../lib/activity';
import { updateLeaderboardPoints } from '../lib/leaderboard';

interface Article {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  summary?: string;
  coverImage?: string;
  tags?: string[];
  createdAt: any;
  likesCount: number;
  viewsCount: number;
}

export default function ArticlesPage({ user }: { user: User }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  
  // Create form state
  const [newTitle, setNewTitle] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newCoverImage, setNewCoverImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingContent, setUploadingContent] = useState(false);
  
  const coverInputRef = React.useRef<HTMLInputElement>(null);
  const contentInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const articlesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Article[];
      setArticles(articlesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    setIsSubmitting(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const authorName = userSnap.exists() ? userSnap.data().displayName : user.displayName || 'Auteur';

      await addDoc(collection(db, 'articles'), {
        authorId: user.uid,
        authorName,
        title: newTitle,
        summary: newSummary,
        content: newContent,
        coverImage: newCoverImage,
        tags: newTags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
        createdAt: serverTimestamp(),
        likesCount: 0,
        viewsCount: 0
      });

      // Update leaderboard points
      await updateLeaderboardPoints(
        user.uid,
        authorName,
        user.photoURL || undefined,
        'article_create'
      );

      await logActivity(user.uid, authorName, 'article_create', `A publié l'article: ${newTitle}`);

      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewSummary('');
      setNewContent('');
      setNewTags('');
      setNewCoverImage('');
    } catch (error) {
      console.error("Erreur lors de la création de l'article:", error);
      alert("Une erreur est survenue lors de la publication de l'article.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const storageRef = ref(storage, `articles/covers/${user.uid}_${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setNewCoverImage(url);
    } catch (error) {
      console.error("Erreur lors du téléversement de l'image:", error);
      alert("Erreur lors du téléversement de l'image.");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleArticleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Only allow text or markdown files
    if (!file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
      alert("Veuillez sélectionner un fichier .txt ou .md");
      return;
    }

    setUploadingContent(true);
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setNewContent(content);
        setUploadingContent(false);
      };
      reader.readAsText(file);
    } catch (error) {
      console.error("Erreur lors de la lecture du fichier:", error);
      alert("Erreur lors de la lecture du fichier.");
      setUploadingContent(false);
    }
  };

  const handleViewArticle = async (article: Article) => {
    setSelectedArticle(article);
    // Increment views
    try {
      await updateDoc(doc(db, 'articles', article.id), {
        viewsCount: increment(1)
      });
    } catch (error) {
      console.error("Erreur lors de l'incrémentation des vues:", error);
    }
  };

  const filteredArticles = articles.filter(article => 
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 transition-colors duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none">
            <BookOpen className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Articles & Publications</h1>
            <p className="text-slate-500 dark:text-slate-400">Partagez vos connaissances et lisez les articles de la communauté.</p>
          </div>
        </div>
        
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          <Plus size={20} />
          Écrire un article
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Rechercher un article, un auteur ou un tag..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-12 pr-4 py-4 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all text-lg text-slate-900 dark:text-slate-100"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        </div>
      ) : filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((article) => (
            <motion.div
              key={article.id}
              layoutId={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-dark-border overflow-hidden shadow-sm hover:shadow-xl transition-all group cursor-pointer flex flex-col"
              onClick={() => handleViewArticle(article)}
            >
              {article.coverImage ? (
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={article.coverImage} 
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ) : (
                <div className="h-48 bg-slate-100 dark:bg-dark-bg flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-slate-800 transition-colors">
                  <BookOpen size={48} className="text-slate-300 dark:text-slate-600" />
                </div>
              )}
              
              <div className="p-6 flex-grow flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  {article.tags?.slice(0, 2).map(tag => (
                    <span key={tag} className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-medium rounded-md">
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {article.title}
                </h3>
                
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-3 flex-grow">
                  {article.summary || article.content.substring(0, 150) + '...'}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-dark-border">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center overflow-hidden">
                      <UserIcon size={16} className="text-slate-500 dark:text-slate-400" />
                    </div>
                    <div className="text-xs">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{article.authorName}</p>
                      <p className="text-slate-500 dark:text-slate-400">
                        {article.createdAt?.toDate() ? formatDistanceToNow(article.createdAt.toDate(), { addSuffix: true, locale: fr }) : 'À l\'instant'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500 text-xs">
                    <span className="flex items-center gap-1">
                      <Eye size={14} />
                      {article.viewsCount || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp size={14} />
                      {article.likesCount || 0}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-dark-surface rounded-3xl border-2 border-dashed border-slate-200 dark:border-dark-border">
          <BookOpen size={64} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Aucun article trouvé</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Soyez le premier à partager vos connaissances !</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            Écrire un article
          </button>
        </div>
      )}

      {/* Create Article Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-dark-surface rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-dark-border"
            >
              <div className="px-8 py-6 border-b border-slate-100 dark:border-dark-border flex items-center justify-between bg-slate-50/50 dark:bg-dark-surface/50">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Nouvel Article</h2>
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-dark-bg rounded-full transition-colors text-slate-500 dark:text-slate-400"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleCreateArticle} className="p-8 overflow-y-auto flex-grow space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Titre de l'article</label>
                      <input
                        type="text"
                        required
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-slate-100"
                        placeholder="Ex: Les bases de React en 2024"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Résumé (optionnel)</label>
                      <textarea
                        value={newSummary}
                        onChange={(e) => setNewSummary(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-24 resize-none text-slate-900 dark:text-slate-100"
                        placeholder="Un court texte pour donner envie de lire..."
                      />
                    </div>
...
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Image de couverture</label>
                      <div className="flex gap-2">
                        <div className="relative flex-grow">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <ImageIcon className="h-5 w-5 text-slate-400" />
                          </div>
                          <input
                            type="url"
                            value={newCoverImage}
                            onChange={(e) => setNewCoverImage(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-slate-100"
                            placeholder="URL de l'image..."
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => coverInputRef.current?.click()}
                          disabled={uploadingCover}
                          className="px-4 py-3 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-xl hover:bg-slate-50 dark:hover:bg-dark-bg transition-colors flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium disabled:opacity-50"
                        >
                          {uploadingCover ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload size={20} />}
                          <span className="hidden sm:inline">Téléverser</span>
                        </button>
                        <input
                          type="file"
                          ref={coverInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={handleCoverImageUpload}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Tags (séparés par des virgules)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Tag className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                          type="text"
                          value={newTags}
                          onChange={(e) => setNewTags(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-slate-100"
                          placeholder="react, frontend, gabon"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Contenu (Markdown supporté)</label>
                      <button
                        type="button"
                        onClick={() => contentInputRef.current?.click()}
                        disabled={uploadingContent}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 uppercase tracking-wider disabled:opacity-50"
                      >
                        {uploadingContent ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText size={14} />}
                        Importer un fichier (.md, .txt)
                      </button>
                      <input
                        type="file"
                        ref={contentInputRef}
                        className="hidden"
                        accept=".md,.txt"
                        onChange={handleArticleFileUpload}
                      />
                    </div>
                    <textarea
                      required
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      className="w-full flex-grow px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono text-sm min-h-[300px] text-slate-900 dark:text-slate-100"
                      placeholder="# Mon super article..."
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-6 py-3 text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-100 dark:hover:bg-dark-bg rounded-xl transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send size={20} />}
                    Publier l'article
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Article Detail Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-white dark:bg-dark-surface w-full max-w-5xl h-full sm:h-[95vh] sm:rounded-3xl overflow-hidden flex flex-col relative border border-slate-200 dark:border-dark-border shadow-2xl"
            >
              <button 
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/20 dark:bg-black/20 backdrop-blur-md hover:bg-white/40 dark:hover:bg-black/40 rounded-full transition-colors text-white sm:text-slate-500 dark:sm:text-slate-400 sm:bg-slate-100 dark:sm:bg-dark-bg sm:hover:bg-slate-200 dark:sm:hover:bg-dark-surface"
              >
                <X size={24} />
              </button>

              <div className="overflow-y-auto flex-grow custom-scrollbar">
                {selectedArticle.coverImage && (
                  <div className="h-64 sm:h-96 w-full relative">
                    <img 
                      src={selectedArticle.coverImage} 
                      alt={selectedArticle.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-dark-surface via-transparent to-transparent" />
                  </div>
                )}

                <div className="px-6 sm:px-12 py-8 max-w-3xl mx-auto">
                  <div className="flex items-center gap-2 mb-6">
                    {selectedArticle.tags?.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-sm font-medium rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">
                    {selectedArticle.title}
                  </h1>

                  <div className="flex items-center gap-4 mb-10 pb-8 border-b border-slate-100 dark:border-dark-border">
                    <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center overflow-hidden">
                      <UserIcon size={24} className="text-slate-500 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100 text-lg">{selectedArticle.authorName}</p>
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {selectedArticle.createdAt?.toDate() ? formatDistanceToNow(selectedArticle.createdAt.toDate(), { addSuffix: true, locale: fr }) : 'À l\'instant'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye size={14} />
                          {selectedArticle.viewsCount} vues
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="prose prose-indigo dark:prose-invert prose-lg max-w-none text-slate-700 dark:text-slate-300 leading-relaxed">
                    <ReactMarkdown>{selectedArticle.content}</ReactMarkdown>
                  </div>
                  
                  <div className="mt-12 pt-8 border-t border-slate-100 dark:border-dark-border flex items-center justify-between">
                    <button className="flex items-center gap-2 px-6 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">
                      <ThumbsUp size={20} />
                      J'aime cet article
                    </button>
                    
                    <div className="flex items-center gap-4">
                      <span className="text-slate-500 dark:text-slate-400 text-sm">Partager :</span>
                      <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        <Send size={20} />
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
