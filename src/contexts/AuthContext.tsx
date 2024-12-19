import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Auth,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import { UserProfile } from '@/types';
import { updateDoc, doc } from 'firebase/firestore';
import { storage } from '@/config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface AuthContextType {
  currentUser: User | null;
  signup: (email: string, password: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  loginWithGoogle: () => Promise<any>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  uploadProfilePhoto: (file: File) => Promise<string>;
  uploadGroupImage: (file: File) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email: string, password: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    setCurrentUser(result.user);
    return result;
  };

  const login = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    setCurrentUser(result.user);
    return result;
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    setCurrentUser(result.user);
    return result;
  };

  const logout = () => signOut(auth);

  const updateProfile = async (profile: Partial<UserProfile>) => {
    // if (!currentUser) throw new Error('No user logged in');
    
    // // Update Firebase auth profile
    // await updateProfile(currentUser, {
    //   displayName: profile.displayName,
    //   photoURL: profile.photoURL,
    // });

    // // Update additional profile data in Firestore
    // await updateDoc(doc(db, 'users', currentUser.uid), profile);
  };

  const uploadProfilePhoto = async (file: File): Promise<string> => {
    if (!currentUser) throw new Error('No user logged in');
    
    const storageRef = ref(storage, `users/${currentUser.uid}/profile.jpg`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const uploadGroupImage = async (file: File): Promise<string> => {
    // const storageRef = ref(storage, `groups/${Date.now()}_${file.name}`);
    // await uploadBytes(storageRef, file);
    // return await getDownloadURL(storageRef);
    return '';
  };

  const value = {
    currentUser,
    signup,
    login,
    loginWithGoogle,
    logout,
    updateProfile,
    uploadProfilePhoto,
    uploadGroupImage,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 