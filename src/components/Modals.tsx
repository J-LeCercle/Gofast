import React, { useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { formatFCFA } from '../data/gofastData';
import { SafeImage } from './BrandMark';

export function LineDetailModal() {
  const {
    selectedLineForModal,
    setSelectedLineForModal,
    balance,
    launchLine,
    navigateTo,
    showToast,
  } = useAppState();
  const [busy, setBusy] = useState(false);

  if (!selectedLineForModal) return null;

  const canAfford = balance >= selectedLineForModal.price;

  const handleLaunch = async () => {
    setBusy(true);
    const res = await launchLine(selectedLineForModal);
    setBusy(false);
    if (!res.ok) {
      showToast(res.reason || 'Solde insuffisant.', 'error');
      return;
    }
    setSelectedLineForModal(null);
    navigateTo('my-lines');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="line-modal-title"
    >
      <div className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl bg-[#0B1222] border border-[#1E3258] overflow-hidden shadow-2xl">
        <div className="relative h-44 bg-[#070B16]">
          <SafeImage
            src={selectedLineForModal.image}
            alt={selectedLineForModal.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1222] via-[#0B1222]/40 to-transparent" />
          <button
            type="button"
            onClick={() => setSelectedLineForModal(null)}
            aria-label="Fermer"
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#050811]/80 text-white flex items-center justify-center hover:bg-[#050811]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <p className="text-xs font-semibold text-[#60A5FA]">
              {selectedLineForModal.planCode} · {selectedLineForModal.categoryLabel}
            </p>
            <h3 id="line-modal-title" className="font-display text-xl font-bold text-white mt-1">
              {selectedLineForModal.name}
            </h3>
            <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
              {selectedLineForModal.description}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#070B16] border border-[#18243E]">
            <div>
              <p className="text-xs text-[#64748B]">Prix</p>
              <p className="text-sm font-bold text-white tabular-nums mt-0.5">
                {formatFCFA(selectedLineForModal.price)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Par jour</p>
              <p className="text-sm font-bold text-[#34D399] tabular-nums mt-0.5">
                {formatFCFA(selectedLineForModal.dailyIncome)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Total ({selectedLineForModal.durationDays} j)</p>
              <p className="text-sm font-bold text-white tabular-nums mt-0.5">
                {formatFCFA(selectedLineForModal.totalReturn)}
              </p>
            </div>
          </div>

          <ul className="space-y-2">
            {selectedLineForModal.specs.map((spec) => (
              <li key={spec} className="flex items-center gap-2 text-xs text-[#CBD5E1]">
                <CheckCircle2 className="w-4 h-4 text-[#3B82F6] shrink-0" />
                <span>{spec}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            {canAfford ? (
              <button
                type="button"
                disabled={busy}
                onClick={handleLaunch}
                className="flex-1 min-h-[46px] py-3 rounded-xl bg-[#2563EB] hover:bg-[#3B82F6] text-white text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {busy ? 'Activation...' : `Confirmer (${formatFCFA(selectedLineForModal.price)})`}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSelectedLineForModal(null);
                  navigateTo('recharge');
                }}
                className="flex-1 min-h-[46px] py-3 rounded-xl bg-[#2563EB] hover:bg-[#3B82F6] text-white text-sm font-semibold transition-colors"
              >
                Solde insuffisant · Déposer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function GiftCodeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { redeemGiftCode } = useAppState();
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await redeemGiftCode(code);
    setBusy(false);
    setFeedback({ ok: res.ok, msg: res.message });
    if (res.ok) setCode('');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-2xl bg-[#0B1222] border border-[#1E3258] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-white">Code cadeau</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="p-1.5 text-[#94A3B8] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-[#94A3B8]">
          Saisissez un code promotionnel GoFast (ex.{' '}
          <span className="font-mono text-white">GOFAST500</span>,{' '}
          <span className="font-mono text-white">BLEUNOIR</span> ou{' '}
          <span className="font-mono text-white">PARRAIN1000</span>).
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Entrez votre code"
            className="w-full px-4 py-3 rounded-xl bg-[#070B16] border border-[#1E2E4E] text-sm font-mono uppercase text-white placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6]"
          />
          {feedback && (
            <p className={`text-xs font-medium ${feedback.ok ? 'text-[#34D399]' : 'text-[#FCA5A5]'}`}>
              {feedback.msg}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full min-h-[44px] py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#3B82F6] text-white text-sm font-semibold disabled:opacity-60"
          >
            {busy ? 'Activation...' : 'Activer le code'}
          </button>
        </form>
      </div>
    </div>
  );
}

export function QRCodeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { profile } = useAppState();
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm rounded-2xl bg-[#0B1222] border border-[#1E3258] p-6 text-center space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-white">Code QR d’invitation</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="p-1.5 text-[#94A3B8] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="w-48 h-48 mx-auto p-3 rounded-2xl bg-white flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full" aria-label="QR Code GoFast">
            <rect width="100" height="100" fill="#FFFFFF" />
            <rect x="6" y="6" width="26" height="26" fill="none" stroke="#050811" strokeWidth="5" />
            <rect x="13" y="13" width="12" height="12" fill="#2563EB" />
            <rect x="68" y="6" width="26" height="26" fill="none" stroke="#050811" strokeWidth="5" />
            <rect x="75" y="13" width="12" height="12" fill="#2563EB" />
            <rect x="6" y="68" width="26" height="26" fill="none" stroke="#050811" strokeWidth="5" />
            <rect x="13" y="75" width="12" height="12" fill="#2563EB" />
            <rect x="42" y="10" width="6" height="18" fill="#050811" />
            <rect x="52" y="16" width="8" height="8" fill="#050811" />
            <rect x="10" y="42" width="18" height="6" fill="#050811" />
            <rect x="38" y="38" width="24" height="24" fill="#050811" />
            <rect x="44" y="44" width="12" height="12" fill="#2563EB" />
            <rect x="70" y="42" width="16" height="8" fill="#050811" />
            <rect x="42" y="72" width="14" height="14" fill="#050811" />
            <rect x="64" y="64" width="10" height="10" fill="#050811" />
            <rect x="78" y="76" width="14" height="14" fill="#050811" />
          </svg>
        </div>

        <div>
          <p className="text-xs text-[#94A3B8]">Code d’invitation</p>
          <p className="font-mono text-xl font-bold tracking-[0.2em] text-white mt-0.5">
            {profile.inviteCode}
          </p>
        </div>
      </div>
    </div>
  );
}

export function EditProfileModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { profile, updateProfile } = useAppState();
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);

  useEffect(() => {
    setName(profile.name);
    setPhone(profile.phone);
  }, [profile.name, profile.phone, open]);

  if (!open) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await updateProfile(name, phone)) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-2xl bg-[#0B1222] border border-[#1E3258] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-white">Modifier le profil</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="p-1.5 text-[#94A3B8] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Nom</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#070B16] border border-[#1E2E4E] text-sm text-white focus:outline-none focus:border-[#3B82F6]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Téléphone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#070B16] border border-[#1E2E4E] text-sm font-mono text-white focus:outline-none focus:border-[#3B82F6]"
            />
          </div>
          <button
            type="submit"
            className="w-full min-h-[44px] py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#3B82F6] text-white text-sm font-semibold"
          >
            Enregistrer
          </button>
        </form>
      </div>
    </div>
  );
}

