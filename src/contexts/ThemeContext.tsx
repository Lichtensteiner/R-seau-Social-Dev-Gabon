import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = null;
      }

      if (user) {
        const userRef = doc(db, 'users', user.uid);
        unsubscribeDoc = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            if (data.theme) {
              setThemeState(prevTheme => {
                if (data.theme !== prevTheme) {
                  localStorage.setItem('theme', data.theme);
                  return data.theme as Theme;
                }
                return prevTheme;
              });
            }
          }
        }, (error) => {
          // Only handle error if user is still logged in
          if (auth.currentUser) {
            handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
          }
        });
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []); // Remove theme dependency to avoid multiple listeners

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setThemeState(newTheme);
    
    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          theme: newTheme
        });
      } catch (error) {
        console.error("Error updating theme in Firestore:", error);
      }
    }
  };

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          theme: newTheme
        });
      } catch (error) {
        console.error("Error updating theme in Firestore:", error);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
