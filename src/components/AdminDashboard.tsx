import React, { useMemo, useState } from 'react';
import {
  Activity,
  ArrowDownLeft,
  ArrowRightLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Download,
  Gift,
  Layers,
  LogOut,
  Search,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react';
import { ADMIN_EMAIL, useAppState } from '../context/AppStateContext';
import { formatFCFA } from '../data/gofastData';
import { FlowEvent, FlowEventType } from '../types';
import { GoFastLogo } from './BrandMark';

type AdminSection = 'overview' | 'flows' | 'treasury' | 'users';
type FlowFilter = 'all' | FlowEventType;
type TreasuryFilter = 'all' | 'pending' | 'validated' | 'deposit' | 'withdrawal';

const EVENT_TYPE_LABEL: Record<FlowEventType, string> = {
  deposit: 'Dépôt',
  withdrawal: 'Retrait',
  line: 'Ligne',
  yield: 'Gain quotidien',
  commission: 'Commission',
  referral: 'Parrainage',
  signup: 'Inscription',
  bonus: 'Pointage',
};

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatDateOnly(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function FlowTypeIcon({ type }: { type: FlowEventType }) {
  switch (type) {
    case 'deposit':
      return <ArrowDownLeft className="w-4 h-4 text-[#34D399]" />;
    case 'withdrawal':
      return <ArrowUpRight className="w-4 h-4 text-[#FBBF24]" />;
    case 'line':
      return <Layers className="w-4 h-4 text-[#60A5FA]" />;
    case 'yield':
      return <TrendingUp className="w-4 h-4 text-[#34D399]" />;
    case 'commission':
      return <Users className="w-4 h-4 text-[#93C5FD]" />;
    case 'referral':
      return <UserCheck className="w-4 h-4 text-[#60A5FA]" />;
    case 'signup':
      return <UserPlus className="w-4 h-4 text-[#60A5FA]" />;
    case 'bonus':
      return <Gift className="w-4 h-4 text-[#93C5FD]" />;
  }
}

export function AdminDashboard() {
  const {
    profile,
    adminFlows,
    adminUsers,
    adminLoading,
    validateAdminWithdrawal,
    setAdminMode,
    logout,
    toast,
    showToast,
  } = useAppState();

  const [section, setSection] = useState<AdminSection>('overview');
  const [flowFilter, setFlowFilter] = useState<FlowFilter>('all');
  const [treasuryFilter, setTreasuryFilter] = useState<TreasuryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [validatingId, setValidatingId] = useState<string | null>(null);

  const metrics = useMemo(() => {
    let depositTotal = 0;
    let depositCount = 0;
    let withdrawalTotal = 0;
    let withdrawalCount = 0;
    let pendingWithdrawals = 0;
    let pendingWithdrawalAmount = 0;
    let lineVolume = 0;
    let lineCount = 0;
    let yieldTotal = 0;
    let commissionTotal = 0;

    for (const f of adminFlows) {
      if (f.eventType === 'deposit') {
        depositTotal += f.amount;
        depositCount += 1;
      } else if (f.eventType === 'withdrawal') {
        withdrawalTotal += f.amount;
        withdrawalCount += 1;
        if (f.status === 'En attente') {
          pendingWithdrawals += 1;
          pendingWithdrawalAmount += f.amount;
        }
      } else if (f.eventType === 'line') {
        lineVolume += f.amount;
        lineCount += 1;
      } else if (f.eventType === 'yield') {
        yieldTotal += f.amount;
      } else if (f.eventType === 'commission') {
        commissionTotal += f.amount;
      }
    }

    const totalUserBalances = adminUsers.reduce((sum, u) => sum + u.balance, 0);
    const referredUsersCount = adminUsers.filter((u) => Boolean(u.referredByCode)).length;

    return {
      depositTotal,
      depositCount,
      withdrawalTotal,
      withdrawalCount,
      pendingWithdrawals,
      pendingWithdrawalAmount,
      lineVolume,
      lineCount,
      yieldTotal,
      commissionTotal,
      totalUserBalances,
      referredUsersCount,
    };
  }, [adminFlows, adminUsers]);

  const flowChartRows = useMemo(() => {
    const rows = [
      { label: 'Dépôts', amount: metrics.depositTotal, color: '#10B981' },
      { label: 'Lignes lancées', amount: metrics.lineVolume, color: '#3B82F6' },
      { label: 'Retraits', amount: metrics.withdrawalTotal, color: '#F59E0B' },
      { label: 'Rendements', amount: metrics.yieldTotal, color: '#60A5FA' },
      { label: 'Commissions', amount: metrics.commissionTotal, color: '#818CF8' },
    ];
    const maxAmount = Math.max(...rows.map((r) => r.amount), 1);
    return rows.map((r) => ({
      ...r,
      pct: Math.round((r.amount / maxAmount) * 100),
    }));
  }, [metrics]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredFlows = useMemo(() => {
    return adminFlows.filter((f) => {
      if (flowFilter !== 'all' && f.eventType !== flowFilter) return false;
      if (!normalizedQuery) return true;
      return (
        f.userName.toLowerCase().includes(normalizedQuery) ||
        f.userEmail.toLowerCase().includes(normalizedQuery) ||
        f.title.toLowerCase().includes(normalizedQuery) ||
        f.detail.toLowerCase().includes(normalizedQuery) ||
        f.reference.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [adminFlows, flowFilter, normalizedQuery]);

  const filteredTreasuryFlows = useMemo(() => {
    return adminFlows.filter((f) => {
      if (f.eventType !== 'deposit' && f.eventType !== 'withdrawal') return false;
      if (treasuryFilter === 'deposit' && f.eventType !== 'deposit') return false;
      if (treasuryFilter === 'withdrawal' && f.eventType !== 'withdrawal') return false;
      if (treasuryFilter === 'pending' && !(f.eventType === 'withdrawal' && f.status === 'En attente')) {
        return false;
      }
      if (treasuryFilter === 'validated' && f.status === 'En attente') return false;
      if (!normalizedQuery) return true;
      return (
        f.userName.toLowerCase().includes(normalizedQuery) ||
        f.userEmail.toLowerCase().includes(normalizedQuery) ||
        f.detail.toLowerCase().includes(normalizedQuery) ||
        f.reference.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [adminFlows, treasuryFilter, normalizedQuery]);

  const filteredUsers = useMemo(() => {
    return adminUsers.filter((u) => {
      if (!normalizedQuery) return true;
      return (
        u.name.toLowerCase().includes(normalizedQuery) ||
        u.email.toLowerCase().includes(normalizedQuery) ||
        u.inviteCode.toLowerCase().includes(normalizedQuery) ||
        (u.referredByCode || '').toLowerCase().includes(normalizedQuery) ||
        (u.referredByName || '').toLowerCase().includes(normalizedQuery)
      );
    });
  }, [adminUsers, normalizedQuery]);

  const handleValidateWithdrawal = async (flow: FlowEvent) => {
    if (validatingId) return;
    setValidatingId(flow.id);
    try {
      await validateAdminWithdrawal(flow);
    } finally {
      setValidatingId(null);
    }
  };

  const handleExportCsv = () => {
    const source =
      section === 'treasury'
        ? filteredTreasuryFlows
        : section === 'flows'
        ? filteredFlows
        : adminFlows;

    if (source.length === 0) {
      showToast('Aucun flux à exporter.', 'info');
      return;
    }

    const escapeCsv = (val: string | number) => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = ['Date', 'Type', 'Membre', 'Email', 'Libellé', 'Détail', 'Montant (FCFA)', 'Statut', 'Référence'];
    const lines = [
      headers.join(','),
      ...source.map((f) =>
        [
          escapeCsv(f.createdAt),
          escapeCsv(EVENT_TYPE_LABEL[f.eventType]),
          escapeCsv(f.userName),
          escapeCsv(f.userEmail),
          escapeCsv(f.title),
          escapeCsv(f.detail),
          escapeCsv(f.amount),
          escapeCsv(f.status),
          escapeCsv(f.reference),
        ].join(',')
      ),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gofast-flux-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`${source.length} flux exportés en CSV.`, 'success');
  };

  const navItems: {
    id: AdminSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[] = [
    { id: 'overview', label: 'Vue d’ensemble', icon: Activity },
    { id: 'flows', label: 'Flux en temps réel', icon: ArrowRightLeft, badge: adminFlows.length },
    {
      id: 'treasury',
      label: 'Dépôts & Retraits',
      icon: Wallet,
      badge: metrics.pendingWithdrawals > 0 ? metrics.pendingWithdrawals : undefined,
    },
    { id: 'users', label: 'Membres', icon: Users, badge: adminUsers.length },
  ];

  const sectionTitle =
    section === 'overview'
      ? 'Tableau de bord Admin'
      : section === 'flows'
      ? 'Surveillance des flux en temps réel'
      : section === 'treasury'
      ? 'Dépôts & Retraits'
      : 'Répertoire des membres';

  const renderFlowRows = (items: FlowEvent[], emptyLabel: string) => {
    if (adminLoading) {
      return (
        <div className="p-10 flex items-center justify-center gap-3 text-sm text-[#94A3B8]">
          <div className="w-5 h-5 rounded-full border-2 border-[#3B82F6] border-t-transparent animate-spin" />
          <span>Chargement du flux Firestore en temps réel...</span>
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="p-10 text-center text-sm text-[#94A3B8]">
          {emptyLabel}
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#18243E] text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Membre</th>
              <th className="py-3 px-4">Opération</th>
              <th className="py-3 px-4 text-right">Montant</th>
              <th className="py-3 px-4">Statut</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#18243E] text-sm">
            {items.map((flow) => {
              const isPendingWithdrawal =
                flow.eventType === 'withdrawal' &&
                flow.status === 'En attente' &&
                Boolean(flow.targetDocId);

              return (
                <tr key={flow.id} className="hover:bg-[#0F172A]/60 transition-colors">
                  <td className="py-3 px-4 text-xs font-mono text-[#94A3B8] tabular-nums whitespace-nowrap">
                    {formatDateTime(flow.createdAt)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#E2E8F0]">
                      <FlowTypeIcon type={flow.eventType} />
                      <span>{EVENT_TYPE_LABEL[flow.eventType]}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 min-w-[170px]">
                    <p className="text-xs font-semibold text-white truncate">{flow.userName}</p>
                    <p className="text-[11px] text-[#94A3B8] truncate">{flow.userEmail}</p>
                  </td>
                  <td className="py-3 px-4 min-w-[220px]">
                    <p className="text-xs font-medium text-white truncate">{flow.title}</p>
                    <p className="text-[11px] text-[#94A3B8] truncate">
                      {flow.detail} · <span className="font-mono">{flow.reference}</span>
                    </p>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-xs font-semibold tabular-nums whitespace-nowrap">
                    {flow.amount > 0 ? (
                      <span
                        className={
                          flow.direction === 'out'
                            ? 'text-[#FBBF24]'
                            : flow.direction === 'in'
                            ? 'text-[#34D399]'
                            : 'text-white'
                        }
                      >
                        {flow.direction === 'out' ? '-' : flow.direction === 'in' ? '+' : ''}
                        {formatFCFA(flow.amount)}
                      </span>
                    ) : (
                      <span className="text-[#64748B]">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                        flow.status === 'En attente'
                          ? 'bg-[#251806] border-[#F59E0B]/40 text-[#FBBF24]'
                          : 'bg-[#071B16] border-[#10B981]/30 text-[#34D399]'
                      }`}
                    >
                      {flow.status === 'En attente' ? (
                        <Clock className="w-3 h-3 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                      )}
                      <span>{flow.status}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    {isPendingWithdrawal ? (
                      <button
                        type="button"
                        disabled={validatingId === flow.id}
                        onClick={() => handleValidateWithdrawal(flow)}
                        className="px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#3B82F6] text-white text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        {validatingId === flow.id ? 'Validation...' : 'Valider'}
                      </button>
                    ) : (
                      <span className="text-xs text-[#64748B]">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050811] text-[#F8FAFC] flex flex-col lg:flex-row">
      {/* Desktop Admin Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 bg-[#070B16] border-r border-[#18243E] z-40">
        <div className="h-16 px-6 flex items-center justify-between border-b border-[#18243E]">
          <GoFastLogo />
          <span className="px-2 py-0.5 rounded-md bg-[#1D4ED8]/20 border border-[#3B82F6]/30 text-[11px] font-semibold text-[#60A5FA]">
            Admin
          </span>
        </div>

        <div className="px-4 py-4 border-b border-[#18243E]">
          <p className="text-[11px] font-medium uppercase tracking-wider text-[#64748B]">
            Administrateur vérifié
          </p>
          <p className="text-xs font-semibold text-white truncate mt-1">
            {profile.name || 'Administrateur'}
          </p>
          <p className="text-[11px] font-mono text-[#60A5FA] truncate">{ADMIN_EMAIL}</p>
        </div>

        <nav aria-label="Navigation Admin" className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-[#1D4ED8]/20 text-white border border-[#3B82F6]/30'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#0F172A]'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#3B82F6]' : ''}`} />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.5 rounded-md bg-[#0F172A] text-[11px] font-mono tabular-nums text-[#CBD5E1]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[#18243E] space-y-2">
          <button
            type="button"
            onClick={() => setAdminMode(false)}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#CBD5E1] bg-[#0D1526] hover:bg-[#13203A] border border-[#1E2E4E] transition-colors whitespace-nowrap"
          >
            <ShieldCheck className="w-4 h-4 text-[#3B82F6] shrink-0" />
            <span>Basculer en espace membre</span>
          </button>
          <button
            type="button"
            onClick={() => logout()}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#FCA5A5] bg-[#160B11] hover:bg-[#23101A] border border-[#EF4444]/30 transition-colors whitespace-nowrap"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Console Column */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Desktop Top Header */}
        <header className="hidden lg:flex sticky top-0 z-30 h-16 px-8 items-center justify-between gap-6 bg-[#050811]/90 backdrop-blur-md border-b border-[#18243E]">
          <div className="min-w-0">
            <h1 className="font-display text-base font-semibold text-white truncate whitespace-nowrap">
              {sectionTitle}
            </h1>
            <p className="text-xs text-[#94A3B8] truncate">
              Flux Firestore en direct · {adminFlows.length} événements · {adminUsers.length} membres
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="relative w-64">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrer membre, email, réf..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#0B1222] border border-[#18243E] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6]"
              />
            </div>

            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-lg bg-[#0B1222] hover:bg-[#111C34] border border-[#1E2E4E] text-xs font-semibold text-[#CBD5E1] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-[#60A5FA]" />
              <span>Exporter CSV</span>
            </button>

            <button
              type="button"
              onClick={() => setAdminMode(false)}
              className="px-3.5 py-2 rounded-lg bg-[#2563EB] hover:bg-[#3B82F6] text-xs font-semibold text-white whitespace-nowrap shrink-0"
            >
              Espace membre
            </button>
          </div>
        </header>

        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-[#060A15]/95 backdrop-blur-md border-b border-[#18243E]">
          <div className="h-14 px-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <GoFastLogo />
              <span className="px-2 py-0.5 rounded-md bg-[#1D4ED8]/20 border border-[#3B82F6]/30 text-[11px] font-semibold text-[#60A5FA] shrink-0">
                Admin
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setAdminMode(false)}
                className="px-2.5 py-1.5 rounded-lg bg-[#0F1B33] border border-[#1E2E4E] text-xs font-semibold text-white whitespace-nowrap"
              >
                Membre
              </button>
              <button
                type="button"
                onClick={() => logout()}
                aria-label="Déconnexion"
                className="p-2 rounded-lg bg-[#160B11] border border-[#EF4444]/30 text-[#FCA5A5]"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="px-4 pb-2.5 flex items-center gap-2 overflow-x-auto">
            {navItems.map((item) => {
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 border transition-colors ${
                    active
                      ? 'bg-[#2563EB] border-[#3B82F6] text-white'
                      : 'bg-[#0B1222] border-[#18243E] text-[#94A3B8]'
                  }`}
                >
                  {item.label}
                  {item.badge !== undefined ? ` (${item.badge})` : ''}
                </button>
              );
            })}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Mobile Search & Export Row */}
          <div className="flex lg:hidden items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher membre, email, réf..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0B1222] border border-[#18243E] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6]"
              />
            </div>
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3 py-2 rounded-xl bg-[#0B1222] border border-[#1E2E4E] text-xs font-semibold text-[#CBD5E1] inline-flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-[#60A5FA]" />
              <span>CSV</span>
            </button>
          </div>

          {section === 'overview' && (
            <>
              {/* 4-Column KPI Strip */}
              <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="rounded-2xl bg-[#0B1222] border border-[#18243E] p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-[#94A3B8]">
                    <span>Dépôts enregistrés</span>
                    <ArrowDownLeft className="w-4 h-4 text-[#34D399]" />
                  </div>
                  <p className="font-display text-2xl font-bold text-white tabular-nums">
                    {formatFCFA(metrics.depositTotal)}
                  </p>
                  <p className="text-xs text-[#94A3B8] tabular-nums">
                    {metrics.depositCount} dépôt(s) Orange Money / Wave
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1222] border border-[#18243E] p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-[#94A3B8]">
                    <span>Retraits demandés</span>
                    <ArrowUpRight className="w-4 h-4 text-[#FBBF24]" />
                  </div>
                  <p className="font-display text-2xl font-bold text-white tabular-nums">
                    {formatFCFA(metrics.withdrawalTotal)}
                  </p>
                  <p className="text-xs text-[#FBBF24] tabular-nums">
                    {metrics.pendingWithdrawals} en attente ({formatFCFA(metrics.pendingWithdrawalAmount)})
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1222] border border-[#18243E] p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-[#94A3B8]">
                    <span>Volume Lignes Actives</span>
                    <Layers className="w-4 h-4 text-[#60A5FA]" />
                  </div>
                  <p className="font-display text-2xl font-bold text-white tabular-nums">
                    {formatFCFA(metrics.lineVolume)}
                  </p>
                  <p className="text-xs text-[#94A3B8] tabular-nums">
                    {metrics.lineCount} ligne(s) · {formatFCFA(metrics.yieldTotal)} récoltés
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1222] border border-[#18243E] p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-[#94A3B8]">
                    <span>Membres & Soldes</span>
                    <Users className="w-4 h-4 text-[#60A5FA]" />
                  </div>
                  <p className="font-display text-2xl font-bold text-white tabular-nums">
                    {adminUsers.length} membre{adminUsers.length > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-[#94A3B8] tabular-nums">
                    Solde cumulé : {formatFCFA(metrics.totalUserBalances)}
                  </p>
                </div>
              </section>

              {/* Flow Breakdown Chart + Summary */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-7 rounded-2xl bg-[#0B1222] border border-[#18243E] p-5 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h2 className="font-display text-base font-semibold text-white">
                        Répartition des flux financiers
                      </h2>
                      <p className="text-xs text-[#94A3B8] mt-0.5">
                        Calculée en temps réel sur les 200 derniers événements Firestore
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSection('flows')}
                      className="text-xs font-semibold text-[#60A5FA] hover:text-white whitespace-nowrap"
                    >
                      Tout voir
                    </button>
                  </div>

                  <div className="space-y-3 pt-1">
                    {flowChartRows.map((row) => (
                      <div key={row.label} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-[#CBD5E1]">{row.label}</span>
                          <span className="font-mono font-semibold text-white tabular-nums">
                            {formatFCFA(row.amount)}
                          </span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-[#070B16] overflow-hidden border border-[#18243E]">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${row.amount > 0 ? Math.max(row.pct, 4) : 0}%`,
                              backgroundColor: row.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-5 rounded-2xl bg-[#0B1222] border border-[#18243E] p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <h2 className="font-display text-base font-semibold text-white">
                      Activité réseau & parrainage
                    </h2>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                      Suivi des parrainages, commissions et validations en attente
                    </p>
                  </div>

                  <div className="divide-y divide-[#18243E] text-sm">
                    <div className="py-3 flex items-center justify-between">
                      <span className="text-xs text-[#94A3B8]">Membres parrainés</span>
                      <span className="font-mono font-semibold text-white tabular-nums">
                        {metrics.referredUsersCount} / {adminUsers.length}
                      </span>
                    </div>
                    <div className="py-3 flex items-center justify-between">
                      <span className="text-xs text-[#94A3B8]">Commissions distribuées</span>
                      <span className="font-mono font-semibold text-[#60A5FA] tabular-nums">
                        {formatFCFA(metrics.commissionTotal)}
                      </span>
                    </div>
                    <div className="py-3 flex items-center justify-between">
                      <span className="text-xs text-[#94A3B8]">Rendements quotidiens versés</span>
                      <span className="font-mono font-semibold text-[#34D399] tabular-nums">
                        {formatFCFA(metrics.yieldTotal)}
                      </span>
                    </div>
                    <div className="py-3 flex items-center justify-between">
                      <span className="text-xs text-[#94A3B8]">Retraits en attente d’action</span>
                      <span className="font-mono font-semibold text-[#FBBF24] tabular-nums">
                        {metrics.pendingWithdrawals}
                      </span>
                    </div>
                  </div>

                  {metrics.pendingWithdrawals > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setTreasuryFilter('pending');
                        setSection('treasury');
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-[#3B82F6] text-xs font-semibold text-white transition-colors"
                    >
                      Traiter {metrics.pendingWithdrawals} retrait(s) en attente
                    </button>
                  )}
                </div>
              </section>

              {/* Recent Real-Time Flows */}
              <section className="rounded-2xl bg-[#0B1222] border border-[#18243E] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#18243E] flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display text-base font-semibold text-white">
                      Derniers flux en temps réel
                    </h2>
                    <p className="text-xs text-[#94A3B8]">
                      Mises à jour automatiques sans rechargement de page
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSection('flows')}
                    className="text-xs font-semibold text-[#60A5FA] hover:text-white whitespace-nowrap"
                  >
                    Ouvrir le journal complet
                  </button>
                </div>
                {renderFlowRows(
                  filteredFlows.slice(0, 12),
                  'Aucun flux enregistré pour le moment.'
                )}
              </section>
            </>
          )}

          {section === 'flows' && (
            <section className="rounded-2xl bg-[#0B1222] border border-[#18243E] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#18243E] flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {(
                    [
                      ['all', 'Tous'],
                      ['deposit', 'Dépôts'],
                      ['withdrawal', 'Retraits'],
                      ['line', 'Lignes'],
                      ['yield', 'Gains'],
                      ['commission', 'Commissions'],
                      ['referral', 'Parrainages'],
                      ['signup', 'Inscriptions'],
                      ['bonus', 'Pointages'],
                    ] as [FlowFilter, string][]
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setFlowFilter(id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap ${
                        flowFilter === id
                          ? 'bg-[#2563EB] border-[#3B82F6] text-white'
                          : 'bg-[#070B16] border-[#18243E] text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-[#94A3B8] tabular-nums">
                  {filteredFlows.length} événement(s)
                </span>
              </div>
              {renderFlowRows(filteredFlows, 'Aucun événement ne correspond à ce filtre.')}
            </section>
          )}

          {section === 'treasury' && (
            <section className="rounded-2xl bg-[#0B1222] border border-[#18243E] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#18243E] flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {(
                    [
                      ['all', 'Tous dépôts & retraits'],
                      ['pending', `Retraits en attente (${metrics.pendingWithdrawals})`],
                      ['deposit', 'Dépôts'],
                      ['withdrawal', 'Tous retraits'],
                      ['validated', 'Validés / Succès'],
                    ] as [TreasuryFilter, string][]
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setTreasuryFilter(id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap ${
                        treasuryFilter === id
                          ? 'bg-[#2563EB] border-[#3B82F6] text-white'
                          : 'bg-[#070B16] border-[#18243E] text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-[#94A3B8] tabular-nums">
                  {filteredTreasuryFlows.length} opération(s)
                </span>
              </div>
              {renderFlowRows(
                filteredTreasuryFlows,
                'Aucune opération de dépôt ou retrait trouvée.'
              )}
            </section>
          )}

          {section === 'users' && (
            <section className="rounded-2xl bg-[#0B1222] border border-[#18243E] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#18243E] flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-base font-semibold text-white">
                    Membres inscrits sur GoFast
                  </h2>
                  <p className="text-xs text-[#94A3B8]">
                    Soldes, codes d’invitation personnels et liens de parrainage en temps réel
                  </p>
                </div>
                <span className="text-xs text-[#94A3B8] tabular-nums">
                  {filteredUsers.length} membre(s)
                </span>
              </div>

              {adminLoading ? (
                <div className="p-10 flex items-center justify-center gap-3 text-sm text-[#94A3B8]">
                  <div className="w-5 h-5 rounded-full border-2 border-[#3B82F6] border-t-transparent animate-spin" />
                  <span>Chargement des membres...</span>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-10 text-center text-sm text-[#94A3B8]">
                  Aucun membre trouvé pour cette recherche.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#18243E] text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                        <th className="py-3 px-4">Membre</th>
                        <th className="py-3 px-4">Code d’invitation</th>
                        <th className="py-3 px-4">Parrain</th>
                        <th className="py-3 px-4 text-right">Solde</th>
                        <th className="py-3 px-4 text-right">Pointages</th>
                        <th className="py-3 px-4">Inscription</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#18243E] text-sm">
                      {filteredUsers.map((u) => (
                        <tr key={u.uid} className="hover:bg-[#0F172A]/60 transition-colors">
                          <td className="py-3 px-4 min-w-[200px]">
                            <p className="text-xs font-semibold text-white truncate">{u.name}</p>
                            <p className="text-[11px] text-[#94A3B8] truncate">
                              {u.email}
                              {u.phone ? ` · ${u.phone}` : ''}
                            </p>
                          </td>
                          <td className="py-3 px-4 font-mono text-xs font-semibold text-[#60A5FA] whitespace-nowrap">
                            {u.inviteCode || '—'}
                          </td>
                          <td className="py-3 px-4 text-xs text-[#CBD5E1] whitespace-nowrap">
                            {u.referredByCode ? (
                              <span>
                                {u.referredByName || 'Parrain'} ·{' '}
                                <span className="font-mono text-[#60A5FA]">{u.referredByCode}</span>
                              </span>
                            ) : (
                              <span className="text-[#64748B]">Direct</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-xs font-semibold text-[#34D399] tabular-nums whitespace-nowrap">
                            {formatFCFA(u.balance)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-xs text-[#CBD5E1] tabular-nums whitespace-nowrap">
                            {u.checkInDays} j
                          </td>
                          <td className="py-3 px-4 font-mono text-xs text-[#94A3B8] tabular-nums whitespace-nowrap">
                            {formatDateOnly(u.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </main>
      </div>

      {/* Global Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-16 lg:top-20 right-4 left-4 sm:left-auto sm:w-96 z-50 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md text-sm font-medium flex items-center gap-2.5 ${
            toast.variant === 'error'
              ? 'bg-[#1F0B10]/95 border-[#EF4444]/40 text-[#FCA5A5]'
              : toast.variant === 'success'
              ? 'bg-[#071B16]/95 border-[#10B981]/40 text-[#A7F3D0]'
              : 'bg-[#0B152B]/95 border-[#3B82F6]/40 text-[#DBEAFE]'
          }`}
        >
          <span className="flex-1">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
