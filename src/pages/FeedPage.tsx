import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { User } from 'firebase/auth';
import { collection, addDoc, query, orderBy, onSnapshot, doc, deleteDoc, updateDoc, getDoc, serverTimestamp, arrayUnion, arrayRemove, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Send, MessageSquare, Heart, Trash2, Clock, Languages } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistance } from '../lib/date-utils';
import { logActivity } from '../lib/activity';
import { updateLeaderboardPoints } from '../lib/leaderboard';
import { useTranslation } from 'react-i18next';
import { GoogleGenAI } from "@google/genai";
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  content: string;
  createdAt: any;
}

interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  content: string;
  createdAt: any;
  likes: string[];
  commentsCount: number;
  comments?: Comment[];
  showComments?: boolean;
}

export default function FeedPage({ user }: { user: User }) {
  const { t, i18n } = useTranslation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [commentContents, setCommentContents] = useState<Record<string, string>>({});
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [translatingIds, setTranslatingIds] = useState<Record<string, boolean>>({});

  const handleTranslate = async (postId: string, content: string) => {
    if (translations[postId]) {
      setTranslations(prev => {
        const next = { ...prev };
        delete next[postId];
        return next;
      });
      return;
    }

    try {
      setTranslatingIds(prev => ({ ...prev, [postId]: true }));
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Translate the following social media post to ${i18n.language}. Only return the translated text, nothing else:\n\n${content}`,
      });
      
      if (response.text) {
        setTranslations(prev => ({ ...prev, [postId]: response.text }));
      }
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setTranslatingIds(prev => ({ ...prev, [postId]: false }));
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      setPosts(postsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'posts');
    });

    return () => unsubscribe();
  }, []);

  const handleCreatePost = async (e: FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    try {
      setLoading(true);
      
      // Get user profile for name and photo
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      await addDoc(collection(db, 'posts'), {
        authorId: user.uid,
        authorName: userData?.displayName || user.displayName || 'Développeur',
        authorPhoto: userData?.photoURL || user.photoURL || '',
        content: newPostContent,
        createdAt: serverTimestamp(),
        likes: [],
        commentsCount: 0
      });
      
      // Update leaderboard points
      await updateLeaderboardPoints(
        user.uid,
        userData?.displayName || user.displayName || 'Développeur',
        userData?.photoURL || user.photoURL || undefined,
        'post_create'
      );

      await logActivity(user.uid, userData?.displayName || user.displayName || 'Développeur', 'post_create', 'A publié un nouveau post');
      setNewPostContent('');
    } catch (error) {
      console.error("Error creating post:", error);
      alert(t('feed.error_publish'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm(t('feed.delete_post_confirm'))) return;
    try {
      await deleteDoc(doc(db, 'posts', postId));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const toggleComments = async (postId: string) => {
    setPosts(currentPosts => 
      currentPosts.map(p => {
        if (p.id === postId) {
          const willShow = !p.showComments;
          if (willShow && !p.comments) {
            fetchComments(postId);
          }
          return { ...p, showComments: willShow };
        }
        return p;
      })
    );
  };

  const fetchComments = (postId: string) => {
    const q = query(
      collection(db, 'posts', postId, 'comments'),
      orderBy('createdAt', 'asc'),
      limit(50)
    );

    onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      
      setPosts(currentPosts => 
        currentPosts.map(p => 
          p.id === postId ? { ...p, comments: commentsData, commentsCount: commentsData.length } : p
        )
      );
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `posts/${postId}/comments`);
    });
  };

  const handleCreateComment = async (e: FormEvent, postId: string, postAuthorId: string) => {
    e.preventDefault();
    const content = commentContents[postId];
    if (!content?.trim()) return;

    try {
      setLoadingComments(prev => ({ ...prev, [postId]: true }));
      
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      // Add comment
      await addDoc(collection(db, 'posts', postId, 'comments'), {
        authorId: user.uid,
        authorName: userData?.displayName || user.displayName || 'Développeur',
        authorPhoto: userData?.photoURL || user.photoURL || '',
        content: content.trim(),
        createdAt: serverTimestamp()
      });

      // Update post comment count
      const postRef = doc(db, 'posts', postId);
      const postSnap = await getDoc(postRef);
      if (postSnap.exists()) {
        await updateDoc(postRef, {
          commentsCount: (postSnap.data().commentsCount || 0) + 1
        });
      }

      // Update leaderboard points
      await updateLeaderboardPoints(
        user.uid,
        userData?.displayName || user.displayName || 'Développeur',
        userData?.photoURL || user.photoURL || undefined,
        'comment_create'
      );

      // Notify post author
      if (postAuthorId !== user.uid) {
        await addDoc(collection(db, 'users', postAuthorId, 'notifications'), {
          type: 'comment',
          fromUserId: user.uid,
          fromUserName: userData?.displayName || user.displayName || 'Un utilisateur',
          fromUserPhoto: userData?.photoURL || user.photoURL || '',
          postId: postId,
          read: false,
          createdAt: serverTimestamp()
        });
      }

      setCommentContents(prev => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setLoadingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!window.confirm(t('feed.delete_comment_confirm'))) return;
    try {
      await deleteDoc(doc(db, 'posts', postId, 'comments', commentId));
      
      const postRef = doc(db, 'posts', postId);
      const postSnap = await getDoc(postRef);
      if (postSnap.exists()) {
        await updateDoc(postRef, {
          commentsCount: Math.max(0, (postSnap.data().commentsCount || 1) - 1)
        });
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleLike = async (postId: string, currentLikes: string[] = [], authorId: string) => {
    const postRef = doc(db, 'posts', postId);
    const isLiked = currentLikes.includes(user.uid);

    try {
      if (isLiked) {
        await updateDoc(postRef, {
          likes: arrayRemove(user.uid)
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(user.uid)
        });
        
        // Notify the author if it's not their own post
        if (authorId !== user.uid) {
          await addDoc(collection(db, 'users', authorId, 'notifications'), {
            type: 'like',
            fromUserId: user.uid,
            fromUserName: user.displayName || 'Un utilisateur',
            fromUserPhoto: user.photoURL || '',
            postId: postId,
            read: false,
            createdAt: serverTimestamp()
          });
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 transition-colors duration-300">
      {/* Create Post */}
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-slate-200 dark:border-dark-border p-4">
        <form onSubmit={handleCreatePost}>
          <div className="flex gap-4">
            <img 
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email}&background=random`} 
              alt="Avatar" 
              className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 object-cover border border-white dark:border-dark-border"
            />
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder={t('feed.placeholder')}
              className="flex-1 resize-none border-none focus:ring-0 p-2 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 bg-transparent min-h-[80px]"
            />
          </div>
          <div className="flex justify-end mt-3 pt-3 border-t border-slate-100 dark:border-dark-border">
            <button
              type="submit"
              disabled={loading || !newPostContent.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <Send size={18} />
              {t('feed.publish')}
            </button>
          </div>
        </form>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-dark-surface rounded-xl border border-slate-200 dark:border-dark-border">
            <p className="text-slate-500 dark:text-slate-400">{t('feed.no_posts')}</p>
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-slate-200 dark:border-dark-border p-5">
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <Link to={`/app/profile/${post.authorId}`}>
                    <img 
                      src={post.authorPhoto || `https://ui-avatars.com/api/?name=${post.authorName}&background=random`} 
                      alt={post.authorName}
                      className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 object-cover cursor-pointer hover:opacity-80 transition-opacity border border-white dark:border-dark-border"
                    />
                  </Link>
                  <div>
                    <Link to={`/app/profile/${post.authorId}`}>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">{post.authorName}</h3>
                    </Link>
                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <Clock size={12} className="mr-1" />
                      {formatDistance(post.createdAt)}
                    </div>
                  </div>
                </div>
                {post.authorId === user.uid && (
                  <button 
                    onClick={() => handleDeletePost(post.id)}
                    className="text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              
              <div className="mt-4 text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                {translations[post.id] || post.content}
                {translations[post.id] && (
                  <div className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 italic border-l-2 border-indigo-200 dark:border-indigo-900 pl-2">
                    Traduit par IA
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center gap-4">
                <button
                  onClick={() => handleTranslate(post.id, post.content)}
                  disabled={translatingIds[post.id]}
                  className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
                >
                  <Languages size={14} />
                  {translatingIds[post.id] ? t('feed.translating') : (translations[post.id] ? "Voir l'original" : t('feed.translate'))}
                </button>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-dark-border flex gap-6">
                <button 
                  onClick={() => handleLike(post.id, post.likes, post.authorId)}
                  className={`flex items-center gap-1.5 transition-colors ${
                    post.likes?.includes(user.uid) 
                      ? 'text-pink-600' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-pink-600'
                  }`}
                >
                  <Heart size={18} fill={post.likes?.includes(user.uid) ? "currentColor" : "none"} />
                  <span className="text-sm font-medium">{post.likes?.length || 0}</span>
                </button>
                <button 
                  onClick={() => toggleComments(post.id)}
                  className={`flex items-center gap-1.5 transition-colors ${
                    post.showComments ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}
                >
                  <MessageSquare size={18} />
                  <span className="text-sm font-medium">{post.commentsCount || 0}</span>
                </button>
              </div>

              {/* Comments Section */}
              {post.showComments && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-dark-border space-y-4">
                  {/* Comment List */}
                  <div className="space-y-4">
                    {post.comments?.map(comment => (
                      <div key={comment.id} className="flex gap-3 group">
                        <img 
                          src={comment.authorPhoto || `https://ui-avatars.com/api/?name=${comment.authorName}&background=random`} 
                          alt={comment.authorName}
                          className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 object-cover shrink-0 border border-white dark:border-dark-border"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="bg-slate-50 dark:bg-dark-bg rounded-2xl rounded-tl-none px-4 py-2.5 inline-block max-w-full border border-slate-100 dark:border-dark-border">
                            <div className="flex items-baseline justify-between gap-4">
                              <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{comment.authorName}</span>
                              {comment.authorId === user.uid && (
                                <button 
                                  onClick={() => handleDeleteComment(post.id, comment.id)}
                                  className="text-slate-400 dark:text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5 break-words">{comment.content}</p>
                          </div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 ml-2">
                            {formatDistance(comment.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Comment */}
                  <form onSubmit={(e) => handleCreateComment(e, post.id, post.authorId)} className="flex gap-3 mt-4">
                    <img 
                      src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email}&background=random`} 
                      alt="Avatar" 
                      className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 object-cover shrink-0 border border-white dark:border-dark-border"
                    />
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={commentContents[post.id] || ''}
                        onChange={(e) => setCommentContents(prev => ({ ...prev, [post.id]: e.target.value }))}
                        placeholder={t('feed.write_comment')}
                        className="w-full bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-full pl-4 pr-10 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                      <button
                        type="submit"
                        disabled={loadingComments[post.id] || !commentContents[post.id]?.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-full transition-colors disabled:opacity-50"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
