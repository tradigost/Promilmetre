import React, { useState, useEffect } from 'react';
import { Gender, StomachState, UserProfile } from '../types';
import { X, User, Scale, Utensils, Check } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

const AVATARS = ['👤', '👨', '👩', '🧑', '😎', '🍹', '🍺', '🦁', '🦉', '🦊'];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [name, setName] = useState(profile.name);
  const [gender, setGender] = useState<Gender>(profile.gender);
  const [weight, setWeight] = useState(profile.weight);
  const [stomach, setStomach] = useState<StomachState>(profile.stomach);
  const [avatar, setAvatar] = useState(profile.avatar);

  useEffect(() => {
    if (isOpen) {
      setName(profile.name);
      setGender(profile.gender);
      setWeight(profile.weight);
      setStomach(profile.stomach);
      setAvatar(profile.avatar);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalWeight = Math.min(250, Math.max(30, Number(weight) || 75));
    onSaveProfile({
      name: name.trim() || 'Kullanıcı',
      gender,
      weight: finalWeight,
      stomach,
      avatar,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-white/15 w-full max-w-md rounded-2xl p-5 sm:p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-500/15 rounded-xl text-purple-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">Profil & Beden Ayarları</h3>
              <p className="text-xs text-slate-400">
                Widmark formülü bu parametrelere göre hesaplar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Profil Simgesi
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {AVATARS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setAvatar(av)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-transform ${
                    avatar === av
                      ? 'bg-pink-500/30 border-2 border-pink-500 scale-110'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              İsim / Takma Ad
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800/80 border border-white/15 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-pink-500"
              placeholder="İsminiz..."
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Cinsiyet (Widmark Vücut Su Katsayısı)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  gender === 'male'
                    ? 'bg-blue-500/20 border-blue-500 text-blue-300 shadow-sm'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                Erkek (r = 0.68)
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  gender === 'female'
                    ? 'bg-pink-500/20 border-pink-500 text-pink-300 shadow-sm'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                Kadın (r = 0.55)
              </button>
            </div>
          </div>

          {/* Weight */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-slate-400" /> Vücut Ağırlığı (kg)
              </label>
              <span className="text-xs font-mono font-bold text-pink-400">{weight} kg</span>
            </div>
            <input
              type="number"
              min="30"
              max="250"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full bg-slate-800/80 border border-white/15 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-pink-500"
            />
            {/* Quick weight chips */}
            <div className="flex gap-1.5 mt-2">
              {[55, 65, 75, 85, 95].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWeight(w)}
                  className={`flex-1 py-1 text-xs rounded-lg border transition-colors ${
                    weight === w
                      ? 'bg-pink-500/20 border-pink-500 text-pink-300 font-bold'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {w} kg
                </button>
              ))}
            </div>
          </div>

          {/* Stomach Condition */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-slate-400" />
              Mide Doluluk Durumu (Emilim Hızı)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'full', label: 'Tok', desc: 'Yavaş emilim (45 dk)' },
                { key: 'medium', label: 'Orta', desc: 'Normal (30 dk)' },
                { key: 'empty', label: 'Aç', desc: 'Hızlı emilim (18 dk)' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setStomach(item.key as StomachState)}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    stomach === item.key
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <div className="text-xs font-bold">{item.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-slate-300 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white shadow-lg shadow-pink-500/25 transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
