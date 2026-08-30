import React from 'react';
import { DollarSign, CheckCircle2, Users, AlertCircle, ArrowDownRight, Sparkles, Tag, CreditCard, ShieldCheck } from 'lucide-react';
import { PartyPlan } from '../types';

interface BudgetSummaryCardProps {
  plan: PartyPlan;
  onApplyAllSavings?: () => void;
  onOpenCheckoutModal?: () => void;
}

export const BudgetSummaryCard: React.FC<BudgetSummaryCardProps> = ({ 
  plan, 
  onApplyAllSavings,
  onOpenCheckoutModal 
}) => {
  const totalEstimated = plan.items.reduce((acc, i) => acc + (i.estimatedCost || 0), 0);
  const totalPurchased = plan.items
    .filter(i => i.isPurchased)
    .reduce((acc, i) => acc + (i.actualCost ?? i.estimatedCost ?? 0), 0);
  const purchasedCount = plan.items.filter(i => i.isPurchased).length;
  const totalItemsCount = plan.items.length;
  const completionPercentage = totalItemsCount > 0 ? Math.round((purchasedCount / totalItemsCount) * 100) : 0;

  const targetBudget = plan.budget.target || 1;
  const budgetRatio = totalEstimated / targetBudget;
  const costPerGuest = (totalEstimated / Math.max(1, plan.headcount.total)).toFixed(2);

  // Calculate potential savings from budget alternatives
  const potentialSavings = plan.items.reduce((acc, item) => {
    if (item.budgetAlternative && item.budgetAlternative.estimatedCost < item.estimatedCost) {
      return acc + (item.estimatedCost - item.budgetAlternative.estimatedCost);
    }
    return acc;
  }, 0);

  // Status color logic
  let budgetStatus = {
    label: 'On Target Budget',
    color: 'text-emerald-700',
    barColor: 'bg-emerald-500',
    bgColor: 'bg-emerald-50 border-emerald-200'
  };

  if (budgetRatio > 1.05) {
    budgetStatus = {
      label: `$${(totalEstimated - targetBudget).toFixed(0)} Over Budget Target`,
      color: 'text-rose-700',
      barColor: 'bg-rose-500',
      bgColor: 'bg-rose-50 border-rose-200'
    };
  } else if (budgetRatio < 0.9) {
    budgetStatus = {
      label: `$${(targetBudget - totalEstimated).toFixed(0)} Under Budget Target`,
      color: 'text-blue-700',
      barColor: 'bg-blue-500',
      bgColor: 'bg-blue-50 border-blue-200'
    };
  }

  return (
    <div id="budget-summary-card" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
      {/* Top Row: Title, Target, Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">{plan.title}</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 capitalize">
              {plan.theme}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${budgetStatus.bgColor} ${budgetStatus.color}`}>
              {budgetStatus.label}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {plan.venue} • {plan.durationHours} hrs duration • {plan.vibe}
            {plan.specialRequests && ` • Special: "${plan.specialRequests}"`}
          </p>
        </div>

        {/* Headcount Pills & Checkout Button */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
            <Users className="w-3.5 h-3.5" />
            {plan.headcount.total} Guests
          </span>
          <span className="px-2 py-1 rounded-md bg-slate-50 text-slate-600 border border-slate-200">
            {plan.headcount.adults} Adults
          </span>
          {plan.headcount.teens > 0 && (
            <span className="px-2 py-1 rounded-md bg-slate-50 text-slate-600 border border-slate-200">
              {plan.headcount.teens} Teens
            </span>
          )}
          {plan.headcount.kids > 0 && (
            <span className="px-2 py-1 rounded-md bg-slate-50 text-slate-600 border border-slate-200">
              {plan.headcount.kids} Kids
            </span>
          )}

          {onOpenCheckoutModal && (
            <button
              onClick={onOpenCheckoutModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all"
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
              <span>Refine & Checkout</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Target vs Estimated */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Estimated Total</span>
            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-slate-900">${totalEstimated}</span>
            <span className="text-xs text-slate-400 font-medium">/ ${targetBudget} target</span>
          </div>
          <div className="mt-2 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${budgetStatus.barColor}`}
              style={{ width: `${Math.min(100, (totalEstimated / targetBudget) * 100)}%` }}
            />
          </div>
        </div>

        {/* Actual Spent */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Purchased Spent</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-emerald-700">${totalPurchased}</span>
            <span className="text-xs text-slate-400 font-medium">of ${totalEstimated}</span>
          </div>
          <div className="mt-2 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Cost Per Guest */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Cost Per Guest</span>
            <Users className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-black text-slate-900">${costPerGuest}</span>
            <span className="text-xs text-slate-400 font-medium">/ attendee</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 capitalize">
            {plan.budget.tier} tier budget plan
          </p>
        </div>

        {/* Items Checklist Progress */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Checklist Status</span>
            <Tag className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-slate-900">{purchasedCount}</span>
            <span className="text-xs text-slate-400 font-medium">/ {totalItemsCount} items</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 font-medium">
            {completionPercentage}% of shopping complete
          </p>
        </div>
      </div>

      {/* Potential Savings Banner & Auto-Budget Align */}
      {potentialSavings > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs">
          <div className="flex items-center gap-2 text-amber-950 font-medium">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>CymbalMart Private-Label Savings:</strong> Save up to <strong>${potentialSavings}</strong> by switching branded items to CymbalMart Fresh & Value options.
            </span>
          </div>

          {onApplyAllSavings && (
            <button
              onClick={onApplyAllSavings}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
            >
              <Sparkles className="w-3 h-3" />
              Auto-Align to Budget (Save ${potentialSavings})
            </button>
          )}
        </div>
      )}

      {/* Dietary Restrictions Badges */}
      {plan.dietaryRestrictions && plan.dietaryRestrictions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-slate-500 font-semibold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> Dietary Accommodations:
          </span>
          {plan.dietaryRestrictions.map((diet, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-medium border border-rose-200/60"
            >
              {diet.restriction} ({diet.count})
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

