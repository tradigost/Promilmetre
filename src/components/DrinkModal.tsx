import React, { useState, useEffect } from 'react';
import { DrinkPreset, UserProfile } from '../types';
import { calculatePureAlcoholGrams, getWidmarkR } from '../utils/calculator';
import { X, Plus, Clock, Wine, Sparkles } from 'lucide-react';

interface DrinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  preset: DrinkPreset | null;
  onAddDrink: (drink: { name: string; icon: string; ml: number; percent: number; grams: number; time: number }) => void;
  currentBac: number;
  profile: UserProfile;
}

export const DrinkModal: React.FC<DrinkModalProps> = ({
  isOpen,
  onClose,
  preset,
  onAddDrink,
  currentBac,
  profile,
}) => {
  const [name, setName] = useState('Bira');
  const [icon, setIcon] = useState('🍺');
  const [ml, setMl] = useState(500);
  const [percent, setPercent] = useState(5.0);
  const [timeOffsetMinutes, setTimeOffsetMinutes] = useState(0); // 0 = now, 15 = 15m ago, etc.
  const [customTime, setCustomTime] = useState('');

  useEffect(() => {
    if (preset) {
      setName(preset.name.replace(/\s*\(.*\)/, ''));
      setIcon(preset.icon);
      setMl(preset.ml);
      setPercent(preset.percent);
      setTimeOffsetMinutes(0);
      setCustomTime('');
    }
  }, [preset, isOpen]);

  if (!isOpen) return null;

  // Real-time calculations for preview
  const grams = calculatePureAlcoholGrams(ml, percent);
  const r = getWidmarkR(profile.gender);
  const bacIncrease = grams / (profile.weight * r);
  const projectedBac = currentBac + bacIncrease;

  const handleSave = () => {
    if (!ml || ml <= 0 || !percent || percent <= 0) return;

    let consumedTime = Date.now();
    if (customTime) {
      const [h, m] = customTime.split(':').map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        const d = new Date();
        d.setHours(h, m, 0, 0);
        // If time is in the future, assume it was earlier today or yesterday evening
        if (d.getTime() > Date.now()) {
          d.setDate(d.getDate() - 1);
        }
        consumedTime = d.getTime();
      }
    } else if (timeOffsetMinutes > 0) {
      consumedTime = Date.now() - timeOffsetMinutes * 60 * 1000;
    }

    onAddDrink({
      name: name.trim() || 'İçecek',
      icon: icon || '🍹',
      ml,
      percent,
      grams,
      time: consumedTime,
    });
    onClose();
  };

  const volumePresets = [40, 50, 80, 150, 330, 500, 700];
  const percentPresets = [4.5, 5.0, 7.5, 12.5, 40.0, 45.0];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-white/15 w-full max-w-lg rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 bg-white/10 rounded-xl">{icon}</span>
            <div>
              <h3 className="text-lg font-bold text-white">İçecek Ekle</h3>
              <p className="text-xs text-slate-400">
                Porsiyon miktarını ve alkol derecesini ayarlayın
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

        {/* Inputs */}
        <div className="space-y-4">
          {/* Drink Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              İçecek Adı
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800/80 border border-white/15 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors"
              placeholder="Örn: Bira, Duble Rakı, Şarap..."
            />
          </div>

          {/* Volume (ml) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300">
                Miktar (ml)
              </label>
              <span className="text-xs font-mono text-pink-400 font-semibold">
                {ml} ml
              </span>
            </div>
            <input
              type="number"
              min="1"
              max="2000"
              value={ml}
              onChange={(e) => setMl(Math.max(1, Number(e.target.value)))}
              className="w-full bg-slate-800/80 border border-white/15 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-pink-500"
            />
            {/* Quick volume chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {volumePresets.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setMl(val)}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-colors border ${
                    ml === val
                      ? 'bg-pink-500/20 border-pink-500 text-pink-300 font-bold'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {val >= 1000 ? `${val / 1000} L` : `${val} ml`}
                </button>
              ))}
            </div>
          </div>

          {/* Alcohol Percentage (%) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300">
                Alkol Oranı (% Hacmen)
              </label>
              <span className="text-xs font-mono text-purple-400 font-semibold">
                %{percent}
              </span>
            </div>
            <input
              type="number"
              min="0.1"
              max="100"
              step="0.1"
              value={percent}
              onChange={(e) => setPercent(Math.max(0.1, Number(e.target.value)))}
              className="w-full bg-slate-800/80 border border-white/15 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
            />
            {/* Quick percent chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {percentPresets.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setPercent(val)}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-colors border ${
                    percent === val
                      ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  %{val}
                </button>
              ))}
            </div>
          </div>

          {/* Consumed Time */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Ne Zaman Tüketildi?
            </label>
            <div className="grid grid-cols-4 gap-1.5 mb-2">
              {[
                { label: 'Şimdi', val: 0 },
                { label: '15 dk önce', val: 15 },
                { label: '30 dk önce', val: 30 },
                { label: '1 saat önce', val: 60 },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => {
                    setTimeOffsetMinutes(opt.val);
                    setCustomTime('');
                  }}
                  className={`py-1.5 text-xs rounded-lg border transition-colors ${
                    timeOffsetMinutes === opt.val && !customTime
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-semibold'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">veya kesin saat:</span>
              <input
                type="time"
                value={customTime}
                onChange={(e) => {
                  setCustomTime(e.target.value);
                  setTimeOffsetMinutes(-1);
                }}
                className="bg-slate-800/80 border border-white/15 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Real-time Impact Preview Box */}
          <div className="bg-gradient-to-r from-purple-950/40 via-pink-950/30 to-slate-900 border border-pink-500/20 rounded-xl p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-pink-300 mb-1">
              <Sparkles className="w-4 h-4 text-pink-400" />
              Hesaplanan Etki Önizlemesi
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
              <div className="bg-black/30 p-2 rounded-lg">
                <span className="text-slate-400 block text-[11px]">Saf Alkol Miktarı:</span>
                <span className="text-base font-bold text-rose-400 font-mono">
                  {grams.toFixed(1)} g
                </span>
              </div>
              <div className="bg-black/30 p-2 rounded-lg">
                <span className="text-slate-400 block text-[11px]">Tahmini Promil Artışı:</span>
                <span className="text-base font-bold text-pink-400 font-mono">
                  +{bacIncrease.toFixed(2)} Promil
                </span>
              </div>
            </div>
            <div className="mt-2 text-[11px] text-slate-400 text-center">
              Eklenince zirve promil tahmini:{' '}
              <strong className="text-white font-mono">{projectedBac.toFixed(2)}</strong> promil
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-5 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/15 text-slate-300 transition-colors"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white shadow-lg shadow-pink-500/25 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            İçeceği Ekle
          </button>
        </div>
      </div>
    </div>
  );
};
