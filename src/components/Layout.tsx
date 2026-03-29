import { Outlet, Link, useLocation } from 'react-router-dom';
import { User, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { Home, Briefcase, User as UserIcon, LogOut, Menu, X, Users, Bell, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function Layout({ user }: { user: User }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'users', user.uid, 'notifications'),
      where('read', '==', false)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.docs.length);
    });
    return () => unsubscribe();
  }, [user]);

  const handleSignOut = () => {
    signOut(auth);
  };

  const navigation = [
    { name: "Fil d'actualité", href: '/', icon: Home },
    { name: 'Annuaire', href: '/network', icon: Users },
    { name: 'Opportunités', href: '/jobs', icon: Briefcase },
    { name: 'Messages', href: '/messages', icon: MessageCircle },
    { name: 'Notifications', href: '/notifications', icon: Bell, badge: unreadCount },
    { name: 'Mon Profil', href: '/profile', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="text-xl font-bold text-indigo-600">DevGabon</div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 hidden md:block">
            <div className="text-2xl font-bold text-indigo-600">DevGabon</div>
            <p className="text-xs text-slate-500 mt-1">Réseau Social IT</p>
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-6 md:mt-0">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-indigo-50 text-indigo-700 font-medium' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={20} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                    {item.name}
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-200">
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email}&background=random`} 
                alt="Avatar" 
                className="w-10 h-10 rounded-full bg-slate-200 object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{user.displayName || 'Utilisateur'}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
