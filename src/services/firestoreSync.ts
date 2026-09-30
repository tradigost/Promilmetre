import {
  db,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import { ArchivedSession, SessionData, UserProfile } from '../types';

export interface CloudUserData {
  profile: UserProfile;
  session: SessionData | null;
}

export async function saveUserCloudData(
  uid: string,
  profile: UserProfile,
  activeSession: SessionData | null
): Promise<void> {
  const path = `users/${uid}`;
  try {
    const dataToSave = {
      name: profile.name || 'Kullanıcı',
      email: profile.email || '',
      avatar: profile.avatar || '👤',
      photoURL: profile.photoURL || '',
      gender: profile.gender,
      weight: profile.weight,
      stomach: profile.stomach,
      session: activeSession ? activeSession : null,
      updatedAt: Date.now(),
    };
    await setDoc(doc(db, 'users', uid), dataToSave, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function loadUserCloudData(uid: string): Promise<CloudUserData | null> {
  const path = `users/${uid}`;
  try {
    const docSnap = await getDoc(doc(db, 'users', uid));
    if (!docSnap.exists()) {
      return null;
    }
    const data = docSnap.data();
    const profile: UserProfile = {
      name: data.name || 'Kullanıcı',
      email: data.email || '',
      avatar: data.avatar || '👤',
      photoURL: data.photoURL || '',
      gender: data.gender === 'female' ? 'female' : 'male',
      weight: Number(data.weight) || 75,
      stomach: data.stomach || 'full',
    };
    const session: SessionData | null = data.session || null;
    return { profile, session };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveArchivedSessionToCloud(
  uid: string,
  archive: ArchivedSession
): Promise<void> {
  const path = `users/${uid}/archives/${archive.id}`;
  try {
    await setDoc(doc(db, 'users', uid, 'archives', archive.id), {
      ...archive,
      userId: uid,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function loadUserArchivesFromCloud(uid: string): Promise<ArchivedSession[]> {
  const path = `users/${uid}/archives`;
  try {
    const querySnapshot = await getDocs(collection(db, 'users', uid, 'archives'));
    const archives: ArchivedSession[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as ArchivedSession;
      archives.push(data);
    });
    // Sort newest first
    archives.sort((a, b) => b.startTime - a.startTime);
    return archives;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function deleteArchivedSessionFromCloud(
  uid: string,
  archiveId: string
): Promise<void> {
  const path = `users/${uid}/archives/${archiveId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'archives', archiveId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
