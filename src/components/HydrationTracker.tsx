import React from 'react';
import { Droplets, Plus, Minus, ThumbsUp, HeartPulse } from 'lucide-react';

interface HydrationTrackerProps {
  waterGlasses: number;
  drinkCount: number;
  onAddWater: () => void;
  onRemoveWater: () => void;
}

export const HydrationTracker: React.FC<HydrationTrackerProps> = ({
  waterGlasses,
  drinkCount,
  onAddWater,
  onRemoveWater,
}) => {
  const targetGlasses = Math.max(1, drinkCount);
  const percentage = Math.min(100, Math.round((waterGlasses / targetGlasses) * 100));

  return (
    <div className="bg-slate-900/60 border border-cyan-500/20 rounded-2xl p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-cyan-500/15 rounded-lg text-cyan-400">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Su & Hidrasyon Takibi</h4>
            <p className="text-[11px] text-slate-400">
              Alkol dehidrasyona yol açar; her içkiye en az 1 bardak su için.
            </p>
          </div>
        </div>

        {/* Counter controls */}
        <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-xl p-1">
          <button
            onClick={onRemoveWater}
            disabled={waterGlasses <= 0}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="1 bardak eksilt"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono font-bold text-sm text-cyan-300 px-2 min-w-[28px] text-center">
            {waterGlasses}
          </span>
          <button
            onClick={onAddWater}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-colors"
            title="1 bardak su ekle"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-2">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-400 flex items-center gap-1">
            Hedef: {targetGlasses} bardak ({targetGlasses * 250} ml)
          </span>
          <span className="font-mono text-cyan-400 font-semibold">
            {waterGlasses} / {targetGlasses} ({percentage}%)
          </span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-white/5">
          <div
            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Encouragement message */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
        {percentage >= 100 ? (
          <span className="text-emerald-400 font-medium flex items-center gap-1">
            <ThumbsUp className="w-3 h-3" /> Harika gidiyorsun! Hidrasyon hedefini karşıladın.
          </span>
        ) : (
          <span className="text-cyan-300/80 flex items-center gap-1">
            <HeartPulse className="w-3 h-3 text-cyan-400" />
            Sabah baş ağrısını önlemek için yatmadan önce 2 bardak daha su için.
          </span>
        )}
        <button
          onClick={onAddWater}
          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
        >
          + Su İçtim
        </button>
      </div>
    </div>
  );
};
