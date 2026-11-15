import { ProductionLinePlan } from '../types';
import { GOFAST_IMAGES } from './assets';

export const HERO_SLIDES = [
  {
    id: 'slide-1',
    kicker: 'Comment ça marche',
    title: 'Vos revenus, chaque jour',
    subtitle: 'Comment une ligne fonctionne et paie toutes les 24 h.',
    image: GOFAST_IMAGES.heroOperations,
    targetView: 'how-it-works' as const,
  },
  {
    id: 'slide-2',
    kicker: 'Infrastructures numériques',
    title: 'Puissance cloud & calcul continu',
    subtitle: 'Des unités haute performance opérationnelles sans interruption.',
    image: GOFAST_IMAGES.cardDatacenter,
    targetView: 'lines' as const,
  },
  {
    id: 'slide-3',
    kicker: 'Énergie & réseaux',
    title: 'Production durable sur 100 jours',
    subtitle: 'Suivez vos rendements quotidiens directement depuis votre portefeuille.',
    image: GOFAST_IMAGES.cardEnergy,
    targetView: 'lines' as const,
  },
  {
    id: 'slide-4',
    kicker: 'À propos de GoFast',
    title: 'Une technologie au service du quotidien',
    subtitle: 'Ingénierie industrielle et gestion simplifiée des actifs productifs.',
    image: GOFAST_IMAGES.aboutTech,
    targetView: 'about' as const,
  },
];

export const ACTIVITIES_SHOWCASE = [
  {
    id: 'act-1',
    index: '01 / 05',
    category: 'grand-public' as const,
    title: 'Grand public et services',
    subtitle: 'Outils, électroménager et services du quotidien.',
    meta: 'À partir de 4 000 FCFA · 100 jours · 2 lignes',
    image: GOFAST_IMAGES.cardServices,
  },
  {
    id: 'act-2',
    index: '02 / 05',
    category: 'infrastructures' as const,
    title: 'Infrastructures numériques',
    subtitle: 'Centres de données et logiciels industriels.',
    meta: 'À partir de 24 000 FCFA · 100 jours · 2 lignes',
    image: GOFAST_IMAGES.cardDatacenter,
  },
  {
    id: 'act-3',
    index: '03 / 05',
    category: 'energie' as const,
    title: 'Énergie & Réseaux',
    subtitle: 'Centrales hybrides et distribution haute tension.',
    meta: 'À partir de 100 000 FCFA · 100 jours · 1 ligne',
    image: GOFAST_IMAGES.cardEnergy,
  },
  {
    id: 'act-4',
    index: '04 / 05',
    category: 'grand-public' as const,
    title: 'Logistique automatisée',
    subtitle: 'Chaînes de tri rapide et flux de distribution.',
    meta: 'Rendement versé toutes les 24 heures',
    image: GOFAST_IMAGES.heroOperations,
  },
  {
    id: 'act-5',
    index: '05 / 05',
    category: 'infrastructures' as const,
    title: 'Laboratoires & Contrôle',
    subtitle: 'Tests qualité et électronique de précision.',
    meta: 'Supervision continue GoFast',
    image: GOFAST_IMAGES.aboutTech,
  },
];

export const PRODUCTION_LINES: ProductionLinePlan[] = [
  {
    id: 'plan-1',
    planCode: 'Plan 1',
    name: 'Ligne Cuisine & Maison',
    category: 'grand-public',
    categoryLabel: 'Grand public et services',
    price: 4000,
    dailyIncome: 1000,
    durationDays: 100,
    totalReturn: 100000,
    image: GOFAST_IMAGES.cardServices,
    description:
      'Unité dédiée aux équipements domestiques intelligents et appareils de cuisine basse consommation.',
    specs: [
      'Versement automatique toutes les 24 h',
      '1 tour de Roue de la fortune offert',
      'Débloque les retraits dès activation',
    ],
  },
  {
    id: 'plan-2',
    planCode: 'Plan 2',
    name: 'Ligne Électroménager Pro',
    category: 'grand-public',
    categoryLabel: 'Grand public et services',
    price: 10000,
    dailyIncome: 2530,
    durationDays: 100,
    totalReturn: 253000,
    image: GOFAST_IMAGES.heroOperations,
    description:
      'Chaîne d’assemblage haute cadence destinée aux systèmes modulaires et équipements professionnels.',
    specs: [
      'Rendement quotidien de 2 530 FCFA',
      '1 tour de Roue de la fortune offert',
      'Éligible aux commissions d’équipe L1–L3',
    ],
  },
  {
    id: 'plan-3',
    planCode: 'Plan 3',
    name: 'Ligne Cœur Numérique',
    category: 'infrastructures',
    categoryLabel: 'Infrastructures numériques',
    price: 24000,
    dailyIncome: 6168,
    durationDays: 100,
    totalReturn: 616800,
    image: GOFAST_IMAGES.cardDatacenter,
    description:
      'Infrastructure serveur dédiée au traitement de données et aux nœuds d’interconnexion fibre optique.',
    specs: [
      'Rendement quotidien de 6 168 FCFA',
      '1 tour de Roue de la fortune offert',
      'Accès prioritaire aux paliers d’équipe',
    ],
  },
  {
    id: 'plan-4',
    planCode: 'Plan 4',
    name: 'Ligne Cloud Edge',
    category: 'infrastructures',
    categoryLabel: 'Infrastructures numériques',
    price: 50000,
    dailyIncome: 13200,
    durationDays: 100,
    totalReturn: 1320000,
    image: GOFAST_IMAGES.aboutTech,
    description:
      'Cluster de calcul distribué pour l’automatisation industrielle et l’hébergement haute disponibilité.',
    specs: [
      'Rendement quotidien de 13 200 FCFA',
      '1 tour de Roue de la fortune offert',
      'Supervision technique dédiée',
    ],
  },
  {
    id: 'plan-5',
    planCode: 'Plan 5',
    name: 'Ligne Turbine & Réseau',
    category: 'energie',
    categoryLabel: 'Énergie & Réseaux',
    price: 100000,
    dailyIncome: 27500,
    durationDays: 100,
    totalReturn: 2750000,
    image: GOFAST_IMAGES.cardEnergy,
    description:
      'Unité de production énergétique et poste de distribution haute capacité à rendement optimisé.',
    specs: [
      'Rendement quotidien de 27 500 FCFA',
      '1 tour de Roue de la fortune offert',
      'Cumulable avec d’autres lignes actives',
    ],
  },
];

export const PAYMENT_NUMBER = '+22656445452';

export const PAYMENT_METHODS = [
  {
    id: 'orange-money',
    label: 'Orange Money',
    region: '+22656445452',
    paymentNumber: PAYMENT_NUMBER,
    codeLabel: 'Code de paiement Orange Money',
  },
  {
    id: 'wave',
    label: 'Wave',
    region: '+22656445452',
    paymentNumber: PAYMENT_NUMBER,
    codeLabel: 'Numéro de paiement Wave',
  },
];

export const WITHDRAWAL_OPERATORS = [
  'Burkina Faso · Orange Money',
  'Burkina Faso · Moov Money',
  "Côte d'Ivoire · Wave",
  "Côte d'Ivoire · Orange Money",
  "Côte d'Ivoire · MTN Mobile Money",
  'Sénégal · Wave',
  'Sénégal · Orange Money',
  'Mali · Orange Money',
  'Coris Bank International',
  'Ecobank',
];

export const TEAM_TIERS = [
  { tier: 1, threshold: 300000, bonus: 3000 },
  { tier: 2, threshold: 800000, bonus: 10000 },
  { tier: 3, threshold: 1500000, bonus: 22000 },
  { tier: 4, threshold: 3000000, bonus: 50000 },
  { tier: 5, threshold: 6000000, bonus: 110000 },
  { tier: 6, threshold: 12000000, bonus: 240000 },
  { tier: 7, threshold: 25000000, bonus: 550000 },
  { tier: 8, threshold: 50000000, bonus: 1200000 },
];

export const WHEEL_PRIZES = [
  { label: '200 FCFA', amount: 200, color: '#0F1B33' },
  { label: '1 000 FCFA', amount: 1000, color: '#1D4ED8' },
  { label: '500 FCFA', amount: 500, color: '#0B1222' },
  { label: '5 000 FCFA', amount: 5000, color: '#2563EB' },
  { label: '300 FCFA', amount: 300, color: '#0F1B33' },
  { label: '10 000 FCFA', amount: 10000, color: '#1E40AF' },
  { label: '800 FCFA', amount: 800, color: '#0B1222' },
  { label: '30 000 FCFA', amount: 30000, color: '#3B82F6' },
];

export const VALID_GIFT_CODES: Record<string, number> = {
  GOFAST500: 500,
  BLEUNOIR: 1000,
  BIENVENUE: 750,
};

export function formatFCFA(value: number): string {
  return `${Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} FCFA`;
}

export function formatNumber(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
