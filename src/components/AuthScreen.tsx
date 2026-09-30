import React, { useState } from 'react';
import { Wine, ShieldCheck, Sparkles, Cloud, Lock, ArrowRight, Car, Clock } from 'lucide-react';

interface AuthScreenProps {
  onGoogleLogin: () => Promise<void>;
  onContinueAsGuest: () => void;
  isLoading: boolean;
  error?: string | null;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onGoogleLogin,
  onContinueAsGuest,
  isLoading,
  error,
}) => {
  const [loggingIn, setLoggingIn] = useState(false);

  const handleLoginClick = async () => {
    try {
      setLoggingIn(true);
      await onGoogleLogin();
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full my-auto py-6 animate-in fade-in duration-300">
      {/* Brand Hero Card */}
      <div className="bg-slate-900/80 border border-white/15 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl text-center relative overflow-hidden">
        {/* Glow behind */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-tr from-pink-500/20 to-purple-600/30 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-pink-500/25">
            <Wine className="w-9 h-9 sm:w-10 sm:h-10 text-white" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
            Hoş Geldiniz
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xs mx-auto leading-relaxed mb-6">
            Google hesabınızla giriş yapın, promil takibiniz ve geçmişiniz bulutta güvenle saklansın.
          </p>

          {/* Value props */}
          <div className="grid grid-cols-2 gap-2 text-left mb-6 text-xs text-slate-300">
            <div className="p-2.5 bg-white/[0.04] border border-white/10 rounded-xl flex items-start gap-2">
              <Cloud className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block text-[11px]">Bulut Senkronizasyonu</strong>
                <span className="text-[10px] text-slate-400">Telefon değiştirseniz de verileriniz korunur</span>
              </div>
            </div>
            <div className="p-2.5 bg-white/[0.04] border border-white/10 rounded-xl flex items-start gap-2">
              <Clock className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block text-[11px]">Canlı Takip</strong>
                <span className="text-[10px] text-slate-400">Widmark formülüyle anlık ayılma süresi</span>
              </div>
            </div>
          </div>

          {/* Error notice if any */}
          {error && (
            <div className="mb-4 p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300 text-left">
              {error}
            </div>
          )}

          {/* Google Sign-in button */}
          <button
            onClick={handleLoginClick}
            disabled={isLoading || loggingIn}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
          >
            {loggingIn || isLoading ? (
              <div className="w-5 h-5 border-2 border-slate-400 border-t-slate-800 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
                <path
                  fill="#FFC107"
                  d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                />
                <path
                  fill="#FF3D00"
                  d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
                />
              </svg>
            )}
            <span className="text-sm sm:text-base">Google ile Giriş Yap</span>
          </button>

          {/* Guest option */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <button
              onClick={onContinueAsGuest}
              className="text-xs text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto"
            >
              <span>Giriş yapmadan misafir olarak devam et</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
        <Lock className="w-3 h-3 text-slate-400" />
        <span>Verileriniz Firebase güvenliği ile sadece size özel saklanır.</span>
      </div>
    </div>
  );
};
