import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  GoogleAuthProvider,
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import {
  ActiveLine,
  AdminUserSummary,
  ChatMessage,
  DepositRecord,
  FlowEvent,
  FlowEventType,
  FundTransaction,
  MainTab,
  NotificationCategory,
  ProductionLinePlan,
  SubView,
  SystemMessage,
  TeamMember,
  UserProfile,
  WithdrawalAccount,
  WithdrawalRecord,
} from '../types';
import { TEAM_TIERS, VALID_GIFT_CODES, WHEEL_PRIZES, formatFCFA } from '../data/gofastData';

export const ADMIN_EMAIL = 'allymika07@gmail.com';
const PENDING_REF_KEY = 'gofast_pending_referral_code';
const SOUND_PREF_KEY = 'gofast_sound_alerts';
const PUSH_PREF_KEY = 'gofast_browser_push';

interface ToastNotification {
  id: string;
  message: string;
  variant: 'success' | 'info' | 'error';
}

export interface LiveAlert {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  actionLabel?: string;
  actionView?: SubView;
  actionTab?: MainTab;
}

interface AppStateContextValue {
  authReady: boolean;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  authenticated: boolean;
  balance: number;
  checkInDays: number;
  lastCheckInDate: string | null;
  wheelSpins: number;
  usedGiftCodes: string[];
  claimedTiers: number[];
  profile: UserProfile;
  withdrawalAccount: WithdrawalAccount | null;
  activeLines: ActiveLine[];
  deposits: DepositRecord[];
  withdrawals: WithdrawalRecord[];
  fundHistory: FundTransaction[];
  messages: SystemMessage[];
  chatMessages: ChatMessage[];
  teamMembers: TeamMember[];
  hideBalance: boolean;
  activeTab: MainTab;
  subView: SubView;
  selectedLineForModal: ProductionLinePlan | null;
  toast: ToastNotification | null;
  liveAlert: LiveAlert | null;
  dismissLiveAlert: () => void;
  browserPushEnabled: boolean;
  soundAlertsEnabled: boolean;
  toggleBrowserPush: () => Promise<void>;
  toggleSoundAlerts: () => void;
  pendingReferralCode: string;
  setPendingReferralCode: (code: string) => void;
  setActiveTab: (tab: MainTab) => void;
  setSubView: (view: SubView) => void;
  navigateTo: (view: SubView, tab?: MainTab) => void;
  setSelectedLineForModal: (plan: ProductionLinePlan | null) => void;
  toggleHideBalance: () => void;
  showToast: (message: string, variant?: 'success' | 'info' | 'error') => void;
  signInWithGoogle: (referralCode?: string) => Promise<{ ok: boolean; error?: string }>;
  signInWithAdminGoogle: (email?: string) => Promise<{ ok: boolean; error?: string }>;
  isAdmin: boolean;
  adminMode: boolean;
  setAdminMode: (val: boolean) => void;
  adminFlows: FlowEvent[];
  adminUsers: AdminUserSummary[];
  adminLoading: boolean;
  validateAdminWithdrawal: (flow: FlowEvent) => Promise<void>;
  logout: () => Promise<void>;
  validateReferralCode: (
    rawCode: string
  ) => Promise<{ valid: boolean; ownerUid?: string; ownerName?: string; code?: string; error?: string }>;
  applyReferralCodeAfterSignup: (
    rawCode: string
  ) => Promise<{ ok: boolean; message: string }>;
  performCheckIn: () => Promise<void>;
  canCheckInToday: boolean;
  submitDeposit: (amount: number, method: string) => Promise<boolean>;
  launchLine: (plan: ProductionLinePlan) => Promise<{ ok: boolean; reason?: string }>;
  collectLineIncome: (lineId: string) => Promise<void>;
  collectAllLineIncome: () => Promise<void>;
  claimableLines: ActiveLine[];
  claimableDailyTotal: number;
  saveWithdrawalAccount: (account: WithdrawalAccount) => Promise<boolean>;
  submitWithdrawal: (amount: number) => Promise<{ ok: boolean; reason?: string }>;
  spinWheel: () => Promise<{ ok: boolean; winIndex?: number; prizeAmount?: number; error?: string }>;
  redeemGiftCode: (code: string) => Promise<{ ok: boolean; message: string }>;
  updateProfile: (name: string, phone: string) => Promise<boolean>;
  setLanguage: (lang: 'Français' | 'English') => Promise<void>;
  sendChatMessage: (text: string) => Promise<void>;
  markNotificationRead: (notifId: string) => Promise<void>;
  markAllMessagesRead: () => Promise<void>;
  claimTierBonus: (tier: number) => Promise<void>;
  totalDailyIncome: number;
  teamInvestmentTotal: number;
  weeklyCommissionTotal: number;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

const EMPTY_PROFILE: UserProfile = {
  uid: '',
  name: 'Utilisateur',
  email: '',
  phone: '',
  inviteCode: '',
  language: 'Français',
  referredByUid: null,
  referredByCode: null,
  referredByName: null,
  l2SponsorUid: null,
  l3SponsorUid: null,
};

function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;
}

function nowTimeString(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function makeId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function tsToIso(val: unknown): string {
  if (val instanceof Timestamp) return val.toDate().toISOString();
  if (typeof val === 'string') return val;
  return new Date().toISOString();
}

function playAlertChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    osc1.frequency.setValueAtTime(880, now + 0.09);
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.exponentialRampToValueAtTime(0.07, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);
    osc1.onended = () => {
      ctx.close().catch(() => {});
    };
  } catch {
    // Ignore audio context autoplay blocks
  }
}

function normalizeCategory(val: unknown): NotificationCategory {
  if (val === 'system' || val === 'earnings' || val === 'referral') return val;
  return 'info';
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [authReady, setAuthReady] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [balance, setBalance] = useState(0);
  const [checkInDays, setCheckInDays] = useState(0);
  const [lastCheckInDate, setLastCheckInDate] = useState<string | null>(null);
  const [wheelSpins, setWheelSpins] = useState(0);
  const [usedGiftCodes, setUsedGiftCodes] = useState<string[]>([]);
  const [claimedTiers, setClaimedTiers] = useState<number[]>([]);
  const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE);
  const [withdrawalAccount, setWithdrawalAccount] = useState<WithdrawalAccount | null>(null);

  const [activeLines, setActiveLines] = useState<ActiveLine[]>([]);
  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [fundHistory, setFundHistory] = useState<FundTransaction[]>([]);
  const [messages, setMessages] = useState<SystemMessage[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const [hideBalance, setHideBalance] = useState(false);
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [subView, setSubView] = useState<SubView>('main');
  const [selectedLineForModal, setSelectedLineForModal] = useState<ProductionLinePlan | null>(null);
  const [toast, setToast] = useState<ToastNotification | null>(null);
  const [liveAlert, setLiveAlert] = useState<LiveAlert | null>(null);
  const [todayKey, setTodayKey] = useState<string>(() => getTodayKey());
  const [adminMode, setAdminMode] = useState<boolean>(false);
  const [adminFlows, setAdminFlows] = useState<FlowEvent[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUserSummary[]>([]);
  const [adminLoading, setAdminLoading] = useState<boolean>(false);

  const isAdmin = Boolean(
    firebaseUser?.emailVerified && firebaseUser.email?.toLowerCase() === ADMIN_EMAIL
  );

  const [soundAlertsEnabled, setSoundAlertsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(SOUND_PREF_KEY);
    return saved === null ? true : saved === 'true';
  });
  const [browserPushEnabled, setBrowserPushEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    return localStorage.getItem(PUSH_PREF_KEY) === 'true' && Notification.permission === 'granted';
  });

  const [pendingReferralCode, setPendingReferralCodeState] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    const urlCode = (params.get('code') || '').trim().toUpperCase();
    if (urlCode) {
      sessionStorage.setItem(PENDING_REF_KEY, urlCode);
      return urlCode;
    }
    return sessionStorage.getItem(PENDING_REF_KEY) || '';
  });

  const claimingCommissionsRef = useRef<Set<string>>(new Set());
  const initializingUserRef = useRef<string | null>(null);
  const initialNotifsLoadedRef = useRef<boolean>(false);
  const seenNotifIdsRef = useRef<Set<string>>(new Set());
  const dailyAlertCheckedRef = useRef<string>('');
  const liveAlertTimerRef = useRef<number | null>(null);
  const soundEnabledRef = useRef<boolean>(soundAlertsEnabled);
  const browserPushRef = useRef<boolean>(browserPushEnabled);

  useEffect(() => {
    soundEnabledRef.current = soundAlertsEnabled;
  }, [soundAlertsEnabled]);

  useEffect(() => {
    browserPushRef.current = browserPushEnabled;
  }, [browserPushEnabled]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const next = getTodayKey();
      setTodayKey((prev) => (prev === next ? prev : next));
    }, 60000);
    return () => window.clearInterval(interval);
  }, []);

  const dismissLiveAlert = () => {
    if (liveAlertTimerRef.current) {
      window.clearTimeout(liveAlertTimerRef.current);
      liveAlertTimerRef.current = null;
    }
    setLiveAlert(null);
  };

  const triggerLiveAlert = (alert: LiveAlert) => {
    if (liveAlertTimerRef.current) {
      window.clearTimeout(liveAlertTimerRef.current);
    }
    setLiveAlert(alert);
    if (soundEnabledRef.current) {
      playAlertChime();
    }
    if (
      browserPushRef.current &&
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      try {
        new Notification(alert.title, { body: alert.body });
      } catch {
        // Ignore restricted notification context
      }
    }
    liveAlertTimerRef.current = window.setTimeout(() => {
      setLiveAlert((prev) => (prev?.id === alert.id ? null : prev));
    }, 7000);
  };

  const toggleSoundAlerts = () => {
    setSoundAlertsEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(SOUND_PREF_KEY, String(next));
      if (next) playAlertChime();
      return next;
    });
  };

  const toggleBrowserPush = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      showToast('Les notifications navigateur ne sont pas prises en charge sur cet appareil.', 'info');
      return;
    }
    if (browserPushEnabled) {
      setBrowserPushEnabled(false);
      localStorage.setItem(PUSH_PREF_KEY, 'false');
      showToast('Alertes navigateur désactivées.', 'info');
      return;
    }
    if (Notification.permission === 'denied') {
      showToast('Autorisation bloquée dans les réglages de votre navigateur.', 'error');
      return;
    }
    const perm =
      Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
    if (perm === 'granted') {
      setBrowserPushEnabled(true);
      localStorage.setItem(PUSH_PREF_KEY, 'true');
      showToast('Alertes navigateur activées en temps réel !', 'success');
    } else {
      showToast('Permission de notification refusée.', 'info');
    }
  };

  const setPendingReferralCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    setPendingReferralCodeState(clean);
    if (clean) {
      sessionStorage.setItem(PENDING_REF_KEY, clean);
    } else {
      sessionStorage.removeItem(PENDING_REF_KEY);
    }
  };

  const showToast = (message: string, variant: 'success' | 'info' | 'error' = 'info') => {
    const id = `toast-${Date.now()}`;
    setToast({ id, message, variant });
    window.setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 3600);
  };

  const validateReferralCode = async (rawCode: string) => {
    const code = rawCode.trim().toUpperCase();
    if (!code || !/^[A-Z0-9]{4,12}$/.test(code)) {
      return { valid: false, error: 'Format de code invalide (4 à 12 caractères alphanumériques).' };
    }
    const path = `referralCodes/${code}`;
    try {
      const snap = await getDoc(doc(db, 'referralCodes', code));
      if (!snap.exists()) {
        return { valid: false, error: 'Code de parrainage introuvable.' };
      }
      const d = snap.data();
      return {
        valid: true,
        code: String(d.code),
        ownerUid: String(d.ownerUid),
        ownerName: String(d.ownerName),
      };
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
    }
  };

  const linkSponsorToUser = async (
    uid: string,
    memberName: string,
    rawCode: string,
    isInitialCreate: boolean
  ): Promise<{
    referredByUid: string | null;
    referredByCode: string | null;
    referredByName: string | null;
    l2SponsorUid: string | null;
    l3SponsorUid: string | null;
  }> => {
    const cleanCode = rawCode.trim().toUpperCase();
    if (!cleanCode || !/^[A-Z0-9]{4,12}$/.test(cleanCode)) {
      return {
        referredByUid: null,
        referredByCode: null,
        referredByName: null,
        l2SponsorUid: null,
        l3SponsorUid: null,
      };
    }

    const codeSnap = await getDoc(doc(db, 'referralCodes', cleanCode));
    if (!codeSnap.exists()) {
      return {
        referredByUid: null,
        referredByCode: null,
        referredByName: null,
        l2SponsorUid: null,
        l3SponsorUid: null,
      };
    }

    const sponsorData = codeSnap.data();
    const l1Uid = String(sponsorData.ownerUid);
    if (l1Uid === uid) {
      return {
        referredByUid: null,
        referredByCode: null,
        referredByName: null,
        l2SponsorUid: null,
        l3SponsorUid: null,
      };
    }

    const l2Uid = sponsorData.l1SponsorUid ? String(sponsorData.l1SponsorUid) : null;
    const l3Uid = sponsorData.l2SponsorUid ? String(sponsorData.l2SponsorUid) : null;
    const sponsorName = String(sponsorData.ownerName);

    const batch = writeBatch(db);

    batch.set(doc(db, 'users', l1Uid, 'teamMembers', uid), {
      memberUid: uid,
      sponsorUid: l1Uid,
      memberName: memberName.slice(0, 80),
      level: 1,
      investedAmount: 0,
      commissionEarned: 0,
      joinedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    if (l2Uid && l2Uid !== uid) {
      batch.set(doc(db, 'users', l2Uid, 'teamMembers', uid), {
        memberUid: uid,
        sponsorUid: l2Uid,
        memberName: memberName.slice(0, 80),
        level: 2,
        investedAmount: 0,
        commissionEarned: 0,
        joinedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    if (l3Uid && l3Uid !== uid) {
      batch.set(doc(db, 'users', l3Uid, 'teamMembers', uid), {
        memberUid: uid,
        sponsorUid: l3Uid,
        memberName: memberName.slice(0, 80),
        level: 3,
        investedAmount: 0,
        commissionEarned: 0,
        joinedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    const notifId = makeId('notif_ref_l1');
    batch.set(doc(db, 'users', l1Uid, 'notifications', notifId), {
      id: notifId,
      userId: l1Uid,
      senderUid: uid,
      category: 'referral',
      title: 'Nouveau filleul inscrit (N1)',
      body: `${memberName} vient de rejoindre votre équipe avec votre code ${cleanCode}. Vous recevrez 37 % dès son premier lancement de ligne.`,
      read: false,
      createdAt: serverTimestamp(),
    });

    if (l2Uid && l2Uid !== uid) {
      const notifL2Id = makeId('notif_ref_l2');
      batch.set(doc(db, 'users', l2Uid, 'notifications', notifL2Id), {
        id: notifL2Id,
        userId: l2Uid,
        senderUid: uid,
        category: 'referral',
        title: 'Nouveau filleul dans votre réseau (N2)',
        body: `${memberName} vient de s’inscrire dans votre équipe de niveau 2.`,
        read: false,
        createdAt: serverTimestamp(),
      });
    }

    if (l3Uid && l3Uid !== uid) {
      const notifL3Id = makeId('notif_ref_l3');
      batch.set(doc(db, 'users', l3Uid, 'notifications', notifL3Id), {
        id: notifL3Id,
        userId: l3Uid,
        senderUid: uid,
        category: 'referral',
        title: 'Nouveau filleul dans votre réseau (N3)',
        body: `${memberName} vient de s’inscrire dans votre équipe de niveau 3.`,
        read: false,
        createdAt: serverTimestamp(),
      });
    }

    if (!isInitialCreate) {
      batch.update(doc(db, 'users', uid), {
        referredByUid: l1Uid,
        referredByCode: cleanCode,
        referredByName: sponsorName.slice(0, 80),
        l2SponsorUid: l2Uid,
        l3SponsorUid: l3Uid,
        updatedAt: serverTimestamp(),
      });
      if (profile.inviteCode) {
        batch.update(doc(db, 'referralCodes', profile.inviteCode), {
          ownerName: memberName.slice(0, 80),
          l1SponsorUid: l1Uid,
          l2SponsorUid: l2Uid,
        });
      }
    }

    try {
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${l1Uid}/teamMembers/${uid}`);
    }

    return {
      referredByUid: l1Uid,
      referredByCode: cleanCode,
      referredByName: sponsorName,
      l2SponsorUid: l2Uid,
      l3SponsorUid: l3Uid,
    };
  };

  const ensureUserInitialized = async (fbUser: FirebaseUser) => {
    if (initializingUserRef.current === fbUser.uid) return;
    initializingUserRef.current = fbUser.uid;

    const userRef = doc(db, 'users', fbUser.uid);
    let userSnap;
    try {
      userSnap = await getDoc(userRef);
    } catch (err) {
      initializingUserRef.current = null;
      handleFirestoreError(err, OperationType.GET, `users/${fbUser.uid}`);
    }

    if (userSnap.exists()) {
      initializingUserRef.current = null;
      return;
    }

    const displayName = (fbUser.displayName || fbUser.email?.split('@')[0] || 'Utilisateur').slice(
      0,
      80
    );
    const email = (fbUser.email || '').slice(0, 160);

    let inviteCode = generateInviteCode();
    for (let i = 0; i < 6; i++) {
      const codeSnap = await getDoc(doc(db, 'referralCodes', inviteCode));
      if (!codeSnap.exists()) break;
      inviteCode = generateInviteCode();
    }

    const pendingCode = (
      sessionStorage.getItem(PENDING_REF_KEY) || pendingReferralCode || ''
    ).trim().toUpperCase();

    const sponsorLink = await linkSponsorToUser(fbUser.uid, displayName, pendingCode, true);

    const batch = writeBatch(db);
    batch.set(userRef, {
      uid: fbUser.uid,
      name: displayName,
      email,
      phone: '',
      inviteCode,
      referredByUid: sponsorLink.referredByUid,
      referredByCode: sponsorLink.referredByCode,
      referredByName: sponsorLink.referredByName,
      l2SponsorUid: sponsorLink.l2SponsorUid,
      l3SponsorUid: sponsorLink.l3SponsorUid,
      balance: 800,
      checkInDays: 0,
      lastCheckInDate: null,
      wheelSpins: 1,
      language: 'Français',
      withdrawalAccount: null,
      usedGiftCodes: [],
      claimedTiers: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    batch.set(doc(db, 'referralCodes', inviteCode), {
      code: inviteCode,
      ownerUid: fbUser.uid,
      ownerName: displayName,
      l1SponsorUid: sponsorLink.referredByUid,
      l2SponsorUid: sponsorLink.l2SponsorUid,
      createdAt: serverTimestamp(),
    });

    const welcomeTxId = makeId('tx_welcome');
    batch.set(doc(db, 'users', fbUser.uid, 'transactions', welcomeTxId), {
      id: welcomeTxId,
      userId: fbUser.uid,
      type: 'credit',
      category: 'Cadeau',
      label: 'Bonus de bienvenue GoFast',
      amount: 800,
      balanceAfter: 800,
      createdAt: serverTimestamp(),
    });

    const welcomeNotifId = makeId('notif_welcome');
    batch.set(doc(db, 'users', fbUser.uid, 'notifications', welcomeNotifId), {
      id: welcomeNotifId,
      userId: fbUser.uid,
      senderUid: fbUser.uid,
      category: 'system',
      title: 'Bienvenue sur GoFast',
      body: sponsorLink.referredByName
        ? `Votre compte est actif avec 800 FCFA offerts. Parrain : ${sponsorLink.referredByName} (${sponsorLink.referredByCode}). Votre code personnel : ${inviteCode}.`
        : `Votre compte est actif avec 800 FCFA offerts. Votre code de parrainage personnel : ${inviteCode}.`,
      read: false,
      createdAt: serverTimestamp(),
    });

    const signupFlowId = makeId('flow_signup');
    batch.set(doc(db, 'flows', signupFlowId), {
      id: signupFlowId,
      userId: fbUser.uid,
      userName: displayName,
      userEmail: email,
      eventType: 'signup' as FlowEventType,
      title: 'Nouvelle inscription membre',
      detail: sponsorLink.referredByName
        ? `Parrainé par ${sponsorLink.referredByName} (${sponsorLink.referredByCode})`
        : `Code personnel attribué : ${inviteCode}`,
      amount: 800,
      direction: 'in',
      status: 'Actif',
      reference: inviteCode,
      targetDocId: null,
      createdAt: serverTimestamp(),
    });

    const chatWelcomeId = makeId('chat_init');
    batch.set(doc(db, 'users', fbUser.uid, 'supportMessages', chatWelcomeId), {
      id: chatWelcomeId,
      userId: fbUser.uid,
      sender: 'agent',
      text: 'Bonjour, comment puis-je vous aider ?',
      timestamp: '09:00',
      createdAt: serverTimestamp(),
    });

    try {
      await batch.commit();
      sessionStorage.removeItem(PENDING_REF_KEY);
      setPendingReferralCodeState('');
      if (window.history.replaceState && window.location.search) {
        window.history.replaceState({}, '', '/');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${fbUser.uid}`);
    } finally {
      initializingUserRef.current = null;
    }
  };

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setAuthReady(true);

      if (!user) {
        setProfile(EMPTY_PROFILE);
        setBalance(0);
        setActiveLines([]);
        setDeposits([]);
        setWithdrawals([]);
        setFundHistory([]);
        setMessages([]);
        setChatMessages([]);
        setTeamMembers([]);
        setAdminMode(false);
        setAdminFlows([]);
        setAdminUsers([]);
        setLoading(false);
        return;
      }

      const userIsAdmin = Boolean(
        user.emailVerified && user.email?.toLowerCase() === ADMIN_EMAIL
      );
      setAdminMode(userIsAdmin);

      setLoading(true);
      try {
        await ensureUserInitialized(user);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubAuth();
  }, []);

  // Real-time Firestore listeners once authenticated
  useEffect(() => {
    if (!authReady || !firebaseUser) return;
    const uid = firebaseUser.uid;

    const unsubUser = onSnapshot(
      doc(db, 'users', uid),
      (snap) => {
        if (!snap.exists()) return;
        const d = snap.data();
        setBalance(Number(d.balance || 0));
        setCheckInDays(Number(d.checkInDays || 0));
        setLastCheckInDate(d.lastCheckInDate ? String(d.lastCheckInDate) : null);
        setWheelSpins(Number(d.wheelSpins || 0));
        setUsedGiftCodes(Array.isArray(d.usedGiftCodes) ? d.usedGiftCodes.map(String) : []);
        setClaimedTiers(Array.isArray(d.claimedTiers) ? d.claimedTiers.map(Number) : []);
        setWithdrawalAccount(
          d.withdrawalAccount
            ? {
                holderName: String(d.withdrawalAccount.holderName),
                operator: String(d.withdrawalAccount.operator),
                accountNumber: String(d.withdrawalAccount.accountNumber),
              }
            : null
        );
        setProfile({
          uid: String(d.uid),
          name: String(d.name),
          email: String(d.email || ''),
          phone: String(d.phone || ''),
          inviteCode: String(d.inviteCode),
          language: d.language === 'English' ? 'English' : 'Français',
          referredByUid: d.referredByUid ? String(d.referredByUid) : null,
          referredByCode: d.referredByCode ? String(d.referredByCode) : null,
          referredByName: d.referredByName ? String(d.referredByName) : null,
          l2SponsorUid: d.l2SponsorUid ? String(d.l2SponsorUid) : null,
          l3SponsorUid: d.l3SponsorUid ? String(d.l3SponsorUid) : null,
        });
      },
      (err) => handleFirestoreError(err, OperationType.GET, `users/${uid}`)
    );

    const unsubTeam = onSnapshot(
      query(collection(db, 'users', uid, 'teamMembers'), orderBy('joinedAt', 'desc')),
      (snap) => {
        setTeamMembers(
          snap.docs.map((docSnap) => {
            const d = docSnap.data();
            return {
              id: String(d.memberUid),
              name: String(d.memberName),
              phone: `Niveau ${Number(d.level)}`,
              level: (Number(d.level) as 1 | 2 | 3) || 1,
              investedAmount: Number(d.investedAmount || 0),
              commissionEarned: Number(d.commissionEarned || 0),
              joinedAt: tsToIso(d.joinedAt),
            };
          })
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${uid}/teamMembers`)
    );

    // Auto-claim incoming referral commissions in real time
    const unsubCommissions = onSnapshot(
      collection(db, 'users', uid, 'commissions'),
      async (snap) => {
        for (const docSnap of snap.docs) {
          const d = docSnap.data();
          const commId = docSnap.id;
          if (d.claimed === true || claimingCommissionsRef.current.has(commId)) continue;
          claimingCommissionsRef.current.add(commId);

          try {
            await runTransaction(db, async (tx) => {
              const userRef = doc(db, 'users', uid);
              const commRef = doc(db, 'users', uid, 'commissions', commId);
              const [uSnap, cSnap] = await Promise.all([tx.get(userRef), tx.get(commRef)]);
              if (!uSnap.exists() || !cSnap.exists() || cSnap.data().claimed === true) return;

              const amt = Number(cSnap.data().amount || 0);
              const nextBal = Number(uSnap.data().balance || 0) + amt;
              const txId = makeId('tx_comm');

              tx.update(commRef, { claimed: true });
              tx.update(userRef, { balance: nextBal, updatedAt: serverTimestamp() });
              tx.set(doc(db, 'users', uid, 'transactions', txId), {
                id: txId,
                userId: uid,
                type: 'credit',
                category: 'Commission',
                label: `Commission N${cSnap.data().level} · ${cSnap.data().fromMemberName}`,
                amount: amt,
                balanceAfter: nextBal,
                createdAt: serverTimestamp(),
              });
              const commFlowId = makeId('flow_comm');
              tx.set(doc(db, 'flows', commFlowId), {
                id: commFlowId,
                userId: uid,
                userName: (uSnap.data().name ? String(uSnap.data().name) : 'Parrain').slice(0, 80),
                userEmail: (uSnap.data().email ? String(uSnap.data().email) : '').slice(0, 160),
                eventType: 'commission',
                title: `Commission équipe N${cSnap.data().level}`,
                detail: `De ${cSnap.data().fromMemberName} · ${cSnap.data().lineName}`.slice(0, 240),
                amount: amt,
                direction: 'in',
                status: 'Crédité',
                reference: commId.slice(0, 64),
                targetDocId: commId,
                createdAt: serverTimestamp(),
              });
            });
            showToast(`Commission d’équipe créditée : +${formatFCFA(Number(d.amount))} !`, 'success');
          } catch (err) {
            console.error('Commission claim error:', err);
          } finally {
            claimingCommissionsRef.current.delete(commId);
          }
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${uid}/commissions`)
    );

    const unsubLines = onSnapshot(
      query(collection(db, 'users', uid, 'lines'), orderBy('startedAt', 'desc')),
      (snap) => {
        setActiveLines(
          snap.docs.map((docSnap) => {
            const d = docSnap.data();
            return {
              id: docSnap.id,
              planId: String(d.planId),
              planCode: String(d.planCode),
              name: String(d.name),
              categoryLabel: String(d.categoryLabel),
              price: Number(d.price),
              dailyIncome: Number(d.dailyIncome),
              durationDays: Number(d.durationDays),
              daysElapsed: Number(d.daysElapsed),
              totalEarned: Number(d.totalEarned),
              startedAt: tsToIso(d.startedAt),
              lastClaimedAt: d.lastClaimedAt ? String(d.lastClaimedAt) : null,
              status: d.status === 'completed' ? 'completed' : 'active',
            };
          })
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${uid}/lines`)
    );

    const unsubDeposits = onSnapshot(
      query(collection(db, 'users', uid, 'deposits'), orderBy('createdAt', 'desc')),
      (snap) => {
        setDeposits(
          snap.docs.map((docSnap) => {
            const d = docSnap.data();
            return {
              id: docSnap.id,
              amount: Number(d.amount),
              method: String(d.method),
              status: (d.status as DepositRecord['status']) || 'Succès',
              reference: String(d.reference),
              createdAt: tsToIso(d.createdAt),
            };
          })
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${uid}/deposits`)
    );

    const unsubWithdrawals = onSnapshot(
      query(collection(db, 'users', uid, 'withdrawals'), orderBy('createdAt', 'desc')),
      (snap) => {
        setWithdrawals(
          snap.docs.map((docSnap) => {
            const d = docSnap.data();
            return {
              id: docSnap.id,
              grossAmount: Number(d.grossAmount),
              feeAmount: Number(d.feeAmount),
              netAmount: Number(d.netAmount),
              operator: String(d.operator),
              accountNumber: String(d.accountNumber),
              status: (d.status as WithdrawalRecord['status']) || 'En attente',
              reference: String(d.reference),
              createdAt: tsToIso(d.createdAt),
            };
          })
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${uid}/withdrawals`)
    );

    const unsubTx = onSnapshot(
      query(collection(db, 'users', uid, 'transactions'), orderBy('createdAt', 'desc')),
      (snap) => {
        setFundHistory(
          snap.docs.map((docSnap) => {
            const d = docSnap.data();
            return {
              id: docSnap.id,
              type: d.type === 'debit' ? 'debit' : 'credit',
              category: d.category as FundTransaction['category'],
              label: String(d.label),
              amount: Number(d.amount),
              balanceAfter: Number(d.balanceAfter),
              createdAt: tsToIso(d.createdAt),
            };
          })
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${uid}/transactions`)
    );

    initialNotifsLoadedRef.current = false;
    seenNotifIdsRef.current.clear();
    dailyAlertCheckedRef.current = '';

    const unsubNotifs = onSnapshot(
      query(collection(db, 'users', uid, 'notifications'), orderBy('createdAt', 'desc')),
      (snap) => {
        if (!initialNotifsLoadedRef.current) {
          for (const d of snap.docs) {
            seenNotifIdsRef.current.add(d.id);
          }
          initialNotifsLoadedRef.current = true;
        } else {
          for (const change of snap.docChanges()) {
            if (change.type === 'added' && !seenNotifIdsRef.current.has(change.doc.id)) {
              seenNotifIdsRef.current.add(change.doc.id);
              const raw = change.doc.data();
              const cat = normalizeCategory(raw.category);
              if (raw.read !== true) {
                const actionProps: Pick<LiveAlert, 'actionLabel' | 'actionView' | 'actionTab'> =
                  cat === 'referral'
                    ? { actionLabel: 'Voir l’équipe', actionView: 'main', actionTab: 'team' }
                    : cat === 'earnings'
                    ? { actionLabel: 'Mes lignes', actionView: 'my-lines' }
                    : { actionLabel: 'Messages', actionView: 'messages' };
                triggerLiveAlert({
                  id: change.doc.id,
                  category: cat,
                  title: String(raw.title),
                  body: String(raw.body),
                  ...actionProps,
                });
              }
            }
          }
        }

        setMessages(
          snap.docs.map((docSnap) => {
            const d = docSnap.data();
            return {
              id: docSnap.id,
              category: normalizeCategory(d.category),
              title: String(d.title),
              body: String(d.body),
              read: Boolean(d.read),
              createdAt: tsToIso(d.createdAt),
            };
          })
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${uid}/notifications`)
    );

    const unsubChat = onSnapshot(
      query(collection(db, 'users', uid, 'supportMessages'), orderBy('createdAt', 'asc')),
      (snap) => {
        setChatMessages(
          snap.docs.map((docSnap) => {
            const d = docSnap.data();
            return {
              id: docSnap.id,
              sender: d.sender === 'user' ? 'user' : 'agent',
              text: String(d.text),
              timestamp: String(d.timestamp),
            };
          })
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${uid}/supportMessages`)
    );

    return () => {
      unsubUser();
      unsubTeam();
      unsubCommissions();
      unsubLines();
      unsubDeposits();
      unsubWithdrawals();
      unsubTx();
      unsubNotifs();
      unsubChat();
    };
  }, [authReady, firebaseUser]);

  // Real-time daily earnings availability notification
  const claimableLines = activeLines.filter(
    (l) => l.status === 'active' && l.lastClaimedAt !== todayKey
  );
  const claimableDailyTotal = claimableLines.reduce((sum, l) => sum + l.dailyIncome, 0);

  useEffect(() => {
    if (!authReady || !firebaseUser) return;
    if (claimableLines.length === 0 || claimableDailyTotal <= 0) return;
    if (dailyAlertCheckedRef.current === todayKey) return;

    const uid = firebaseUser.uid;
    const dailyNotifId = `notif_daily_avail_${todayKey}`;
    dailyAlertCheckedRef.current = todayKey;

    (async () => {
      try {
        const notifRef = doc(db, 'users', uid, 'notifications', dailyNotifId);
        const existingSnap = await getDoc(notifRef);
        if (existingSnap.exists()) return;

        await setDoc(notifRef, {
          id: dailyNotifId,
          userId: uid,
          senderUid: uid,
          category: 'earnings',
          title: 'Gains quotidiens disponibles',
          body: `Vos ${claimableLines.length} ligne${
            claimableLines.length > 1 ? 's actives ont' : ' active a'
          } généré +${formatFCFA(claimableDailyTotal)} à récolter aujourd’hui.`,
          read: false,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.error('Daily yield notification error:', err);
      }
    })();
  }, [authReady, firebaseUser, todayKey, claimableLines.length, claimableDailyTotal]);

  // Real-time Admin listeners when authenticated as allymika07@gmail.com
  useEffect(() => {
    if (!authReady || !firebaseUser || !isAdmin) {
      setAdminFlows([]);
      setAdminUsers([]);
      setAdminLoading(false);
      return;
    }

    setAdminLoading(true);
    const unsubFlows = onSnapshot(
      query(collection(db, 'flows'), orderBy('createdAt', 'desc'), limit(200)),
      (snap) => {
        setAdminFlows(
          snap.docs.map((docSnap) => {
            const d = docSnap.data();
            return {
              id: docSnap.id,
              userId: String(d.userId),
              userName: String(d.userName),
              userEmail: String(d.userEmail || ''),
              eventType: (d.eventType as FlowEventType) || 'bonus',
              title: String(d.title),
              detail: String(d.detail),
              amount: Number(d.amount || 0),
              direction:
                d.direction === 'in' || d.direction === 'out' ? d.direction : 'neutral',
              status: String(d.status),
              reference: String(d.reference || ''),
              targetDocId: d.targetDocId ? String(d.targetDocId) : null,
              createdAt: tsToIso(d.createdAt),
            };
          })
        );
        setAdminLoading(false);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'flows')
    );

    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snap) => {
        const list = snap.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            uid: String(d.uid),
            name: String(d.name),
            email: String(d.email || ''),
            phone: String(d.phone || ''),
            inviteCode: String(d.inviteCode || ''),
            referredByCode: d.referredByCode ? String(d.referredByCode) : null,
            referredByName: d.referredByName ? String(d.referredByName) : null,
            balance: Number(d.balance || 0),
            checkInDays: Number(d.checkInDays || 0),
            wheelSpins: Number(d.wheelSpins || 0),
            createdAt: tsToIso(d.createdAt),
          };
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setAdminUsers(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'users')
    );

    return () => {
      unsubFlows();
      unsubUsers();
    };
  }, [authReady, firebaseUser, isAdmin]);

  const signInWithGoogle = async (referralCode?: string) => {
    const clean = (referralCode || '').trim().toUpperCase();
    if (clean) {
      const check = await validateReferralCode(clean);
      if (!check.valid) {
        return { ok: false, error: check.error || 'Code de parrainage invalide.' };
      }
      setPendingReferralCode(clean);
    }

    try {
      await signInWithPopup(auth, googleProvider);
      return { ok: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connexion Google annulée.';
      return { ok: false, error: message };
    }
  };

  const signInWithAdminGoogle = async (enteredEmail?: string) => {
    const cleanEmail = (enteredEmail || '').trim().toLowerCase();
    if (!cleanEmail || cleanEmail !== ADMIN_EMAIL) {
      return {
        ok: false,
        error: 'Adresse e-mail non autorisée pour l’accès administrateur.',
      };
    }

    const adminProvider = new GoogleAuthProvider();
    adminProvider.setCustomParameters({
      prompt: 'select_account',
      login_hint: cleanEmail,
    });
    try {
      const cred = await signInWithPopup(auth, adminProvider);
      const email = cred.user.email?.toLowerCase() || '';
      if (email !== ADMIN_EMAIL || !cred.user.emailVerified) {
        await signOut(auth);
        return {
          ok: false,
          error: 'Ce compte Google vérifié n’est pas autorisé pour l’administration.',
        };
      }
      setAdminMode(true);
      return { ok: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connexion administrateur annulée.';
      return { ok: false, error: message };
    }
  };

  const validateAdminWithdrawal = async (flow: FlowEvent) => {
    if (!isAdmin || !firebaseUser) return;
    if (!flow.targetDocId || flow.status !== 'En attente') return;

    const batch = writeBatch(db);
    batch.update(doc(db, 'users', flow.userId, 'withdrawals', flow.targetDocId), {
      status: 'Validé',
    });
    batch.update(doc(db, 'flows', flow.id), {
      status: 'Validé',
    });
    const notifId = makeId('notif_wdr_ok');
    batch.set(doc(db, 'users', flow.userId, 'notifications', notifId), {
      id: notifId,
      userId: flow.userId,
      senderUid: firebaseUser.uid,
      category: 'system',
      title: 'Retrait validé',
      body: `Votre retrait (${flow.reference}) de ${formatFCFA(flow.amount)} a été validé par l’administration.`,
      read: false,
      createdAt: serverTimestamp(),
    });

    try {
      await batch.commit();
      showToast(`Retrait ${flow.reference} validé avec succès.`, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `flows/${flow.id}`);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setAdminMode(false);
    setActiveTab('home');
    setSubView('main');
    showToast('Vous êtes déconnecté.', 'info');
  };

  const applyReferralCodeAfterSignup = async (
    rawCode: string
  ): Promise<{ ok: boolean; message: string }> => {
    if (!firebaseUser) return { ok: false, message: 'Connexion requise.' };
    if (profile.referredByUid) {
      return { ok: false, message: `Vous êtes déjà parrainé par ${profile.referredByName}.` };
    }
    const clean = rawCode.trim().toUpperCase();
    const check = await validateReferralCode(clean);
    if (!check.valid || !check.ownerUid) {
      return { ok: false, message: check.error || 'Code de parrainage introuvable.' };
    }
    if (check.ownerUid === firebaseUser.uid) {
      return { ok: false, message: 'Vous ne pouvez pas utiliser votre propre code de parrainage.' };
    }

    const linked = await linkSponsorToUser(firebaseUser.uid, profile.name, clean, false);
    if (!linked.referredByUid) {
      return { ok: false, message: 'Impossible d’associer ce code de parrainage.' };
    }
    const refFlowId = makeId('flow_ref');
    setDoc(doc(db, 'flows', refFlowId), {
      id: refFlowId,
      userId: firebaseUser.uid,
      userName: (profile.name || 'Utilisateur').slice(0, 80),
      userEmail: (profile.email || firebaseUser.email || '').slice(0, 160),
      eventType: 'referral',
      title: 'Parrainage associé',
      detail: `Équipe de ${linked.referredByName} (${clean})`,
      amount: 0,
      direction: 'neutral',
      status: 'Lié',
      reference: clean,
      targetDocId: null,
      createdAt: serverTimestamp(),
    }).catch((err) => console.error('Referral flow log error:', err));

    showToast(`Parrain associé : ${linked.referredByName} (${clean}) !`, 'success');
    return {
      ok: true,
      message: `Vous avez rejoint l’équipe de ${linked.referredByName} !`,
    };
  };

  const navigateTo = (view: SubView, tab?: MainTab) => {
    if (tab) setActiveTab(tab);
    setSubView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleHideBalance = () => setHideBalance((p) => !p);
  const canCheckInToday = lastCheckInDate !== getTodayKey();

  const performCheckIn = async () => {
    if (!firebaseUser) return;
    const today = getTodayKey();
    if (lastCheckInDate === today) {
      showToast('Pointage déjà effectué pour aujourd’hui.', 'info');
      return;
    }

    const uid = firebaseUser.uid;
    const reward = 50;
    const nextBalance = balance + reward;
    const nextDays = checkInDays + 1;
    const txId = makeId('tx_checkin');
    const notifId = makeId('notif_checkin');

    const batch = writeBatch(db);
    batch.update(doc(db, 'users', uid), {
      balance: nextBalance,
      checkInDays: nextDays,
      lastCheckInDate: today,
      updatedAt: serverTimestamp(),
    });
    batch.set(doc(db, 'users', uid, 'transactions', txId), {
      id: txId,
      userId: uid,
      type: 'credit',
      category: 'Pointage',
      label: `Pointage quotidien (Jour ${nextDays})`,
      amount: reward,
      balanceAfter: nextBalance,
      createdAt: serverTimestamp(),
    });
    batch.set(doc(db, 'users', uid, 'notifications', notifId), {
      id: notifId,
      userId: uid,
      senderUid: uid,
      category: 'earnings',
      title: 'Pointage quotidien validé',
      body: `Vous avez reçu +${formatFCFA(reward)} sur votre solde principal.`,
      read: false,
      createdAt: serverTimestamp(),
    });
    const checkinFlowId = makeId('flow_chk');
    batch.set(doc(db, 'flows', checkinFlowId), {
      id: checkinFlowId,
      userId: uid,
      userName: (profile.name || 'Utilisateur').slice(0, 80),
      userEmail: (profile.email || firebaseUser.email || '').slice(0, 160),
      eventType: 'bonus',
      title: 'Pointage quotidien',
      detail: `Jour ${nextDays} validé`,
      amount: reward,
      direction: 'in',
      status: 'Succès',
      reference: txId.slice(0, 64),
      targetDocId: null,
      createdAt: serverTimestamp(),
    });

    try {
      await batch.commit();
      showToast('Pointage validé : +50 FCFA crédités !', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
    }
  };

  const submitDeposit = async (amount: number, method: string): Promise<boolean> => {
    if (!firebaseUser) return false;
    if (amount < 4000 || amount > 100000) {
      showToast('Le montant du dépôt doit être compris entre 4 000 et 100 000 FCFA.', 'error');
      return false;
    }

    const uid = firebaseUser.uid;
    const nextBalance = balance + amount;
    const depId = makeId('dep');
    const txId = makeId('tx_dep');
    const notifId = makeId('notif_dep');
    const refCode = `GF-DEP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const batch = writeBatch(db);
    batch.update(doc(db, 'users', uid), {
      balance: nextBalance,
      updatedAt: serverTimestamp(),
    });
    batch.set(doc(db, 'users', uid, 'deposits', depId), {
      id: depId,
      userId: uid,
      amount,
      method,
      status: 'Succès',
      reference: refCode,
      createdAt: serverTimestamp(),
    });
    batch.set(doc(db, 'users', uid, 'transactions', txId), {
      id: txId,
      userId: uid,
      type: 'credit',
      category: 'Dépôt',
      label: `Dépôt via ${method}`,
      amount,
      balanceAfter: nextBalance,
      createdAt: serverTimestamp(),
    });
    batch.set(doc(db, 'users', uid, 'notifications', notifId), {
      id: notifId,
      userId: uid,
      senderUid: uid,
      category: 'system',
      title: 'Dépôt confirmé',
      body: `Votre dépôt de ${formatFCFA(amount)} (${method}) a été crédité. Réf : ${refCode}.`,
      read: false,
      createdAt: serverTimestamp(),
    });
    const depFlowId = makeId('flow_dep');
    batch.set(doc(db, 'flows', depFlowId), {
      id: depFlowId,
      userId: uid,
      userName: (profile.name || 'Utilisateur').slice(0, 80),
      userEmail: (profile.email || firebaseUser.email || '').slice(0, 160),
      eventType: 'deposit',
      title: 'Dépôt reçu',
      detail: method.slice(0, 240),
      amount,
      direction: 'in',
      status: 'Succès',
      reference: refCode,
      targetDocId: depId,
      createdAt: serverTimestamp(),
    });

    try {
      await batch.commit();
      showToast(`Dépôt de ${formatFCFA(amount)} crédité avec succès !`, 'success');
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${uid}/deposits/${depId}`);
    }
  };

  const launchLine = async (
    plan: ProductionLinePlan
  ): Promise<{ ok: boolean; reason?: string }> => {
    if (!firebaseUser) return { ok: false, reason: 'Connexion requise.' };
    if (balance < plan.price) {
      return {
        ok: false,
        reason: `Solde insuffisant. Il vous manque ${formatFCFA(plan.price - balance)} pour lancer cette ligne.`,
      };
    }

    const uid = firebaseUser.uid;
    const nextBalance = balance - plan.price;
    const nextSpins = wheelSpins + 1;
    const lineId = makeId('line');
    const txId = makeId('tx_line');
    const notifId = makeId('notif_line');

    const batch = writeBatch(db);
    batch.update(doc(db, 'users', uid), {
      balance: nextBalance,
      wheelSpins: nextSpins,
      updatedAt: serverTimestamp(),
    });
    batch.set(doc(db, 'users', uid, 'lines', lineId), {
      id: lineId,
      userId: uid,
      planId: plan.id,
      planCode: plan.planCode,
      name: plan.name,
      categoryLabel: plan.categoryLabel,
      price: plan.price,
      dailyIncome: plan.dailyIncome,
      durationDays: plan.durationDays,
      daysElapsed: 0,
      totalEarned: 0,
      startedAt: serverTimestamp(),
      lastClaimedAt: null,
      status: 'active',
    });
    batch.set(doc(db, 'users', uid, 'transactions', txId), {
      id: txId,
      userId: uid,
      type: 'debit',
      category: 'Ligne',
      label: `Lancement ${plan.name} (${plan.planCode})`,
      amount: plan.price,
      balanceAfter: nextBalance,
      createdAt: serverTimestamp(),
    });
    batch.set(doc(db, 'users', uid, 'notifications', notifId), {
      id: notifId,
      userId: uid,
      senderUid: uid,
      category: 'system',
      title: 'Ligne de production activée',
      body: `${plan.name} est active pour ${plan.durationDays} jours. +1 tour de Roue de la fortune ajouté.`,
      read: false,
      createdAt: serverTimestamp(),
    });
    const lineFlowId = makeId('flow_line');
    batch.set(doc(db, 'flows', lineFlowId), {
      id: lineFlowId,
      userId: uid,
      userName: (profile.name || 'Utilisateur').slice(0, 80),
      userEmail: (profile.email || firebaseUser.email || '').slice(0, 160),
      eventType: 'line',
      title: `Lancement ${plan.name}`,
      detail: `${plan.planCode} · +${formatFCFA(plan.dailyIncome)}/j`,
      amount: plan.price,
      direction: 'neutral',
      status: 'Actif',
      reference: plan.planCode,
      targetDocId: lineId,
      createdAt: serverTimestamp(),
    });

    // Distribute 3-level commissions to sponsors (L1 37%, L2 2%, L3 1%)
    const sponsors: { uid: string; level: 1 | 2 | 3; rate: number }[] = [];
    if (profile.referredByUid) sponsors.push({ uid: profile.referredByUid, level: 1, rate: 0.37 });
    if (profile.l2SponsorUid) sponsors.push({ uid: profile.l2SponsorUid, level: 2, rate: 0.02 });
    if (profile.l3SponsorUid) sponsors.push({ uid: profile.l3SponsorUid, level: 3, rate: 0.01 });

    for (const sp of sponsors) {
      const commissionAmt = Math.round(plan.price * sp.rate);
      const commId = makeId(`comm_l${sp.level}`);
      const spNotifId = makeId(`notif_l${sp.level}`);
      const tmRef = doc(db, 'users', sp.uid, 'teamMembers', uid);

      try {
        const tmSnap = await getDoc(tmRef);
        if (tmSnap.exists()) {
          const curInv = Number(tmSnap.data().investedAmount || 0);
          const curCom = Number(tmSnap.data().commissionEarned || 0);
          batch.update(tmRef, {
            investedAmount: curInv + plan.price,
            commissionEarned: curCom + commissionAmt,
            updatedAt: serverTimestamp(),
          });
        }
      } catch {
        // Proceed with commission creation
      }

      batch.set(doc(db, 'users', sp.uid, 'commissions', commId), {
        id: commId,
        sponsorUid: sp.uid,
        fromMemberUid: uid,
        fromMemberName: profile.name.slice(0, 80),
        level: sp.level,
        lineName: plan.name,
        linePrice: plan.price,
        amount: commissionAmt,
        claimed: false,
        createdAt: serverTimestamp(),
      });

      batch.set(doc(db, 'users', sp.uid, 'notifications', spNotifId), {
        id: spNotifId,
        userId: sp.uid,
        senderUid: uid,
        category: 'earnings',
        title: `Commission d’équipe N${sp.level} reçue`,
        body: `${profile.name} a lancé ${plan.name} (${formatFCFA(
          plan.price
        )}). Commission : +${formatFCFA(commissionAmt)}.`,
        read: false,
        createdAt: serverTimestamp(),
      });
    }

    try {
      await batch.commit();
      showToast(`${plan.name} lancée ! +1 tour de Roue de la fortune offert.`, 'success');
      return { ok: true };
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${uid}/lines/${lineId}`);
    }
  };

  const collectLineIncome = async (lineId: string) => {
    if (!firebaseUser) return;
    const line = activeLines.find((l) => l.id === lineId);
    if (!line || line.status === 'completed') return;
    const today = getTodayKey();
    if (line.lastClaimedAt === today) {
      showToast('Le revenu de cette ligne a déjà été récolté aujourd’hui.', 'info');
      return;
    }

    const uid = firebaseUser.uid;
    const nextBalance = balance + line.dailyIncome;
    const nextDays = line.daysElapsed + 1;
    const nextEarned = line.totalEarned + line.dailyIncome;
    const nextStatus = nextDays >= line.durationDays ? 'completed' : 'active';
    const txId = makeId('tx_yield');
    const notifId = makeId('notif_yield');

    const batch = writeBatch(db);
    batch.update(doc(db, 'users', uid), {
      balance: nextBalance,
      updatedAt: serverTimestamp(),
    });
    batch.update(doc(db, 'users', uid, 'lines', lineId), {
      daysElapsed: nextDays,
      totalEarned: nextEarned,
      lastClaimedAt: today,
      status: nextStatus,
    });
    batch.set(doc(db, 'users', uid, 'transactions', txId), {
      id: txId,
      userId: uid,
      type: 'credit',
      category: 'Rendement',
      label: `Rendement quotidien · ${line.name}`,
      amount: line.dailyIncome,
      balanceAfter: nextBalance,
      createdAt: serverTimestamp(),
    });
    batch.set(doc(db, 'users', uid, 'notifications', notifId), {
      id: notifId,
      userId: uid,
      senderUid: uid,
      category: 'earnings',
      title: 'Gain quotidien récolté',
      body: `+${formatFCFA(line.dailyIncome)} crédités sur votre solde depuis ${line.name}.`,
      read: false,
      createdAt: serverTimestamp(),
    });
    const yieldFlowId = makeId('flow_yield');
    batch.set(doc(db, 'flows', yieldFlowId), {
      id: yieldFlowId,
      userId: uid,
      userName: (profile.name || 'Utilisateur').slice(0, 80),
      userEmail: (profile.email || firebaseUser.email || '').slice(0, 160),
      eventType: 'yield',
      title: 'Gain quotidien récolté',
      detail: `${line.name} (${line.planCode})`,
      amount: line.dailyIncome,
      direction: 'in',
      status: 'Crédité',
      reference: line.planCode,
      targetDocId: lineId,
      createdAt: serverTimestamp(),
    });

    try {
      await batch.commit();
      showToast(`+${formatFCFA(line.dailyIncome)} récoltés depuis ${line.name} !`, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}/lines/${lineId}`);
    }
  };

  const collectAllLineIncome = async () => {
    if (!firebaseUser) return;
    const today = getTodayKey();
    const ready = activeLines.filter((l) => l.status === 'active' && l.lastClaimedAt !== today);
    if (ready.length === 0) {
      showToast('Tous vos gains du jour ont déjà été récoltés.', 'info');
      return;
    }

    const uid = firebaseUser.uid;
    const totalHarvest = ready.reduce((sum, l) => sum + l.dailyIncome, 0);
    const nextBalance = balance + totalHarvest;
    const txId = makeId('tx_yield_all');
    const notifId = makeId('notif_yield_all');

    const batch = writeBatch(db);
    batch.update(doc(db, 'users', uid), {
      balance: nextBalance,
      updatedAt: serverTimestamp(),
    });
    for (const line of ready) {
      const nextDays = line.daysElapsed + 1;
      const nextStatus = nextDays >= line.durationDays ? 'completed' : 'active';
      batch.update(doc(db, 'users', uid, 'lines', line.id), {
        daysElapsed: nextDays,
        totalEarned: line.totalEarned + line.dailyIncome,
        lastClaimedAt: today,
        status: nextStatus,
      });
    }
    batch.set(doc(db, 'users', uid, 'transactions', txId), {
      id: txId,
      userId: uid,
      type: 'credit',
      category: 'Rendement',
      label: `Récolte quotidienne (${ready.length} ligne${ready.length > 1 ? 's' : ''})`,
      amount: totalHarvest,
      balanceAfter: nextBalance,
      createdAt: serverTimestamp(),
    });
    batch.set(doc(db, 'users', uid, 'notifications', notifId), {
      id: notifId,
      userId: uid,
      senderUid: uid,
      category: 'earnings',
      title: 'Gains quotidiens récoltés',
      body: `+${formatFCFA(totalHarvest)} crédités sur votre solde (${ready.length} ligne${
        ready.length > 1 ? 's' : ''
      }).`,
      read: false,
      createdAt: serverTimestamp(),
    });
    const yieldAllFlowId = makeId('flow_yield_all');
    batch.set(doc(db, 'flows', yieldAllFlowId), {
      id: yieldAllFlowId,
      userId: uid,
      userName: (profile.name || 'Utilisateur').slice(0, 80),
      userEmail: (profile.email || firebaseUser.email || '').slice(0, 160),
      eventType: 'yield',
      title: 'Récolte quotidienne groupée',
      detail: `${ready.length} ligne${ready.length > 1 ? 's' : ''} récoltée${ready.length > 1 ? 's' : ''}`,
      amount: totalHarvest,
      direction: 'in',
      status: 'Crédité',
      reference: today,
      targetDocId: null,
      createdAt: serverTimestamp(),
    });

    try {
      await batch.commit();
      showToast(`+${formatFCFA(totalHarvest)} récoltés avec succès !`, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${uid}/lines`);
    }
  };

  const saveWithdrawalAccount = async (account: WithdrawalAccount): Promise<boolean> => {
    if (!firebaseUser) return false;
    const uid = firebaseUser.uid;
    const notifId = makeId('notif_wacc');

    const batch = writeBatch(db);
    batch.update(doc(db, 'users', uid), {
      withdrawalAccount: account,
      updatedAt: serverTimestamp(),
    });
    batch.set(doc(db, 'users', uid, 'notifications', notifId), {
      id: notifId,
      userId: uid,
      senderUid: uid,
      category: 'system',
      title: 'Compte de retrait associé',
      body: `Le compte ${account.operator} (${account.accountNumber}) a été enregistré pour vos retraits.`,
      read: false,
      createdAt: serverTimestamp(),
    });

    try {
      await batch.commit();
      showToast('Compte de retrait enregistré avec succès.', 'success');
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const submitWithdrawal = async (
    amount: number
  ): Promise<{ ok: boolean; reason?: string }> => {
    if (!firebaseUser) return { ok: false, reason: 'Connexion requise.' };
    if (activeLines.length === 0) {
      return { ok: false, reason: 'Veuillez lancer au moins une ligne de production avant de retirer.' };
    }
    if (!withdrawalAccount) {
      return { ok: false, reason: 'Veuillez associer un compte de retrait.' };
    }
    if (amount < 1500 || amount > 1000000) {
      return { ok: false, reason: 'Le montant doit être compris entre 1 500 FCFA et 1 000 000 FCFA.' };
    }
    if (amount > balance) {
      return { ok: false, reason: 'Solde disponible insuffisant pour ce retrait.' };
    }

    const uid = firebaseUser.uid;
    const feeAmount = Math.round(amount * 0.18);
    const netAmount = amount - feeAmount;
    const nextBalance = balance - amount;
    const wdrId = makeId('wdr');
    const txId = makeId('tx_wdr');
    const notifId = makeId('notif_wdr');
    const refCode = `GF-WDR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const batch = writeBatch(db);
    batch.update(doc(db, 'users', uid), {
      balance: nextBalance,
      updatedAt: serverTimestamp(),
    });
    batch.set(doc(db, 'users', uid, 'withdrawals', wdrId), {
      id: wdrId,
      userId: uid,
      grossAmount: amount,
      feeAmount,
      netAmount,
      operator: withdrawalAccount.operator,
      accountNumber: withdrawalAccount.accountNumber,
      status: 'En attente',
      reference: refCode,
      createdAt: serverTimestamp(),
    });
    batch.set(doc(db, 'users', uid, 'transactions', txId), {
      id: txId,
      userId: uid,
      type: 'debit',
      category: 'Retrait',
      label: `Retrait vers ${withdrawalAccount.operator}`,
      amount,
      balanceAfter: nextBalance,
      createdAt: serverTimestamp(),
    });
    batch.set(doc(db, 'users', uid, 'notifications', notifId), {
      id: notifId,
      userId: uid,
      senderUid: uid,
      category: 'system',
      title: 'Demande de retrait enregistrée',
      body: `Montant net à recevoir : ${formatFCFA(netAmount)} (frais 18 % : ${formatFCFA(
        feeAmount
      )}). Délai estimé : 1 à 48 h.`,
      read: false,
      createdAt: serverTimestamp(),
    });
    const wdrFlowId = makeId('flow_wdr');
    batch.set(doc(db, 'flows', wdrFlowId), {
      id: wdrFlowId,
      userId: uid,
      userName: (profile.name || 'Utilisateur').slice(0, 80),
      userEmail: (profile.email || firebaseUser.email || '').slice(0, 160),
      eventType: 'withdrawal',
      title: 'Demande de retrait',
      detail: `${withdrawalAccount.operator} (${withdrawalAccount.accountNumber}) · Net ${formatFCFA(netAmount)}`.slice(0, 240),
      amount,
      direction: 'out',
      status: 'En attente',
      reference: refCode,
      targetDocId: wdrId,
      createdAt: serverTimestamp(),
    });

    try {
      await batch.commit();
      showToast(`Demande de retrait de ${formatFCFA(amount)} envoyée.`, 'success');
      return { ok: true };
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${uid}/withdrawals/${wdrId}`);
    }
  };

  const spinWheel = async () => {
    if (!firebaseUser) return { ok: false, error: 'Connexion requise.' };
    if (wheelSpins <= 0) {
      return { ok: false, error: 'Aucun tour disponible. Lancez une ligne pour recevoir un tour offert.' };
    }

    const weights = [28, 16, 22, 5, 20, 2, 6, 1];
    const total = weights.reduce((a, b) => a + b, 0);
    let roll = Math.floor(Math.random() * total);
    let winIndex = 0;
    for (let i = 0; i < weights.length; i++) {
      roll -= weights[i];
      if (roll < 0) {
        winIndex = i;
        break;
      }
    }

    const prize = WHEEL_PRIZES[winIndex];
    const uid = firebaseUser.uid;
    const nextBalance = balance + prize.amount;
    const nextSpins = wheelSpins - 1;
    const txId = makeId('tx_wheel');
    const notifId = makeId('notif_wheel');

    const batch = writeBatch(db);
    batch.update(doc(db, 'users', uid), {
      balance: nextBalance,
      wheelSpins: nextSpins,
      updatedAt: serverTimestamp(),
    });
    batch.set(doc(db, 'users', uid, 'transactions', txId), {
      id: txId,
      userId: uid,
      type: 'credit',
      category: 'Roue',
      label: 'Gain Roue de la fortune',
      amount: prize.amount,
      balanceAfter: nextBalance,
      createdAt: serverTimestamp(),
    });
    batch.set(doc(db, 'users', uid, 'notifications', notifId), {
      id: notifId,
      userId: uid,
      senderUid: uid,
      category: 'earnings',
      title: 'Gain Roue de la fortune',
      body: `Félicitations ! Vous avez remporté ${formatFCFA(prize.amount)}.`,
      read: false,
      createdAt: serverTimestamp(),
    });

    try {
      await batch.commit();
      return { ok: true, winIndex, prizeAmount: prize.amount };
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const redeemGiftCode = async (rawCode: string): Promise<{ ok: boolean; message: string }> => {
    if (!firebaseUser) return { ok: false, message: 'Connexion requise.' };
    const code = rawCode.trim().toUpperCase();
    if (!code) return { ok: false, message: 'Veuillez saisir un code cadeau.' };
    if (usedGiftCodes.includes(code)) {
      return { ok: false, message: 'Ce code cadeau a déjà été utilisé sur votre compte.' };
    }
    const reward = VALID_GIFT_CODES[code];
    if (!reward) {
      return {
        ok: false,
        message: 'Code invalide. Essayez GOFAST500, BLEUNOIR ou BIENVENUE.',
      };
    }

    const uid = firebaseUser.uid;
    const nextBalance = balance + reward;
    const txId = makeId('tx_gift');

    const batch = writeBatch(db);
    batch.update(doc(db, 'users', uid), {
      balance: nextBalance,
      usedGiftCodes: [...usedGiftCodes, code],
      updatedAt: serverTimestamp(),
    });
    batch.set(doc(db, 'users', uid, 'transactions', txId), {
      id: txId,
      userId: uid,
      type: 'credit',
      category: 'Cadeau',
      label: `Code cadeau ${code}`,
      amount: reward,
      balanceAfter: nextBalance,
      createdAt: serverTimestamp(),
    });

    try {
      await batch.commit();
      showToast(`Code ${code} activé : +${formatFCFA(reward)} !`, 'success');
      return { ok: true, message: `+${formatFCFA(reward)} ajoutés à votre solde !` };
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const updateProfile = async (name: string, phone: string): Promise<boolean> => {
    if (!firebaseUser) return false;
    const uid = firebaseUser.uid;
    const cleanName = (name.trim() || profile.name).slice(0, 80);
    const cleanPhone = phone.trim().slice(0, 32);

    const batch = writeBatch(db);
    batch.update(doc(db, 'users', uid), {
      name: cleanName,
      phone: cleanPhone,
      language: profile.language,
      updatedAt: serverTimestamp(),
    });
    if (profile.inviteCode) {
      batch.update(doc(db, 'referralCodes', profile.inviteCode), {
        ownerName: cleanName,
        l1SponsorUid: profile.referredByUid || null,
        l2SponsorUid: profile.l2SponsorUid || null,
      });
    }

    try {
      await batch.commit();
      showToast('Profil mis à jour.', 'success');
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const setLanguage = async (language: 'Français' | 'English') => {
    if (!firebaseUser) return;
    const uid = firebaseUser.uid;
    try {
      await updateDoc(doc(db, 'users', uid), {
        name: profile.name,
        phone: profile.phone,
        language,
        updatedAt: serverTimestamp(),
      });
      showToast(`Langue sélectionnée : ${language}`, 'info');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const sendChatMessage = async (text: string) => {
    if (!firebaseUser) return;
    const clean = text.trim();
    if (!clean) return;

    const uid = firebaseUser.uid;
    const ts = nowTimeString();
    const userMsgId = makeId('chat_u');

    try {
      await setDoc(doc(db, 'users', uid, 'supportMessages', userMsgId), {
        id: userMsgId,
        userId: uid,
        sender: 'user',
        text: clean.slice(0, 1000),
        timestamp: ts,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${uid}/supportMessages/${userMsgId}`);
    }

    const lower = clean.toLowerCase();
    let reply =
      'Merci pour votre message. Un conseiller GoFast traite votre demande (délai moyen : 5 min pendant les heures d’ouverture 09:00–18:00).';
    if (lower.includes('retrait') || lower.includes('retirer')) {
      reply =
        'Pour effectuer un retrait (min. 1 500 FCFA, frais 18 %), assurez-vous d’avoir au moins une ligne active et un compte de retrait associé dans votre espace Retrait.';
    } else if (lower.includes('dépôt') || lower.includes('depot') || lower.includes('recharg')) {
      reply =
        'Les dépôts sont acceptés à partir de 4 000 FCFA uniquement via Orange Money ou Wave sur le numéro +22656445452. Le crédit sur votre solde est immédiat après validation.';
    } else if (lower.includes('parrain') || lower.includes('code') || lower.includes('équipe')) {
      reply =
        'Partagez votre code d’invitation depuis l’onglet Équipe. Chaque filleul qui s’inscrit avec votre code rejoint immédiatement votre équipe L1 et vous rapporte 37 % dès son premier lancement de ligne.';
    } else if (lower.includes('ligne') || lower.includes('plan')) {
      reply =
        'Chaque ligne de production génère un revenu quotidien toutes les 24 h pendant 100 jours et vous offre 1 tour sur la Roue de la fortune.';
    }

    window.setTimeout(async () => {
      const replyId = makeId('chat_a');
      try {
        await setDoc(doc(db, 'users', uid, 'supportMessages', replyId), {
          id: replyId,
          userId: uid,
          sender: 'agent',
          text: reply,
          timestamp: nowTimeString(),
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.error(err);
      }
    }, 550);
  };

  const markNotificationRead = async (notifId: string) => {
    if (!firebaseUser) return;
    const target = messages.find((m) => m.id === notifId);
    if (!target || target.read) return;
    const uid = firebaseUser.uid;
    try {
      await updateDoc(doc(db, 'users', uid, 'notifications', notifId), { read: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}/notifications/${notifId}`);
    }
  };

  const markAllMessagesRead = async () => {
    if (!firebaseUser) return;
    const unread = messages.filter((m) => !m.read);
    if (unread.length === 0) return;

    const uid = firebaseUser.uid;
    const batch = writeBatch(db);
    for (const m of unread) {
      batch.update(doc(db, 'users', uid, 'notifications', m.id), { read: true });
    }
    try {
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}/notifications`);
    }
  };

  const claimTierBonus = async (tier: number) => {
    if (!firebaseUser) return;
    if (claimedTiers.includes(tier)) return;
    const cfg = TEAM_TIERS.find((t) => t.tier === tier);
    if (!cfg || teamInvestmentTotal < cfg.threshold) {
      showToast('Le volume d’investissement d’équipe requis n’est pas encore atteint.', 'error');
      return;
    }

    const uid = firebaseUser.uid;
    const nextBalance = balance + cfg.bonus;
    const txId = makeId('tx_tier');

    const batch = writeBatch(db);
    batch.update(doc(db, 'users', uid), {
      balance: nextBalance,
      claimedTiers: [...claimedTiers, tier],
      updatedAt: serverTimestamp(),
    });
    batch.set(doc(db, 'users', uid, 'transactions', txId), {
      id: txId,
      userId: uid,
      type: 'credit',
      category: 'Commission',
      label: `Bonus de palier d'équipe · Palier ${tier}`,
      amount: cfg.bonus,
      balanceAfter: nextBalance,
      createdAt: serverTimestamp(),
    });

    try {
      await batch.commit();
      showToast(`Bonus palier ${tier} réclamé : +${formatFCFA(cfg.bonus)} !`, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const totalDailyIncome = activeLines
    .filter((l) => l.status === 'active')
    .reduce((sum, l) => sum + l.dailyIncome, 0);

  const teamInvestmentTotal = teamMembers.reduce((sum, m) => sum + m.investedAmount, 0);
  const weeklyCommissionTotal = teamMembers.reduce((sum, m) => sum + m.commissionEarned, 0);

  return (
    <AppStateContext.Provider
      value={{
        authReady,
        firebaseUser,
        loading,
        authenticated: Boolean(firebaseUser),
        balance,
        checkInDays,
        lastCheckInDate,
        wheelSpins,
        usedGiftCodes,
        claimedTiers,
        profile,
        withdrawalAccount,
        activeLines,
        deposits,
        withdrawals,
        fundHistory,
        messages,
        chatMessages,
        teamMembers,
        hideBalance,
        activeTab,
        subView,
        selectedLineForModal,
        toast,
        liveAlert,
        dismissLiveAlert,
        browserPushEnabled,
        soundAlertsEnabled,
        toggleBrowserPush,
        toggleSoundAlerts,
        pendingReferralCode,
        setPendingReferralCode,
        setActiveTab,
        setSubView,
        navigateTo,
        setSelectedLineForModal,
        toggleHideBalance,
        showToast,
        signInWithGoogle,
        signInWithAdminGoogle,
        isAdmin,
        adminMode,
        setAdminMode,
        adminFlows,
        adminUsers,
        adminLoading,
        validateAdminWithdrawal,
        logout,
        validateReferralCode,
        applyReferralCodeAfterSignup,
        performCheckIn,
        canCheckInToday,
        submitDeposit,
        launchLine,
        collectLineIncome,
        collectAllLineIncome,
        claimableLines,
        claimableDailyTotal,
        saveWithdrawalAccount,
        submitWithdrawal,
        spinWheel,
        redeemGiftCode,
        updateProfile,
        setLanguage,
        sendChatMessage,
        markNotificationRead,
        markAllMessagesRead,
        claimTierBonus,
        totalDailyIncome,
        teamInvestmentTotal,
        weeklyCommissionTotal,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return ctx;
}
