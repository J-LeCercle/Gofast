import React from 'react';
import {
  CalendarCheck,
  ChevronRight,
  Copy,
  CreditCard,
  Eye,
  EyeOff,
  FileText,
  Gift,
  Globe,
  HelpCircle,
  Info,
  Layers,
  LogOut,
  Receipt,
  Shield,
  UserPen,
  Wallet,
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { formatFCFA } from '../data/gofastData';
import { GOFAST_IMAGES } from '../data/assets';
import { SafeImage } from './BrandMark';

interface ProfileViewProps {
  onOpenEditProfile: () => void;
  onOpenGiftCode: () => void;
}

export function ProfileView({ onOpenEditProfile, onOpenGiftCode }: ProfileViewProps) {
  const {
    profile,
    balance,
    hideBalance,
    toggleHideBalance,
    navigateTo,
    performCheckIn,
    canCheckInToday,
    setLanguage,
    logout,
    showToast,
  } = useAppState();

  const initial = profile.name.trim().charAt(0).toUpperCase() || 'U';

  const handleCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(profile.inviteCode);
      showToast(`Code d’invitation ${profile.inviteCode} copié.`, 'success');
    } catch {
      showToast(`Code : ${profile.inviteCode}`, 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Twilight Bleu Noir Profile Header */}
      <section className="relative rounded-2xl overflow-hidden border border-[#1B2947] bg-[#080F20]">
        <SafeImage
          src={GOFAST_IMAGES.cardEnergy}
          alt="Arrière-plan profil GoFast"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#060B18]/70 via-[#081022]/90 to-[#060B17]" />

        <div className="relative z-10 p-5 sm:p-7 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#1D4ED8] border-2 border-[#60A5FA]/50 text-white font-display text-xl font-bold flex items-center justify-center shrink-0">
              {initial}
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-lg font-bold text-white truncate">
                {profile.name}
              </h2>
              <p className="font-mono text-xs sm:text-sm text-[#CBD5E1] tabular-nums mt-0.5 truncate">
                {profile.phone || profile.email}
              </p>
              {profile.referredByName && (
                <p className="text-xs text-[#93C5FD] mt-0.5">
                  Parrain : {profile.referredByName} ({profile.referredByCode})
                </p>
              )}
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-[#94A3B8]">SOLDE</span>
              <button
                type="button"
                onClick={toggleHideBalance}
                aria-label={hideBalance ? 'Afficher le solde' : 'Masquer le solde'}
                className="p-2 -mr-2 text-[#CBD5E1] hover:text-white transition-colors"
              >
                {hideBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display text-3xl sm:text-4xl font-bold text-white tabular-nums">
                {hideBalance ? '••••' : formatFCFA(balance).replace(' FCFA', '')}
              </span>
              <span className="text-base font-semibold text-[#60A5FA]">FCFA</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => navigateTo('recharge')}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white hover:bg-[#EFF6FF] text-[#050811] font-semibold text-sm transition-colors whitespace-nowrap"
            >
              Dépôt
            </button>
            <button
              type="button"
              onClick={() => navigateTo('withdraw')}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#0F1B33]/90 hover:bg-[#16274A] border border-[#2B4375] text-white font-semibold text-sm transition-colors whitespace-nowrap"
            >
              Retrait
            </button>
          </div>

          <div className="grid grid-cols-2 border-t border-white/10 pt-3 gap-2">
            <button
              type="button"
              onClick={onOpenEditProfile}
              className="py-2 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-[#CBD5E1] hover:text-white transition-colors whitespace-nowrap"
            >
              <UserPen className="w-4 h-4 text-[#60A5FA]" />
              <span>Modifier le profil</span>
            </button>
            <button
              type="button"
              onClick={handleCopyInvite}
              className="py-2 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-[#CBD5E1] hover:text-white border-l border-white/10 transition-colors whitespace-nowrap"
            >
              <Copy className="w-4 h-4 text-[#60A5FA]" />
              <span>Code : {profile.inviteCode}</span>
            </button>
          </div>
        </div>
      </section>

      {/* MON COMPTE */}
      <section className="space-y-2.5">
        <h3 className="text-xs font-semibold tracking-wider text-[#94A3B8]">MON COMPTE</h3>
        <div className="rounded-2xl bg-[#0B1222] border border-[#1B2947] p-4 grid grid-cols-3 sm:grid-cols-5 gap-3">
          {[
            { label: 'Mes lignes', icon: Layers, action: () => navigateTo('my-lines') },
            {
              label: 'Compte de retrait',
              icon: CreditCard,
              action: () => navigateTo('withdraw-account'),
            },
            {
              label: 'Historique des dépôts',
              icon: Receipt,
              action: () => navigateTo('deposit-history'),
            },
            {
              label: 'Historique des retraits',
              icon: FileText,
              action: () => navigateTo('withdraw-history'),
            },
            {
              label: 'Historique des fonds',
              icon: Wallet,
              action: () => navigateTo('fund-history'),
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={item.action}
                className="flex flex-col items-center text-center p-2.5 rounded-xl hover:bg-[#101A30] transition-colors group"
              >
                <div className="w-11 h-11 rounded-xl bg-[#101A30] border border-[#1E2E4E] group-hover:border-[#3B82F6]/50 flex items-center justify-center mb-2 transition-colors">
                  <Icon className="w-5 h-5 text-[#60A5FA]" />
                </div>
                <span className="text-xs font-medium text-[#CBD5E1] group-hover:text-white leading-snug">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ACTIVITÉS */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold tracking-wider text-[#94A3B8]">ACTIVITÉS</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <button
            type="button"
            onClick={performCheckIn}
            className="rounded-2xl bg-[#0B1222] border border-[#1B2947] hover:border-[#3B82F6]/50 p-4 flex items-center justify-between gap-4 text-left transition-colors"
          >
            <div>
              <h4 className="font-display text-base font-bold text-white">Pointage quotidien</h4>
              <p className="text-xs text-[#94A3B8] mt-1">
                {canCheckInToday
                  ? 'Réclamez vos +50 FCFA quotidiens'
                  : 'Récompense réclamée aujourd’hui'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#111D38] border border-[#243963] flex items-center justify-center shrink-0">
              <CalendarCheck className="w-6 h-6 text-[#60A5FA]" />
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenGiftCode}
            className="rounded-2xl bg-[#0B1222] border border-[#1B2947] hover:border-[#3B82F6]/50 p-4 flex items-center justify-between gap-4 text-left transition-colors"
          >
            <div>
              <h4 className="font-display text-base font-bold text-white">Code cadeau</h4>
              <p className="text-xs text-[#94A3B8] mt-1">Utiliser un code promotionnel</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#111D38] border border-[#243963] flex items-center justify-center shrink-0">
              <Gift className="w-6 h-6 text-[#60A5FA]" />
            </div>
          </button>
        </div>

        {/* Roue de la chance banner */}
        <button
          type="button"
          onClick={() => navigateTo('wheel')}
          className="w-full rounded-2xl bg-gradient-to-r from-[#173680] via-[#10265C] to-[#08122B] border border-[#3B82F6]/30 p-5 flex items-center justify-between gap-4 text-left hover:border-[#60A5FA]/60 transition-colors"
        >
          <div>
            <h4 className="font-display text-lg font-bold text-white">Roue de la chance</h4>
            <p className="text-xs text-[#DBEAFE] mt-1">
              Tournez pour gagner des prix jusqu’à 30 000 FCFA
            </p>
          </div>
          <div className="w-14 h-14 shrink-0">
            <svg viewBox="0 0 120 120" className="w-full h-full" aria-hidden="true">
              <circle cx="60" cy="60" r="52" fill="#070E20" stroke="#93C5FD" strokeWidth="5" />
              <path d="M60 60 L60 12 A48 48 0 0 1 108 60 Z" fill="#2563EB" />
              <path d="M60 60 L60 108 A48 48 0 0 1 12 60 Z" fill="#3B82F6" />
              <circle cx="60" cy="60" r="14" fill="#FFFFFF" />
              <circle cx="60" cy="60" r="6" fill="#050811" />
            </svg>
          </div>
        </button>
      </section>

      {/* SERVICES */}
      <section className="space-y-2.5">
        <h3 className="text-xs font-semibold tracking-wider text-[#94A3B8]">SERVICES</h3>
        <div className="rounded-2xl bg-[#0B1222] border border-[#1B2947] divide-y divide-[#18243E]">
          {[
            {
              label: 'Comment ça marche',
              icon: HelpCircle,
              action: () => navigateTo('how-it-works'),
            },
            {
              label: 'Sécurité du compte',
              icon: Shield,
              action: () => navigateTo('security'),
            },
            {
              label: 'À propos',
              icon: Info,
              action: () => navigateTo('about'),
            },
          ].map((row) => {
            const Icon = row.icon;
            return (
              <button
                key={row.label}
                type="button"
                onClick={row.action}
                className="w-full px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-[#101A30] transition-colors first:rounded-t-2xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#101A30] border border-[#1E2E4E] flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[#60A5FA]" />
                  </div>
                  <span className="text-sm font-medium text-white">{row.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#64748B]" />
              </button>
            );
          })}

          <button
            type="button"
            onClick={() =>
              setLanguage(profile.language === 'Français' ? 'English' : 'Français')
            }
            className="w-full px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-[#101A30] transition-colors rounded-b-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#101A30] border border-[#1E2E4E] flex items-center justify-center">
                <Globe className="w-4 h-4 text-[#60A5FA]" />
              </div>
              <span className="text-sm font-medium text-white">Langue</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
              <span>{profile.language}</span>
              <ChevronRight className="w-4 h-4 text-[#64748B]" />
            </div>
          </button>
        </div>
      </section>

      {/* SESSION */}
      <button
        type="button"
        onClick={logout}
        className="w-full px-4 py-3 rounded-xl bg-[#0B1222] hover:bg-[#1F0B10] border border-[#1B2947] hover:border-[#EF4444]/40 text-sm font-semibold text-[#FCA5A5] inline-flex items-center justify-center gap-2 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span>Déconnexion</span>
      </button>
    </div>
  );
}
