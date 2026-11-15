import React, { useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Copy,
  Inbox,
  Landmark,
  Phone,
  XCircle,
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import {
  PAYMENT_METHODS,
  PAYMENT_NUMBER,
  WITHDRAWAL_OPERATORS,
  formatFCFA,
  formatNumber,
} from '../data/gofastData';
import { GOFAST_IMAGES } from '../data/assets';
import { GoFastLogo, SafeImage } from './BrandMark';

export function RechargeView() {
  const { balance, submitDeposit, navigateTo, showToast } = useAppState();
  const [amountInput, setAmountInput] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>(PAYMENT_METHODS[0].id);

  const numericAmount = Number(amountInput.replace(/\D/g, '')) || 0;
  const presets = [4000, 10000, 24000, 50000, 100000];
  const isValid = numericAmount >= 4000 && numericAmount <= 100000;

  const activeMethod = PAYMENT_METHODS.find((m) => m.id === selectedMethod) || PAYMENT_METHODS[0];
  const orangeUssdCode = `*144*2*1*56445452*${numericAmount > 0 ? numericAmount : 'MONTANT'}#`;

  const copyValue = (value: string, label: string) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(value);
    }
    showToast(`${label} copié : ${value}`, 'success');
  };

  const handleSubmit = async () => {
    if (await submitDeposit(numericAmount, `${activeMethod.label} (${PAYMENT_NUMBER})`)) {
      setAmountInput('');
      navigateTo('deposit-history');
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Solde Disponible Banner */}
      <section className="relative rounded-2xl overflow-hidden border border-[#1B2947] bg-[#080F20] p-5 sm:p-6">
        <SafeImage
          src={GOFAST_IMAGES.cardEnergy}
          alt="Solde disponible GoFast"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050811] via-[#081024]/85 to-[#0B1733]/70" />
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wider text-[#94A3B8]">SOLDE DISPONIBLE</p>
            <p className="font-display text-3xl font-bold text-white tabular-nums mt-1">
              {formatFCFA(balance)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('deposit-history')}
            className="hidden sm:inline-flex text-xs font-semibold text-[#60A5FA] hover:text-[#93C5FD]"
          >
            Historique des dépôts
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Amount Card */}
        <section className="lg:col-span-6 rounded-2xl bg-[#0B1222] border border-[#1B2947] p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-base font-bold text-white">Montant</h2>
            <span className="text-xs text-[#94A3B8] tabular-nums">4 000 FCFA – 100 000 FCFA</span>
          </div>

          <div className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl bg-[#070B16] border border-[#1E2E4E] focus-within:border-[#3B82F6] transition-colors">
            <input
              type="text"
              inputMode="numeric"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value.replace(/\D/g, ''))}
              placeholder="0"
              aria-label="Montant du dépôt en FCFA"
              className="w-full bg-transparent font-display text-2xl font-bold text-white placeholder-[#475569] focus:outline-none tabular-nums"
            />
            <span className="text-sm font-semibold text-[#94A3B8] shrink-0">FCFA</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {presets.map((val) => {
              const active = numericAmount === val;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmountInput(String(val))}
                  className={`py-2.5 px-3 rounded-xl text-sm font-semibold tabular-nums border transition-colors ${
                    active
                      ? 'bg-[#1D4ED8] border-[#3B82F6] text-white'
                      : 'bg-[#070B16] border-[#1B2947] text-[#CBD5E1] hover:border-[#3B82F6]/50'
                  }`}
                >
                  {formatNumber(val)} <span className="text-[11px] font-normal">FCFA</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Payment Methods */}
        <section className="lg:col-span-6 space-y-3">
          <h2 className="font-display text-base font-bold text-white">Moyen de paiement</h2>
          <div className="space-y-2.5">
            {PAYMENT_METHODS.map((method) => {
              const active = selectedMethod === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedMethod(method.id)}
                  className={`w-full p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-left transition-colors ${
                    active
                      ? 'bg-[#0F1B33] border-[#3B82F6]'
                      : 'bg-[#0B1222] border-[#1B2947] hover:border-[#2B4375]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <GoFastLogo compact />
                    <div className="min-w-0">
                      <span className="block text-sm font-medium text-white truncate">
                        {method.label}
                      </span>
                      <span className="block text-xs font-mono text-[#60A5FA] tabular-nums">
                        {method.paymentNumber}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                      active
                        ? 'bg-[#2563EB] border-[#3B82F6] text-white'
                        : 'border-[#334155] bg-transparent'
                    }`}
                  >
                    {active && <Check className="w-3 h-3" />}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Payment Code & Number Instructions */}
          <div className="rounded-2xl bg-[#0B1222] border border-[#1E3258] p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#60A5FA]">
                <Phone className="w-3.5 h-3.5" />
                {activeMethod.codeLabel}
              </span>
              <span className="text-[11px] font-medium text-[#94A3B8]">
                {activeMethod.label}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-[#070B16] border border-[#1B2947]">
              <div className="min-w-0">
                <p className="text-[11px] text-[#94A3B8]">Numéro de paiement</p>
                <p className="font-mono text-base font-bold text-white tracking-wide tabular-nums">
                  {PAYMENT_NUMBER}
                </p>
              </div>
              <button
                type="button"
                onClick={() => copyValue(PAYMENT_NUMBER, 'Numéro')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#101A30] hover:bg-[#172542] border border-[#243963] text-xs font-semibold text-white shrink-0 transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-[#60A5FA]" />
                Copier
              </button>
            </div>

            {activeMethod.id === 'orange-money' ? (
              <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-[#070B16] border border-[#1B2947]">
                <div className="min-w-0">
                  <p className="text-[11px] text-[#94A3B8]">Code USSD Orange Money</p>
                  <p className="font-mono text-sm font-bold text-[#34D399] truncate tabular-nums">
                    {orangeUssdCode}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyValue(orangeUssdCode, 'Code de paiement')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#101A30] hover:bg-[#172542] border border-[#243963] text-xs font-semibold text-white shrink-0 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-[#60A5FA]" />
                  Copier
                </button>
              </div>
            ) : (
              <div className="px-3.5 py-2.5 rounded-xl bg-[#070B16] border border-[#1B2947] text-xs text-[#CBD5E1] leading-relaxed">
                Ouvrez votre application <span className="font-semibold text-white">Wave</span> et
                effectuez le transfert de{' '}
                <span className="font-semibold text-[#34D399] tabular-nums">
                  {numericAmount > 0 ? formatFCFA(numericAmount) : 'votre montant'}
                </span>{' '}
                vers le numéro <span className="font-mono text-white">{PAYMENT_NUMBER}</span>, puis
                cliquez sur <span className="font-semibold text-white">Déposer</span>.
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Bottom Summary & Confirm Bar */}
      <div className="fixed lg:static bottom-0 left-0 right-0 z-30 bg-[#070B16]/95 lg:bg-[#0B1222] backdrop-blur-md border-t lg:border border-[#18243E] lg:rounded-2xl p-4 sm:px-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-[#94A3B8]">Vous payez</p>
          <p className="font-display text-lg font-bold text-white tabular-nums">
            {numericAmount > 0 ? formatFCFA(numericAmount) : '—'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid}
          className={`min-h-[46px] px-7 py-2.5 rounded-xl font-semibold text-sm transition-colors whitespace-nowrap ${
            isValid
              ? 'bg-[#2563EB] hover:bg-[#3B82F6] text-white'
              : 'bg-[#101A30] text-[#64748B] border border-[#1B2947] cursor-not-allowed'
          }`}
        >
          Déposer
        </button>
      </div>
    </div>
  );
}

export function WithdrawView() {
  const {
    balance,
    activeLines,
    withdrawalAccount,
    submitWithdrawal,
    navigateTo,
    setActiveTab,
    showToast,
  } = useAppState();

  const [amountInput, setAmountInput] = useState<string>('');
  const [showConditions, setShowConditions] = useState(false);

  const numericAmount = Number(amountInput.replace(/\D/g, '')) || 0;
  const hasActiveLine = activeLines.length > 0;
  const hasAccount = Boolean(withdrawalAccount);

  const readyCount = 2 + (hasActiveLine ? 1 : 0) + (hasAccount ? 1 : 0);
  const presets = [1500, 5000, 10000, 50000];

  const fee = Math.round(numericAmount * 0.18);
  const net = Math.max(0, numericAmount - fee);
  const canSubmit =
    hasActiveLine && hasAccount && numericAmount >= 1500 && numericAmount <= balance;

  const handleWithdraw = async () => {
    const res = await submitWithdrawal(numericAmount);
    if (!res.ok && res.reason) {
      showToast(res.reason, 'error');
      return;
    }
    setAmountInput('');
    navigateTo('withdraw-history');
  };

  return (
    <div className="space-y-6 pb-24 lg:pb-6">
      {/* Disponible Banner */}
      <section className="relative rounded-2xl overflow-hidden border border-[#1B2947] bg-[#080F20] p-5 sm:p-6">
        <SafeImage
          src={GOFAST_IMAGES.cardEnergy}
          alt="Solde disponible pour retrait"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050811] via-[#081024]/85 to-[#0B1733]/70" />
        <div className="relative z-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wider text-[#94A3B8]">DISPONIBLE</p>
            <p className="font-display text-3xl font-bold text-white tabular-nums mt-1">
              {formatFCFA(balance)}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs text-[#94A3B8]">HORAIRES</p>
            <p className="text-sm font-medium text-white tabular-nums mt-0.5">
              Tous les jours 00:00–23:59
            </p>
          </div>
        </div>
      </section>

      {/* Avant de retirer Checklist */}
      <section className="rounded-2xl bg-[#0B1222] border border-[#1B2947] p-5 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-semibold tracking-wider text-[#60A5FA]">
            AVANT DE RETIRER
          </span>
          <span className="font-mono text-xs font-semibold text-white tabular-nums">
            {readyCount}/4 prêts
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`h-1 rounded-full ${idx < readyCount ? 'bg-[#3B82F6]' : 'bg-[#18243E]'}`}
            />
          ))}
        </div>

        {!hasActiveLine && (
          <div className="space-y-3 pt-1">
            <p className="font-display text-lg font-bold text-white leading-snug">
              Lancez une ligne pour débloquer les retraits
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveTab('lines');
                navigateTo('main', 'lines');
              }}
              className="w-full py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-[#3B82F6] text-white text-sm font-semibold transition-colors"
            >
              Découvrir les lignes
            </button>
          </div>
        )}

        <div className="pt-2 border-t border-[#18243E] space-y-3">
          <p className="text-xs text-[#94A3B8]">Également requis</p>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {hasAccount ? (
                <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-[#F59E0B] shrink-0" />
              )}
              <span className="text-sm text-white">Compte de retrait associé</span>
            </div>
            <button
              type="button"
              onClick={() => navigateTo('withdraw-account')}
              className="text-xs font-semibold text-[#60A5FA] hover:text-[#93C5FD] whitespace-nowrap"
            >
              {hasAccount ? 'Modifier' : 'Associer un compte de retrait'}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowConditions((c) => !c)}
            className="w-full pt-2 border-t border-[#18243E] flex items-center justify-between text-left"
          >
            <span className="flex items-center gap-2.5 text-sm text-[#CBD5E1]">
              <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0" />
              <span>2 conditions remplies</span>
            </span>
            {showConditions ? (
              <ChevronUp className="w-4 h-4 text-[#94A3B8]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#94A3B8]" />
            )}
          </button>

          {showConditions && (
            <div className="pl-7 space-y-1.5 text-xs text-[#94A3B8]">
              <p>• Compte utilisateur GoFast actif et vérifié</p>
              <p>• Service de retrait ouvert (24 h/24, 7 j/7)</p>
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Montant du retrait */}
        <section className="lg:col-span-7 rounded-2xl bg-[#0B1222] border border-[#1B2947] p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-base font-bold text-white">Montant du retrait</h2>
            <span className="text-xs text-[#94A3B8] tabular-nums">1 500 FCFA – 1 000 000 FCFA</span>
          </div>

          <div className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl bg-[#070B16] border border-[#1E2E4E] focus-within:border-[#3B82F6] transition-colors">
            <input
              type="text"
              inputMode="numeric"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value.replace(/\D/g, ''))}
              placeholder="0"
              aria-label="Montant du retrait en FCFA"
              className="w-full bg-transparent font-display text-2xl font-bold text-white placeholder-[#475569] focus:outline-none tabular-nums"
            />
            <span className="text-sm font-semibold text-[#94A3B8] shrink-0">FCFA</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {presets.map((val) => {
              const active = numericAmount === val;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmountInput(String(val))}
                  className={`py-2.5 px-3 rounded-xl text-sm font-semibold tabular-nums border transition-colors ${
                    active
                      ? 'bg-[#1D4ED8] border-[#3B82F6] text-white'
                      : 'bg-[#070B16] border-[#1B2947] text-[#CBD5E1] hover:border-[#3B82F6]/50'
                  }`}
                >
                  {formatNumber(val)} <span className="text-[11px] font-normal">FCFA</span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setAmountInput(String(balance))}
              className="py-2 px-3 rounded-xl text-center border bg-[#070B16] border-[#1B2947] hover:border-[#3B82F6]/50 transition-colors"
            >
              <span className="block text-sm font-semibold text-white">Tout</span>
              <span className="block text-[11px] text-[#94A3B8] tabular-nums">
                {formatFCFA(balance)}
              </span>
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-[#94A3B8] pt-1">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#60A5FA]" />
              Les fonds arrivent généralement sous 48 heures.
            </span>
            {numericAmount >= 1500 && (
              <span className="text-white font-semibold tabular-nums">
                Net reçu : {formatFCFA(net)}
              </span>
            )}
          </div>
        </section>

        {/* Vers le compte + Règles */}
        <section className="lg:col-span-5 space-y-4">
          <div className="space-y-2">
            <h2 className="font-display text-base font-bold text-white">Vers le compte</h2>
            <button
              type="button"
              onClick={() => navigateTo('withdraw-account')}
              className="w-full p-4 rounded-2xl bg-[#0B1222] border border-[#1B2947] hover:border-[#3B82F6]/50 flex items-center justify-between gap-3 text-left transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#111D38] border border-[#243963] flex items-center justify-center shrink-0">
                  <Landmark className="w-5 h-5 text-[#60A5FA]" />
                </div>
                <div className="min-w-0">
                  {withdrawalAccount ? (
                    <>
                      <p className="text-sm font-semibold text-white truncate">
                        {withdrawalAccount.operator}
                      </p>
                      <p className="text-xs text-[#94A3B8] font-mono tabular-nums truncate">
                        {withdrawalAccount.holderName} · {withdrawalAccount.accountNumber}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm font-semibold text-white">
                      Associer un compte de retrait
                    </p>
                  )}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#64748B] shrink-0" />
            </button>
          </div>

          <ul className="rounded-2xl bg-[#0B1222] border border-[#1B2947] p-4 space-y-1.5 text-xs text-[#94A3B8]">
            <li>
              • Retrait minimum : <span className="text-white font-semibold">1 500 FCFA</span>
            </li>
            <li>
              • Frais de retrait : <span className="text-white font-semibold">18 %</span>
            </li>
            <li>
              • Nombre de retraits : <span className="text-white font-semibold">illimité</span>
            </li>
            <li>
              • Horaires de retrait : <span className="text-white font-semibold">24 h/24, 7 j/7</span>
            </li>
            <li>
              • Condition :{' '}
              <span className="text-white font-semibold">
                avoir investi dans au moins un produit
              </span>
            </li>
            <li>
              • Délai de réception :{' '}
              <span className="text-white font-semibold">sous 1 à 48 heures</span>
            </li>
          </ul>
        </section>
      </div>

      {/* Bottom Submit Bar */}
      <div className="fixed lg:static bottom-0 left-0 right-0 z-30 bg-[#070B16]/95 lg:bg-[#0B1222] backdrop-blur-md border-t lg:border border-[#18243E] lg:rounded-2xl p-4 sm:px-6 space-y-2.5 lg:space-y-0 lg:flex lg:items-center lg:justify-between lg:gap-4">
        <p className="text-xs text-[#94A3B8] text-center lg:text-left">
          Délai de retrait : 24h/24 et 7j/7 (Disponible en permanence)
        </p>
        <button
          type="button"
          onClick={handleWithdraw}
          disabled={!canSubmit}
          className={`w-full lg:w-auto min-h-[46px] px-8 py-2.5 rounded-xl font-semibold text-sm transition-colors whitespace-nowrap ${
            canSubmit
              ? 'bg-[#2563EB] hover:bg-[#3B82F6] text-white'
              : 'bg-[#101A30] text-[#64748B] border border-[#1B2947] cursor-not-allowed'
          }`}
        >
          Retirer
        </button>
      </div>
    </div>
  );
}

export function WithdrawAccountView() {
  const { withdrawalAccount, saveWithdrawalAccount, navigateTo, showToast } = useAppState();
  const [holderName, setHolderName] = useState(withdrawalAccount?.holderName || '');
  const [operator, setOperator] = useState(
    withdrawalAccount?.operator || WITHDRAWAL_OPERATORS[0]
  );
  const [accountNumber, setAccountNumber] = useState(withdrawalAccount?.accountNumber || '');
  const [confirmNumber, setConfirmNumber] = useState(withdrawalAccount?.accountNumber || '');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holderName.trim()) {
      showToast('Veuillez saisir le nom du titulaire.', 'error');
      return;
    }
    if (!accountNumber.trim()) {
      showToast('Veuillez saisir le numéro de compte.', 'error');
      return;
    }
    if (accountNumber.trim() !== confirmNumber.trim()) {
      showToast('Les numéros de compte ne correspondent pas.', 'error');
      return;
    }
    const ok = await saveWithdrawalAccount({
      holderName: holderName.trim(),
      operator,
      accountNumber: accountNumber.trim(),
    });
    if (ok) {
      navigateTo('withdraw');
    }
  };

  return (
    <form onSubmit={handleSave} className="max-w-xl mx-auto space-y-6">
      <div className="rounded-2xl bg-[#0B1222] border border-[#1B2947] p-5 sm:p-6 space-y-5">
        <div>
          <label htmlFor="holderName" className="block text-sm font-medium text-white mb-2">
            Nom du titulaire
          </label>
          <input
            id="holderName"
            type="text"
            value={holderName}
            onChange={(e) => setHolderName(e.target.value)}
            placeholder="Saisissez le nom complet"
            className="w-full px-4 py-3 rounded-xl bg-[#070B16] border border-[#1E2E4E] text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6]"
          />
        </div>

        <div>
          <label htmlFor="operator" className="block text-sm font-medium text-white mb-2">
            Banque ou opérateur
          </label>
          <select
            id="operator"
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#070B16] border border-[#1E2E4E] text-sm text-white focus:outline-none focus:border-[#3B82F6]"
          >
            {WITHDRAWAL_OPERATORS.map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="accountNumber" className="block text-sm font-medium text-white mb-2">
            Numéro de compte
          </label>
          <input
            id="accountNumber"
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="Saisissez le numéro de compte"
            className="w-full px-4 py-3 rounded-xl bg-[#070B16] border border-[#1E2E4E] text-sm text-white font-mono placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6]"
          />
        </div>

        <div>
          <label htmlFor="confirmNumber" className="block text-sm font-medium text-white mb-2">
            Confirmer le numéro de compte
          </label>
          <input
            id="confirmNumber"
            type="text"
            value={confirmNumber}
            onChange={(e) => setConfirmNumber(e.target.value)}
            placeholder="Saisissez à nouveau le numéro de compte"
            className="w-full px-4 py-3 rounded-xl bg-[#070B16] border border-[#1E2E4E] text-sm text-white font-mono placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6]"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full min-h-[48px] py-3 rounded-xl bg-[#2563EB] hover:bg-[#3B82F6] text-white font-semibold text-sm transition-colors"
      >
        Enregistrer
      </button>
    </form>
  );
}

export function WithdrawHistoryView() {
  const { withdrawals, navigateTo } = useAppState();

  return (
    <div className="space-y-4">
      {withdrawals.length === 0 ? (
        <div className="py-20 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#0B1222] border border-[#1B2947] flex items-center justify-center mb-3">
            <Inbox className="w-5 h-5 text-[#64748B]" />
          </div>
          <p className="text-sm text-[#94A3B8]">Aucun historique de retrait</p>
          <button
            type="button"
            onClick={() => navigateTo('withdraw')}
            className="mt-4 px-5 py-2.5 rounded-xl bg-[#101A30] border border-[#243963] text-xs font-semibold text-white hover:bg-[#172542]"
          >
            Effectuer un retrait
          </button>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#0B1222] border border-[#1B2947] divide-y divide-[#18243E]">
          {withdrawals.map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">{item.operator}</p>
                <p className="text-xs text-[#94A3B8] font-mono tabular-nums mt-0.5">
                  {item.reference} · {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-white tabular-nums">
                  -{formatFCFA(item.grossAmount)}
                </p>
                <p className="text-xs text-[#F59E0B] tabular-nums">
                  {item.status} · Net {formatFCFA(item.netAmount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function DepositHistoryView() {
  const { deposits, navigateTo } = useAppState();

  return (
    <div className="space-y-4">
      {deposits.length === 0 ? (
        <div className="py-20 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#0B1222] border border-[#1B2947] flex items-center justify-center mb-3">
            <Inbox className="w-5 h-5 text-[#64748B]" />
          </div>
          <p className="text-sm text-[#94A3B8]">Aucun historique de dépôt</p>
          <button
            type="button"
            onClick={() => navigateTo('recharge')}
            className="mt-4 px-5 py-2.5 rounded-xl bg-[#2563EB] text-xs font-semibold text-white hover:bg-[#3B82F6]"
          >
            Faire un dépôt
          </button>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#0B1222] border border-[#1B2947] divide-y divide-[#18243E]">
          {deposits.map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">{item.method}</p>
                <p className="text-xs text-[#94A3B8] font-mono tabular-nums mt-0.5">
                  {item.reference} · {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#34D399] tabular-nums">
                  +{formatFCFA(item.amount)}
                </p>
                <p className="text-xs text-[#94A3B8]">{item.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function FundHistoryView() {
  const { fundHistory } = useAppState();

  return (
    <div className="rounded-2xl bg-[#0B1222] border border-[#1B2947] divide-y divide-[#18243E]">
      {fundHistory.map((tx) => (
        <div key={tx.id} className="p-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{tx.label}</p>
            <p className="text-xs text-[#94A3B8] tabular-nums mt-0.5">
              {tx.category} · {new Date(tx.createdAt).toLocaleString('fr-FR')}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p
              className={`text-sm font-bold tabular-nums ${
                tx.type === 'credit' ? 'text-[#34D399]' : 'text-white'
              }`}
            >
              {tx.type === 'credit' ? '+' : '-'}
              {formatFCFA(tx.amount)}
            </p>
            <p className="text-xs text-[#64748B] tabular-nums">
              Solde {formatFCFA(tx.balanceAfter)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MyLinesView() {
  const {
    activeLines,
    claimableLines,
    claimableDailyTotal,
    collectLineIncome,
    collectAllLineIncome,
    setActiveTab,
    setSubView,
  } = useAppState();
  const today = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;
  })();

  if (activeLines.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#0B1222] border border-[#1B2947] flex items-center justify-center mb-3">
          <AlertCircle className="w-5 h-5 text-[#60A5FA]" />
        </div>
        <p className="text-sm text-[#94A3B8] max-w-xs">
          Vous n’avez pas encore de ligne de production active.
        </p>
        <button
          type="button"
          onClick={() => {
            setActiveTab('lines');
            setSubView('main');
          }}
          className="mt-4 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#3B82F6] text-xs font-semibold text-white"
        >
          Découvrir les lignes
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {claimableLines.length > 0 && (
        <div className="rounded-2xl bg-[#071B16] border border-[#10B981]/35 p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-white">
              Gains quotidiens prêts : +{formatFCFA(claimableDailyTotal)}
            </p>
            <p className="text-xs text-[#A7F3D0]">
              {claimableLines.length} ligne{claimableLines.length > 1 ? 's' : ''} en attente de récolte aujourd’hui.
            </p>
          </div>
          <button
            type="button"
            onClick={collectAllLineIncome}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-[#04100C] text-xs font-bold transition-colors whitespace-nowrap"
          >
            Tout récolter (+{formatFCFA(claimableDailyTotal)})
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeLines.map((line) => {
          const claimedToday = line.lastClaimedAt === today;
          const pct = Math.min(100, Math.round((line.daysElapsed / line.durationDays) * 100));
          return (
            <div
              key={line.id}
              className="rounded-2xl bg-[#0B1222] border border-[#1B2947] p-5 space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-[#60A5FA] font-medium">
                    {line.planCode} · {line.categoryLabel}
                  </p>
                  <h3 className="font-display text-lg font-bold text-white mt-0.5">{line.name}</h3>
                </div>
                <span className="text-xs font-semibold text-[#34D399] tabular-nums">
                  +{formatFCFA(line.dailyIncome)}/j
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-[#94A3B8] tabular-nums">
                  <span>
                    Progression : {line.daysElapsed}/{line.durationDays} jours
                  </span>
                  <span>Total perçu : {formatFCFA(line.totalEarned)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#101A30] overflow-hidden">
                  <div className="h-full bg-[#2563EB]" style={{ width: `${pct}%` }} />
                </div>
              </div>

              <button
                type="button"
                onClick={() => collectLineIncome(line.id)}
                disabled={claimedToday || line.status === 'completed'}
                className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  claimedToday
                    ? 'bg-[#101A30] text-[#64748B] border border-[#1B2947] cursor-default'
                    : 'bg-[#2563EB] hover:bg-[#3B82F6] text-white'
                }`}
              >
                {claimedToday
                  ? 'Revenu du jour déjà récolté'
                  : `Récolter +${formatFCFA(line.dailyIncome)}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
