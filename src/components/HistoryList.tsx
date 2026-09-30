import React from 'react';
import { ConsumedDrink } from '../types';
import { Trash2, History, Wine, Clock } from 'lucide-react';

interface HistoryListProps {
  drinks: ConsumedDrink[];
  onRemoveDrink: (id: string) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ drinks, onRemoveDrink }) => {
  if (!drinks || drinks.length === 0) {
    return (
      <div className="text-center py-8 px-4 bg-white/[0.03] border border-dashed border-white/10 rounded-2xl">
        <Wine className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
        <p className="text-sm font-medium text-slate-400">Henüz içki eklemediniz</p>
        <p className="text-xs text-slate-500 mt-1">
          Yukarıdaki içecek listesinden birini seçerek başlayabilirsiniz.
        </p>
      </div>
    );
  }

  // Reverse list to show newest on top
  const sorted = [...drinks].reverse();

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-400 px-1 mb-1">
        <span>Tüketilen İçecekler ({drinks.length})</span>
        <span>Son eklenen en üstte</span>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {sorted.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 transition-colors"
          >
            {/* Left: Icon & Info */}
            <div className="flex items-center gap-3">
              <span className="text-2xl p-1.5 bg-white/10 rounded-lg">{item.icon}</span>
              <div>
                <div className="text-sm font-semibold text-white">
                  {item.name}
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  {item.ml} ml · %{item.percent} · <span className="text-rose-400 font-semibold">{item.grams.toFixed(1)}g</span> alkol
                </div>
              </div>
            </div>

            {/* Right: Time & Delete */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {formatTime(item.time)}
                </div>
              </div>

              <button
                onClick={() => onRemoveDrink(item.id)}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                title="İçeceği listeden sil"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
