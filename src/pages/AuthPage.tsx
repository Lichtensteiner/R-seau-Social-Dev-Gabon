import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Code2, Github, Mail, Lock, User as UserIcon, ArrowLeft, Home, LogOut } from 'lucide-react';
import { logActivity } from '../lib/activity';

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('dev');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      
      // Check if user exists in Firestore
      const userRef = doc(db, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        const role = result.user.email === 'ludo.consulting3@gmail.com' ? 'admin' : 'dev';
        // Create user profile
        await setDoc(userRef, {
          uid: result.user.uid,
          displayName: result.user.displayName || 'Développeur',
          email: result.user.email,
          photoURL: result.user.photoURL || '',
          bio: '',
          skills: [],
          location: '',
          githubUrl: '',
          role: role,
          createdAt: serverTimestamp()
        });
        await logActivity(result.user.uid, result.user.displayName || 'Développeur', 'signup', 'S\'est inscrit via Google');
      } else if (result.user.email === 'ludo.consulting3@gmail.com' && userSnap.data().role !== 'admin') {
        await setDoc(userRef, { role: 'admin' }, { merge: true });
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setError("Cette méthode de connexion n'est pas activée dans la console Firebase. Veuillez activer 'Email/Password' et 'Google' dans l'onglet Authentication.");
      } else if (err.code === 'auth/unauthorized-domain') {
        setError("Ce domaine n'est pas autorisé dans la console Firebase. Veuillez ajouter votre domaine Netlify dans Authentication > Settings > Authorized domains.");
      } else if (err.code === 'auth/invalid-credential') {
        setError("Email ou mot de passe incorrect. Veuillez vérifier vos identifiants.");
      } else {
        setError(err.message || 'Une erreur est survenue lors de la connexion.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      if (isLogin) {
        const result = await signInWithEmailAndPassword(auth, email, password);
        // Ensure admin role if email matches
        if (result.user.email === 'ludo.consulting3@gmail.com') {
          const userRef = doc(db, 'users', result.user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists() && userSnap.data().role !== 'admin') {
            await setDoc(userRef, { role: 'admin' }, { merge: true });
          }
        }
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const initialRole = result.user.email === 'ludo.consulting3@gmail.com' ? 'admin' : role;
        // Create user profile
        await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid,
          displayName: name || (role === 'writer' ? 'Auteur' : 'Développeur'),
          email: result.user.email,
          photoURL: '',
          bio: '',
          skills: [],
          location: '',
          githubUrl: '',
          role: initialRole,
          createdAt: serverTimestamp()
        });
        await logActivity(result.user.uid, name || 'Nouvel utilisateur', 'signup', 'S\'est inscrit via Email');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Cet email est déjà utilisé. Veuillez vous connecter.');
        setIsLogin(true);
      } else if (err.code === 'auth/invalid-credential') {
        setError("Email ou mot de passe incorrect. Veuillez vérifier vos identifiants.");
      } else if (err.code === 'auth/weak-password') {
        setError("Le mot de passe est trop court. Il doit contenir au moins 6 caractères.");
      } else if (err.code === 'auth/invalid-email') {
        setError("L'adresse email n'est pas valide.");
      } else {
        setError(err.message || 'Une erreur est survenue.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300 relative">
      {/* Back to Home Button */}
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8 flex gap-2">
        <button
          onClick={() => navigate('/')}
          className="group flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-900/30 transition-all shadow-sm hover:shadow-md active:scale-95"
        >
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1 hidden sm:block" />
          <Home size={18} className="sm:hidden" />
          <span className="hidden sm:inline">Retour à l'accueil</span>
        </button>

        {auth.currentUser && (
          <button
            onClick={() => signOut(auth)}
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all shadow-sm active:scale-95"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Se déconnecter</span>
          </button>
        )}
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Code2 size={32} className="text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-white">
          Réseau Social Dev Gabon
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          {isLogin ? 'Connectez-vous à votre compte' : 'Rejoignez la communauté tech du Gabon'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-dark-surface py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200 dark:border-dark-border">
          
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleEmailAuth}>
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nom complet</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-slate-300 dark:border-dark-border dark:bg-dark-bg dark:text-white rounded-md py-2 border"
                      placeholder="Ludovic Dev"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Votre profil</label>
                  <div className="mt-1 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('dev')}
                      className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-all ${
                        role === 'dev' 
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 ring-1 ring-indigo-600' 
                          : 'border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-surface'
                      }`}
                    >
                      <Code2 size={20} className="mb-1" />
                      <span className="text-xs font-medium">Développeur</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('writer')}
                      className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-all ${
                        role === 'writer' 
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 ring-1 ring-indigo-600' 
                          : 'border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-surface'
                      }`}
                    >
                      <UserIcon size={20} className="mb-1" />
                      <span className="text-xs font-medium">Écrivain / Auteur</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Adresse Email</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-slate-300 dark:border-dark-border dark:bg-dark-bg dark:text-white rounded-md py-2 border"
                  placeholder="ludo.consulting3@gmail.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Mot de passe</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-slate-300 dark:border-dark-border dark:bg-dark-bg dark:text-white rounded-md py-2 border"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : "S'inscrire")}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300 dark:border-dark-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-dark-surface text-slate-500 dark:text-slate-400">Ou continuer avec</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full inline-flex justify-center py-2 px-4 border border-slate-300 dark:border-dark-border rounded-md shadow-sm bg-white dark:bg-dark-bg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-surface"
              >
                <span className="sr-only">Sign in with Google</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="ml-2">Google</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-medium"
            >
              {isLogin ? "Pas encore de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
