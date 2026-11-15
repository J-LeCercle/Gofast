import React from 'react';
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowUpFromLine,
  Bell,
  Headphones,
  Home,
  Layers,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  User,
  UserPlus,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { formatFCFA } from '../data/gofastData';
import { MainTab, SubView } from '../types';
import { GoFastLogo } from './BrandMark';

const VIEW_TITLES: Record<SubView, string> = {
  main: 'GoFast',
  recharge: 'Dépôt',
  withdraw: 'Retirer des fonds',
  'withdraw-account': 'Compte de retrait',
  'withdraw-history': 'Historique des retraits',
  'deposit-history': 'Historique des dépôts',
  'fund-history': 'Historique des fonds',
  'my-lines': 'Mes lignes',
  messages: 'Centre de notifications',
  'support-chat': 'Service client',
  wheel: 'Roue de la fortune',
  'how-it-works': 'Comment ça marche',
  about: 'À propos de GoFast',
  security: 'Sécurité du compte',
  'gift-code': 'Code cadeau',
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const {
    activeTab,
    subView,
    balance,
    hideBalance,
    messages,
    toast,
    liveAlert,
    dismissLiveAlert,
    markNotificationRead,
    navigateTo,
    setActiveTab,
    setSubView,
    isAdmin,
    setAdminMode,
  } = useAppState();

  const unreadCount = messages.filter((m) => !m.read).length;

  const handleMainTab = (tab: MainTab) => {
    setActiveTab(tab);
    setSubView('main');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (subView === 'withdraw-account') {
      setSubView('withdraw');
    } else {
      setSubView('main');
    }
  };

  const tabItems: { id: MainTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Accueil', icon: Home },
    { id: 'lines', label: 'Lignes', icon: Layers },
    { id: 'team', label: 'Équipe', icon: Users },
    { id: 'profile', label: 'Profil', icon: User },
  ];

  const isMain = subView === 'main';
  const currentTitle =
    isMain
      ? activeTab === 'home'
        ? 'Accueil'
        : activeTab === 'lines'
        ? 'Lignes de production'
        : activeTab === 'team'
        ? 'Mon équipe'
        : 'Profil'
      : VIEW_TITLES[subView];

  return (
    <div className="min-h-screen bg-[#050811] text-[#F8FAFC] flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 bg-[#070B16] border-r border-[#18243E] z-40">
        <div className="h-16 px-6 flex items-center border-b border-[#18243E]">
          <button
            type="button"
            onClick={() => handleMainTab('home')}
            className="focus-visible:outline-2 focus-visible:outline-[#3B82F6] rounded-lg"
          >
            <GoFastLogo />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
          <nav aria-label="Navigation principale" className="space-y-1">
            {tabItems.map((item) => {
              const Icon = item.icon;
              const isActive = isMain && activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleMainTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-[#1D4ED8]/20 text-white border border-[#3B82F6]/30'
                      : 'text-[#94A3B8] hover:text-white hover:bg-[#0F172A]'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#3B82F6]' : ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div>
            <p className="px-3.5 mb-2 text-xs font-medium text-[#64748B]">Opérations</p>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => navigateTo('recharge')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                  subView === 'recharge'
                    ? 'bg-[#1D4ED8]/20 text-white border border-[#3B82F6]/30'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#0F172A]'
                }`}
              >
                <ArrowDownToLine className="w-4 h-4 shrink-0" />
                <span>Dépôt</span>
              </button>
              <button
                type="button"
                onClick={() => navigateTo('withdraw')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                  subView === 'withdraw'
                    ? 'bg-[#1D4ED8]/20 text-white border border-[#3B82F6]/30'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#0F172A]'
                }`}
              >
                <ArrowUpFromLine className="w-4 h-4 shrink-0" />
                <span>Retrait</span>
              </button>
              <button
                type="button"
                onClick={() => navigateTo('my-lines')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                  subView === 'my-lines'
                    ? 'bg-[#1D4ED8]/20 text-white border border-[#3B82F6]/30'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#0F172A]'
                }`}
              >
                <Wallet className="w-4 h-4 shrink-0" />
                <span>Mes lignes</span>
              </button>
              <button
                type="button"
                onClick={() => navigateTo('wheel')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                  subView === 'wheel'
                    ? 'bg-[#1D4ED8]/20 text-white border border-[#3B82F6]/30'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#0F172A]'
                }`}
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Roue de la fortune</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-[#18243E] space-y-2">
          {isAdmin && (
            <button
              type="button"
              onClick={() => setAdminMode(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#1D4ED8]/25 hover:bg-[#1D4ED8]/40 border border-[#3B82F6]/40 transition-colors whitespace-nowrap"
            >
              <ShieldCheck className="w-4 h-4 text-[#60A5FA] shrink-0" />
              <span>Tableau de bord Admin</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => navigateTo('support-chat')}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#CBD5E1] bg-[#0D1526] hover:bg-[#13203A] border border-[#1E2E4E] transition-colors whitespace-nowrap"
          >
            <Headphones className="w-4 h-4 text-[#3B82F6] shrink-0" />
            <span>Service client</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Desktop Top Header (Clean 3-zone Top Bar Contract) */}
        <header className="hidden lg:flex sticky top-0 z-30 h-16 px-8 items-center justify-between gap-8 bg-[#050811]/90 backdrop-blur-md border-b border-[#18243E]">
          {/* Zone 1: Current context title */}
          <div className="flex items-center gap-3 min-w-0">
            {!isMain && (
              <button
                type="button"
                onClick={handleBack}
                className="p-2 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#0F172A] transition-colors"
                aria-label="Retour"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h1 className="font-display text-base font-semibold text-white truncate whitespace-nowrap shrink-0">
              {currentTitle}
            </h1>
          </div>

          {/* Zone 2: Clean single-line text nav links */}
          <nav className="flex items-center gap-6 text-sm font-medium text-[#94A3B8]">
            <button
              type="button"
              onClick={() => handleMainTab('home')}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Accueil
            </button>
            <button
              type="button"
              onClick={() => handleMainTab('lines')}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Lignes
            </button>
            <button
              type="button"
              onClick={() => handleMainTab('team')}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Équipe
            </button>
            <button
              type="button"
              onClick={() => navigateTo('messages')}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5"
            >
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#2563EB] text-white text-[11px] font-bold tabular-nums leading-none">
                  {unreadCount}
                </span>
              )}
            </button>
          </nav>

          {/* Zone 3: Single Primary Action + Alert Bell */}
          <div className="flex items-center gap-3 shrink-0">
            {isAdmin && (
              <button
                type="button"
                onClick={() => setAdminMode(true)}
                className="px-3 py-1.5 rounded-lg bg-[#0F1B33] hover:bg-[#16274A] border border-[#3B82F6]/40 text-[#93C5FD] text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                Admin
              </button>
            )}
            <button
              type="button"
              onClick={() => navigateTo('messages')}
              aria-label="Ouvrir le centre de notifications"
              className="relative p-2 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#0F172A] transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#3B82F6]" />
              )}
            </button>
            <span className="text-sm font-mono tabular-nums text-[#CBD5E1] whitespace-nowrap">
              {hideBalance ? '•••••• FCFA' : formatFCFA(balance)}
            </span>
            <button
              type="button"
              onClick={() => navigateTo('recharge')}
              className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#3B82F6] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              Déposer
            </button>
          </div>
        </header>

        {/* Mobile Sticky Top Header (<= 56px) */}
        <header className="lg:hidden sticky top-0 z-30 h-14 px-4 flex items-center justify-between bg-[#060A15]/95 backdrop-blur-md border-b border-[#18243E]">
          {isMain ? (
            <>
              <button
                type="button"
                onClick={() => handleMainTab('home')}
                className="min-h-[44px] flex items-center"
              >
                <GoFastLogo />
              </button>
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setAdminMode(true)}
                    className="px-2.5 py-1 rounded-lg bg-[#0F1B33] border border-[#3B82F6]/40 text-[#93C5FD] text-xs font-semibold whitespace-nowrap"
                  >
                    Admin
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => navigateTo('messages')}
                  aria-label="Centre de notifications"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#CBD5E1] hover:text-white hover:bg-[#0F172A] relative transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#2563EB] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleBack}
                aria-label="Retour"
                className="min-h-[44px] min-w-[44px] -ml-2 flex items-center justify-center text-[#CBD5E1] hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="font-display text-base font-semibold text-white truncate">
                {currentTitle}
              </h1>
              <div className="min-w-[44px] flex justify-end">
                {(subView === 'recharge' || subView === 'withdraw') && (
                  <button
                    type="button"
                    onClick={() =>
                      navigateTo(subView === 'recharge' ? 'deposit-history' : 'withdraw-history')
                    }
                    className="text-sm font-medium text-[#3B82F6] hover:text-[#60A5FA] whitespace-nowrap"
                  >
                    Historique
                  </button>
                )}
              </div>
            </>
          )}
        </header>

        {/* Main Viewport */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 pb-24 lg:pb-10">
          {children}
        </main>
      </div>

      {/* Floating Support Chat Button (only on main tabs to keep sub-page sticky CTAs unobstructed) */}
      {isMain && (
        <button
          type="button"
          onClick={() => navigateTo('support-chat')}
          aria-label="Ouvrir le service client"
          className="lg:hidden fixed right-4 bottom-20 z-30 w-12 h-12 rounded-full bg-[#0F1B33] border border-[#2563EB]/50 text-white shadow-lg shadow-black/50 flex items-center justify-center hover:bg-[#17284A] active:scale-95 transition-all"
        >
          <MessageSquare className="w-5 h-5 text-[#60A5FA]" />
        </button>
      )}

      {/* Mobile Fixed Bottom Navigation Bar (4 tabs, <= 64px height) */}
      {isMain && (
        <nav
          aria-label="Navigation mobile"
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-[#070B16]/95 backdrop-blur-md border-t border-[#18243E] grid grid-cols-4 items-center"
        >
          {tabItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleMainTab(item.id)}
                className={`relative flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
                  isActive ? 'text-white' : 'text-[#64748B] hover:text-[#CBD5E1]'
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 w-8 h-0.5 bg-[#3B82F6] rounded-b-full" />
                )}
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#3B82F6]' : ''}`} />
                <span className="text-[11px] font-medium mt-1 whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Real-Time Firestore Live Alert Card */}
      {liveAlert && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-16 lg:top-20 right-4 left-4 sm:left-auto sm:w-96 z-50 rounded-2xl bg-[#0B152B]/95 border border-[#3B82F6]/50 shadow-2xl shadow-black/60 backdrop-blur-md p-4 space-y-2.5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  liveAlert.category === 'earnings'
                    ? 'bg-[#071B16] border border-[#10B981]/40 text-[#34D399]'
                    : liveAlert.category === 'referral'
                    ? 'bg-[#111D38] border border-[#3B82F6]/40 text-[#60A5FA]'
                    : 'bg-[#101A30] border border-[#243963] text-[#93C5FD]'
                }`}
              >
                {liveAlert.category === 'earnings' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : liveAlert.category === 'referral' ? (
                  <UserPlus className="w-4 h-4" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#60A5FA]">
                  Alerte en direct
                </p>
                <p className="text-sm font-bold text-white truncate">{liveAlert.title}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={dismissLiveAlert}
              aria-label="Fermer l’alerte"
              className="p-1 text-[#94A3B8] hover:text-white shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-[#CBD5E1] leading-relaxed">{liveAlert.body}</p>
          {liveAlert.actionLabel && liveAlert.actionView && (
            <div className="flex justify-end pt-0.5">
              <button
                type="button"
                onClick={() => {
                  markNotificationRead(liveAlert.id);
                  navigateTo(liveAlert.actionView!, liveAlert.actionTab);
                  dismissLiveAlert();
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#3B82F6] text-white text-xs font-semibold transition-colors"
              >
                {liveAlert.actionLabel}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Global Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed ${
            liveAlert ? 'top-44 lg:top-48' : 'top-16 lg:top-20'
          } right-4 left-4 sm:left-auto sm:w-96 z-50 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md text-sm font-medium flex items-center gap-2.5 transition-all ${
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
