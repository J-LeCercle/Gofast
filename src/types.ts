export type MainTab = 'home' | 'lines' | 'team' | 'profile';

export type SubView =
  | 'main'
  | 'recharge'
  | 'withdraw'
  | 'withdraw-account'
  | 'withdraw-history'
  | 'deposit-history'
  | 'fund-history'
  | 'my-lines'
  | 'messages'
  | 'support-chat'
  | 'wheel'
  | 'how-it-works'
  | 'about'
  | 'security'
  | 'gift-code';

export type LineCategory = 'grand-public' | 'infrastructures' | 'energie';

export interface ProductionLinePlan {
  id: string;
  planCode: string;
  name: string;
  category: LineCategory;
  categoryLabel: string;
  price: number;
  dailyIncome: number;
  durationDays: number;
  totalReturn: number;
  image: string;
  description: string;
  specs: string[];
}

export interface ActiveLine {
  id: string;
  planId: string;
  planCode: string;
  name: string;
  categoryLabel: string;
  price: number;
  dailyIncome: number;
  durationDays: number;
  daysElapsed: number;
  totalEarned: number;
  startedAt: string;
  lastClaimedAt: string | null;
  status: 'active' | 'completed';
}

export interface WithdrawalAccount {
  holderName: string;
  operator: string;
  accountNumber: string;
}

export interface DepositRecord {
  id: string;
  amount: number;
  method: string;
  status: 'Succès' | 'En cours' | 'Échoué';
  createdAt: string;
  reference: string;
}

export interface WithdrawalRecord {
  id: string;
  grossAmount: number;
  feeAmount: number;
  netAmount: number;
  operator: string;
  accountNumber: string;
  status: 'En attente' | 'Validé';
  createdAt: string;
  reference: string;
}

export interface FundTransaction {
  id: string;
  type: 'credit' | 'debit';
  category:
    | 'Dépôt'
    | 'Retrait'
    | 'Pointage'
    | 'Ligne'
    | 'Rendement'
    | 'Roue'
    | 'Cadeau'
    | 'Commission';
  label: string;
  amount: number;
  balanceAfter: number;
  createdAt: string;
}

export type NotificationCategory = 'system' | 'info' | 'earnings' | 'referral';

export interface SystemMessage {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
}

export interface TeamMember {
  id: string;
  name: string;
  phone: string;
  level: 1 | 2 | 3;
  investedAmount: number;
  commissionEarned: number;
  joinedAt: string;
}

export interface UserProfile {
  uid?: string;
  name: string;
  email: string;
  phone: string;
  inviteCode: string;
  language: 'Français' | 'English';
  referredByUid?: string | null;
  referredByCode?: string | null;
  referredByName?: string | null;
  l2SponsorUid?: string | null;
  l3SponsorUid?: string | null;
}

export type FlowEventType =
  | 'signup'
  | 'deposit'
  | 'withdrawal'
  | 'line'
  | 'yield'
  | 'commission'
  | 'referral'
  | 'bonus';

export interface FlowEvent {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  eventType: FlowEventType;
  title: string;
  detail: string;
  amount: number;
  direction: 'in' | 'out' | 'neutral';
  status: string;
  reference: string;
  targetDocId?: string | null;
  createdAt: string;
}

export interface AdminUserSummary {
  uid: string;
  name: string;
  email: string;
  phone: string;
  inviteCode: string;
  referredByCode: string | null;
  referredByName: string | null;
  balance: number;
  checkInDays: number;
  wheelSpins: number;
  createdAt: string;
}
