import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Lock, Mail, ShieldCheck, Ticket, X } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { GOFAST_IMAGES } from '../data/assets';
import { GoFastLogo, SafeImage } from './BrandMark';

const ADMIN_HOLD_DURATION_MS = 15000;

export function AuthScreen() {
  const {
    authReady,
    authenticated,
    pendingReferralCode,
    setPendingReferralCode,
    validateReferralCode,
    signInWithGoogle,
    signInWithAdminGoogle,
  } = useAppState();

  const [referralCode, setReferralCode] = useState(pendingReferralCode);
  const [sponsorCheck, setSponsorCheck] = useState<{
    status: 'idle' | 'checking' | 'valid' | 'invalid';
    message?: string;
  }>({ status: 'idle' });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Hidden 15-second long-press state on the security icon
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminSubmitting, setAdminSubmitting] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  const holdTimerRef = useRef<number | null>(null);
  const holdStartRef = useRef<number>(0);

  const stopHold = () => {
    if (holdTimerRef.current !== null) {
      window.clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setIsHolding(false);
    setHoldProgress(0);
  };

  const startHold = () => {
    if (adminModalOpen) return;
    stopHold();
    holdStartRef.current = Date.now();
    setIsHolding(true);
    holdTimerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - holdStartRef.current;
      const pct = Math.min(1, elapsed / ADMIN_HOLD_DURATION_MS);
      setHoldProgress(pct);
      if (elapsed >= ADMIN_HOLD_DURATION_MS) {
        stopHold();
        setAdminError(null);
        setAdminEmailInput('');
        setAdminModalOpen(true);
      }
    }, 50);
  };

  useEffect(() => {
    return () => {
      if (holdTimerRef.current !== null) {
        window.clearInterval(holdTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const code = referralCode.trim().toUpperCase();
    setPendingReferralCode(code);
    if (!code || code.length < 4) {
      setSponsorCheck({ status: 'idle' });
      return;
    }

    let cancelled = false;
    setSponsorCheck({ status: 'checking' });
    const timer = window.setTimeout(async () => {
      const res = await validateReferralCode(code);
      if (cancelled) return;
      if (res.valid) {
        setSponsorCheck({
          status: 'valid',
          message: `Parrain vérifié : ${res.ownerName} (${res.code})`,
        });
      } else {
        setSponsorCheck({
          status: 'invalid',
          message: res.error || 'Code de parrainage introuvable.',
        });
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [referralCode]);

  if (!authReady || authenticated) return null;

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSubmitting(true);
    const res = await signInWithGoogle(referralCode);
    setSubmitting(false);
    if (!res.ok) {
      setErrorMsg(res.error || 'Connexion Google impossible.');
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    const trimmed = adminEmailInput.trim();
    if (!trimmed) {
      setAdminError('Veuillez saisir votre adresse e-mail.');
      return;
    }
    setAdminSubmitting(true);
    const res = await signInWithAdminGoogle(trimmed);
    setAdminSubmitting(false);
    if (!res.ok) {
      setAdminError(res.error || 'Accès refusé.');
    } else {
      setAdminModalOpen(false);
    }
  };

  const ringRadius = 15;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - holdProgress);

  return (
    <div className="min-h-screen bg-[#050811] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl rounded-3xl overflow-hidden bg-[#0B1222] border border-[#1E3258] shadow-2xl grid grid-cols-1 lg:grid-cols-12">
        {/* Left Visual Column */}
        <div className="lg:col-span-5 relative p-6 sm:p-8 flex flex-col justify-between min-h-[220px] lg:min-h-[500px] bg-[#070C18]">
          <SafeImage
            src={GOFAST_IMAGES.heroOperations}
            alt="Infrastructure GoFast"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050811]/70 via-[#081228]/85 to-[#050811]" />

          <div className="relative z-10">
            <GoFastLogo />
          </div>

          <div className="relative z-10 space-y-3 mt-8 lg:mt-0">
            <p className="text-xs font-semibold tracking-wider text-[#60A5FA]">
              PLATEFORME GOFAST
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight [text-wrap:balance]">
              Vos lignes de production et votre équipe en temps réel
            </h1>
            <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
              800 FCFA offerts à l’inscription, code de parrainage personnel généré
              automatiquement et commissions sur 3 niveaux (37 % / 2 % / 1 %).
            </p>
          </div>
        </div>

        {/* Right Sign-In Column */}
        <div className="lg:col-span-7 p-6 sm:p-9 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
                Connexion ou inscription
              </h2>
              <p className="text-sm text-[#94A3B8] mt-1">
                Connectez-vous avec votre compte Google pour accéder à votre portefeuille et à
                votre équipe GoFast.
              </p>
            </div>

            <div>
              <label
                htmlFor="google-ref-code"
                className="block text-xs font-medium text-[#CBD5E1] mb-2"
              >
                Code de parrainage (optionnel)
              </label>
              <div className="relative">
                <Ticket className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="google-ref-code"
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="Saisissez le code d’invitation d’un parrain"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#070B16] border border-[#1E2E4E] text-sm font-mono uppercase tracking-wider text-white placeholder-[#475569] focus:outline-none focus:border-[#3B82F6]"
                />
              </div>
              {sponsorCheck.status === 'valid' && (
                <p className="mt-2 text-xs text-[#34D399] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{sponsorCheck.message}</span>
                </p>
              )}
              {sponsorCheck.status === 'invalid' && (
                <p className="mt-2 text-xs text-[#FCA5A5] flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{sponsorCheck.message}</span>
                </p>
              )}
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-[#1F0B10] border border-[#EF4444]/40 text-xs text-[#FCA5A5]">
                {errorMsg}
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={submitting}
              className="w-full min-h-[50px] px-5 py-3 rounded-xl bg-white hover:bg-[#EFF6FF] text-[#050811] font-semibold text-sm flex items-center justify-center gap-3 shadow-lg transition-colors disabled:opacity-60"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                />
              </svg>
              <span>{submitting ? 'Connexion en cours...' : 'Continuer avec Google'}</span>
            </button>
          </div>

          <div className="pt-5 border-t border-[#18243E] flex items-center gap-2.5 text-xs text-[#94A3B8]">
            <button
              type="button"
              onPointerDown={startHold}
              onPointerUp={stopHold}
              onPointerLeave={stopHold}
              onPointerCancel={stopHold}
              onContextMenu={(e) => e.preventDefault()}
              aria-label="Sécurité GoFast"
              className="relative w-10 h-10 -ml-2 rounded-full flex items-center justify-center shrink-0 select-none touch-none focus-visible:outline-2 focus-visible:outline-[#3B82F6]"
            >
              {isHolding && (
                <svg
                  className="absolute inset-0 w-10 h-10 -rotate-90 pointer-events-none"
                  viewBox="0 0 40 40"
                  aria-hidden="true"
                >
                  <circle
                    cx="20"
                    cy="20"
                    r={ringRadius}
                    fill="none"
                    stroke="#1E2E4E"
                    strokeWidth="2.5"
                  />
                  <circle
                    cx="20"
                    cy="20"
                    r={ringRadius}
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringOffset}
                  />
                </svg>
              )}
              <ShieldCheck className="w-4 h-4 text-[#3B82F6]" />
            </button>
            <span>
              Authentification sécurisée via Google · Chaque inscription via un lien ou code
              ajoute automatiquement le membre à l’équipe du parrain.
            </span>
          </div>
        </div>
      </div>

      {/* Private Admin Login Modal (unlocked after 15s hold on security icon) */}
      {adminModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-auth-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-[#0B1222] border border-[#1E3258] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0F1B33] border border-[#2563EB]/40 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-[#60A5FA]" />
                </div>
                <div>
                  <h3 id="admin-auth-title" className="font-display text-base font-bold text-white">
                    Accès restreint
                  </h3>
                  <p className="text-xs text-[#94A3B8]">Console de surveillance en temps réel</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAdminModalOpen(false)}
                aria-label="Fermer"
                className="p-2 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#0F172A] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-email-input"
                  className="block text-xs font-medium text-[#CBD5E1] mb-2"
                >
                  Adresse e-mail administrateur
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="admin-email-input"
                    type="email"
                    autoFocus
                    required
                    value={adminEmailInput}
                    onChange={(e) => setAdminEmailInput(e.target.value)}
                    placeholder="Saisissez l’e-mail administrateur"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#070B16] border border-[#1E2E4E] text-sm text-white placeholder-[#475569] focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>
              </div>

              {adminError && (
                <div className="p-3 rounded-xl bg-[#1F0B10] border border-[#EF4444]/40 text-xs text-[#FCA5A5]">
                  {adminError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setAdminModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#070B16] border border-[#1E2E4E] text-xs font-semibold text-[#CBD5E1] hover:text-white transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={adminSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#3B82F6] text-xs font-semibold text-white transition-colors disabled:opacity-60"
                >
                  {adminSubmitting ? 'Connexion...' : 'Se connecter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
