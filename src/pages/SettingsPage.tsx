import React, { useState, useEffect } from 'react';
import { User, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Settings, User as UserIcon, Bell, Shield, LogOut, Smartphone, Mail, Loader2 } from 'lucide-react';

export default function SettingsPage({ user }: { user: User }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [phone, setPhone] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [role, setRole] = useState('dev');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPhone(data.phone || '');
          setRole(data.role || 'dev');
          setEmailNotifications(data.settings?.emailNotifications ?? true);
          setPushNotifications(data.settings?.pushNotifications ?? false);
          setProfileVisibility(data.settings?.profileVisibility || 'public');
        }
      } catch (error) {
        console.error("Erreur lors du chargement des paramètres:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        phone,
        role,
        settings: {
          emailNotifications,
          pushNotifications,
          profileVisibility
        }
      });
      alert('Paramètres enregistrés avec succès !');
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      alert('Une erreur est survenue lors de l\'enregistrement.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    signOut(auth);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-8 h-8 text-indigo-600" />
        <h1 className="text-3xl font-bold text-slate-900">Paramètres</h1>
      </div>

      {/* Informations compte */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-800">Informations du compte</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Adresse Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                disabled
                value={user.email || ''}
                className="bg-slate-50 block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2 border text-slate-500 cursor-not-allowed"
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">L'adresse email ne peut pas être modifiée ici.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Numéro de téléphone</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Smartphone className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+241 XX XX XX XX"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2 border"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Profil Professionnel */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
          <Shield className="w-5 h-5 text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-800">Profil Professionnel</h2>
        </div>
        <div className="p-6">
          <label className="block text-sm font-medium text-slate-700 mb-3">Votre rôle sur la plateforme</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setRole('dev')}
              className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all ${
                role === 'dev' 
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-600 ring-inset' 
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Smartphone className="mb-2" />
              <span className="text-sm font-semibold">Développeur</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('writer')}
              className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all ${
                role === 'writer' 
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-600 ring-inset' 
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <UserIcon className="mb-2" />
              <span className="text-sm font-semibold">Écrivain / Auteur</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('recruiter')}
              className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all ${
                role === 'recruiter' 
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-600 ring-inset' 
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Shield className="mb-2" />
              <span className="text-sm font-semibold">Recruteur</span>
            </button>
          </div>
        </div>
      </div>

      {/* Options de confidentialité */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
          <Shield className="w-5 h-5 text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-800">Confidentialité</h2>
        </div>
        <div className="p-6">
          <label className="block text-sm font-medium text-slate-700 mb-3">Visibilité du profil</label>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                id="visibility-public"
                name="visibility"
                type="radio"
                checked={profileVisibility === 'public'}
                onChange={() => setProfileVisibility('public')}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <label htmlFor="visibility-public" className="ml-3 block text-sm font-medium text-slate-700">
                Public <span className="text-slate-500 font-normal">- Tout le monde peut voir votre profil</span>
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="visibility-network"
                name="visibility"
                type="radio"
                checked={profileVisibility === 'network'}
                onChange={() => setProfileVisibility('network')}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <label htmlFor="visibility-network" className="ml-3 block text-sm font-medium text-slate-700">
                Réseau <span className="text-slate-500 font-normal">- Seuls les membres connectés peuvent voir votre profil</span>
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="visibility-private"
                name="visibility"
                type="radio"
                checked={profileVisibility === 'private'}
                onChange={() => setProfileVisibility('private')}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <label htmlFor="visibility-private" className="ml-3 block text-sm font-medium text-slate-700">
                Privé <span className="text-slate-500 font-normal">- Seules vos relations peuvent voir votre profil</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
          <Bell className="w-5 h-5 text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-800">Notifications</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-900">Notifications par email</h3>
              <p className="text-sm text-slate-500">Recevoir un résumé de l'activité par email.</p>
            </div>
            <button
              type="button"
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`${
                emailNotifications ? 'bg-indigo-600' : 'bg-slate-200'
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
            >
              <span
                className={`${
                  emailNotifications ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-900">Notifications Push <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">Bientôt</span></h3>
              <p className="text-sm text-slate-500">Recevoir des alertes sur votre appareil (disponible plus tard).</p>
            </div>
            <button
              type="button"
              disabled
              className="bg-slate-100 relative inline-flex h-6 w-11 flex-shrink-0 cursor-not-allowed rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out opacity-50"
            >
              <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          Déconnexion
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Enregistrer les modifications
        </button>
      </div>
    </div>
  );
}
