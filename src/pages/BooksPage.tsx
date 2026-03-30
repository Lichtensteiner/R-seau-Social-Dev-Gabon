import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { Library, Plus, Search, Tag, Calendar, User as UserIcon, ExternalLink, Loader2, X, Image as ImageIcon, Send, Book as BookIcon, Upload } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

interface Book {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  description: string;
  coverImage?: string;
  purchaseUrl?: string;
  genre?: string;
  publishedDate?: string;
  createdAt: any;
}

export default function BooksPage({ user }: { user: User }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  
  // Create form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newGenre, setNewGenre] = useState('');
  const [newPublishedDate, setNewPublishedDate] = useState('');
  const [newPurchaseUrl, setNewPurchaseUrl] = useState('');
  const [newCoverImage, setNewCoverImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  
  const coverInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'books'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const booksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Book[];
      setBooks(booksData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDescription) return;

    setIsSubmitting(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const authorName = userSnap.exists() ? userSnap.data().displayName : user.displayName || 'Auteur';

      await addDoc(collection(db, 'books'), {
        authorId: user.uid,
        authorName,
        title: newTitle,
        description: newDescription,
        genre: newGenre,
        publishedDate: newPublishedDate,
        purchaseUrl: newPurchaseUrl,
        coverImage: newCoverImage,
        createdAt: serverTimestamp()
      });

      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      setNewGenre('');
      setNewPublishedDate('');
      setNewPurchaseUrl('');
      setNewCoverImage('');
    } catch (error) {
      console.error("Erreur lors de la création du livre:", error);
      alert("Une erreur est survenue lors de l'ajout du livre.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const storageRef = ref(storage, `books/covers/${user.uid}_${Date.now()}_${file.name}`);
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

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.genre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-600 rounded-xl shadow-lg shadow-amber-200">
            <Library className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Bibliothèque & Livres</h1>
            <p className="text-slate-500">Découvrez les ouvrages écrits par les membres de la communauté.</p>
          </div>
        </div>
        
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          <Plus size={20} />
          Ajouter un livre
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Rechercher un livre, un auteur ou un genre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-sm transition-all text-lg"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-10 h-10 animate-spin text-amber-600" />
        </div>
      ) : filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all group cursor-pointer flex flex-col"
              onClick={() => setSelectedBook(book)}
            >
              <div className="aspect-[2/3] overflow-hidden relative bg-slate-100">
                {book.coverImage ? (
                  <img 
                    src={book.coverImage} 
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 shadow-inner"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                    <BookIcon size={64} className="text-slate-300 mb-4" />
                    <p className="text-slate-400 font-bold text-lg leading-tight">{book.title}</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <p className="text-white text-sm font-medium line-clamp-2">{book.description}</p>
                </div>
                {book.genre && (
                  <div className="absolute top-3 left-3 px-2 py-1 bg-amber-600 text-white text-[10px] font-bold uppercase tracking-wider rounded shadow-md">
                    {book.genre}
                  </div>
                )}
              </div>
              
              <div className="p-4 flex-grow flex flex-col">
                <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-1 group-hover:text-amber-600 transition-colors">
                  {book.title}
                </h3>
                <p className="text-slate-500 text-sm mb-3">par {book.authorName}</p>
                
                <div className="mt-auto flex items-center justify-between">
                   <span className="text-xs text-slate-400">
                     {book.publishedDate || 'Date inconnue'}
                   </span>
                   <button className="p-2 text-amber-600 hover:bg-amber-50 rounded-full transition-colors">
                     <ExternalLink size={16} />
                   </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <Library size={64} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-semibold text-slate-900">Aucun livre trouvé</h3>
          <p className="text-slate-500 mt-2">Soyez le premier à ajouter votre ouvrage !</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-6 px-6 py-2 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-colors"
          >
            Ajouter un livre
          </button>
        </div>
      )}

      {/* Create Book Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-2xl font-bold text-slate-900">Ajouter un Livre</h2>
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleCreateBook} className="p-8 overflow-y-auto flex-grow space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Titre du livre</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                      placeholder="Le titre de votre ouvrage"
                    />
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Description / Synopsis</label>
                    <textarea
                      required
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all h-32 resize-none"
                      placeholder="De quoi parle votre livre ?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Genre</label>
                    <input
                      type="text"
                      value={newGenre}
                      onChange={(e) => setNewGenre(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                      placeholder="Roman, Essai, Tech..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Date de publication</label>
                    <input
                      type="text"
                      value={newPublishedDate}
                      onChange={(e) => setNewPublishedDate(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                      placeholder="Ex: Mars 2024"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Image de couverture</label>
                    <div className="flex gap-2">
                      <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <ImageIcon className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                          type="url"
                          value={newCoverImage}
                          onChange={(e) => setNewCoverImage(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                          placeholder="URL de l'image..."
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => coverInputRef.current?.click()}
                        disabled={uploadingCover}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2 text-slate-600 font-medium disabled:opacity-50"
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

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Lien d'achat (optionnel)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ExternalLink className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="url"
                        value={newPurchaseUrl}
                        onChange={(e) => setNewPurchaseUrl(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                        placeholder="Amazon, Fnac, Site perso..."
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-6 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-8 py-2 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition-all shadow-lg shadow-amber-100 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus size={20} />}
                    Ajouter le livre
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Book Detail Modal */}
      <AnimatePresence>
        {selectedBook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden flex flex-col sm:flex-row shadow-2xl"
            >
              <div className="w-full sm:w-1/3 bg-slate-100 relative">
                {selectedBook.coverImage ? (
                  <img 
                    src={selectedBook.coverImage} 
                    alt={selectedBook.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-12">
                    <BookIcon size={120} className="text-slate-300" />
                  </div>
                )}
                <button 
                  onClick={() => setSelectedBook(null)}
                  className="absolute top-4 left-4 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors text-white sm:hidden"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="w-full sm:w-2/3 p-8 sm:p-12 relative flex flex-col">
                <button 
                  onClick={() => setSelectedBook(null)}
                  className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hidden sm:block"
                >
                  <X size={24} />
                </button>

                <div className="flex items-center gap-2 mb-4">
                  {selectedBook.genre && (
                    <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold uppercase tracking-wider rounded-full">
                      {selectedBook.genre}
                    </span>
                  )}
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2">
                  {selectedBook.title}
                </h2>
                <p className="text-xl text-slate-500 mb-8">par {selectedBook.authorName}</p>

                <div className="prose prose-slate prose-lg max-w-none text-slate-600 mb-10 flex-grow">
                  <p>{selectedBook.description}</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 mt-auto pt-8 border-t border-slate-100">
                  {selectedBook.purchaseUrl && (
                    <a 
                      href={selectedBook.purchaseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-amber-600 text-white rounded-2xl font-bold hover:bg-amber-700 transition-all shadow-lg shadow-amber-100"
                    >
                      Acheter le livre
                      <ExternalLink size={20} />
                    </a>
                  )}
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Calendar size={16} />
                    Publié en {selectedBook.publishedDate || 'Date inconnue'}
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
