import React from 'react';
import { X, ShieldAlert, AlertTriangle, Car, Scale, Info, CheckCircle } from 'lucide-react';

interface LegalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LegalInfoModal: React.FC<LegalInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-white/15 w-full max-w-lg rounded-2xl p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/15 rounded-xl text-amber-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Yasal Sınırlar ve Trafik Cezaları
              </h3>
              <p className="text-xs text-slate-400">
                2918 Sayılı Karayolları Trafik Kanunu (Madde 48)
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

        {/* Limits Breakdown */}
        <div className="space-y-3.5 text-xs text-slate-300">
          {/* Hususi Araçlar */}
          <div className="p-3.5 bg-white/[0.04] border border-white/10 rounded-xl">
            <div className="flex items-center justify-between font-semibold text-white mb-1">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Car className="w-4 h-4" /> Hususi (Binek) Otomobiller
              </span>
              <span className="font-mono text-sm px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                0.50 Promil
              </span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Kişisel binek araç kullanan sürücüler için yasal üst sınır 0.50 promildir. 0.51 promil ve üzerinde ceza ve ehliyete el koyma uygulanır.
            </p>
          </div>

          {/* Ticari ve Aday Sürücüler */}
          <div className="p-3.5 bg-white/[0.04] border border-amber-500/30 rounded-xl">
            <div className="flex items-center justify-between font-semibold text-white mb-1">
              <span className="flex items-center gap-1.5 text-amber-400">
                <ShieldAlert className="w-4 h-4" /> Ticari Araç & Stajyer Sürücüler
              </span>
              <span className="font-mono text-sm px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                0.00 Promil (Sıfır)
              </span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Taksi, dolmuş, servis, otobüs, kamyon ve 2 yıllık stajyer (aday) sürücüler için hiçbir tolerans yoktur (0.00 promil). En ufak alkol tespitinde ehliyet iptal edilebilir.
            </p>
          </div>

          {/* 1.00 Promil ve Üzeri - TCK */}
          <div className="p-3.5 bg-rose-950/30 border border-rose-500/40 rounded-xl">
            <div className="flex items-center justify-between font-semibold text-rose-300 mb-1">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" /> TCK Madde 179/3 (Adli Ceza)
              </span>
              <span className="font-mono text-sm px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                1.00+ Promil
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              1.00 promilin üzerinde alkollü araç kullanan sürücüler hakkında doğrudan Türk Ceza Kanunu kapsamında <strong>"Trafik Güvenliğini Tehlikeye Sokma"</strong> suçundan <strong>2 yıla kadar hapis istemiyle adli dava</strong> açılır ve karakola sevk edilir.
            </p>
          </div>

          {/* Ehliyet Geri Alma Süreleri */}
          <div className="p-3.5 bg-white/[0.04] border border-white/10 rounded-xl">
            <h4 className="font-semibold text-white mb-2 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-blue-400" /> Ehliyete El Koyma Süreleri
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="bg-black/30 p-2 rounded-lg">
                <span className="text-slate-400 block">1. Defa</span>
                <span className="font-bold text-amber-400 text-sm">6 Ay</span>
              </div>
              <div className="bg-black/30 p-2 rounded-lg">
                <span className="text-slate-400 block">2. Defa</span>
                <span className="font-bold text-rose-400 text-sm">2 Yıl</span>
              </div>
              <div className="bg-black/30 p-2 rounded-lg">
                <span className="text-slate-400 block">3. Defa</span>
                <span className="font-bold text-purple-400 text-sm">5 Yıl</span>
              </div>
            </div>
          </div>

          {/* Bilimsel ve Yasal Uyarı */}
          <div className="flex items-start gap-2.5 p-3 bg-blue-950/20 border border-blue-500/20 rounded-xl text-blue-300/90 text-[11px]">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong>Önemli Hatırlatma:</strong> Bu uygulamadaki hesaplamalar tıp literatüründe kabul gören Widmark formülüne dayanır. Metabolizma, karaciğer sağlığı, ilaçlar ve yorgunluk değerleri değiştirebilir. Yasal olarak tek bağlayıcı ölçüm kolluk kuvvetlerinin alkolmetresidir. <strong>Alkol aldıysanız asla araç kullanmayınız.</strong>
            </div>
          </div>
        </div>

        {/* Footer Close */}
        <div className="mt-5 pt-3 border-t border-white/10 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/15 text-white transition-colors"
          >
            Anladım, Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
