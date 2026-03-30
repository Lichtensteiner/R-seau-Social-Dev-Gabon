import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export async function logActivity(userId: string, userName: string, type: string, details?: string) {
  try {
    await addDoc(collection(db, 'activities'), {
      userId,
      userName,
      type,
      details: details || '',
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Error logging activity:", error);
  }
}
