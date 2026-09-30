import React from 'react';
import { BacStatus } from '../types';
import { AlertTriangle, CheckCircle2, ShieldAlert, Skull, Info } from 'lucide-react';

interface GaugeProps {
  bac: number;
  status: BacStatus;
  onOpenLegalInfo: () => void;
}

export const Gauge: React.FC<GaugeProps> = ({ bac, status, onOpenLegalInfo }) => {
  // Radius and circumference for the circle
  const radius = 86;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  // Maximum scale is 2.50 promil for full circle progress
  const progressRatio = Math.min(bac / 2.5, 1);
  const strokeDashoffset = circumference - progressRatio * circumference;

  // Render appropriate severity icon
  const renderIcon = () => {
    switch (status.severity) {
      case 'safe':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'low':
        return <CheckCircle2 className="w-4 h-4 text-lime-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'danger':
        return <ShieldAlert className="w-4 h-4 text-red-400" />;
      case 'critical':
        return <Skull className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Radial Gauge Container */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
        {/* Glow backdrop behind the ring */}
        <div
          className="absolute inset-4 rounded-full blur-2xl opacity-20 transition-all duration-700 pointer-events-none"
          style={{ backgroundColor: status.color }}
        />

        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 200 200">
          {/* Subtle track background */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
          />

          {/* Legal limit (0.50 promil) marker tick if within range */}
          {/* 0.50 / 2.5 = 20% of the circumference */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="rgba(251, 191, 36, 0.35)"
            strokeWidth={strokeWidth + 2}
            strokeDasharray={`2 ${circumference}`}
            strokeDashoffset={circumference - (0.5 / 2.5) * circumference}
          />

          {/* Animated Active Gauge Arc */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={status.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${status.color}88)`,
            }}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
            Mevcut Kandaki Alkol
          </span>
          <div className="flex items-baseline justify-center">
            <span
              className="text-5xl sm:text-6xl font-black tracking-tight transition-colors duration-500 font-mono"
              style={{ color: status.color }}
            >
              {bac.toFixed(2)}
            </span>
            <span className="text-sm font-bold text-slate-400 ml-1.5 uppercase">
              Promil
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-0.5">
            ≈ {(bac * 0.1).toFixed(3)} % BAC (g/dL)
          </span>
        </div>
      </div>

      {/* Dynamic Status Badge */}
      <div
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs sm:text-sm font-semibold transition-all duration-300 mt-2 shadow-lg backdrop-blur-md ${status.badgeClass}`}
      >
        {renderIcon()}
        <span>{status.statusText}</span>
      </div>

      {/* Driving status helper banner */}
      <button
        onClick={onOpenLegalInfo}
        className="mt-3 group inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full transition-all"
        title="Yasal sürüş limitlerini gör"
      >
        <span>
          {bac >= 0.50 ? (
            <span className="text-amber-400 font-medium">⚠️ Araç Kullanamazsınız (0.50 aşıldı)</span>
          ) : bac > 0 ? (
            <span className="text-emerald-400 font-medium">🚗 Hususi otomobil yasal sınır altı (0.50)</span>
          ) : (
            <span className="text-slate-400">🚗 Yasal limitler: Hususi 0.50 / Ticari 0.00</span>
          )}
        </span>
        <Info className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 transition-colors" />
      </button>
    </div>
  );
};
