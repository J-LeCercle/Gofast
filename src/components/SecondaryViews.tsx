import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  BellOff,
  BellRing,
  CheckCheck,
  CheckCircle2,
  Inbox,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserPlus,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { WHEEL_PRIZES, formatFCFA } from '../data/gofastData';
import { SystemMessage } from '../types';

function classifyMessage(msg: SystemMessage): 'earnings' | 'referral' | 'system' {
  if (msg.category === 'earnings') return 'earnings';
  if (msg.category === 'referral') return 'referral';
  const title = msg.title.toLowerCase();
  if (msg.category === 'info') {
    if (title.includes('membre') || title.includes('filleul')) return 'referral';
    if (
      title.includes('pointage') ||
      title.includes('gain') ||
      title.includes('commission') ||
      title.includes('rendement')
    ) {
      return 'earnings';
    }
  }
  return 'system';
}

export function MessagesView() {
  const {
    messages,
    markNotificationRead,
    markAllMessagesRead,
    browserPushEnabled,
    soundAlertsEnabled,
    toggleBrowserPush,
    toggleSoundAlerts,
    navigateTo,
  } = useAppState();
  const [filter, setFilter] = useState<'all' | 'earnings' | 'referral' | 'system'>('all');

  const unreadCount = messages.filter((m) => !m.read).length;
  const earningsUnread = messages.filter(
    (m) => !m.read && classifyMessage(m) === 'earnings'
  ).length;
  const referralUnread = messages.filter(
    (m) => !m.read && classifyMessage(m) === 'referral'
  ).length;

  const filtered = messages.filter((m) =>
    filter === 'all' ? true : classifyMessage(m) === filter
  );

  return (
    <div className="space-y-4">
      {/* Real-time controls bar */}
      <div className="rounded-2xl bg-[#0B1222] border border-[#1B2947] p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse shrink-0" />
          <span className="text-xs font-semibold text-white">
            Alertes en temps réel actives
          </span>
          {unreadCount > 0 && (
            <span className="text-xs text-[#60A5FA] font-mono tabular-nums">
              · {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={toggleSoundAlerts}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
              soundAlertsEnabled
                ? 'bg-[#101A30] border-[#2563EB]/40 text-white'
                : 'bg-[#070B16] border-[#1B2947] text-[#94A3B8]'
            }`}
          >
            {soundAlertsEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-[#60A5FA]" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
            <span>{soundAlertsEnabled ? 'Son actif' : 'Son coupé'}</span>
          </button>

          <button
            type="button"
            onClick={toggleBrowserPush}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
              browserPushEnabled
                ? 'bg-[#071B16] border-[#10B981]/40 text-[#A7F3D0]'
                : 'bg-[#070B16] border-[#1B2947] text-[#CBD5E1] hover:border-[#3B82F6]'
            }`}
          >
            {browserPushEnabled ? (
              <BellRing className="w-3.5 h-3.5 text-[#34D399]" />
            ) : (
              <BellOff className="w-3.5 h-3.5 text-[#94A3B8]" />
            )}
            <span>{browserPushEnabled ? 'Push navigateur actif' : 'Activer alertes navigateur'}</span>
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllMessagesRead}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#3B82F6] text-white text-xs font-semibold transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Tout lire</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-5 border-b border-[#18243E] overflow-x-auto">
        {[
          { id: 'all' as const, label: 'Tout', count: unreadCount },
          { id: 'earnings' as const, label: 'Gains quotidiens', count: earningsUnread },
          { id: 'referral' as const, label: 'Filleuls', count: referralUnread },
          { id: 'system' as const, label: 'Système', count: 0 },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors inline-flex items-center gap-1.5 ${
              filter === tab.id
                ? 'border-[#3B82F6] text-white'
                : 'border-transparent text-[#94A3B8] hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-[#1D4ED8] text-white text-[10px] font-bold tabular-nums leading-none">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#0B1222] border border-[#1B2947] flex items-center justify-center mb-3">
            <Inbox className="w-5 h-5 text-[#64748B]" />
          </div>
          <p className="text-sm text-[#94A3B8]">Aucune notification dans cette catégorie</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((msg) => {
            const kind = classifyMessage(msg);
            return (
              <article
                key={msg.id}
                onClick={() => {
                  if (!msg.read) markNotificationRead(msg.id);
                }}
                className={`rounded-2xl border p-4 transition-colors ${
                  msg.read
                    ? 'bg-[#0B1222] border-[#1B2947]'
                    : 'bg-[#0F1B33] border-[#3B82F6]/50 cursor-pointer'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      kind === 'earnings'
                        ? 'bg-[#071B16] border border-[#10B981]/35 text-[#34D399]'
                        : kind === 'referral'
                        ? 'bg-[#101D3B] border border-[#3B82F6]/35 text-[#60A5FA]'
                        : 'bg-[#101A30] border border-[#243963] text-[#94A3B8]'
                    }`}
                  >
                    {kind === 'earnings' ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : kind === 'referral' ? (
                      <UserPlus className="w-4 h-4" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {!msg.read && (
                          <span className="w-2 h-2 rounded-full bg-[#3B82F6] shrink-0" />
                        )}
                        <h3 className="text-sm font-semibold text-white truncate">{msg.title}</h3>
                      </div>
                      <span className="text-xs text-[#64748B] tabular-nums shrink-0">
                        {new Date(msg.createdAt).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">{msg.body}</p>

                    {(kind === 'earnings' || kind === 'referral') && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!msg.read) markNotificationRead(msg.id);
                            if (kind === 'referral') {
                              navigateTo('main', 'team');
                            } else {
                              navigateTo('my-lines');
                            }
                          }}
                          className="text-xs font-semibold text-[#60A5FA] hover:text-[#93C5FD]"
                        >
                          {kind === 'referral' ? 'Voir mon équipe →' : 'Voir mes lignes →'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function SupportChatView() {
  const { chatMessages, sendChatMessage } = useAppState();
  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    sendChatMessage(draft);
    setDraft('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-3xl mx-auto">
      <div className="rounded-xl bg-[#0D162B] border border-[#243963] p-3.5 flex items-start gap-3 mb-4">
        <AlertTriangle className="w-4 h-4 text-[#60A5FA] shrink-0 mt-0.5" />
        <div className="text-xs text-[#CBD5E1] leading-relaxed">
          <span className="font-semibold text-white">09:00–18:00 · Réponse en 5 min environ.</span>{' '}
          En dehors des horaires d’ouverture, votre message est enregistré et traité en priorité.
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-4">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-[#0B1222] border border-[#1B2947] text-[#E2E8F0]'
              }`}
            >
              <p>{msg.text}</p>
              <span className="block text-[10px] opacity-70 mt-1 text-right tabular-nums">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="pt-3 border-t border-[#18243E] flex items-center gap-2.5"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Écrivez votre message..."
          className="flex-1 px-4 py-3 rounded-xl bg-[#0B1222] border border-[#1E2E4E] text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6]"
        />
        <button
          type="submit"
          aria-label="Envoyer"
          className="min-h-[44px] min-w-[44px] px-4 rounded-xl bg-[#2563EB] hover:bg-[#3B82F6] text-white flex items-center justify-center transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

export function WheelView() {
  const { wheelSpins, spinWheel, showToast, setActiveTab, setSubView } = useAppState();
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [lastPrize, setLastPrize] = useState<number | null>(null);

  const segmentAngle = 360 / WHEEL_PRIZES.length;

  const handleSpin = async () => {
    if (spinning) return;
    if (wheelSpins <= 0) {
      showToast('Aucun tour disponible. Lancez une ligne pour recevoir un tour offert.', 'info');
      return;
    }

    setSpinning(true);
    setLastPrize(null);

    const res = await spinWheel();
    if (!res.ok || res.winIndex === undefined || res.prizeAmount === undefined) {
      setSpinning(false);
      showToast(res.error || 'Tirage impossible.', 'error');
      return;
    }

    const winIndex = res.winIndex;
    const prizeAmount = res.prizeAmount;
    const targetSegmentCenter = winIndex * segmentAngle + segmentAngle / 2;
    const nextRotation = rotation + 360 * 5 + (360 - targetSegmentCenter) - (rotation % 360);

    setRotation(nextRotation);

    window.setTimeout(() => {
      setSpinning(false);
      setLastPrize(prizeAmount);
      showToast(`Félicitations ! Vous avez gagné ${formatFCFA(prizeAmount)} !`, 'success');
    }, 3600);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-center">
      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-wider text-[#60A5FA]">ROUE DE LA FORTUNE</p>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
          Gagnez jusqu’à 30 000 FCFA
        </h2>
        <p className="text-sm text-[#94A3B8]">
          Tours disponibles :{' '}
          <span className="font-mono font-bold text-white tabular-nums">{wheelSpins}</span>
        </p>
      </div>

      <div className="relative w-72 h-72 sm:w-80 sm:h-80 mx-auto">
        {/* Pointer */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
            <polygon points="12,22 3,4 21,4" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2" />
          </svg>
        </div>

        <div
          className="w-full h-full rounded-full border-4 border-[#3B82F6] shadow-2xl shadow-blue-950/60 overflow-hidden"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 3.6s cubic-bezier(0.12, 0.85, 0.18, 1)' : 'none',
          }}
        >
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {WHEEL_PRIZES.map((seg, i) => {
              const startAngle = (i * segmentAngle - 90) * (Math.PI / 180);
              const endAngle = ((i + 1) * segmentAngle - 90) * (Math.PI / 180);
              const x1 = 100 + 100 * Math.cos(startAngle);
              const y1 = 100 + 100 * Math.sin(startAngle);
              const x2 = 100 + 100 * Math.cos(endAngle);
              const y2 = 100 + 100 * Math.sin(endAngle);
              const midDeg = i * segmentAngle + segmentAngle / 2;

              return (
                <g key={seg.label}>
                  <path
                    d={`M100,100 L${x1},${y1} A100,100 0 0,1 ${x2},${y2} Z`}
                    fill={seg.color}
                    stroke="#1E3A8A"
                    strokeWidth="0.8"
                  />
                  <text
                    x="100"
                    y="32"
                    fill="#F8FAFC"
                    fontSize="8.5"
                    fontWeight="700"
                    textAnchor="middle"
                    transform={`rotate(${midDeg} 100 100)`}
                  >
                    {seg.amount.toLocaleString('fr-FR')}
                  </text>
                </g>
              );
            })}
            <circle cx="100" cy="100" r="22" fill="#050811" stroke="#60A5FA" strokeWidth="3" />
            <text
              x="100"
              y="103"
              fill="#FFFFFF"
              fontSize="7"
              fontWeight="700"
              textAnchor="middle"
            >
              GOFAST
            </text>
          </svg>
        </div>
      </div>

      {lastPrize !== null && (
        <div className="rounded-xl bg-[#071B16] border border-[#10B981]/40 p-4 inline-flex items-center gap-2 text-sm font-semibold text-[#A7F3D0]">
          <Sparkles className="w-4 h-4 text-[#34D399]" />
          <span>Gain crédité : +{formatFCFA(lastPrize)}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleSpin}
          disabled={spinning || wheelSpins <= 0}
          className={`min-h-[46px] px-8 py-3 rounded-xl font-semibold text-sm transition-colors ${
            spinning || wheelSpins <= 0
              ? 'bg-[#101A30] text-[#64748B] border border-[#1B2947] cursor-not-allowed'
              : 'bg-[#2563EB] hover:bg-[#3B82F6] text-white'
          }`}
        >
          {spinning ? 'Rotation en cours...' : 'Tourner la roue'}
        </button>

        {wheelSpins <= 0 && (
          <button
            type="button"
            onClick={() => {
              setActiveTab('lines');
              setSubView('main');
            }}
            className="min-h-[46px] px-6 py-3 rounded-xl bg-[#0B1222] border border-[#1B2947] text-sm font-semibold text-white hover:border-[#3B82F6]"
          >
            Obtenir un tour (Lancer une ligne)
          </button>
        )}
      </div>
    </div>
  );
}

export function InfoView({ mode }: { mode: 'how-it-works' | 'about' | 'security' }) {
  if (mode === 'how-it-works') {
    return (
      <div className="max-w-3xl space-y-5">
        <h2 className="font-display text-2xl font-bold text-white">
          Comment fonctionne une ligne GoFast
        </h2>
        <div className="space-y-3">
          {[
            {
              step: '01. Alimentez votre solde',
              desc: 'Effectuez un dépôt à partir de 4 000 FCFA via Orange Money ou Wave sur le numéro +22656445452.',
            },
            {
              step: '02. Lancez une ligne de production',
              desc: 'Choisissez un plan adapté à votre objectif. Chaque ligne génère un revenu fixe toutes les 24 heures pendant 100 jours.',
            },
            {
              step: '03. Récoltez et retirez vos fonds',
              desc: 'Collectez vos rendements quotidiens, cumulez les commissions d’équipe et demandez vos retraits dès 1 500 FCFA.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-2xl bg-[#0B1222] border border-[#1B2947] p-5 space-y-1.5"
            >
              <h3 className="font-display text-base font-bold text-[#60A5FA]">{item.step}</h3>
              <p className="text-sm text-[#CBD5E1] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (mode === 'security') {
    return (
      <div className="max-w-3xl space-y-4">
        <div className="rounded-2xl bg-[#0B1222] border border-[#1B2947] p-6 space-y-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-[#34D399]" />
            <h2 className="font-display text-xl font-bold text-white">Sécurité du compte</h2>
          </div>
          <div className="space-y-3 text-sm text-[#CBD5E1]">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>Protection des sessions et vérification du compte de retrait</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>Historique détaillé de chaque transaction de fonds</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>Support client dédié de 09:00 à 18:00</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-4">
      <div className="rounded-2xl bg-[#0B1222] border border-[#1B2947] p-6 space-y-3">
        <p className="text-xs font-semibold tracking-wider text-[#60A5FA]">À PROPOS DE GOFAST</p>
        <h2 className="font-display text-2xl font-bold text-white">
          Une technologie au service du quotidien
        </h2>
        <p className="text-sm text-[#CBD5E1] leading-relaxed">
          GoFast connecte l’infrastructure industrielle, les services grand public et les réseaux
          numériques à travers une plateforme de suivi en temps réel. Chaque unité de production est
          conçue pour offrir un rendement transparent et régulier sur 100 jours.
        </p>
      </div>
    </div>
  );
}
