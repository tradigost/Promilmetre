import React from 'react';
import { DrinkPreset } from '../types';
import { DEFAULT_DRINKS } from '../utils/presets';
import { Plus, Sparkles, RefreshCw } from 'lucide-react';

interface DrinksGridProps {
  onSelectPreset: (preset: DrinkPreset) => void;
  onCustomDrink: () => void;
  onQuickRepeatLast?: () => void;
  lastDrinkName?: string;
}

export const DrinksGrid: React.FC<DrinksGridProps> = ({
  onSelectPreset,
  onCustomDrink,
  onQuickRepeatLast,
  lastDrinkName,
}) => {
  return (
    <div className="w-full">
      {/* Grid of presets */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-2.5">
        {DEFAULT_DRINKS.map((drink) => (
          <button
            key={drink.id}
            onClick={() => onSelectPreset(drink)}
            className="group relative flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-pink-500/40 transition-all duration-200 active:scale-95 text-center"
          >
            <span className="text-3xl mb-1.5 transform group-hover:scale-110 transition-transform">
              {drink.icon}
            </span>
            <span className="text-xs font-semibold text-white line-clamp-1">
              {drink.name}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 font-mono">
              {drink.ml} ml · %{drink.percent}
            </span>
          </button>
        ))}

        {/* Custom Drink Button */}
        <button
          onClick={onCustomDrink}
          className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-purple-500/15 to-pink-500/10 hover:from-purple-500/25 hover:to-pink-500/20 border border-purple-500/30 hover:border-pink-500/50 transition-all duration-200 active:scale-95 text-center"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-1 text-white shadow-md shadow-pink-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-purple-200">
            Özel İçecek
          </span>
          <span className="text-[10px] text-purple-300/70 mt-0.5">
            İsteğe Göre
          </span>
        </button>
      </div>

      {/* Quick Actions Row */}
      {lastDrinkName && onQuickRepeatLast && (
        <div className="mt-3 flex items-center justify-end">
          <button
            onClick={onQuickRepeatLast}
            className="inline-flex items-center gap-1.5 text-xs text-pink-300 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 px-3 py-1.5 rounded-xl transition-colors"
          >
            <RefreshCw className="w-3 h-3 text-pink-400" />
            <span>Son İçeceği Tekrarla: <strong>{lastDrinkName}</strong></span>
          </button>
        </div>
      )}
    </div>
  );
};
