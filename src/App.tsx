import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';

import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import FeedPage from './pages/FeedPage';
import JobsPage from './pages/JobsPage';
import ProfilePage from './pages/ProfilePage';
import NetworkPage from './pages/NetworkPage';
import NotificationsPage from './pages/NotificationsPage';
import MessagesPage from './pages/MessagesPage';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
        
        <Route path="/" element={user ? <Layout user={user} /> : <Navigate to="/auth" />}>
          <Route index element={<FeedPage user={user} />} />
          <Route path="jobs" element={<JobsPage user={user} />} />
          <Route path="network" element={<NetworkPage />} />
          <Route path="notifications" element={<NotificationsPage user={user} />} />
          <Route path="messages" element={<MessagesPage user={user} />} />
          <Route path="profile" element={<ProfilePage user={user} />} />
          <Route path="profile/:userId" element={<ProfilePage user={user} />} />
        </Route>
      </Routes>
    </Router>
  );
}
