/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  UserProfile,
  SessionData,
  DrinkPreset,
  ConsumedDrink,
  ArchivedSession,
} from './types';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
  FirebaseUser,
} from './firebase';
import {
  saveUserCloudData,
  loadUserCloudData,
  saveArchivedSessionToCloud,
  loadUserArchivesFromCloud,
  deleteArchivedSessionFromCloud,
} from './services/firestoreSync';
import {
  calculateBacAtTime,
  calculateSoberTime,
  calculateLegalLimitSafeTime,
  getBacStatus,
  generateProjection,
} from './utils/calculator';
import {
  DEFAULT_PROFILE,
  loadProfile,
  saveProfile,
  loadActiveSession,
  saveActiveSession,
  loadArchivedSessions,
  archiveCurrentSession,
  deleteArchivedSession,
} from './utils/storage';
import { AuthScreen } from './components/AuthScreen';
import { Gauge } from './components/Gauge';
import { InfoCards } from './components/InfoCards';
import { DrinksGrid } from './components/DrinksGrid';
import { DrinkModal } from './components/DrinkModal';
import { ProjectionChart } from './components/ProjectionChart';
import { HydrationTracker } from './components/HydrationTracker';
import { HistoryList } from './components/HistoryList';
import { LegalInfoModal } from './components/LegalInfoModal';
import { EmergencyModal } from './components/EmergencyModal';
import { ProfileModal } from './components/ProfileModal';
import { ArchivedSessionsModal } from './components/ArchivedSessionsModal';
import {
  Wine,
  Settings,
  History,
  PhoneCall,
  Play,
  RotateCcw,
  LogOut,
  LogIn,
  Calendar,
  Cloud,
  CheckCircle2,
} from 'lucide-react';

export default function App() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [guestMode, setGuestMode] = useState<boolean>(false);

  // App core state
  const [profile, setProfile] = useState<UserProfile>(loadProfile);
  const [session, setSession] = useState<SessionData | null>(loadActiveSession);
  const [archives, setArchives] = useState<ArchivedSession[]>(loadArchivedSessions);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Setup screen form state
  const [setupWeight, setSetupWeight] = useState<number>(profile.weight || 75);
  const [setupGender, setSetupGender] = useState<'male' | 'female'>(profile.gender || 'male');
  const [setupStomach, setSetupStomach] = useState<'full' | 'medium' | 'empty'>(profile.stomach || 'full');
  const [setupStartTime, setSetupStartTime] = useState<string>(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });

  // Modals state
  const [selectedPreset, setSelectedPreset] = useState<DrinkPreset | null>(null);
  const [isDrinkModalOpen, setIsDrinkModalOpen] = useState<boolean>(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isArchivesModalOpen, setIsArchivesModalOpen] = useState<boolean>(false);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthLoading(true);
      if (user) {
        setCurrentUser(user);
        setGuestMode(false);
        try {
          // Fetch user data from Firestore
          const cloudData = await loadUserCloudData(user.uid);
          if (cloudData) {
            const mergedProfile: UserProfile = {
              ...cloudData.profile,
              name: user.displayName || cloudData.profile.name || 'Kullanıcı',
              email: user.email || '',
              photoURL: user.photoURL || '',
            };
            setProfile(mergedProfile);
            saveProfile(mergedProfile);

            if (cloudData.session) {
              setSession(cloudData.session);
              saveActiveSession(cloudData.session);
            }
          } else {
            // New user in Firestore: populate defaults with Google profile info
            const initialProfile: UserProfile = {
              name: user.displayName || 'Kullanıcı',
              email: user.email || '',
              photoURL: user.photoURL || '',
              gender: 'male',
              weight: 75,
              stomach: 'full',
              avatar: '👤',
            };
            setProfile(initialProfile);
            saveProfile(initialProfile);
            await saveUserCloudData(user.uid, initialProfile, null);
          }

          // Load cloud archives
          const cloudArchives = await loadUserArchivesFromCloud(user.uid);
          if (cloudArchives && cloudArchives.length > 0) {
            setArchives(cloudArchives);
          }
        } catch (err) {
          console.error('Cloud load error:', err);
        }
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Real-time ticker (every 1 second)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update profile handler (persists to cloud + local)
  const handleUpdateProfile = useCallback(
    async (newProfile: UserProfile) => {
      setProfile(newProfile);
      saveProfile(newProfile);
      if (currentUser) {
        try {
          await saveUserCloudData(currentUser.uid, newProfile, session);
        } catch (e) {
          console.error('Profile cloud save error:', e);
        }
      }
    },
    [currentUser, session]
  );

  // Compute live calculations
  const {
    currentBac,
    bacStatus,
    soberTime,
    legalLimitTime,
    elapsedTimeString,
    totalAlcoholGrams,
    peakBac,
    projectionPoints,
  } = useMemo(() => {
    if (!session) {
      return {
        currentBac: 0,
        bacStatus: getBacStatus(0),
        soberTime: currentTime,
        legalLimitTime: null,
        elapsedTimeString: '00:00:00',
        totalAlcoholGrams: 0,
        peakBac: 0,
        projectionPoints: [],
      };
    }

    const bac = calculateBacAtTime(currentTime, session.startTime, session.drinks, profile);
    const status = getBacStatus(bac);
    const sober = calculateSoberTime(bac, currentTime);
    const legalLimit = calculateLegalLimitSafeTime(bac, currentTime);

    // Elapsed time
    const elapsedMs = Math.max(0, currentTime - session.startTime);
    const totalSecs = Math.floor(elapsedMs / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    const elapsedStr = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    // Total grams pure alcohol
    const totalGrams = session.drinks.reduce((sum, d) => sum + d.grams, 0);

    // Peak tracking
    const currentPeak = Math.max(session.peak || 0, bac);

    // Timeline projection
    const projection = generateProjection(currentTime, session.startTime, session.drinks, profile);

    return {
      currentBac: bac,
      bacStatus: status,
      soberTime: sober,
      legalLimitTime: legalLimit,
      elapsedTimeString: elapsedStr,
      totalAlcoholGrams: totalGrams,
      peakBac: currentPeak,
      projectionPoints: projection,
    };
  }, [session, profile, currentTime]);

  // Update peak in session if changed
  useEffect(() => {
    if (session && peakBac > session.peak) {
      const updated = { ...session, peak: peakBac };
      setSession(updated);
      saveActiveSession(updated);
      if (currentUser) {
        saveUserCloudData(currentUser.uid, profile, updated).catch(() => {});
      }
    }
  }, [peakBac, session, currentUser, profile]);

  // Google Login action
  const handleGoogleLogin = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (popupErr: any) {
      console.warn('Popup login failed, attempting redirect:', popupErr);
      try {
        await signInWithRedirect(auth, googleProvider);
      } catch (redirectErr: any) {
        console.error('Redirect login error:', redirectErr);
        setAuthError(
          redirectErr?.message || 'Google girişi sırasında bir hata oluştu. Lütfen tekrar deneyin.'
        );
      }
    }
  };

  // Google Logout action
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setSession(null);
      saveActiveSession(null);
      setGuestMode(false);
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  // Start new session
  const handleStartSession = async () => {
    const finalWeight = Math.min(250, Math.max(30, Number(setupWeight) || 75));
    const updatedProfile: UserProfile = {
      ...profile,
      gender: setupGender,
      weight: finalWeight,
      stomach: setupStomach,
    };
    handleUpdateProfile(updatedProfile);

    // Calculate start timestamp
    const startTimeDate = new Date();
    if (setupStartTime) {
      const [h, m] = setupStartTime.split(':').map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        startTimeDate.setHours(h, m, 0, 0);
        if (startTimeDate.getTime() > Date.now()) {
          startTimeDate.setDate(startTimeDate.getDate() - 1);
        }
      }
    }

    const newSession: SessionData = {
      id: `session_${Date.now()}`,
      startTime: startTimeDate.getTime(),
      drinks: [],
      waterGlasses: 0,
      peak: 0,
    };

    setSession(newSession);
    saveActiveSession(newSession);

    if (currentUser) {
      try {
        await saveUserCloudData(currentUser.uid, updatedProfile, newSession);
      } catch (e) {
        console.error('Cloud session save error:', e);
      }
    }
  };

  // Add drink to session
  const handleAddDrink = async (drinkData: {
    name: string;
    icon: string;
    ml: number;
    percent: number;
    grams: number;
    time: number;
  }) => {
    if (!session) return;

    const newDrink: ConsumedDrink = {
      id: `drink_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      ...drinkData,
    };

    const updatedSession: SessionData = {
      ...session,
      drinks: [...session.drinks, newDrink],
    };

    setSession(updatedSession);
    saveActiveSession(updatedSession);

    if (currentUser) {
      try {
        await saveUserCloudData(currentUser.uid, profile, updatedSession);
      } catch (e) {
        console.error('Cloud drink sync error:', e);
      }
    }
  };

  // Remove drink
  const handleRemoveDrink = async (drinkId: string) => {
    if (!session) return;
    const updatedSession: SessionData = {
      ...session,
      drinks: session.drinks.filter((d) => d.id !== drinkId),
    };
    setSession(updatedSession);
    saveActiveSession(updatedSession);

    if (currentUser) {
      try {
        await saveUserCloudData(currentUser.uid, profile, updatedSession);
      } catch (e) {
        console.error('Cloud drink removal error:', e);
      }
    }
  };

  // Water tracking
  const handleAddWater = async () => {
    if (!session) return;
    const updated: SessionData = {
      ...session,
      waterGlasses: (session.waterGlasses || 0) + 1,
    };
    setSession(updated);
    saveActiveSession(updated);
    if (currentUser) {
      saveUserCloudData(currentUser.uid, profile, updated).catch(() => {});
    }
  };

  const handleRemoveWater = async () => {
    if (!session || (session.waterGlasses || 0) <= 0) return;
    const updated: SessionData = {
      ...session,
      waterGlasses: Math.max(0, (session.waterGlasses || 0) - 1),
    };
    setSession(updated);
    saveActiveSession(updated);
    if (currentUser) {
      saveUserCloudData(currentUser.uid, profile, updated).catch(() => {});
    }
  };

  // Quick repeat last drink
  const handleQuickRepeatLast = () => {
    if (!session || session.drinks.length === 0) return;
    const last = session.drinks[session.drinks.length - 1];
    handleAddDrink({
      name: last.name,
      icon: last.icon,
      ml: last.ml,
      percent: last.percent,
      grams: last.grams,
      time: Date.now(),
    });
  };

  // End / Archive session
  const handleEndSession = async () => {
    if (!session) return;
    const hasDrinks = session.drinks.length > 0;
    const confirmMessage = hasDrinks
      ? 'Bu oturumu sonlandırmak ve arşive kaydetmek istediğinizden emin misiniz?'
      : 'Mevcut oturumu sıfırlamak istediğinizden emin misiniz?';

    if (window.confirm(confirmMessage)) {
      if (hasDrinks) {
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

        archiveCurrentSession(session, currentBac);
        setArchives((prev) => [newArchive, ...prev]);

        if (currentUser) {
          try {
            await saveArchivedSessionToCloud(currentUser.uid, newArchive);
            await saveUserCloudData(currentUser.uid, profile, null);
          } catch (e) {
            console.error('Cloud archive error:', e);
          }
        }
      } else {
        saveActiveSession(null);
        if (currentUser) {
          saveUserCloudData(currentUser.uid, profile, null).catch(() => {});
        }
      }
      setSession(null);
    }
  };

  // Delete an archived session
  const handleDeleteArchive = async (id: string) => {
    const updated = deleteArchivedSession(id);
    setArchives(updated);
    if (currentUser) {
      try {
        await deleteArchivedSessionFromCloud(currentUser.uid, id);
      } catch (e) {
        console.error('Cloud delete archive error:', e);
      }
    }
  };

  // Trigger drink modal for preset
  const handleOpenPresetModal = (preset: DrinkPreset) => {
    setSelectedPreset(preset);
    setIsDrinkModalOpen(true);
  };

  // Trigger custom drink
  const handleOpenCustomDrinkModal = () => {
    setSelectedPreset({
      id: 'custom',
      name: 'Özel İçecek',
      icon: '✨',
      ml: 100,
      percent: 10,
      category: 'other',
    });
    setIsDrinkModalOpen(true);
  };

  // Initial loading splash
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0c0a1d] text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-3 border-pink-500/20 border-t-pink-500 rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-300">Promilmetre Başlatılıyor...</p>
      </div>
    );
  }

  // Not logged in and not in guest mode => show AuthScreen
  if (!currentUser && !guestMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0c0a1d] via-[#1a1738] to-[#141226] text-slate-100 flex flex-col font-sans px-3 sm:px-4 py-4 sm:py-6">
        <AuthScreen
          onGoogleLogin={handleGoogleLogin}
          onContinueAsGuest={() => setGuestMode(true)}
          isLoading={authLoading}
          error={authError}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c0a1d] via-[#1a1738] to-[#141226] text-slate-100 flex flex-col font-sans selection:bg-pink-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 bg-pink-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 -left-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-xl mx-auto flex-1 flex flex-col px-3 sm:px-4 py-4 sm:py-6">
        {/* Top Header */}
        <header className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Wine className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent flex items-center gap-1.5">
                <span>Promilmetre</span>
                {currentUser && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-normal px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Cloud className="w-2.5 h-2.5" /> Bulut
                  </span>
                )}
              </h1>
              <p className="text-[10px] text-slate-400">Alkol & Güvenlik Takibi</p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-1.5">
            {/* Past Archives */}
            <button
              onClick={() => setIsArchivesModalOpen(true)}
              className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors relative"
              title="Geçmiş Oturumlar"
            >
              <Calendar className="w-4 h-4" />
              {archives.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {archives.length}
                </span>
              )}
            </button>

            {/* Emergency & Taxi */}
            <button
              onClick={() => setIsEmergencyModalOpen(true)}
              className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 hover:text-rose-200 transition-colors"
              title="Taksi Çağır / Acil Yardım"
            >
              <PhoneCall className="w-4 h-4" />
            </button>

            {/* Profile Settings */}
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition-colors"
              title="Profil ve Beden Ayarları"
            >
              {profile.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt={profile.name}
                  referrerPolicy="no-referrer"
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <span className="text-sm">{profile.avatar}</span>
              )}
              <span className="hidden sm:inline max-w-[65px] truncate">{profile.name}</span>
              <Settings className="w-3 h-3 text-slate-400" />
            </button>

            {/* Auth Button: Login or Logout */}
            {currentUser ? (
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-white/[0.06] hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 text-slate-400 hover:text-rose-300 transition-colors"
                title="Çıkış Yap"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleGoogleLogin}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 text-pink-300 text-xs font-semibold transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Giriş Yap</span>
              </button>
            )}
          </div>
        </header>

        {/* MAIN BODY: Setup Screen or Active Session */}
        {!session ? (
          /* ==================== SETUP SCREEN ==================== */
          <div className="flex-1 flex flex-col justify-center my-auto space-y-4 animate-in fade-in duration-300">
            {/* User chip banner */}
            {currentUser && (
              <div className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || ''}
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <span className="text-base">👤</span>
                  )}
                  <span>
                    Oturum açık: <strong className="text-white">{currentUser.displayName || currentUser.email}</strong>
                  </span>
                </div>
                <span className="text-[11px] text-emerald-400 font-mono">Buluta senkronize</span>
              </div>
            )}

            {/* Hero Card */}
            <div className="bg-slate-900/70 border border-white/15 rounded-3xl p-5 sm:p-7 backdrop-blur-xl shadow-2xl text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-pink-500/25">
                <Wine className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                Yeni Oturum Başlat
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto mb-6">
                İçtiklerinizi ekleyin, anlık promil seviyenizi ve ne zaman güvenle araç kullanabileceğinizi öğrenin.
              </p>

              {/* Form Grid */}
              <div className="grid grid-cols-2 gap-3 text-left mb-5">
                {/* Gender */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Cinsiyet</label>
                  <select
                    value={setupGender}
                    onChange={(e) => setSetupGender(e.target.value as 'male' | 'female')}
                    className="w-full bg-slate-800/90 border border-white/15 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-pink-500"
                  >
                    <option value="male">Erkek (r=0.68)</option>
                    <option value="female">Kadın (r=0.55)</option>
                  </select>
                </div>

                {/* Weight */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Kilo (kg)</label>
                  <input
                    type="number"
                    min="30"
                    max="220"
                    value={setupWeight}
                    onChange={(e) => setSetupWeight(Number(e.target.value))}
                    className="w-full bg-slate-800/90 border border-white/15 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-pink-500"
                  />
                </div>

                {/* Stomach */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Mide Durumu</label>
                  <select
                    value={setupStomach}
                    onChange={(e) => setSetupStomach(e.target.value as 'full' | 'medium' | 'empty')}
                    className="w-full bg-slate-800/90 border border-white/15 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-pink-500"
                  >
                    <option value="full">Tok (Yavaş Emilim)</option>
                    <option value="medium">Orta (Normal Emilim)</option>
                    <option value="empty">Aç (Hızlı Emilim)</option>
                  </select>
                </div>

                {/* Start Time */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Başlangıç Saati</label>
                  <input
                    type="time"
                    value={setupStartTime}
                    onChange={(e) => setSetupStartTime(e.target.value)}
                    className="w-full bg-slate-800/90 border border-white/15 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={handleStartSession}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-sm sm:text-base shadow-xl shadow-pink-500/30 transition-all flex items-center justify-center gap-2 group active:scale-[0.98] cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current group-hover:translate-x-0.5 transition-transform" />
                Oturumu Başlat
              </button>
            </div>

            {/* Quick Benefits Cards */}
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-slate-400">
              <div className="p-3 bg-white/[0.03] border border-white/10 rounded-2xl">
                <span className="text-lg block mb-1">🔬</span>
                <span className="font-semibold text-slate-300 block">Widmark Bilimi</span>
                <span>Biyolojik metabolizma</span>
              </div>
              <div className="p-3 bg-white/[0.03] border border-white/10 rounded-2xl">
                <span className="text-lg block mb-1">🚗</span>
                <span className="font-semibold text-slate-300 block">Yasal Sınırlar</span>
                <span>0.50 hususi / 0.00 ticari</span>
              </div>
              <div className="p-3 bg-white/[0.03] border border-white/10 rounded-2xl">
                <span className="text-lg block mb-1">☁️</span>
                <span className="font-semibold text-slate-300 block">Bulut Kaydı</span>
                <span>Google ile güvenli senkron</span>
              </div>
            </div>
          </div>
        ) : (
          /* ==================== ACTIVE SESSION SCREEN ==================== */
          <div className="space-y-4 pb-6 animate-in fade-in duration-300">
            {/* Session Top Bar */}
            <div className="flex items-center justify-between p-2.5 bg-white/[0.04] border border-white/10 rounded-2xl backdrop-blur-sm text-xs">
              <div className="flex items-center gap-2">
                {profile.photoURL ? (
                  <img
                    src={profile.photoURL}
                    alt={profile.name}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full object-cover border border-white/20"
                  />
                ) : (
                  <span className="text-base p-1 bg-white/10 rounded-lg">{profile.avatar}</span>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-white">{profile.name}</span>
                    {currentUser && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" title="Buluta bağlı" />
                    )}
                  </div>
                  <span className="text-slate-400 text-[11px] font-mono">
                    {profile.weight} kg ·{' '}
                    {profile.stomach === 'full'
                      ? 'Tok'
                      : profile.stomach === 'empty'
                      ? 'Aç'
                      : 'Orta'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Düzenle
                </button>
                <button
                  onClick={handleEndSession}
                  className="flex items-center gap-1 text-rose-400 hover:text-rose-300 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 font-semibold transition-colors cursor-pointer"
                  title="Oturumu kaydet ve bitir"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Bitir</span>
                </button>
              </div>
            </div>

            {/* Gauge Display Card */}
            <div className="bg-slate-900/70 border border-white/15 rounded-3xl p-5 backdrop-blur-xl shadow-2xl flex flex-col items-center">
              <Gauge
                bac={currentBac}
                status={bacStatus}
                onOpenLegalInfo={() => setIsLegalModalOpen(true)}
              />

              {/* Driving Advice Callout */}
              <div className="mt-4 w-full p-3 rounded-xl bg-black/30 border border-white/10 text-xs text-center text-slate-300">
                <p>{bacStatus.drivingAdvice}</p>
              </div>
            </div>

            {/* 6 Key Stats Grid */}
            <InfoCards
              totalAlcoholGrams={totalAlcoholGrams}
              soberTime={soberTime}
              legalLimitTime={legalLimitTime}
              elapsedTimeString={elapsedTimeString}
              peakBac={peakBac}
              drinkCount={session.drinks.length}
              currentBac={currentBac}
            />

            {/* Drinks Addition Section */}
            <div className="bg-slate-900/60 border border-white/15 rounded-3xl p-4 sm:p-5 backdrop-blur-xl shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Wine className="w-4 h-4 text-pink-400" />
                    İçecek Ekle
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Dokunarak porsiyon ve alkol oranını seçin
                  </p>
                </div>
              </div>

              <DrinksGrid
                onSelectPreset={handleOpenPresetModal}
                onCustomDrink={handleOpenCustomDrinkModal}
                onQuickRepeatLast={session.drinks.length > 0 ? handleQuickRepeatLast : undefined}
                lastDrinkName={
                  session.drinks.length > 0
                    ? session.drinks[session.drinks.length - 1].name
                    : undefined
                }
              />
            </div>

            {/* Projection Curve (Hourly decline chart) */}
            {session.drinks.length > 0 && (
              <ProjectionChart points={projectionPoints} currentBac={currentBac} />
            )}

            {/* Hydration Tracker */}
            <HydrationTracker
              waterGlasses={session.waterGlasses || 0}
              drinkCount={session.drinks.length}
              onAddWater={handleAddWater}
              onRemoveWater={handleRemoveWater}
            />

            {/* Consumed Drinks History List */}
            <div className="bg-slate-900/60 border border-white/15 rounded-3xl p-4 sm:p-5 backdrop-blur-xl shadow-xl">
              <HistoryList drinks={session.drinks} onRemoveDrink={handleRemoveDrink} />
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-auto pt-4 text-center text-[11px] text-slate-500 border-t border-white/5 space-y-1">
          <p>Promilmetre · Widmark formülü & Firebase bulut senkronizasyonu</p>
          <p className="text-[10px] text-slate-600">
            Sağlığınız ve sevdiklerinizin güvenliği için asla alkollü araç kullanmayınız.
          </p>
        </footer>
      </div>

      {/* MODALS */}
      <DrinkModal
        isOpen={isDrinkModalOpen}
        onClose={() => setIsDrinkModalOpen(false)}
        preset={selectedPreset}
        onAddDrink={handleAddDrink}
        currentBac={currentBac}
        profile={profile}
      />

      <LegalInfoModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
      />

      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSaveProfile={handleUpdateProfile}
      />

      <ArchivedSessionsModal
        isOpen={isArchivesModalOpen}
        onClose={() => setIsArchivesModalOpen(false)}
        archives={archives}
        onDeleteArchive={handleDeleteArchive}
      />
    </div>
  );
}
