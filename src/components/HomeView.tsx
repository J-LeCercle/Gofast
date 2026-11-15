import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Bell,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  Pause,
  Play,
  TrendingUp,
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import {
  ACTIVITIES_SHOWCASE,
  HERO_SLIDES,
  PRODUCTION_LINES,
  formatFCFA,
} from '../data/gofastData';
import { GOFAST_IMAGES } from '../data/assets';
import { SafeImage } from './BrandMark';

export function HomeView() {
  const {
    balance,
    hideBalance,
    toggleHideBalance,
    totalDailyIncome,
    checkInDays,
    canCheckInToday,
    performCheckIn,
    deposits,
    activeLines,
    claimableLines,
    claimableDailyTotal,
    collectAllLineIncome,
    messages,
    teamMembers,
    navigateTo,
    setActiveTab,
    setSelectedLineForModal,
  } = useAppState();

  const unreadMessages = messages.filter((m) => !m.read);
  const latestUnread = unreadMessages[0] || null;

  const [slideIdx, setSlideIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [paused]);

  const currentSlide = HERO_SLIDES[slideIdx];
  const step1Done = deposits.length > 0;
  const step2Done = activeLines.length > 0;
  const step3Done = teamMembers.length > 0;
  const completedSteps = [step1Done, step2Done, step3Done].filter(Boolean).length;

  const handleSlideAction = () => {
    if (currentSlide.targetView === 'lines') {
      setActiveTab('lines');
    } else {
      navigateTo(currentSlide.targetView);
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-time Daily Yield & Unread Alerts Strip */}
      {(claimableLines.length > 0 || latestUnread) && (
        <div className="space-y-2.5">
          {claimableLines.length > 0 && (
            <div className="rounded-2xl bg-[#071B16] border border-[#10B981]/35 p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#0B2C22] border border-[#10B981]/40 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-[#34D399]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white">
                    Gains quotidiens disponibles : +{formatFCFA(claimableDailyTotal)}
                  </p>
                  <p className="text-xs text-[#A7F3D0]">
                    {claimableLines.length} ligne{claimableLines.length > 1 ? 's actives prêtes' : ' active prête'} à être récoltée{claimableLines.length > 1 ? 's' : ''} aujourd’hui.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={collectAllLineIncome}
                className="min-h-[40px] px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-[#04100C] text-xs font-bold transition-colors whitespace-nowrap"
              >
                Récolter +{formatFCFA(claimableDailyTotal)}
              </button>
            </div>
          )}

          {latestUnread && (
            <button
              type="button"
              onClick={() => navigateTo('messages')}
              className="w-full rounded-2xl bg-[#0B152B] border border-[#2563EB]/40 hover:border-[#3B82F6] px-4 py-3 flex items-center justify-between gap-3 text-left transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#111D38] border border-[#2563EB]/40 flex items-center justify-center shrink-0 relative">
                  <Bell className="w-4 h-4 text-[#60A5FA]" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">
                    {latestUnread.title}
                  </p>
                  <p className="text-xs text-[#94A3B8] truncate">{latestUnread.body}</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#60A5FA] whitespace-nowrap shrink-0">
                {unreadMessages.length > 1 ? `Voir (${unreadMessages.length})` : 'Voir'}
              </span>
            </button>
          )}
        </div>
      )}

      {/* Row 1: Hero Carousel + Solde Wallet Card (balanced 12-col split on desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Hero Carousel */}
        <section className="lg:col-span-7 relative rounded-2xl overflow-hidden border border-[#1B2947] bg-[#0B1222] min-h-[260px] sm:min-h-[300px] flex flex-col justify-end">
          <SafeImage
            src={currentSlide.image}
            alt={currentSlide.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#040710] via-[#060C1B]/75 to-[#060C1B]/30" />

          <div className="relative z-10 p-6 sm:p-7 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium tracking-wide text-[#93C5FD]">
                {currentSlide.kicker}
              </span>
              <span className="font-mono text-xs tabular-nums text-[#CBD5E1]">
                0{slideIdx + 1} / 0{HERO_SLIDES.length}
              </span>
            </div>

            <div className="mt-10 sm:mt-14 max-w-lg">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight [text-wrap:balance]">
                {currentSlide.title}
              </h2>
              <p className="mt-2 text-sm text-[#CBD5E1] leading-relaxed">
                {currentSlide.subtitle}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleSlideAction}
                className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-[#93C5FD] transition-colors whitespace-nowrap"
              >
                <span>En savoir plus</span>
                <span className="w-7 h-7 rounded-full border border-white/30 flex items-center justify-center">
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  {HERO_SLIDES.map((s, idx) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSlideIdx(idx)}
                      aria-label={`Diapositive ${idx + 1}`}
                      className={`h-1 rounded-full transition-all ${
                        idx === slideIdx ? 'w-6 bg-[#3B82F6]' : 'w-3 bg-white/30 hover:bg-white/50'
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setPaused((p) => !p)}
                  aria-label={paused ? 'Reprendre le carrousel' : 'Mettre en pause'}
                  className="p-1.5 text-white/70 hover:text-white transition-colors"
                >
                  {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Solde Card (Deep Bleu Noir focal wallet card) */}
        <section className="lg:col-span-5 rounded-2xl bg-gradient-to-br from-[#0D172E] via-[#091022] to-[#060A15] border border-[#1E3258] p-6 flex flex-col justify-between shadow-lg shadow-black/40">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-[#94A3B8]">SOLDE</span>
              <button
                type="button"
                onClick={toggleHideBalance}
                aria-label={hideBalance ? 'Afficher le solde' : 'Masquer le solde'}
                className="p-2 -mr-2 text-[#94A3B8] hover:text-white rounded-lg transition-colors"
              >
                {hideBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-3xl sm:text-4xl font-bold text-white tabular-nums">
                {hideBalance ? '••••' : formatFCFA(balance).replace(' FCFA', '')}
              </span>
              <span className="text-base font-semibold text-[#60A5FA]">FCFA</span>
            </div>

            <div className="mt-3 flex items-center gap-2 text-sm text-[#94A3B8]">
              <span>Revenus du jour</span>
              <span className="font-mono font-medium text-white tabular-nums">
                {hideBalance ? '••• FCFA' : formatFCFA(totalDailyIncome)}
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => navigateTo('recharge')}
              className="min-h-[46px] px-4 py-2.5 rounded-xl bg-white hover:bg-[#EFF6FF] text-[#050811] font-semibold text-sm transition-colors whitespace-nowrap"
            >
              Dépôt
            </button>
            <button
              type="button"
              onClick={() => navigateTo('withdraw')}
              className="min-h-[46px] px-4 py-2.5 rounded-xl bg-[#131F3A] hover:bg-[#1B2C52] border border-[#2A406F] text-white font-semibold text-sm transition-colors whitespace-nowrap"
            >
              Retrait
            </button>
          </div>
        </section>
      </div>

      {/* Row 2: Nos activités - Ce que nous construisons */}
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-[#60A5FA]">Nos activités</p>
            <h2 className="font-display text-xl font-bold text-white">Ce que nous construisons</h2>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('lines')}
            className="text-xs font-semibold text-[#60A5FA] hover:text-[#93C5FD] inline-flex items-center gap-1 whitespace-nowrap"
          >
            <span>Tout voir</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-3.5 overflow-x-auto pb-2 snap-x">
          {ACTIVITIES_SHOWCASE.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab('lines')}
              className="snap-start shrink-0 w-64 sm:w-72 h-40 relative rounded-2xl overflow-hidden border border-[#1B2947] bg-[#0B1222] text-left group"
            >
              <SafeImage
                src={item.image}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#040710]/95 via-[#060C1B]/65 to-[#060C1B]/30" />
              <div className="relative z-10 h-full p-4 flex flex-col justify-between">
                <span className="font-mono text-xs tabular-nums text-[#CBD5E1]">{item.index}</span>
                <div>
                  <h3 className="font-display text-base font-bold text-white leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#CBD5E1] line-clamp-2 mt-0.5">{item.subtitle}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Row 3: Pointage quotidien + Premiers pas + Roue de la fortune */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Pointage + Premiers pas */}
        <section className="lg:col-span-7 rounded-2xl bg-[#0B1222] border border-[#1B2947] p-5 flex flex-col justify-between space-y-5">
          {/* Pointage quotidien */}
          <div className="flex items-center justify-between gap-4 pb-5 border-b border-[#18243E]">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#111D38] border border-[#243963] flex items-center justify-center shrink-0">
                <CalendarCheck className="w-5 h-5 text-[#60A5FA]" />
              </div>
              <div>
                <h3 className="font-display text-sm font-semibold text-white">Pointage quotidien</h3>
                <p className="text-xs text-[#94A3B8] tabular-nums mt-0.5">
                  {checkInDays} {checkInDays > 1 ? 'jours' : 'jour'} au total
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={performCheckIn}
              disabled={!canCheckInToday}
              className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                canCheckInToday
                  ? 'bg-[#2563EB] hover:bg-[#3B82F6] text-white'
                  : 'bg-[#101A30] text-[#64748B] border border-[#1B2947] cursor-default'
              }`}
            >
              {canCheckInToday ? 'Pointer +50 FCFA' : 'Pointé aujourd’hui'}
            </button>
          </div>

          {/* Premiers pas */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-sm font-semibold text-white">Premiers pas</h3>
              <span className="font-mono text-xs tabular-nums text-[#94A3B8]">
                {completedSteps}/3
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 mb-4">
              {[step1Done, step2Done, step3Done].map((done, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full ${done ? 'bg-[#3B82F6]' : 'bg-[#18243E]'}`}
                />
              ))}
            </div>

            <div className="divide-y divide-[#18243E]">
              <button
                type="button"
                onClick={() => navigateTo('recharge')}
                className="w-full py-3 flex items-center justify-between gap-3 text-left hover:bg-[#0F1930]/60 px-2 -mx-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  {step1Done ? (
                    <CheckCircle2 className="w-6 h-6 text-[#10B981] shrink-0" />
                  ) : (
                    <span className="w-6 h-6 rounded-full bg-[#1E3A8A] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      1
                    </span>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-white">Dépôt</p>
                    <p className="text-xs text-[#94A3B8]">Alimentez votre compte</p>
                  </div>
                </div>
                <span className="px-3.5 py-1.5 rounded-lg bg-[#1D4ED8] text-white text-xs font-semibold whitespace-nowrap">
                  {step1Done ? 'Fait' : 'Aller'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('lines')}
                className="w-full py-3 flex items-center justify-between gap-3 text-left hover:bg-[#0F1930]/60 px-2 -mx-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  {step2Done ? (
                    <CheckCircle2 className="w-6 h-6 text-[#10B981] shrink-0" />
                  ) : (
                    <span className="w-6 h-6 rounded-full bg-[#111D38] border border-[#243963] text-[#CBD5E1] text-xs font-bold flex items-center justify-center shrink-0">
                      2
                    </span>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-white">Lancer une ligne</p>
                    <p className="text-xs text-[#94A3B8]">Choisissez votre première ligne</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#64748B] shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('team')}
                className="w-full py-3 flex items-center justify-between gap-3 text-left hover:bg-[#0F1930]/60 px-2 -mx-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  {step3Done ? (
                    <CheckCircle2 className="w-6 h-6 text-[#10B981] shrink-0" />
                  ) : (
                    <span className="w-6 h-6 rounded-full bg-[#111D38] border border-[#243963] text-[#CBD5E1] text-xs font-bold flex items-center justify-center shrink-0">
                      3
                    </span>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-white">Inviter</p>
                    <p className="text-xs text-[#94A3B8]">Partagez votre code d’invitation</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#64748B] shrink-0" />
              </button>
            </div>
          </div>
        </section>

        {/* Roue de la fortune Banner */}
        <section className="lg:col-span-5 rounded-2xl bg-gradient-to-br from-[#173680] via-[#0F2457] to-[#08122B] border border-[#3B82F6]/30 p-6 flex items-center justify-between gap-4 relative overflow-hidden">
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
              <p className="text-xs font-semibold tracking-wider text-[#93C5FD]">
                ROUE DE LA FORTUNE
              </p>
              <h3 className="font-display text-2xl font-bold text-white mt-2 leading-tight [text-wrap:balance]">
                Gagnez jusqu’à 30 000 FCFA
              </h3>
              <p className="text-xs text-[#DBEAFE] mt-2">
                Un tour offert à chaque produit acheté
              </p>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => navigateTo('wheel')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#EFF6FF] text-[#050811] text-sm font-semibold transition-colors whitespace-nowrap"
              >
                <span>Découvrir</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Crisp Blue-Black Geometric Wheel Graphic */}
          <div className="shrink-0 w-28 h-28 sm:w-32 sm:h-32 opacity-95">
            <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-xl" aria-hidden="true">
              <circle cx="60" cy="60" r="54" fill="#070E20" stroke="#93C5FD" strokeWidth="4" />
              <path d="M60 60 L60 10 A50 50 0 0 1 95.3 24.7 Z" fill="#2563EB" />
              <path d="M60 60 L95.3 24.7 A50 50 0 0 1 110 60 Z" fill="#0F1C3A" />
              <path d="M60 60 L110 60 A50 50 0 0 1 95.3 95.3 Z" fill="#3B82F6" />
              <path d="M60 60 L95.3 95.3 A50 50 0 0 1 60 110 Z" fill="#0F1C3A" />
              <path d="M60 60 L60 110 A50 50 0 0 1 24.7 95.3 Z" fill="#2563EB" />
              <path d="M60 60 L24.7 95.3 A50 50 0 0 1 10 60 Z" fill="#0F1C3A" />
              <path d="M60 60 L10 60 A50 50 0 0 1 24.7 24.7 Z" fill="#3B82F6" />
              <path d="M60 60 L24.7 24.7 A50 50 0 0 1 60 10 Z" fill="#0F1C3A" />
              <circle cx="60" cy="60" r="14" fill="#050811" stroke="#EFF6FF" strokeWidth="3" />
              <circle cx="60" cy="60" r="5" fill="#60A5FA" />
              <polygon points="60,2 53,16 67,16" fill="#FFFFFF" />
            </svg>
          </div>
        </section>
      </div>

      {/* Row 4: Lignes recommandées */}
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-[#60A5FA]">Lignes de production</p>
            <h2 className="font-display text-xl font-bold text-white">Lignes recommandées</h2>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('lines')}
            className="text-xs font-semibold text-[#60A5FA] hover:text-[#93C5FD] inline-flex items-center gap-1 whitespace-nowrap"
          >
            <span>Tout voir</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="rounded-2xl bg-[#0B1222] border border-[#1B2947] divide-y divide-[#18243E]">
          {PRODUCTION_LINES.slice(0, 3).map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelectedLineForModal(plan)}
              className="w-full p-4 flex items-center justify-between gap-4 text-left hover:bg-[#0F1930]/70 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <SafeImage
                  src={plan.image}
                  alt={plan.name}
                  className="w-16 h-12 sm:w-20 sm:h-14 rounded-xl object-cover border border-[#1B2947] shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs text-[#94A3B8] truncate">
                    {plan.categoryLabel}
                    <span className="mx-1.5" aria-hidden="true">
                      ·
                    </span>
                    <span className="text-[#60A5FA] font-medium">{plan.planCode}</span>
                  </p>
                  <h3 className="font-display text-sm sm:text-base font-bold text-white truncate mt-0.5">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-[#94A3B8] tabular-nums mt-0.5">
                    {formatFCFA(plan.price)} · {plan.durationDays} jours
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="font-display text-sm sm:text-base font-bold text-white tabular-nums">
                  {formatFCFA(plan.dailyIncome)}
                </p>
                <p className="text-xs text-[#64748B]">par jour</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Row 5: À propos Feature Banner */}
      <section className="relative rounded-2xl overflow-hidden border border-[#1B2947] bg-[#0B1222] min-h-[220px] flex flex-col justify-end">
        <SafeImage
          src={GOFAST_IMAGES.aboutTech}
          alt="Une technologie au service du quotidien"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040710] via-[#060C1B]/75 to-transparent" />
        <div className="relative z-10 p-6 sm:p-8 max-w-xl">
          <p className="text-xs font-medium tracking-wider text-[#93C5FD]">À propos</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1.5 leading-tight [text-wrap:balance]">
            Une technologie au service du quotidien
          </h2>
          <button
            type="button"
            onClick={() => navigateTo('about')}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-[#93C5FD] transition-colors whitespace-nowrap"
          >
            <span>En savoir plus</span>
            <span className="w-7 h-7 rounded-full border border-white/30 flex items-center justify-center">
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>
      </section>
    </div>
  );
}
