import React, { useState } from 'react';
import { X, PhoneCall, Car, ShieldAlert, Heart, ExternalLink } from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  const [customPhone, setCustomPhone] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-white/15 w-full max-w-md rounded-2xl p-5 sm:p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/15 rounded-xl text-rose-400">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Güvenli Dönüş & Acil Yardım
              </h3>
              <p className="text-xs text-slate-400">
                Asla alkollü araç kullanmayın, güvenli ulaşım seçin
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

        {/* Buttons list */}
        <div className="space-y-3">
          {/* Taksi Uygulamaları */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href="https://www.bitaksi.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 bg-yellow-500/15 hover:bg-yellow-500/25 border border-yellow-500/30 rounded-xl text-yellow-300 font-semibold text-xs transition-colors"
            >
              <Car className="w-4 h-4 text-yellow-400" />
              <span>BiTaksi Aç</span>
              <ExternalLink className="w-3 h-3 text-yellow-500" />
            </a>

            <a
              href="https://m.uber.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl text-white font-semibold text-xs transition-colors"
            >
              <Car className="w-4 h-4 text-slate-300" />
              <span>Uber Çağır</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>

          {/* 112 Acil Yardım */}
          <a
            href="tel:112"
            className="flex items-center justify-between p-3.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 rounded-xl text-white font-semibold text-sm transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-rose-500/30 rounded-lg text-rose-300">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div>112 Acil Çağrı Merkezi</div>
                <div className="text-[11px] text-rose-300/80 font-normal">
                  Sağlık, Polis, Jandarma (Tek Numara)
                </div>
              </div>
            </div>
            <span className="px-3 py-1 bg-rose-500 text-white rounded-lg text-xs font-bold">
              Ara
            </span>
          </a>

          {/* Arkadaş / Acil İletişim Kişisi */}
          <div className="p-3 bg-white/[0.04] border border-white/10 rounded-xl">
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-pink-400" />
              Güvendiğin Birini Ara
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={customPhone}
                onChange={(e) => setCustomPhone(e.target.value)}
                placeholder="Örn: 0532..."
                className="flex-1 bg-slate-800/80 border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-pink-500"
              />
              {customPhone ? (
                <a
                  href={`tel:${customPhone}`}
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center transition-colors"
                >
                  Ara
                </a>
              ) : (
                <button
                  disabled
                  className="px-4 py-2 bg-white/10 text-slate-500 rounded-xl text-xs font-semibold opacity-50 cursor-not-allowed"
                >
                  Ara
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Safety Tips */}
        <div className="mt-4 p-3 bg-white/[0.03] border border-white/5 rounded-xl text-[11px] text-slate-400 space-y-1">
          <p>• Anahtarlarınızı içki içmeyen bir arkadaşınıza emanet edin.</p>
          <p>• Kendinizi iyi hissetseniz bile refleksleriniz %40'a kadar yavaşlar.</p>
          <p>• Ertesi sabah uyandığınızda kandaki alkol henüz sıfırlanmamış olabilir.</p>
        </div>

        {/* Close Button */}
        <div className="mt-4 text-center">
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
