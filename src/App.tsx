import React, { useState } from 'react';
import { AppStateProvider, useAppState } from './context/AppStateContext';
import { AppShell } from './components/AppShell';
import { HomeView } from './components/HomeView';
import { LinesView } from './components/LinesView';
import { TeamView } from './components/TeamView';
import { ProfileView } from './components/ProfileView';
import { AuthScreen } from './components/AuthScreen';
import { AdminDashboard } from './components/AdminDashboard';
import {
  DepositHistoryView,
  FundHistoryView,
  MyLinesView,
  RechargeView,
  WithdrawAccountView,
  WithdrawHistoryView,
  WithdrawView,
} from './components/WalletViews';
import {
  InfoView,
  MessagesView,
  SupportChatView,
  WheelView,
} from './components/SecondaryViews';
import {
  EditProfileModal,
  GiftCodeModal,
  LineDetailModal,
  QRCodeModal,
} from './components/Modals';

function GoFastRouter() {
  const { authReady, authenticated, isAdmin, adminMode, activeTab, subView, loading } =
    useAppState();
  const [qrOpen, setQrOpen] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  if (!authReady || (authenticated && loading)) {
    return (
      <div className="min-h-screen bg-[#050811] flex flex-col items-center justify-center gap-3 text-sm text-[#94A3B8]">
        <div className="w-8 h-8 rounded-full border-2 border-[#2563EB] border-t-transparent animate-spin" />
        <span>Connexion à votre espace GoFast...</span>
      </div>
    );
  }

  if (!authenticated) {
    return <AuthScreen />;
  }

  if (isAdmin && adminMode) {
    return <AdminDashboard />;
  }

  const renderContent = () => {
    if (subView === 'recharge') return <RechargeView />;
    if (subView === 'withdraw') return <WithdrawView />;
    if (subView === 'withdraw-account') return <WithdrawAccountView />;
    if (subView === 'withdraw-history') return <WithdrawHistoryView />;
    if (subView === 'deposit-history') return <DepositHistoryView />;
    if (subView === 'fund-history') return <FundHistoryView />;
    if (subView === 'my-lines') return <MyLinesView />;
    if (subView === 'messages') return <MessagesView />;
    if (subView === 'support-chat') return <SupportChatView />;
    if (subView === 'wheel') return <WheelView />;
    if (subView === 'how-it-works') return <InfoView mode="how-it-works" />;
    if (subView === 'about') return <InfoView mode="about" />;
    if (subView === 'security') return <InfoView mode="security" />;

    switch (activeTab) {
      case 'home':
        return <HomeView />;
      case 'lines':
        return <LinesView />;
      case 'team':
        return <TeamView onOpenQR={() => setQrOpen(true)} />;
      case 'profile':
        return (
          <ProfileView
            onOpenEditProfile={() => setEditProfileOpen(true)}
            onOpenGiftCode={() => setGiftOpen(true)}
          />
        );
      default:
        return <HomeView />;
    }
  };

  return (
    <AppShell>
      {renderContent()}
      <LineDetailModal />
      <QRCodeModal open={qrOpen} onClose={() => setQrOpen(false)} />
      <GiftCodeModal open={giftOpen} onClose={() => setGiftOpen(false)} />
      <EditProfileModal open={editProfileOpen} onClose={() => setEditProfileOpen(false)} />
    </AppShell>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <GoFastRouter />
    </AppStateProvider>
  );
}
