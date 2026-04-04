import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { 
  Code2, 
  Users, 
  Briefcase, 
  BookOpen, 
  Library, 
  Globe, 
  Target, 
  Rocket, 
  Shield, 
  ChevronRight, 
  Github, 
  MessageSquare, 
  Heart,
  ArrowRight,
  UserCheck,
  Cpu,
  Zap,
  CheckCircle2,
  Clock,
  Languages,
  Menu,
  X,
  Moon,
  Sun
} from 'lucide-react';
import { User } from 'firebase/auth';
import { useTheme } from '../contexts/ThemeContext';

export default function LandingPage({ user }: { user: User | null }) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Check if already installed
    const checkStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    setIsStandalone(checkStandalone);

    // Detect iOS
    const detectIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(detectIOS);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      if (!checkStandalone) {
        setShowInstallBanner(true);
      }
    };

    const handleAppInstalled = () => {
      console.log('App was installed');
      setIsStandalone(true);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // If iOS and not standalone, show banner after a short delay
    if (detectIOS && !checkStandalone) {
      const timer = setTimeout(() => setShowInstallBanner(true), 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      alert("Pour installer l'application sur iOS : \n1. Appuyez sur le bouton 'Partager' (carré avec flèche) en bas de Safari \n2. Faites défiler vers le bas \n3. Appuyez sur 'Sur l'écran d'accueil'");
      return;
    }

    if (!deferredPrompt) {
      alert("Pour installer l'application : \n1. Ouvrez le menu de votre navigateur (⋮ ou ≡) \n2. Sélectionnez 'Installer l'application' ou 'Ajouter à l'écran d'accueil'");
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
      setShowInstallBanner(false);
    }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/30 selection:text-indigo-900 dark:selection:text-indigo-100">
      {/* PWA Install Banner */}
      <AnimatePresence>
        {showInstallBanner && !isStandalone && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-6 right-6 z-[60] md:left-auto md:max-w-md"
          >
            <div className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-2xl shadow-2xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center shrink-0">
                <Zap className="text-indigo-600 dark:text-indigo-400" size={24} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Installer DevGabon</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Accédez au réseau plus rapidement depuis votre écran d'accueil.</p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleInstallClick}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors whitespace-nowrap"
                >
                  Installer
                </button>
                <button
                  onClick={() => setShowInstallBanner(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-dark-bg text-slate-600 dark:text-slate-400 rounded-lg text-xs font-bold hover:bg-slate-200 dark:hover:bg-dark-surface transition-colors"
                >
                  Plus tard
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md border-b border-slate-100 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/assets/Dev_4.png" alt="DevGabon Logo" className="w-10 h-10 rounded-lg object-cover" />
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              DevGabon
            </span>
          </div>
          
          <div className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-400">
            <a href="#mission" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('nav.mission')}</a>
            <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('nav.features')}</a>
            <a href="#network" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('sidebar.network')}</a>
            <a href="#recruitment" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('hero.recruitment.title')}</a>
            <a href="#context" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('nav.context')}</a>
            <a href="#creator" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('nav.creator')}</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Real-time Clock Header */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-dark-bg rounded-xl border border-slate-100 dark:border-dark-border">
              <Clock size={14} className="text-indigo-500 dark:text-indigo-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              title={theme === 'dark' ? 'Passer au mode clair' : 'Passer au mode sombre'}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Install Button */}
            {(isInstallable || (isIOS && !isStandalone)) && (
              <button 
                onClick={handleInstallClick}
                className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] sm:text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all active:scale-95 whitespace-nowrap"
              >
                <Zap size={14} className="animate-pulse" />
                {isIOS ? "Installer" : t('sidebar.install')}
              </button>
            )}

            {/* Language Switcher */}
            <div className="relative group">
              <button className="p-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1">
                <Languages size={20} />
                <span className="hidden md:inline text-xs uppercase font-bold">{i18n.language.split('-')[0]}</span>
              </button>
              <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-dark-surface border border-slate-100 dark:border-dark-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="p-2 space-y-1">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                        i18n.language.startsWith(lang.code) ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-bg'
                      }`}
                    >
                      <span className="text-base">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              {user ? (
                <Link 
                  to="/app/network" 
                  className="px-4 py-2 sm:px-6 sm:py-2.5 bg-indigo-600 text-white rounded-full text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none active:scale-95 whitespace-nowrap"
                >
                  {t('nav.access')}
                </Link>
              ) : (
                <>
                  <Link to="/auth" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-2">
                    {t('nav.login')}
                  </Link>
                  <Link 
                    to="/auth" 
                    className="px-4 py-2 sm:px-6 sm:py-2.5 bg-indigo-600 text-white rounded-full text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none active:scale-95"
                  >
                    {t('nav.join')}
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden bg-white dark:bg-dark-surface border-b border-slate-100 dark:border-dark-border py-6 px-4 space-y-4 shadow-xl"
          >
            <div className="flex flex-col gap-4 text-base font-semibold text-slate-600 dark:text-slate-400">
              <a href="#mission" onClick={() => setMobileMenuOpen(false)} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-2 border-b border-slate-50 dark:border-dark-border">{t('nav.mission')}</a>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-2 border-b border-slate-50 dark:border-dark-border">{t('nav.features')}</a>
              <a href="#network" onClick={() => setMobileMenuOpen(false)} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-2 border-b border-slate-50 dark:border-dark-border">{t('sidebar.network')}</a>
              <a href="#recruitment" onClick={() => setMobileMenuOpen(false)} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-2 border-b border-slate-50 dark:border-dark-border">{t('hero.recruitment.title')}</a>
              <a href="#context" onClick={() => setMobileMenuOpen(false)} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-2 border-b border-slate-50 dark:border-dark-border">{t('nav.context')}</a>
              <a href="#creator" onClick={() => setMobileMenuOpen(false)} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-2 border-b border-slate-50 dark:border-dark-border">{t('nav.creator')}</a>
            </div>
            
            <div className="flex flex-col gap-3 pt-4">
              {user ? (
                <Link 
                  to="/app/network" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl text-center font-bold shadow-lg"
                >
                  {t('nav.access')}
                </Link>
              ) : (
                <>
                  <Link 
                    to="/auth" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full px-6 py-3 bg-slate-100 dark:bg-dark-bg text-slate-700 dark:text-slate-300 rounded-xl text-center font-bold"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link 
                    to="/auth" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl text-center font-bold shadow-lg"
                  >
                    {t('nav.join')}
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-4 overflow-hidden relative">
        {/* Mobile/Tablet Background Image */}
        <div className="absolute inset-0 lg:hidden z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/20 to-white dark:from-dark-bg/60 dark:via-dark-bg/40 dark:to-dark-bg z-10" />
          <img 
            src="/assets/Dev_4.png" 
            alt="" 
            className="w-full h-full object-cover opacity-70 dark:opacity-40"
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="space-y-8"
            >
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-full text-sm font-bold border border-indigo-100 dark:border-indigo-900/30">
                <Zap size={16} />
                {t('hero.badge')}
              </motion.div>
              
              <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-extrabold text-slate-900 dark:text-white leading-[1.1]">
                {t('hero.title')} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                  {t('hero.subtitle')}
                </span>
              </motion.h1>
              
              <motion.p variants={itemVariants} className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                {t('hero.description')}
              </motion.p>
              
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate(user ? '/app' : '/auth')}
                  className="px-6 py-3.5 sm:px-8 sm:py-4 bg-indigo-600 text-white rounded-2xl font-bold text-base sm:text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 group"
                >
                  {t('hero.cta_start')}
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
                <a 
                  href="#mission"
                  className="px-6 py-3.5 sm:px-8 sm:py-4 bg-white dark:bg-dark-surface text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-dark-border rounded-2xl font-bold text-base sm:text-lg hover:bg-slate-50 dark:hover:bg-dark-bg transition-all flex items-center justify-center gap-2"
                >
                  {t('hero.cta_learn')}
                </a>
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {['Dev.jpg', 'Dev_2.png', 'Dev_3.jpg', 'Dev_4.png'].map((img, i) => (
                    <img 
                      key={i}
                      src={`/assets/${img}`} 
                      alt="User" 
                      className="w-12 h-12 rounded-full border-4 border-white dark:border-dark-surface shadow-sm object-cover"
                    />
                  ))}
                </div>
                <div className="text-sm">
                  <p className="font-bold text-slate-900">{t('hero.members')}</p>
                  <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">{t('hero.join_community')}</p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative hidden lg:block"
            >
              <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-[3rem] blur-3xl opacity-20 animate-pulse" />
              <div className="relative bg-white dark:bg-dark-surface rounded-[2.5rem] border border-slate-200 dark:border-dark-border shadow-2xl overflow-hidden aspect-square">
                <img 
                  src="/assets/Dev_4.png" 
                  alt="DevGabon Hero" 
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Goals */}
      <section id="mission" className="py-24 bg-slate-50 dark:bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] mb-4">Notre Mission</h2>
            <p className="text-4xl font-extrabold text-slate-900 dark:text-white mb-6">Bâtir l'écosystème numérique de demain au Gabon</p>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              DevGabon n'est pas qu'un simple réseau social. C'est un catalyseur d'innovation et de créativité pour la jeunesse gabonaise.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Target className="text-indigo-600 dark:text-indigo-400" />,
                title: "Objectif",
                desc: "Fédérer les talents technologiques et littéraires du pays sur une plateforme unique et sécurisée."
              },
              {
                icon: <Rocket className="text-purple-600 dark:text-purple-400" />,
                title: "Vision",
                desc: "Devenir la référence incontournable pour le recrutement et le partage de connaissances au Gabon."
              },
              {
                icon: <Shield className="text-emerald-600 dark:text-emerald-400" />,
                title: "Valeurs",
                desc: "Collaboration, excellence technique et promotion de la culture gabonaise à travers le numérique."
              }
            ].map((item, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white dark:bg-dark-surface p-10 rounded-[2rem] shadow-sm border border-slate-100 dark:border-dark-border hover:shadow-xl transition-all"
              >
                <div className="w-16 h-16 bg-slate-50 dark:bg-dark-bg rounded-2xl flex items-center justify-center mb-6">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-white dark:bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2 space-y-8">
              <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
                Une plateforme complète pour <br />
                <span className="text-indigo-600 dark:text-indigo-400">tous les profils</span>
              </h2>
              
              <div className="space-y-6">
                {[
                  { icon: <Code2 />, title: "Pour les Développeurs", desc: "Exposez vos projets GitHub, partagez vos snippets de code et trouvez des opportunités de carrière." },
                  { icon: <BookOpen />, title: "Pour les Écrivains", desc: "Publiez vos articles, recevez des retours de la communauté et faites-vous un nom." },
                  { icon: <Library />, title: "Bibliothèque Numérique", desc: "Une vitrine pour les ouvrages locaux, permettant aux auteurs de promouvoir leurs livres." },
                  { icon: <Briefcase />, title: "Espace Recrutement", desc: "Les entreprises peuvent poster des offres et trouver les meilleurs profils IT du Gabon.", link: "#recruitment" }
                ].map((f, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="shrink-0 w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {f.icon}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                        {f.link ? (
                          <a href={f.link} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2">
                            {f.title}
                            <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        ) : f.title}
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="lg:w-1/2 relative">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[3rem] p-2 shadow-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1000" 
                  alt="App Preview" 
                  className="rounded-[2.5rem] shadow-inner"
                />
              </div>
              {/* Floating Stats */}
              <div className="absolute -bottom-8 -left-8 bg-white dark:bg-dark-surface p-6 rounded-3xl shadow-2xl border border-slate-100 dark:border-dark-border hidden sm:block">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
                    <CheckCircle2 />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">100%</p>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Made in Gabon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Context Gabon */}
      <section id="context" className="py-24 bg-indigo-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-800/30 skew-x-12 transform translate-x-1/4" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm font-bold border border-white/20">
                <Globe size={16} />
                Contexte Local
              </div>
              <h2 className="text-4xl lg:text-5xl font-extrabold leading-tight">
                Répondre aux défis du <br />
                <span className="text-indigo-400 text-6xl">Gabon Numérique</span>
              </h2>
              <p className="text-xl text-indigo-100 leading-relaxed">
                Dans un pays en pleine transition digitale, DevGabon offre une solution souveraine pour structurer la communauté tech. Nous pallions le manque de visibilité des talents locaux en créant un pont direct entre formation, création et emploi.
              </p>
              <div className="grid grid-cols-2 gap-8 pt-4">
                <div>
                  <p className="text-4xl font-bold mb-2">241</p>
                  <p className="text-indigo-300 text-sm font-semibold uppercase tracking-wider">Code Pays</p>
                </div>
                <div>
                  <p className="text-4xl font-bold mb-2">Tech</p>
                  <p className="text-indigo-300 text-sm font-semibold uppercase tracking-wider">Secteur Prioritaire</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=400" className="rounded-3xl h-64 w-full object-cover" alt="Gabon Tech" />
                <img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=400" className="rounded-3xl h-48 w-full object-cover" alt="Coding" />
              </div>
              <div className="space-y-4 pt-8">
                <img src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=400" className="rounded-3xl h-48 w-full object-cover" alt="Business" />
                <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=400" className="rounded-3xl h-64 w-full object-cover" alt="Team" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recruitment Space Section */}
      <section id="recruitment" className="py-24 bg-white dark:bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-indigo-600 dark:bg-indigo-700 rounded-3xl overflow-hidden shadow-2xl">
            <div className="grid md:grid-cols-2 items-center">
              <div className="p-12 md:p-16 text-white space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium border border-white/10">
                  <Briefcase size={16} />
                  {t('hero.recruitment.title')}
                </div>
                <h2 className="text-4xl font-bold tracking-tight">
                  {t('hero.recruitment.subtitle')}
                </h2>
                <p className="text-xl text-indigo-100 leading-relaxed">
                  {t('hero.recruitment.description')}
                </p>
                <div className="pt-6 flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => navigate(user ? '/app/jobs' : '/auth')}
                    className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    {t('nav.access')}
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
              <div className="relative h-full min-h-[400px] bg-indigo-700 p-12 flex flex-col justify-center items-center text-center space-y-6">
                <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20">
                  <UserCheck size={48} className="text-white" />
                </div>
                <div className="space-y-2">
                  <p className="text-indigo-200 uppercase tracking-widest text-sm font-bold">
                    {t('hero.recruitment.contact_label')}
                  </p>
                  <h3 className="text-3xl font-bold text-white">
                    {t('hero.recruitment.contact_name')}
                  </h3>
                  <p className="text-indigo-100 italic">
                    ludo.consulting3@gmail.com
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10 text-sm">
                    IT Recruitment
                  </div>
                  <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10 text-sm">
                    Gabon Tech
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Network Section */}
      <section id="network" className="py-24 bg-slate-50 dark:bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-dark-surface rounded-3xl overflow-hidden shadow-xl border border-slate-100 dark:border-dark-border">
            <div className="grid md:grid-cols-2 items-center">
              <div className="relative h-full min-h-[400px] bg-gradient-to-br from-purple-600 to-indigo-700 p-12 flex flex-col justify-center items-center text-center space-y-6">
                <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20">
                  <Users size={48} className="text-white" />
                </div>
                <div className="space-y-2">
                  <p className="text-purple-100 uppercase tracking-widest text-sm font-bold">
                    {t('hero.network.title')}
                  </p>
                  <h3 className="text-3xl font-bold text-white">
                    {t('hero.network.subtitle')}
                  </h3>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10 text-sm text-white flex items-center gap-2">
                    <Code2 size={14} />
                    Developers
                  </div>
                  <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10 text-sm text-white flex items-center gap-2">
                    <BookOpen size={14} />
                    Writers
                  </div>
                  <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10 text-sm text-white flex items-center gap-2">
                    <Users size={14} />
                    Recruiters
                  </div>
                  <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10 text-sm text-white flex items-center gap-2">
                    <Shield size={14} />
                    Admins
                  </div>
                </div>
              </div>
              <div className="p-12 md:p-16 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-full text-sm font-medium border border-indigo-100 dark:border-indigo-900/30">
                  <Globe size={16} />
                  {t('sidebar.network')}
                </div>
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {t('hero.network.subtitle')}
                </h2>
                <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t('hero.network.description')}
                </p>
                <div className="pt-6">
                  <button 
                    onClick={() => navigate(user ? '/app/network' : '/auth')}
                    className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
                  >
                    {t('hero.network.cta')}
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Creator Section */}
      <section id="creator" className="py-24 bg-white dark:bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white dark:bg-dark-surface rounded-[3rem] border border-slate-200 dark:border-dark-border shadow-xl overflow-hidden flex flex-col lg:flex-row">
            <div className="lg:w-2/5 bg-slate-50 dark:bg-dark-bg p-12 flex flex-col items-center justify-center text-center border-r border-slate-100 dark:border-dark-border">
              <div className="relative mb-8">
                <div className="absolute -inset-4 bg-indigo-600 rounded-full blur-2xl opacity-20 animate-pulse" />
                <img 
                  src="https://ui-avatars.com/api/?name=Mve+Zogo+Ludovic+Martinien&size=256&background=4f46e5&color=fff" 
                  alt="M. Mve Zogo Ludovic Martinien" 
                  className="relative w-48 h-48 rounded-full border-8 border-white dark:border-dark-surface shadow-xl object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">M. Mve Zogo Ludovic Martinien</h3>
              <p className="text-indigo-600 dark:text-indigo-400 font-bold mb-6">(Dev lichtensteiner)</p>
              <div className="flex gap-4">
                <a href="#" className="p-3 bg-white dark:bg-dark-surface rounded-xl shadow-sm hover:shadow-md transition-all text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"><Github size={20} /></a>
                <a href="#" className="p-3 bg-white dark:bg-dark-surface rounded-xl shadow-sm hover:shadow-md transition-all text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"><Globe size={20} /></a>
                <a href="#" className="p-3 bg-white dark:bg-dark-surface rounded-xl shadow-sm hover:shadow-md transition-all text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"><MessageSquare size={20} /></a>
              </div>
            </div>
            
            <div className="lg:w-3/5 p-12 lg:p-20 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-full text-sm font-bold">
                <Cpu size={16} />
                L'idée derrière le projet
              </div>
              <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white">Vision d'un Ingénieur Passionné</h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed italic">
                "En tant qu'ingénieur en informatique spécialisé en programmation de logiciels, j'ai vu le potentiel immense de la jeunesse gabonaise souvent freiné par le manque d'outils adaptés. DevGabon est ma réponse : un espace où la rigueur du code rencontre la beauté de la plume."
              </p>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center shrink-0">
                    <CheckCircle2 className="text-indigo-600 dark:text-indigo-400" size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Expertise Logicielle</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Conception robuste et scalable.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center shrink-0">
                    <CheckCircle2 className="text-indigo-600 dark:text-indigo-400" size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Engagement Social</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Promouvoir l'excellence locale.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-dark-surface text-white py-12 sm:py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 mb-12 sm:mb-16">
            <div className="sm:col-span-2 lg:col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <img src="/assets/Dev_4.png" alt="DevGabon Logo" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover" />
                <span className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">DevGabon</span>
              </div>
              <p className="text-slate-400 dark:text-slate-500 max-w-sm leading-relaxed text-sm sm:text-base">
                {t('footer.description')}
              </p>
            </div>
            <div>
              <h4 className="font-bold text-base sm:text-lg mb-4 sm:mb-6">{t('footer.quick_links')}</h4>
              <ul className="space-y-3 sm:space-y-4 text-slate-400 text-sm sm:text-base">
                <li><a href="#mission" className="hover:text-white transition-colors">{t('nav.mission')}</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">{t('nav.features')}</a></li>
                <li><a href="#context" className="hover:text-white transition-colors">{t('nav.context')}</a></li>
                <li><Link to="/auth" className="hover:text-white transition-colors">{t('nav.join')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-base sm:text-lg mb-4 sm:mb-6">{t('footer.contact')}</h4>
              <ul className="space-y-3 sm:space-y-4 text-slate-400 text-sm sm:text-base">
                <li className="flex items-center gap-2">
                  <Globe size={16} className="text-indigo-400" />
                  Libreville, Gabon
                </li>
                <li className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-indigo-400" />
                  ludo.consulting3@gmail.com
                </li>
                <li className="flex items-center gap-2">
                  <Zap size={16} className="text-indigo-400" />
                  +241 062-641-120 / 077-022-306
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 text-xs sm:text-sm text-center md:text-left">
            <p>© 2026 DevGabon. {t('footer.developed_by')}</p>
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-white transition-colors">{t('footer.privacy')}</Link>
              <Link to="/terms" className="hover:text-white transition-colors">{t('footer.terms')}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
