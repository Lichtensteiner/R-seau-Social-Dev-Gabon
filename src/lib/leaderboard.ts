import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export type PointAction = 
  | 'post_create' 
  | 'comment_create' 
  | 'article_create' 
  | 'challenge_complete' 
  | 'test_pass' 
  | 'impact_project_featured'
  | 'mentorship_complete';

const POINTS_MAP: Record<PointAction, number> = {
  post_create: 5,
  comment_create: 2,
  article_create: 20,
  challenge_complete: 50,
  test_pass: 100,
  impact_project_featured: 200,
  mentorship_complete: 150,
};

export async function updateLeaderboardPoints(userId: string, displayName: string, photoURL: string | undefined, action: PointAction) {
  const points = POINTS_MAP[action];
  const leaderboardRef = doc(db, 'leaderboard', userId);

  try {
    const snap = await getDoc(leaderboardRef);
    if (snap.exists()) {
      await updateDoc(leaderboardRef, {
        points: increment(points),
        updatedAt: serverTimestamp(),
        displayName, // Keep updated
        photoURL: photoURL || null
      });
    } else {
      await setDoc(leaderboardRef, {
        userId,
        displayName,
        photoURL: photoURL || null,
        points: points,
        badges: [],
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error("Error updating leaderboard points:", error);
  }
}
