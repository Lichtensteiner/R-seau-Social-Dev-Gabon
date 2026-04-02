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
    // Test connection to Firestore
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. The client is offline.");
        }
      }
    };
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Update last login and log activity
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data() as UserProfile;
            try {
              await updateDoc(userRef, {
                lastLoginAt: serverTimestamp()
              });
            } catch (err) {
              handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
            }
            // Log activity only if it's been a while or just for this session
            // For now, let's log every "session start" (refresh)
            await logActivity(currentUser.uid, userData.displayName, 'login', 'S\'est connecté au système');
          }
        } catch (error) {
          console.error("Error updating last login:", error);
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#050505]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
