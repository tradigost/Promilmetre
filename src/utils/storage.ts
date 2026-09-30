import { ArchivedSession, SessionData, UserProfile } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'promilmetre_profile',
  SESSION: 'promilmetre_active_session',
  ARCHIVES: 'promilmetre_archived_sessions',
};

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Kullanıcı',
  gender: 'male',
  weight: 75,
  stomach: 'full',
  avatar: '👤',
};

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      weight: Number(parsed.weight) || 75,
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Profile save error:', e);
  }
}

export function loadActiveSession(): SessionData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.startTime) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveActiveSession(session: SessionData | null): void {
  try {
    if (!session) {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    } else {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    }
  } catch (e) {
    console.error('Session save error:', e);
  }
}

export function loadArchivedSessions(): ArchivedSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ARCHIVES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function archiveCurrentSession(session: SessionData, currentBac: number): void {
  try {
    const archives = loadArchivedSessions();
    const totalGrams = session.drinks.reduce((sum, d) => sum + d.grams, 0);
    const newArchive: ArchivedSession = {
      id: session.id,
      date: new Date(session.startTime).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      startTime: session.startTime,
      endTime: Date.now(),
      peakBac: Math.max(session.peak, currentBac),
      totalGrams,
      drinkCount: session.drinks.length,
      waterGlasses: session.waterGlasses || 0,
      drinks: [...session.drinks],
    };

    archives.unshift(newArchive);
    // Keep last 30 sessions
    localStorage.setItem(STORAGE_KEYS.ARCHIVES, JSON.stringify(archives.slice(0, 30)));
    saveActiveSession(null);
  } catch (e) {
    console.error('Archive save error:', e);
  }
}

export function deleteArchivedSession(id: string): ArchivedSession[] {
  try {
    const archives = loadArchivedSessions().filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ARCHIVES, JSON.stringify(archives));
    return archives;
  } catch {
    return [];
  }
}
