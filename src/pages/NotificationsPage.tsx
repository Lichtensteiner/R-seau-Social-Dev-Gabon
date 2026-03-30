import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Bell, Heart, MessageSquare, Trash2, CheckCircle2 } from 'lucide-react';
import { formatDistance } from '../lib/date-utils';
import { Link } from 'react-router-dom';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'system';
  fromUserId: string;
  fromUserName: string;
  fromUserPhoto: string;
  postId: string;
  read: boolean;
  createdAt: any;
}

export default function NotificationsPage({ user }: { user: User }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'users', user.uid, 'notifications'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      setNotifications(notifs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching notifications:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user.uid]);

  const markAsRead = async (notifId: string) => {
    try {
      await updateDoc(doc(db, 'users', user.uid, 'notifications', notifId), {
        read: true
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifs = notifications.filter(n => !n.read);
    for (const notif of unreadNotifs) {
      await markAsRead(notif.id);
    }
  };

  const deleteNotification = async (notifId: string) => {
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'notifications', notifId));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
            <Bell size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
            <p className="text-slate-500 text-sm">
              {unreadCount > 0 
                ? `Vous avez ${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
                : "Vous êtes à jour !"}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
          >
            <CheckCircle2 size={16} />
            Tout marquer comme lu
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">Aucune notification pour le moment.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map(notif => (
              <div 
                key={notif.id} 
                className={`p-4 flex items-start gap-4 transition-colors ${notif.read ? 'bg-white' : 'bg-indigo-50/50'}`}
                onClick={() => !notif.read && markAsRead(notif.id)}
              >
                <div className="relative shrink-0 mt-1">
                  <Link to={`/app/profile/${notif.fromUserId}`}>
                    <img 
                      src={notif.fromUserPhoto || `https://ui-avatars.com/api/?name=${notif.fromUserName}&background=random`} 
                      alt={notif.fromUserName}
                      className="w-10 h-10 rounded-full bg-slate-200 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  </Link>
                  <div className={`absolute -bottom-1 -right-1 p-1 rounded-full text-white ${notif.type === 'like' ? 'bg-pink-500' : 'bg-blue-500'}`}>
                    {notif.type === 'like' ? <Heart size={10} fill="currentColor" /> : <MessageSquare size={10} fill="currentColor" />}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800">
                    <Link to={`/app/profile/${notif.fromUserId}`}>
                      <span className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer">{notif.fromUserName}</span>
                    </Link>
                    {notif.type === 'like' ? ' a aimé votre publication.' : ' a commenté votre publication.'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500">
                      {formatDistance(notif.createdAt)}
                    </span>
                    <Link to="/app" className="text-xs text-indigo-600 hover:underline font-medium">
                      Voir la publication
                    </Link>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {!notif.read && (
                    <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notif.id);
                    }}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
