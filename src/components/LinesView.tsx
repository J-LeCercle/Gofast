import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { ACTIVITIES_SHOWCASE, PRODUCTION_LINES, formatFCFA } from '../data/gofastData';
import { LineCategory } from '../types';
import { SafeImage } from './BrandMark';

const CATEGORIES: { id: LineCategory; label: string }[] = [
  { id: 'grand-public', label: 'Grand public et services' },
  { id: 'infrastructures', label: 'Infrastructures numériques' },
  { id: 'energie', label: 'Énergie & Réseaux' },
];

export function LinesView() {
  const { setSelectedLineForModal, navigateTo } = useAppState();
  const [selectedCategory, setSelectedCategory] = useState<LineCategory>('grand-public');

  const filteredLines = PRODUCTION_LINES.filter((line) => line.category === selectedCategory);
  const activeShowcase =
    ACTIVITIES_SHOWCASE.find((a) => a.category === selectedCategory) || ACTIVITIES_SHOWCASE[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="font-display text-2xl font-bold text-white">Lignes de production</h2>
        <button
          type="button"
          onClick={() => navigateTo('my-lines')}
          className="text-sm font-semibold text-[#60A5FA] hover:text-[#93C5FD] inline-flex items-center gap-1.5 self-start sm:self-auto whitespace-nowrap"
        >
          <span>Voir mes lignes actives</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#18243E] pb-px">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-3 text-sm font-semibold whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                isActive
                  ? 'border-[#3B82F6] text-white'
                  : 'border-transparent text-[#94A3B8] hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Featured Category Banner */}
      <section className="relative rounded-2xl overflow-hidden border border-[#1B2947] bg-[#0B1222] min-h-[180px] flex flex-col justify-between p-5 sm:p-6">
        <SafeImage
          src={activeShowcase.image}
          alt={activeShowcase.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040710] via-[#060C1B]/75 to-[#060C1B]/40" />

        <div className="relative z-10 flex items-center justify-between">
          <span className="font-mono text-xs tabular-nums text-[#CBD5E1]">
            {activeShowcase.index}
          </span>
          <button
            type="button"
            onClick={() => navigateTo('about')}
            className="px-3.5 py-1.5 rounded-xl bg-[#0B1222]/80 hover:bg-[#142240] border border-white/20 text-xs font-semibold text-white inline-flex items-center gap-1.5 backdrop-blur-sm whitespace-nowrap transition-colors"
          >
            <span>À propos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="relative z-10 mt-8">
          <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
            {activeShowcase.title}
          </h3>
          <p className="text-sm text-[#CBD5E1] mt-1">{activeShowcase.subtitle}</p>
          <p className="text-xs font-medium text-[#93C5FD] mt-2 tabular-nums">
            {activeShowcase.meta}
          </p>
        </div>
      </section>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredLines.map((plan) => (
          <article
            key={plan.id}
            className="rounded-2xl bg-[#0B1222] border border-[#1B2947] overflow-hidden flex flex-col justify-between hover:border-[#3B82F6]/50 transition-colors"
          >
            <div className="relative h-48 bg-[#070B16]">
              <SafeImage
                src={plan.image}
                alt={plan.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1222] via-transparent to-black/30" />
              <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-[#050811]/90 border border-[#2563EB]/40 text-xs font-semibold text-white">
                {plan.planCode}
              </span>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-white">{plan.name}</h3>
                <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">{plan.description}</p>

                <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-[#18243E]">
                  <div>
                    <p className="text-xs text-[#64748B]">Prix</p>
                    <p className="font-display text-sm sm:text-base font-bold text-white tabular-nums mt-0.5">
                      {formatFCFA(plan.price)}
                    </p>
                  </div>
                  <div className="border-l border-[#18243E] pl-3">
                    <p className="text-xs text-[#64748B]">Revenu quotidien</p>
                    <p className="font-display text-sm sm:text-base font-bold text-[#34D399] tabular-nums mt-0.5">
                      {formatFCFA(plan.dailyIncome)}
                    </p>
                  </div>
                  <div className="border-l border-[#18243E] pl-3">
                    <p className="text-xs text-[#64748B]">Durée</p>
                    <p className="font-display text-sm sm:text-base font-bold text-white tabular-nums mt-0.5">
                      {plan.durationDays} jours
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#18243E] flex items-center justify-between gap-4">
                <p className="text-xs text-[#94A3B8] tabular-nums">
                  Total <span className="text-white font-semibold">{formatFCFA(plan.totalReturn)}</span>
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedLineForModal(plan)}
                  className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#3B82F6] text-white text-xs font-semibold transition-colors whitespace-nowrap"
                >
                  Lancer cette ligne
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
