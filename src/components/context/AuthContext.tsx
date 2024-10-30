import { ReactNode, createContext, useEffect, useState } from 'react';
import { User, getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from 'firebaseApp';

interface AuthProps {
  children: ReactNode;
}

export const AuthContext = createContext({
  user: null as User | null,
});

export const AuthContextProvider = ({ children }: AuthProps) => {
  const auth = getAuth(app);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        // User is sign out
        setCurrentUser(null);
      }
    });
  }, [auth]);

  return (
    <AuthContext.Provider value={{ user: currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};
