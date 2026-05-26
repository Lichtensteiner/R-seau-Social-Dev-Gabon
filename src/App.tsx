import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth } from './firebase';

import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import FeedPage from './pages/FeedPage';
import JobsPage from './pages/JobsPage';
import ProfilePage from './pages/ProfilePage';
import NetworkPage from './pages/NetworkPage';
import NotificationsPage from './pages/NotificationsPage';
import MessagesPage from './pages/MessagesPage';
import SettingsPage from './pages/SettingsPage';
import GitHubExplorerPage from './pages/GitHubExplorerPage';
import ArticlesPage from './pages/ArticlesPage';
import BooksPage from './pages/BooksPage';
import LeaderboardPage from './pages/LeaderboardPage';
import BattlegroundPage from './pages/BattlegroundPage';
import ImpactGabonPage from './pages/ImpactGabonPage';
import MentorshipPage from './pages/MentorshipPage';
import CommandoRecruitmentPage from './pages/CommandoRecruitmentPage';
import LandingPage from './pages/LandingPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import AdminUsersPage from './pages/AdminUsersPage';
import ErrorBoundary from './components/ErrorBoundary';
import { handleFirestoreError, OperationType } from './lib/firestore-errors';
import { doc, updateDoc, getDoc, serverTimestamp, getDocFromServer } from 'firebase/firestore';
import { logActivity } from './lib/activity';
import { UserProfile } from './types';

import { ThemeProvider } from './contexts/ThemeContext';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Update last login and log activity
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          // Just try to update if it exists, without waiting for the getDoc which might hang
          updateDoc(userRef, {
            lastLoginAt: serverTimestamp()
          }).catch(err => {
            console.warn("Could not update last login (might be a new user):", err.message);
          });
          
          // Log activity in background
          logActivity(currentUser.uid, currentUser.displayName || currentUser.email || 'Utilisateur', 'login', 'S\'est connecté au système');
        } catch (error) {
          console.error("Error in auth state change logic:", error);
        }
      }
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const isAdmin = (u: User | null) => {
    // This is a client-side check, the real check is in Firestore rules
    // But we use it to hide/show UI elements
    return u?.email === 'ludo.consulting3@gmail.com';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium animate-pulse">Chargement de DevGabon...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage user={user} />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/app" />} />
            
            <Route path="/app" element={user ? <Layout user={user} /> : <Navigate to="/auth" />}>
              <Route index element={<FeedPage user={user} />} />
              <Route path="jobs" element={<JobsPage user={user} />} />
              <Route path="network" element={<NetworkPage user={user!} />} />
              <Route path="notifications" element={<NotificationsPage user={user} />} />
              <Route path="messages" element={<MessagesPage user={user} />} />
              <Route path="profile" element={<ProfilePage user={user} />} />
              <Route path="profile/:userId" element={<ProfilePage user={user} />} />
              <Route path="github-explorer" element={<GitHubExplorerPage />} />
              <Route path="articles" element={<ArticlesPage user={user} />} />
              <Route path="books" element={<BooksPage user={user} />} />
              <Route path="leaderboard" element={<LeaderboardPage />} />
              <Route path="battleground" element={<BattlegroundPage />} />
              <Route path="impact" element={<ImpactGabonPage />} />
              <Route path="mentorship" element={<MentorshipPage />} />
              <Route path="commando" element={<CommandoRecruitmentPage />} />
              <Route path="settings" element={<SettingsPage user={user} />} />
              <Route path="admin/users" element={isAdmin(user) ? <AdminUsersPage /> : <Navigate to="/app" />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
