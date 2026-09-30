import React from 'react';
import { ArchivedSession } from '../types';
import { X, Calendar, Trash2, Trophy, Clock, Wine, Droplets } from 'lucide-react';

interface ArchivedSessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  archives: ArchivedSession[];
  onDeleteArchive: (id: string) => void;
}

export const ArchivedSessionsModal: React.FC<ArchivedSessionsModalProps> = ({
  isOpen,
  onClose,
  archives,
  onDeleteArchive,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-white/15 w-full max-w-lg rounded-2xl p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/15 rounded-xl text-blue-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">Geçmiş Oturumlar</h3>
              <p className="text-xs text-slate-400">
                Önceki gecelerin toplam tüketim ve zirve promil kayıtları
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

        {archives.length === 0 ? (
          <div className="text-center py-10 px-4 bg-white/[0.03] border border-dashed border-white/10 rounded-2xl">
            <Wine className="w-10 h-10 text-slate-500 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium text-slate-400">Henüz arşivlenmiş oturum yok</p>
            <p className="text-xs text-slate-500 mt-1">
              Bir oturumu sonlandırdığınızda burada güvenle saklanır.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {archives.map((item) => {
              const durationHours = Math.max(
                0.1,
                (item.endTime - item.startTime) / 3600000
              );
              const h = Math.floor(durationHours);
              const m = Math.round((durationHours - h) * 60);

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-white text-xs sm:text-sm flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                      {item.date}
                    </span>
                    <button
                      onClick={() => onDeleteArchive(item.id)}
                      className="text-slate-400 hover:text-rose-400 p-1 rounded transition-colors"
                      title="Oturumu sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-xs mb-2.5">
                    <div className="bg-black/30 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-400 block">Zirve</span>
                      <span className="font-mono font-bold text-pink-400">
                        {item.peakBac.toFixed(2)}
                      </span>
                    </div>
                    <div className="bg-black/30 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-400 block">Saf Alkol</span>
                      <span className="font-mono font-bold text-rose-400">
                        {item.totalGrams.toFixed(0)}g
                      </span>
                    </div>
                    <div className="bg-black/30 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-400 block">İçecek</span>
                      <span className="font-mono font-bold text-white">
                        {item.drinkCount} adet
                      </span>
                    </div>
                    <div className="bg-black/30 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-400 block">Süre</span>
                      <span className="font-mono font-bold text-slate-300">
                        {h}s {m}d
                      </span>
                    </div>
                  </div>

                  {/* Drinks list preview */}
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                    {item.drinks.map((d, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-slate-300 font-mono"
                      >
                        <span>{d.icon}</span>
                        <span>{d.name}</span>
                      </span>
                    ))}
                    {item.waterGlasses > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 text-[10px] font-mono">
                        <Droplets className="w-2.5 h-2.5 text-cyan-400" />
                        {item.waterGlasses} bardak su
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-white/10 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-slate-300 transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
