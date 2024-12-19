import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

export const checkOnboardingStatus = async (userId: string): Promise<boolean> => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  return userDoc.exists() && userDoc.data().onboardingCompleted === true;
}; 