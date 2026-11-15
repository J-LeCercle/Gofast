import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Inbox,
  QrCode,
  Share2,
  Ticket,
  Trophy,
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { TEAM_TIERS, formatFCFA } from '../data/gofastData';
import { GOFAST_IMAGES } from '../data/assets';
import { SafeImage } from './BrandMark';

export function TeamView({ onOpenQR }: { onOpenQR: () => void }) {
  const {
    profile,
    teamMembers,
    teamInvestmentTotal,
    weeklyCommissionTotal,
    claimedTiers,
    claimTierBonus,
    applyReferralCodeAfterSignup,
    showToast,
  } = useAppState();

  const [levelTab, setLevelTab] = useState<1 | 2 | 3>(1);
  const [showCommissionInfo, setShowCommissionInfo] = useState(false);
  const [showTierRules, setShowTierRules] = useState(false);
  const [sponsorInput, setSponsorInput] = useState('');
  const [linkingSponsor, setLinkingSponsor] = useState(false);
  const [sponsorFeedback, setSponsorFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const referralUrl = `${window.location.origin}/?code=${profile.inviteCode}`;

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label} copié dans le presse-papiers.`, 'success');
    } catch {
      showToast(`${label} : ${text}`, 'info');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rejoignez GoFast',
          text: `Rejoignez GoFast avec mon code d’invitation : ${profile.inviteCode}`,
          url: referralUrl,
        });
        return;
      } catch {
        // Fallback to copy
      }
    }
    await handleCopy(referralUrl, 'Lien d’invitation');
  };

  const handleBindSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorInput.trim()) return;
    setLinkingSponsor(true);
    const res = await applyReferralCodeAfterSignup(sponsorInput);
    setLinkingSponsor(false);
    setSponsorFeedback({ ok: res.ok, msg: res.message });
    if (res.ok) setSponsorInput('');
  };

  const level1Members = teamMembers.filter((m) => m.level === 1);
  const level2Members = teamMembers.filter((m) => m.level === 2);
  const level3Members = teamMembers.filter((m) => m.level === 3);
  const displayedMembers = teamMembers.filter((m) => m.level === levelTab);

  const nextTier = TEAM_TIERS.find((t) => !claimedTiers.includes(t.tier)) || TEAM_TIERS[0];
  const remainingAmount = Math.max(0, nextTier.threshold - teamInvestmentTotal);
  const progressPct = Math.min(100, Math.round((teamInvestmentTotal / nextTier.threshold) * 100));

  return (
    <div className="space-y-6">
      {/* Dark Bleu Noir Team Hero */}
      <section className="relative rounded-2xl overflow-hidden border border-[#1B2947] bg-[#091124] p-6 sm:p-7">
        <SafeImage
          src={GOFAST_IMAGES.heroOperations}
          alt="Construisez votre équipe GoFast"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050811] via-[#081024]/90 to-[#0B1733]/75" />

        <div className="relative z-10 max-w-2xl">
          <p className="text-xs font-medium text-[#60A5FA]">Mon équipe</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1 [text-wrap:balance]">
            Construisez votre équipe
          </h2>
          <p className="text-sm text-[#CBD5E1] mt-2 leading-relaxed">
            Partagez votre code d’invitation. Chaque membre qui s’inscrit avec ce code rejoint
            automatiquement votre équipe et déclenche des commissions sur 3 niveaux.
          </p>

          <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <span className="text-xs text-[#94A3B8]">Total commissions</span>
              <p className="font-display text-xl font-bold text-white tabular-nums mt-0.5">
                {formatFCFA(weeklyCommissionTotal)}
              </p>
            </div>
            <p className="text-xs text-[#94A3B8]">
              La commission est créditée dès qu’un membre de votre équipe lance une ligne.
            </p>
          </div>
        </div>
      </section>

      {/* Invitation Code + Commission Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Invitation Card */}
        <section className="lg:col-span-6 rounded-2xl bg-[#0B1222] border border-[#1B2947] p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-[#94A3B8]">
                CODE D’INVITATION
              </span>
              <button
                type="button"
                onClick={() => handleCopy(profile.inviteCode, 'Code d’invitation')}
                className="text-xs font-semibold text-[#60A5FA] hover:text-[#93C5FD] transition-colors"
              >
                Copier
              </button>
            </div>

            <div className="mt-3 font-mono text-3xl font-bold tracking-[0.22em] text-white">
              {profile.inviteCode || '------'}
            </div>
            <p className="text-xs text-[#94A3B8] mt-2">
              Les membres qui s’inscrivent via ce code ou lien rejoignent votre niveau 1.
            </p>

            <div className="mt-5 flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-[#070B16] border border-[#18243E]">
              <span className="font-mono text-xs text-[#CBD5E1] truncate">{referralUrl}</span>
              <button
                type="button"
                onClick={() => handleCopy(referralUrl, 'Lien d’invitation')}
                aria-label="Copier le lien"
                className="p-1.5 text-[#94A3B8] hover:text-white shrink-0"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleShare}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#3B82F6] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
            >
              <Share2 className="w-4 h-4" />
              <span>Partager</span>
            </button>
            <button
              type="button"
              onClick={onOpenQR}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#101A30] hover:bg-[#172542] border border-[#243963] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
            >
              <QrCode className="w-4 h-4 text-[#60A5FA]" />
              <span>Code QR</span>
            </button>
          </div>
        </section>

        {/* Three-level commission */}
        <section className="lg:col-span-6 rounded-2xl bg-[#0B1222] border border-[#1B2947] p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium text-[#60A5FA]">Comment vous gagnez</p>
            <h3 className="font-display text-lg font-bold text-white mt-0.5">
              Commission sur trois niveaux
            </h3>

            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-full bg-[#1D4ED8] text-white text-xs font-bold flex items-center justify-center">
                    N1
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">Niveau 1 (direct)</p>
                    <p className="text-xs text-[#94A3B8] tabular-nums">
                      {level1Members.length} {level1Members.length > 1 ? 'personnes' : 'personne'}
                    </p>
                  </div>
                </div>
                <span className="font-display text-xl font-bold text-[#60A5FA] tabular-nums">
                  37 %
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-full bg-[#111D38] border border-[#243963] text-[#CBD5E1] text-xs font-bold flex items-center justify-center">
                    N2
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">Niveau 2</p>
                    <p className="text-xs text-[#94A3B8] tabular-nums">
                      {level2Members.length} {level2Members.length > 1 ? 'personnes' : 'personne'}
                    </p>
                  </div>
                </div>
                <span className="font-display text-xl font-bold text-white tabular-nums">2 %</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-full bg-[#111D38] border border-[#243963] text-[#CBD5E1] text-xs font-bold flex items-center justify-center">
                    N3
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">Niveau 3</p>
                    <p className="text-xs text-[#94A3B8] tabular-nums">
                      {level3Members.length} {level3Members.length > 1 ? 'personnes' : 'personne'}
                    </p>
                  </div>
                </div>
                <span className="font-display text-xl font-bold text-white tabular-nums">1 %</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#18243E]">
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Gagnez une commission à chaque investissement de votre équipe : 37 % sur le niveau 1,
              2 % sur le niveau 2 et 1 % sur le niveau 3.
            </p>
            {showCommissionInfo && (
              <p className="text-xs text-[#CBD5E1] mt-2 leading-relaxed">
                Dès qu’un membre inscrit avec votre code active une ligne, votre solde et vos
                statistiques d’équipe sont mis à jour automatiquement en temps réel.
              </p>
            )}
            <button
              type="button"
              onClick={() => setShowCommissionInfo((v) => !v)}
              className="mt-2 text-xs font-semibold text-[#60A5FA] hover:text-[#93C5FD]"
            >
              {showCommissionInfo ? 'Moins' : 'Plus'}
            </button>
          </div>
        </section>
      </div>

      {/* Bind sponsor code if user hasn't linked one yet */}
      {!profile.referredByUid ? (
        <section className="rounded-2xl bg-[#0B1222] border border-[#1B2947] p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <Ticket className="w-4 h-4 text-[#60A5FA]" />
            <h3 className="font-display text-sm font-bold text-white">
              Vous avez un code de parrainage ?
            </h3>
          </div>
          <form onSubmit={handleBindSponsor} className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={sponsorInput}
              onChange={(e) => setSponsorInput(e.target.value.toUpperCase())}
              placeholder="Entrez le code de votre parrain"
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#070B16] border border-[#1E2E4E] text-sm font-mono uppercase text-white placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6]"
            />
            <button
              type="submit"
              disabled={linkingSponsor || !sponsorInput.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#3B82F6] text-white text-xs font-semibold transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {linkingSponsor ? 'Validation...' : 'Rejoindre cette équipe'}
            </button>
          </form>
          {sponsorFeedback && (
            <p
              className={`text-xs font-medium ${
                sponsorFeedback.ok ? 'text-[#34D399]' : 'text-[#FCA5A5]'
              }`}
            >
              {sponsorFeedback.msg}
            </p>
          )}
        </section>
      ) : (
        <section className="rounded-2xl bg-[#0B1222] border border-[#1B2947] px-5 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-[#CBD5E1]">
            <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
            <span>
              Votre parrain : <strong className="text-white">{profile.referredByName}</strong> (
              <span className="font-mono text-[#60A5FA]">{profile.referredByCode}</span>)
            </span>
          </div>
        </section>
      )}

      {/* Bonus de palier d'équipe */}
      <section className="rounded-2xl bg-[#0B1222] border border-[#1B2947] p-5 sm:p-6 space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#111D38] border border-[#243963] flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5 text-[#60A5FA]" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-white">
              Bonus de palier d’équipe
            </h3>
            <p className="text-xs text-[#94A3B8] mt-1">
              Recevez un bonus unique chaque fois que l’investissement total de votre équipe atteint
              un nouveau palier.
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-[#070B16] border border-[#18243E] p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#94A3B8]">Investissement de l’équipe</span>
            <span className="font-display font-bold text-white tabular-nums">
              {formatFCFA(teamInvestmentTotal)}
            </span>
          </div>

          <div className="h-2 rounded-full bg-[#111D38] overflow-hidden">
            <div
              className="h-full bg-[#2563EB] rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-white font-medium tabular-nums">
              Encore {formatFCFA(remainingAmount)}
            </span>
            <span className="text-[#60A5FA] font-medium tabular-nums">
              Prochain bonus +{formatFCFA(nextTier.bonus)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-[#94A3B8] tabular-nums">
            {claimedTiers.length}/8 réclamés
          </span>
          <button
            type="button"
            onClick={() => setShowTierRules((v) => !v)}
            className="text-xs font-semibold text-[#60A5FA] hover:text-[#93C5FD] inline-flex items-center gap-1"
          >
            <span>Règles et paliers</span>
            {showTierRules ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showTierRules && (
          <div className="pt-3 border-t border-[#18243E] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {TEAM_TIERS.map((t) => {
              const reached = teamInvestmentTotal >= t.threshold;
              const claimed = claimedTiers.includes(t.tier);
              return (
                <div
                  key={t.tier}
                  className="p-3 rounded-xl bg-[#070B16] border border-[#18243E] flex items-center justify-between gap-2"
                >
                  <div>
                    <p className="text-xs text-[#94A3B8] tabular-nums">
                      Palier {t.tier} · {formatFCFA(t.threshold)}
                    </p>
                    <p className="text-sm font-bold text-white tabular-nums mt-0.5">
                      +{formatFCFA(t.bonus)}
                    </p>
                  </div>
                  {claimed ? (
                    <span className="text-xs font-semibold text-[#10B981]">Réclamé</span>
                  ) : reached ? (
                    <button
                      type="button"
                      onClick={() => claimTierBonus(t.tier)}
                      className="px-2.5 py-1 rounded-lg bg-[#2563EB] text-white text-xs font-semibold"
                    >
                      Réclamer
                    </button>
                  ) : (
                    <span className="text-xs text-[#64748B]">Verrouillé</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Membres de l'équipe */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold tracking-wider text-[#94A3B8]">
          MEMBRES DE L’ÉQUIPE
        </h3>

        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#0B1222] border border-[#1B2947]">
          {([1, 2, 3] as const).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setLevelTab(lvl)}
              className={`py-2 rounded-lg text-sm font-semibold transition-colors ${
                levelTab === lvl ? 'bg-[#1D4ED8] text-white' : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              L{lvl}
            </button>
          ))}
        </div>

        <div className="rounded-2xl bg-[#0B1222] border border-[#1B2947] p-6">
          {displayedMembers.length === 0 ? (
            <div className="py-8 flex flex-col items-center text-center max-w-sm mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-[#101A30] border border-[#1E2E4E] flex items-center justify-center mb-3">
                <Inbox className="w-5 h-5 text-[#64748B]" />
              </div>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                Pas encore de membres. Partagez votre code d’invitation pour lancer votre équipe.
              </p>
              <button
                type="button"
                onClick={handleShare}
                className="mt-4 px-6 py-2.5 rounded-xl bg-[#101A30] hover:bg-[#172542] border border-[#243963] text-sm font-semibold text-white transition-colors"
              >
                Partager
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#18243E]">
              {displayedMembers.map((member) => (
                <div
                  key={member.id}
                  className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{member.name}</p>
                    <p className="text-xs text-[#94A3B8] font-mono tabular-nums mt-0.5">
                      {member.phone} · Investi {formatFCFA(member.investedAmount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#34D399] tabular-nums">
                      +{formatFCFA(member.commissionEarned)}
                    </p>
                    <p className="text-xs text-[#64748B]">Commission L{member.level}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
