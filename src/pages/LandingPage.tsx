import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
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
  Cpu,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { User } from 'firebase/auth';

export default function LandingPage({ user }: { user: User | null }) {
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/assets/logo-dev-gabon-pro.png" alt="logo-dev-gabon-pro.png" className="w-10 h-10 object-contain" />
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              DevGabon
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#mission" className="hover:text-indigo-600 transition-colors">Mission</a>
            <a href="#features" className="hover:text-indigo-600 transition-colors">Fonctionnalités</a>
            <a href="#context" className="hover:text-indigo-600 transition-colors">Contexte</a>
            <a href="#creator" className="hover:text-indigo-600 transition-colors">L'Auteur</a>
            <Link to="/" className="hover:text-indigo-600 transition-colors">Présentation</Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <Link 
                to="/app" 
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
              >
                Accéder au réseau
              </Link>
            ) : (
              <>
                <Link to="/auth" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">
                  Connexion
                </Link>
                <Link 
                  to="/auth" 
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
                >
                  Rejoindre
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="space-y-8"
            >
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold border border-indigo-100">
                <Zap size={16} />
                Le premier réseau social tech du Gabon
              </motion.div>
              
              <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1]">
                Propulsez votre carrière <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                  Tech & Littéraire
                </span>
              </motion.h1>
              
              <motion.p variants={itemVariants} className="text-xl text-slate-600 leading-relaxed max-w-xl">
                Une plateforme unique conçue pour connecter les développeurs, les écrivains et les recruteurs du Gabon. Partagez votre code, publiez vos articles et faites rayonner le talent gabonais.
              </motion.p>
              
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate(user ? '/app' : '/auth')}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 group"
                >
                  Commencer l'aventure
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
                <a 
                  href="#mission"
                  className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  En savoir plus
                </a>
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <img 
                      key={i}
                      src={`https://i.pravatar.cc/100?img=${i + 10}`} 
                      alt="User" 
                      className="w-12 h-12 rounded-full border-4 border-white shadow-sm"
                    />
                  ))}
                </div>
                <div className="text-sm">
                  <p className="font-bold text-slate-900">+500 membres actifs</p>
                  <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Rejoignez la communauté</p>
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
              <div className="relative bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden aspect-square flex items-center justify-center p-12">
                <div className="grid grid-cols-2 gap-8 w-full">
                  <div className="space-y-8">
                    <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 transform -rotate-3 hover:rotate-0 transition-transform">
                      <Code2 size={40} className="text-indigo-600 mb-4" />
                      <div className="h-2 w-20 bg-indigo-200 rounded-full mb-2" />
                      <div className="h-2 w-12 bg-indigo-100 rounded-full" />
                    </div>
                    <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 transform rotate-6 hover:rotate-0 transition-transform">
                      <Library size={40} className="text-amber-600 mb-4" />
                      <div className="h-2 w-24 bg-amber-200 rounded-full mb-2" />
                      <div className="h-2 w-16 bg-amber-100 rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-8 pt-12">
                    <div className="p-6 bg-purple-50 rounded-3xl border border-purple-100 transform rotate-3 hover:rotate-0 transition-transform">
                      <Users size={40} className="text-purple-600 mb-4" />
                      <div className="h-2 w-16 bg-purple-200 rounded-full mb-2" />
                      <div className="h-2 w-20 bg-purple-100 rounded-full" />
                    </div>
                    <div className="p-6 bg-pink-50 rounded-3xl border border-pink-100 transform -rotate-6 hover:rotate-0 transition-transform">
                      <Briefcase size={40} className="text-pink-600 mb-4" />
                      <div className="h-2 w-12 bg-pink-200 rounded-full mb-2" />
                      <div className="h-2 w-24 bg-pink-100 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Goals */}
      <section id="mission" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-[0.2em] mb-4">Notre Mission</h2>
            <p className="text-4xl font-extrabold text-slate-900 mb-6">Bâtir l'écosystème numérique de demain au Gabon</p>
            <p className="text-lg text-slate-600">
              DevGabon n'est pas qu'un simple réseau social. C'est un catalyseur d'innovation et de créativité pour la jeunesse gabonaise.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Target className="text-indigo-600" />,
                title: "Objectif",
                desc: "Fédérer les talents technologiques et littéraires du pays sur une plateforme unique et sécurisée."
              },
              {
                icon: <Rocket className="text-purple-600" />,
                title: "Vision",
                desc: "Devenir la référence incontournable pour le recrutement et le partage de connaissances au Gabon."
              },
              {
                icon: <Shield className="text-emerald-600" />,
                title: "Valeurs",
                desc: "Collaboration, excellence technique et promotion de la culture gabonaise à travers le numérique."
              }
            ].map((item, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2 space-y-8">
              <h2 className="text-4xl font-extrabold text-slate-900 leading-tight">
                Une plateforme complète pour <br />
                <span className="text-indigo-600">tous les profils</span>
              </h2>
              
              <div className="space-y-6">
                {[
                  { icon: <Code2 />, title: "Pour les Développeurs", desc: "Exposez vos projets GitHub, partagez vos snippets de code et trouvez des opportunités de carrière." },
                  { icon: <BookOpen />, title: "Pour les Écrivains", desc: "Publiez vos articles, recevez des retours de la communauté et faites-vous un nom." },
                  { icon: <Library />, title: "Bibliothèque Numérique", desc: "Une vitrine pour les ouvrages locaux, permettant aux auteurs de promouvoir leurs livres." },
                  { icon: <Briefcase />, title: "Espace Recrutement", desc: "Les entreprises peuvent poster des offres et trouver les meilleurs profils IT du Gabon." }
                ].map((f, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="shrink-0 w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {f.icon}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 mb-1">{f.title}</h4>
                      <p className="text-slate-600">{f.desc}</p>
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
              <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 hidden sm:block">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">100%</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Made in Gabon</p>
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

      {/* Creator Section */}
      <section id="creator" className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col lg:flex-row">
            <div className="lg:w-2/5 bg-slate-50 p-12 flex flex-col items-center justify-center text-center border-r border-slate-100">
              <div className="relative mb-8">
                <div className="absolute -inset-4 bg-indigo-600 rounded-full blur-2xl opacity-20 animate-pulse" />
                <img 
                  src="https://ui-avatars.com/api/?name=Mve+Zogo+Ludovic+Martinien&size=256&background=4f46e5&color=fff" 
                  alt="M. Mve Zogo Ludovic Martinien" 
                  className="relative w-48 h-48 rounded-full border-8 border-white shadow-xl object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">M. Mve Zogo Ludovic Martinien</h3>
              <p className="text-indigo-600 font-bold mb-6">(Dev lichtensteiner)</p>
              <div className="flex gap-4">
                <a href="#" className="p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-slate-600 hover:text-indigo-600"><Github size={20} /></a>
                <a href="#" className="p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-slate-600 hover:text-indigo-600"><Globe size={20} /></a>
                <a href="#" className="p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-slate-600 hover:text-indigo-600"><MessageSquare size={20} /></a>
              </div>
            </div>
            
            <div className="lg:w-3/5 p-12 lg:p-20 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold">
                <Cpu size={16} />
                L'idée derrière le projet
              </div>
              <h2 className="text-4xl font-extrabold text-slate-900">Vision d'un Ingénieur Passionné</h2>
              <p className="text-xl text-slate-600 leading-relaxed italic">
                "En tant qu'ingénieur en informatique spécialisé en programmation de logiciels, j'ai vu le potentiel immense de la jeunesse gabonaise souvent freiné par le manque d'outils adaptés. DevGabon est ma réponse : un espace où la rigueur du code rencontre la beauté de la plume."
              </p>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                    <CheckCircle2 className="text-indigo-600" size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Expertise Logicielle</p>
                    <p className="text-sm text-slate-500">Conception robuste et scalable.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                    <CheckCircle2 className="text-indigo-600" size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Engagement Social</p>
                    <p className="text-sm text-slate-500">Promouvoir l'excellence locale.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <img src="/assets/logo-dev-gabon-pro.png" alt="logo-dev-gabon-pro.png" className="w-10 h-10 object-contain" />
                <span className="text-2xl font-bold">DevGabon</span>
              </div>
              <p className="text-slate-400 max-w-sm leading-relaxed">
                La plateforme sociale qui connecte l'intelligence technologique et la créativité littéraire du Gabon.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6">Liens Rapides</h4>
              <ul className="space-y-4 text-slate-400">
                <li><a href="#mission" className="hover:text-white transition-colors">Mission</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#context" className="hover:text-white transition-colors">Contexte</a></li>
                <li><Link to="/auth" className="hover:text-white transition-colors">Rejoindre</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Contact</h4>
              <ul className="space-y-4 text-slate-400">
                <li>Libreville, Gabon</li>
                <li>ludo.consulting3@gmail.com</li>
                <li>+241 062-641-120 / 077-022-306</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
            <p>© 2026 DevGabon. Fièrement développé par M. Mve Zogo Ludovic Martinien.</p>
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-white transition-colors">Confidentialité</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Conditions</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
