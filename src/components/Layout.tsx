import { Outlet, Link, useLocation } from 'react-router-dom';
import { User, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useTranslation } from 'react-i18next';
import { Home, Briefcase, User as UserIcon, LogOut, Menu, X, Users, Bell, MessageCircle, Settings, Github, BookOpen, Library, Globe, Code2, Shield, Download, Clock, Languages, Trophy, Sword, Target, GraduationCap, ShieldCheck, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export default function Layout({ user }: { user: User }) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const languages = [
    { code: 'fr', name: 'Français (Gabon)', flag: '🇬🇦' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' }
  ];

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    // Optionally, send analytics event with outcome of user choice
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        setUserProfile(snapshot.data() as UserProfile);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const notificationsPath = `users/${user.uid}/notifications`;
    const q = query(
      collection(db, 'users', user.uid, 'notifications'),
      where('read', '==', false)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.docs.length);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, notificationsPath);
    });
    return () => unsubscribe();
  }, [user]);

  const handleSignOut = () => {
    signOut(auth);
  };

  const navigation = [
    { name: t('sidebar.feed'), href: '/app', icon: Home },
    { name: 'Leaderboard', href: '/app/leaderboard', icon: Trophy },
    { name: 'Battleground', href: '/app/battleground', icon: Sword },
    { name: 'Impact Gabon', href: '/app/impact', icon: Target },
    { name: 'Mentorat', href: '/app/mentorship', icon: GraduationCap },
    { name: 'Recrutement Commando', href: '/app/commando', icon: ShieldCheck },
    { name: t('sidebar.network'), href: '/app/network', icon: Users },
    { name: t('sidebar.jobs'), href: '/app/jobs', icon: Briefcase },
    { name: t('sidebar.messages'), href: '/app/messages', icon: MessageCircle },
    { name: t('sidebar.github'), href: '/app/github-explorer', icon: Github },
    { name: t('sidebar.articles'), href: '/app/articles', icon: BookOpen },
    { name: t('sidebar.library'), href: '/app/books', icon: Library },
    { name: t('sidebar.notifications'), href: '/app/notifications', icon: Bell, badge: unreadCount },
    { name: t('sidebar.profile'), href: '/app/profile', icon: UserIcon },
    { name: t('sidebar.settings'), href: '/app/settings', icon: Settings },
    { name: t('sidebar.presentation'), href: '/', icon: Globe },
  ];

  if (userProfile?.role === 'admin') {
    navigation.splice(navigation.length - 1, 0, { name: t('sidebar.admin'), href: '/app/admin/users', icon: Shield });
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg flex flex-col md:flex-row transition-colors duration-300">
      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-dark-surface border-b border-slate-200 dark:border-dark-border p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <img src="/assets/logo-dev-gabon-pro.png" alt="logo-dev-gabon-pro.png" className="w-8 h-8 object-contain" />
          <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">DevGabon</div>
        </div>
        
        {/* Real-time Clock Mobile */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-dark-bg rounded-lg border border-slate-100 dark:border-dark-border">
          <Clock size={12} className="text-indigo-500 dark:text-indigo-400 animate-pulse" />
          <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle Mobile */}
          <button 
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600 dark:text-slate-400">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-dark-surface border-r border-slate-200 dark:border-dark-border transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 hidden md:block">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img src="/assets/logo-dev-gabon-pro.png" alt="logo-dev-gabon-pro.png" className="w-10 h-10 object-contain" />
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">DevGabon</div>
              </div>
              <div className="flex items-center gap-1">
                {/* Theme Toggle Desktop */}
                <button 
                  onClick={toggleTheme}
                  className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
                >
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* Language Switcher Desktop */}
                <div className="relative group">
                <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  <Languages size={20} />
                </button>
                <div className="absolute left-0 top-full mt-1 w-40 bg-white dark:bg-dark-surface border border-slate-100 dark:border-dark-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="p-2 space-y-1">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center gap-2 ${
                          i18n.language.startsWith(lang.code) ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-bg'
                        }`}
                      >
                        <span className="text-sm">{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
            
            {/* Real-time Clock Desktop Sidebar Top */}
            <div className="mb-4 px-3 py-2 bg-slate-50 dark:bg-dark-bg rounded-xl border border-slate-100 dark:border-dark-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-indigo-500 dark:text-indigo-400 animate-pulse" />
                <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold">{t('footer.clock')}</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">Réseau Social IT</p>
          </div>

          <div className="md:hidden p-4 border-b border-slate-100 dark:border-dark-border flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Menu</span>
            <div className="flex gap-2">
              {languages.slice(0, 3).map(lang => (
                <button 
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase ${i18n.language.startsWith(lang.code) ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-dark-bg text-slate-500 dark:text-slate-400'}`}
                >
                  {lang.code}
                </button>
              ))}
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-6 md:mt-0 overflow-y-auto custom-scrollbar">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 font-medium' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-bg hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={20} className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'} />
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

          <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface">
            <div className="flex items-center gap-3 px-2 sm:px-4 py-2 sm:py-3 mb-2">
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email}&background=random`} 
                alt="Avatar" 
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-200 dark:bg-slate-800 object-cover border border-white dark:border-dark-border"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-200 truncate">{user.displayName || 'Utilisateur'}</p>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            {isInstallable && (
              <button
                onClick={handleInstallClick}
                className="w-full flex items-center gap-3 px-3 sm:px-4 py-2 text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 rounded-lg transition-colors mb-2"
              >
                <Download size={16} />
                {t('sidebar.install')}
              </button>
            )}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              {t('sidebar.logout')}
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
