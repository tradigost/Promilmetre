import React from 'react';
import { Clock, Droplets, Flame, TrendingUp, Car, Sparkles } from 'lucide-react';

interface InfoCardsProps {
  totalAlcoholGrams: number;
  soberTime: number; // timestamp
  legalLimitTime: number | null; // timestamp or null if already below
  elapsedTimeString: string;
  peakBac: number;
  drinkCount: number;
  currentBac: number;
}

export const InfoCards: React.FC<InfoCardsProps> = ({
  totalAlcoholGrams,
  soberTime,
  legalLimitTime,
  elapsedTimeString,
  peakBac,
  drinkCount,
  currentBac,
}) => {
  const formatTime = (timestamp: number) => {
    const d = new Date(timestamp);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const getSoberDisplay = () => {
    if (currentBac <= 0.001) return 'Şimdi Ayık';
    const now = Date.now();
    const diffMin = Math.round((soberTime - now) / 60000);
    const timeStr = formatTime(soberTime);
    if (diffMin <= 0) return 'Şimdi';
    const h = Math.floor(diffMin / 60);
    const m = diffMin % 60;
    const durationStr = h > 0 ? `${h}s ${m}d` : `${m} dk`;
    return { timeStr, durationStr };
  };

  const getLegalLimitDisplay = () => {
    if (currentBac <= 0.50) return 'Sınır Altı';
    if (!legalLimitTime) return 'Sınır Altı';
    const now = Date.now();
    const diffMin = Math.round((legalLimitTime - now) / 60000);
    const timeStr = formatTime(legalLimitTime);
    const h = Math.floor(diffMin / 60);
    const m = diffMin % 60;
    const durationStr = h > 0 ? `${h}s ${m}d` : `${m} dk`;
    return { timeStr, durationStr };
  };

  const soberDisplay = getSoberDisplay();
  const legalDisplay = getLegalLimitDisplay();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full">
      {/* 1. Sıfırlanma (Tam Ayılma) */}
      <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3 flex flex-col justify-between backdrop-blur-sm hover:border-white/20 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            Tam Sıfırlanma
          </span>
        </div>
        <div className="mt-1">
          {typeof soberDisplay === 'string' ? (
            <div className="text-base sm:text-lg font-bold text-emerald-400">
              {soberDisplay}
            </div>
          ) : (
            <div>
              <div className="text-base sm:text-lg font-bold text-white font-mono">
                {soberDisplay.timeStr}
              </div>
              <div className="text-[11px] text-emerald-400/90 font-medium">
                ({soberDisplay.durationStr} sonra)
              </div>
            </div>
          )}
        </div>
        <span className="text-[10px] text-slate-500 mt-1">0.00 promil saati</span>
      </div>

      {/* 2. Yasal Sınıra İniş (0.50 Promil) */}
      <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3 flex flex-col justify-between backdrop-blur-sm hover:border-white/20 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Car className="w-3.5 h-3.5 text-amber-400" />
            Yasal Sürüş Sınırı
          </span>
        </div>
        <div className="mt-1">
          {typeof legalDisplay === 'string' ? (
            <div className="text-base sm:text-lg font-bold text-emerald-400">
              {legalDisplay}
            </div>
          ) : (
            <div>
              <div className="text-base sm:text-lg font-bold text-amber-400 font-mono">
                {legalDisplay.timeStr}
              </div>
              <div className="text-[11px] text-amber-400/90 font-medium">
                ({legalDisplay.durationStr} sonra)
              </div>
            </div>
          )}
        </div>
        <span className="text-[10px] text-slate-500 mt-1">&lt;0.50 promil inişi</span>
      </div>

      {/* 3. Toplam Saf Alkol */}
      <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3 flex flex-col justify-between backdrop-blur-sm hover:border-white/20 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            Saf Alkol
          </span>
        </div>
        <div className="mt-1">
          <div className="text-base sm:text-lg font-bold text-rose-400 font-mono">
            {totalAlcoholGrams.toFixed(1)} <span className="text-xs font-normal text-slate-300">g</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {drinkCount} içecek tüketildi
          </div>
        </div>
        <span className="text-[10px] text-slate-500 mt-1">
          ≈ {(totalAlcoholGrams / 10).toFixed(1)} standart birim
        </span>
      </div>

      {/* 4. Geçen Süre */}
      <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3 flex flex-col justify-between backdrop-blur-sm hover:border-white/20 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            Geçen Süre
          </span>
        </div>
        <div className="mt-1">
          <div className="text-base sm:text-lg font-bold text-white font-mono">
            {elapsedTimeString}
          </div>
          <div className="text-[11px] text-slate-400">
            Oturum süresi
          </div>
        </div>
        <span className="text-[10px] text-slate-500 mt-1">Metabolizma: -0.15/saat</span>
      </div>

      {/* 5. Zirve Promil (Peak) */}
      <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3 flex flex-col justify-between backdrop-blur-sm hover:border-white/20 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
            Zirve Seviye
          </span>
        </div>
        <div className="mt-1">
          <div className="text-base sm:text-lg font-bold text-purple-300 font-mono">
            {peakBac.toFixed(2)} <span className="text-xs font-normal text-slate-400">promil</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Bu oturumdaki en yüksek
          </div>
        </div>
        <span className="text-[10px] text-slate-500 mt-1">Ulaşılan tepe nokta</span>
      </div>

      {/* 6. Hidrasyon & Durum İpucu */}
      <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3 flex flex-col justify-between backdrop-blur-sm hover:border-white/20 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            Su Tavsiyesi
          </span>
        </div>
        <div className="mt-1">
          <div className="text-base sm:text-lg font-bold text-cyan-300 font-mono">
            {Math.max(1, drinkCount)} <span className="text-xs font-normal text-slate-300">bardak</span>
          </div>
          <div className="text-[11px] text-cyan-400/80">
            Dehidrasyonu önler
          </div>
        </div>
        <span className="text-[10px] text-slate-500 mt-1">Her içki için 1 bardak su</span>
      </div>
    </div>
  );
};
