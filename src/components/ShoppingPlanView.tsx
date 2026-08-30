import React, { useState } from 'react';
import { 
  Check, 
  Plus, 
  Minus,
  Sparkles, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  ArrowDownRight, 
  DollarSign,
  Store,
  Tag,
  CheckCircle2,
  Utensils,
  Cookie,
  Wine,
  Cake,
  Layers,
  Gamepad2,
  ShieldAlert,
  AlertCircle,
  RefreshCw,
  Zap,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PartyPlan, ShoppingItem, ItemCategory } from '../types';
import { CATEGORY_LABELS } from '../utils/export';

interface ShoppingPlanViewProps {
  plan: PartyPlan;
  onUpdatePlan: (updated: PartyPlan) => void;
  onOpenAddItemModal: () => void;
  onEditItem: (item: ShoppingItem) => void;
  onOpenRecipeModal: () => void;
}

const CATEGORY_ICONS: Record<ItemCategory, React.ElementType> = {
  food_mains: Utensils,
  appetizers_snacks: Cookie,
  beverages_bar: Wine,
  desserts_bakery: Cake,
  decorations_theme: Sparkles,
  tableware_disposables: Layers,
  entertainment_favors: Gamepad2,
  emergency_essentials: ShieldAlert
};

export const ShoppingPlanView: React.FC<ShoppingPlanViewProps> = ({
  plan,
  onUpdatePlan,
  onOpenAddItemModal,
  onEditItem,
  onOpenRecipeModal
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'purchased'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [viewGrouping, setViewGrouping] = useState<'category' | 'store'>('category');

  // Quick Add Item Bar state
  const [quickName, setQuickName] = useState('');
  const [quickQty, setQuickQty] = useState('1');
  const [quickCost, setQuickCost] = useState('');
  const [quickCat, setQuickCat] = useState<ItemCategory>('food_mains');
  const [justRecalculated, setJustRecalculated] = useState(false);

  const triggerRecalcNotice = () => {
    setJustRecalculated(true);
    setTimeout(() => setJustRecalculated(false), 2000);
  };

  // Toggle item purchased status
  const handleTogglePurchased = (itemId: string) => {
    let justCompletedAll = false;
    const updatedItems = plan.items.map(item => {
      if (item.id === itemId) {
        const nextState = !item.isPurchased;
        return {
          ...item,
          isPurchased: nextState,
          actualCost: nextState ? (item.actualCost ?? item.estimatedCost) : item.actualCost
        };
      }
      return item;
    });

    const pendingCount = updatedItems.filter(i => !i.isPurchased).length;
    if (pendingCount === 0 && updatedItems.length > 0) {
      justCompletedAll = true;
    }

    onUpdatePlan({
      ...plan,
      items: updatedItems
    });
    triggerRecalcNotice();

    if (justCompletedAll) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  // Delete item
  const handleDeleteItem = (itemId: string) => {
    onUpdatePlan({
      ...plan,
      items: plan.items.filter(i => i.id !== itemId)
    });
    triggerRecalcNotice();
  };

  // Adjust item quantity inline with proportional cost recalculation
  const handleAdjustQuantity = (itemId: string, delta: number) => {
    const updatedItems = plan.items.map(item => {
      if (item.id === itemId) {
        const currentQtyNum = parseFloat(item.quantity);
        if (isNaN(currentQtyNum) || currentQtyNum <= 0) {
          return item;
        }
        const nextQtyNum = Math.max(1, currentQtyNum + delta);
        if (nextQtyNum === currentQtyNum) return item;

        const unitCost = item.estimatedCost / currentQtyNum;
        const newEstimatedCost = Math.max(1, Math.round(unitCost * nextQtyNum));
        
        return {
          ...item,
          quantity: `${nextQtyNum}`,
          estimatedCost: newEstimatedCost,
          actualCost: item.isPurchased ? newEstimatedCost : item.actualCost
        };
      }
      return item;
    });

    onUpdatePlan({
      ...plan,
      items: updatedItems
    });
    triggerRecalcNotice();
  };

  // Inline price update
  const handleUpdatePrice = (itemId: string, newPrice: number) => {
    if (isNaN(newPrice) || newPrice < 0) return;
    const updatedItems = plan.items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          estimatedCost: newPrice,
          actualCost: item.isPurchased ? newPrice : item.actualCost
        };
      }
      return item;
    });

    onUpdatePlan({
      ...plan,
      items: updatedItems
    });
    triggerRecalcNotice();
  };

  // Swap to budget alternative
  const handleApplyAlternative = (itemId: string) => {
    const updatedItems = plan.items.map(item => {
      if (item.id === itemId && item.budgetAlternative) {
        return {
          ...item,
          name: item.budgetAlternative.name,
          estimatedCost: item.budgetAlternative.estimatedCost,
          isCymbalMartBrand: true,
          notes: (item.notes ? item.notes + ' • ' : '') + item.budgetAlternative.tip,
          budgetAlternative: undefined // Alternative applied!
        };
      }
      return item;
    });

    onUpdatePlan({
      ...plan,
      items: updatedItems
    });
    triggerRecalcNotice();
  };

  // Quick Add Item Form Submission
  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim()) return;

    let cost = Number(quickCost);
    if (isNaN(cost) || cost <= 0) {
      cost = 10;
    }

    let aisle = 'Aisle 9 (Pantry)';
    if (quickCat === 'beverages_bar') aisle = 'Aisle 11 (Beverages)';
    else if (quickCat === 'desserts_bakery') aisle = 'Aisle 3 (Bakery)';
    else if (quickCat === 'food_mains') aisle = 'Aisle 7 (Meat & Fresh)';
    else if (quickCat === 'tableware_disposables') aisle = 'Aisle 17 (Paper Goods)';
    else if (quickCat === 'decorations_theme') aisle = 'Aisle 14 (Party Supplies)';
    else if (quickCat === 'emergency_essentials') aisle = 'Aisle 18 (Ice & Freezers)';
    else if (quickCat === 'appetizers_snacks') aisle = 'Aisle 9 (Snacks)';

    const newItem: ShoppingItem = {
      id: `item-${Date.now()}`,
      name: quickName.trim(),
      category: quickCat,
      quantity: quickQty.trim() || '1',
      unit: 'pack',
      estimatedCost: cost,
      store: 'CymbalMart Supercenter',
      department: 'Grocery',
      aisle,
      isPurchased: false,
      priority: 'must_have',
      notes: 'Added via Quick Add Bar'
    };

    onUpdatePlan({
      ...plan,
      items: [newItem, ...plan.items]
    });

    setQuickName('');
    setQuickQty('1');
    setQuickCost('');
    triggerRecalcNotice();
  };

  // Category-level bulk actions
  const handleMarkCategoryPurchased = (category: ItemCategory) => {
    const updatedItems = plan.items.map(item => {
      if (item.category === category) {
        return {
          ...item,
          isPurchased: true,
          actualCost: item.actualCost ?? item.estimatedCost
        };
      }
      return item;
    });
    onUpdatePlan({ ...plan, items: updatedItems });
    triggerRecalcNotice();
  };

  const handleSwapCategorySavings = (category: ItemCategory) => {
    const updatedItems = plan.items.map(item => {
      if (item.category === category && item.budgetAlternative) {
        return {
          ...item,
          name: item.budgetAlternative.name,
          estimatedCost: item.budgetAlternative.estimatedCost,
          isCymbalMartBrand: true,
          notes: (item.notes ? item.notes + ' • ' : '') + item.budgetAlternative.tip,
          budgetAlternative: undefined
        };
      }
      return item;
    });
    onUpdatePlan({ ...plan, items: updatedItems });
    triggerRecalcNotice();
  };

  // Filter items
  const filteredItems = plan.items.filter(item => {
    // Category
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    // Status
    if (statusFilter === 'pending' && item.isPurchased) return false;
    if (statusFilter === 'purchased' && !item.isPurchased) return false;
    // Priority
    if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchStore = item.store.toLowerCase().includes(q);
      const matchDept = item.department.toLowerCase().includes(q);
      const matchNotes = item.notes?.toLowerCase().includes(q);
      if (!matchName && !matchStore && !matchDept && !matchNotes) return false;
    }
    return true;
  });

  // Calculation Metrics
  const totalEstimated = plan.items.reduce((acc, i) => acc + (i.estimatedCost || 0), 0);
  const targetBudget = plan.budget.target || 1;
  const budgetDelta = targetBudget - totalEstimated;
  const stores = Array.from(new Set(plan.items.map(i => i.store)));
  const categoriesList = Object.keys(CATEGORY_LABELS) as ItemCategory[];

  return (
    <div className="space-y-5">
      
      {/* Real-time Recalculation Alert Banner */}
      <div className={`p-3 rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-xs ${
        justRecalculated 
          ? 'bg-amber-100 border-amber-400 text-amber-950 scale-[1.01]'
          : 'bg-white border-slate-200 text-slate-700'
      }`}>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold ${
            justRecalculated ? 'bg-amber-400 text-slate-950 animate-bounce' : 'bg-slate-100 text-slate-700'
          }`}>
            <Zap className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900">
                Live Auto-Recalculation:
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800">
                ${totalEstimated} Subtotal
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                budgetDelta >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {budgetDelta >= 0 ? `$${budgetDelta} under target` : `$${Math.abs(budgetDelta)} over target`}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-normal mt-0.5">
              Every item quantity change, price adjustment, or brand swap recalculates your budget totals automatically.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => onUpdatePlan({ ...plan, items: plan.items.map(i => ({ ...i, isPurchased: true, actualCost: i.actualCost ?? i.estimatedCost })) })}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
          >
            Check All
          </button>
          <button
            onClick={() => onUpdatePlan({ ...plan, items: plan.items.map(i => ({ ...i, isPurchased: false })) })}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
          >
            Reset All
          </button>
        </div>
      </div>

      {/* Quick Add Inline Item Form */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <form onSubmit={handleQuickAdd} className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              Quick Add Item to Shopping List
            </span>
            <span className="text-[11px] text-slate-400">
              Auto-recalculates budget upon addition
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <div className="sm:col-span-5">
              <input
                type="text"
                required
                value={quickName}
                onChange={(e) => setQuickName(e.target.value)}
                placeholder="e.g. Sliced Sourdough, Sparkling Seltzer, Ice Bags"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <select
                value={quickCat}
                onChange={(e) => setQuickCat(e.target.value as ItemCategory)}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
              >
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <input
                type="text"
                value={quickQty}
                onChange={(e) => setQuickQty(e.target.value)}
                placeholder="Qty (e.g. 2)"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="sm:col-span-1">
              <input
                type="number"
                step="any"
                min="0"
                value={quickCost}
                onChange={(e) => setQuickCost(e.target.value)}
                placeholder="$ Cost"
                className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                Add & Recalc
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items, aisle numbers, or ingredients..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50/50"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenRecipeModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-100/80 hover:bg-amber-200/80 border border-amber-200 transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              AI Add Recipe / Dish
            </button>

            <button
              onClick={onOpenAddItemModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-xs"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              Add Detailed Item
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Category Chips Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Items ({plan.items.length})
            </button>

            {categoriesList.map(cat => {
              const count = plan.items.filter(i => i.category === cat).length;
              if (count === 0) return null;
              const Icon = CATEGORY_ICONS[cat];
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {CATEGORY_LABELS[cat].label} ({count})
                </button>
              );
            })}
          </div>

          {/* Grouping & Status switches */}
          <div className="flex items-center gap-2">
            <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  statusFilter === 'all' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-500'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  statusFilter === 'pending' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-500'
                }`}
              >
                To Buy
              </button>
              <button
                onClick={() => setStatusFilter('purchased')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  statusFilter === 'purchased' ? 'bg-white text-emerald-700 font-bold shadow-xs' : 'text-slate-500'
                }`}
              >
                Purchased
              </button>
            </div>

            <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewGrouping('category')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  viewGrouping === 'category' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-500'
                }`}
              >
                By Category
              </button>
              <button
                onClick={() => setViewGrouping('store')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  viewGrouping === 'store' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-500'
                }`}
              >
                By Store
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Signature Highlight Card (if exists) */}
      {plan.signatureItem && (
        <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-500/10 rounded-2xl p-4 border border-amber-200/60 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm shrink-0">
              <Wine className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  Featured Signature Creation
                </span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm mt-0.5">
                {plan.signatureItem.name}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                {plan.signatureItem.description}
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-500 bg-white/80 backdrop-blur-xs px-3 py-2 rounded-xl border border-slate-200/60 shrink-0">
            <strong className="text-slate-800">Ingredients: </strong>
            {plan.signatureItem.ingredientsList.join(', ')}
          </div>
        </div>
      )}

      {/* Items List (Grouped by Category or Store) */}
      {viewGrouping === 'category' ? (
        <div className="space-y-6">
          {categoriesList.map(cat => {
            const catItems = filteredItems.filter(i => i.category === cat);
            if (catItems.length === 0) return null;
            const Icon = CATEGORY_ICONS[cat];
            const catMeta = CATEGORY_LABELS[cat];
            const catTotal = catItems.reduce((acc, i) => acc + (i.estimatedCost || 0), 0);
            const catPurchased = catItems.filter(i => i.isPurchased).length;
            const hasSwaps = catItems.some(i => i.budgetAlternative);

            return (
              <div key={cat} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Category Header */}
                <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50/80 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-200/70 text-slate-700 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {catMeta.label}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {catPurchased} of {catItems.length} purchased
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {hasSwaps && (
                      <button
                        onClick={() => handleSwapCategorySavings(cat)}
                        className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-bold transition-colors"
                      >
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        Apply Brand Swaps
                      </button>
                    )}
                    <button
                      onClick={() => handleMarkCategoryPurchased(cat)}
                      className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold transition-colors"
                    >
                      <Check className="w-3 h-3 text-emerald-600" />
                      Check All
                    </button>

                    <div className="text-right">
                      <span className="text-xs font-black text-slate-900">
                        ${catTotal}
                      </span>
                      <p className="text-[10px] text-slate-400">Subtotal</p>
                    </div>
                  </div>
                </div>

                {/* Items in this category */}
                <div className="divide-y divide-slate-100">
                  {catItems.map(item => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      onTogglePurchased={handleTogglePurchased}
                      onEdit={() => onEditItem(item)}
                      onDelete={() => handleDeleteItem(item.id)}
                      onApplyAlternative={() => handleApplyAlternative(item.id)}
                      onAdjustQuantity={(delta) => handleAdjustQuantity(item.id, delta)}
                      onUpdatePrice={(newPrice) => handleUpdatePrice(item.id, newPrice)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Store Route Grouping View */
        <div className="space-y-6">
          {stores.map(storeName => {
            const storeItems = filteredItems.filter(i => i.store === storeName);
            if (storeItems.length === 0) return null;
            const storeTotal = storeItems.reduce((acc, i) => acc + (i.estimatedCost || 0), 0);
            const storePurchased = storeItems.filter(i => i.isPurchased).length;

            return (
              <div key={storeName} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 bg-purple-50/50 border-b border-purple-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {storeName}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {storePurchased} of {storeItems.length} items acquired
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-900">
                      ${storeTotal}
                    </span>
                    <p className="text-[10px] text-slate-400">Store Total</p>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {storeItems.map(item => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      onTogglePurchased={handleTogglePurchased}
                      onEdit={() => onEditItem(item)}
                      onDelete={() => handleDeleteItem(item.id)}
                      onApplyAlternative={() => handleApplyAlternative(item.id)}
                      onAdjustQuantity={(delta) => handleAdjustQuantity(item.id, delta)}
                      onUpdatePrice={(newPrice) => handleUpdatePrice(item.id, newPrice)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredItems.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">No items match your filter</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try clearing your search keyword or switching category filters to see your full shopping checklist.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setStatusFilter('all');
              setSearchQuery('');
            }}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

interface ItemRowProps {
  item: ShoppingItem;
  onTogglePurchased: (id: string) => void;
  onEdit: () => void;
  onDelete: () => void;
  onApplyAlternative: () => void;
  onAdjustQuantity: (delta: number) => void;
  onUpdatePrice: (price: number) => void;
}

const ItemRow: React.FC<ItemRowProps> = ({
  item,
  onTogglePurchased,
  onEdit,
  onDelete,
  onApplyAlternative,
  onAdjustQuantity,
  onUpdatePrice
}) => {
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [tempPrice, setTempPrice] = useState(`${item.estimatedCost}`);

  return (
    <div className={`p-4 transition-colors ${item.isPurchased ? 'bg-slate-50/60 opacity-80' : 'hover:bg-slate-50/40'}`}>
      <div className="flex items-start justify-between gap-3">
        {/* Checkbox and item info */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => onTogglePurchased(item.id)}
            className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-all shrink-0 ${
              item.isPurchased
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                : 'border-slate-300 hover:border-slate-400 bg-white'
            }`}
          >
            {item.isPurchased && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-xs font-bold transition-all ${
                  item.isPurchased ? 'line-through text-slate-400' : 'text-slate-900'
                }`}
              >
                {item.name}
              </span>

              {/* Quantity Stepper Tag */}
              <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => onAdjustQuantity(-1)}
                  title="Decrease quantity & auto-recalculate"
                  className="px-1.5 py-0.5 hover:bg-slate-200 text-slate-600 transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-1.5 py-0.5 text-[11px] font-bold text-slate-800 bg-white border-x border-slate-200">
                  {item.quantity} {item.unit}
                </span>
                <button
                  type="button"
                  onClick={() => onAdjustQuantity(1)}
                  title="Increase quantity & auto-recalculate"
                  className="px-1.5 py-0.5 hover:bg-slate-200 text-slate-600 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Store & Aisle */}
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                <Store className="w-3 h-3 text-slate-400" />
                {item.aisle || item.store} ({item.department})
              </span>

              {/* CymbalMart Brand Badge */}
              {item.isCymbalMartBrand && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                  CymbalMart Brand
                </span>
              )}

              {/* Priority badge */}
              {item.priority === 'must_have' ? (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
                  Essential
                </span>
              ) : item.priority === 'nice_to_have' ? (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60">
                  Recommended
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                  Optional
                </span>
              )}
            </div>

            {/* Notes */}
            {item.notes && (
              <p className="text-[11px] text-slate-500 mt-1 italic">
                {item.notes}
              </p>
            )}

            {/* Budget Alternative Recommendation Pill */}
            {item.budgetAlternative && !item.isPurchased && (
              <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-900">
                  <ArrowDownRight className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Save ${item.estimatedCost - item.budgetAlternative.estimatedCost}:</strong> Swap to {item.budgetAlternative.name} (${item.budgetAlternative.estimatedCost}). {item.budgetAlternative.tip}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onApplyAlternative}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs shrink-0 transition-colors"
                >
                  Apply Swap
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Cost & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            {isEditingPrice ? (
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  step="any"
                  autoFocus
                  value={tempPrice}
                  onChange={(e) => setTempPrice(e.target.value)}
                  onBlur={() => {
                    onUpdatePrice(Number(tempPrice));
                    setIsEditingPrice(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onUpdatePrice(Number(tempPrice));
                      setIsEditingPrice(false);
                    }
                  }}
                  className="w-16 px-1.5 py-0.5 rounded border border-slate-300 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            ) : (
              <button
                onClick={() => {
                  setTempPrice(`${item.actualCost ?? item.estimatedCost}`);
                  setIsEditingPrice(true);
                }}
                title="Click to edit cost & auto-recalculate"
                className="text-sm font-black text-slate-900 hover:text-amber-600 transition-colors"
              >
                ${item.actualCost ?? item.estimatedCost}
              </button>
            )}

            {item.actualCost && item.actualCost !== item.estimatedCost && (
              <p className="text-[10px] text-slate-400 line-through">
                Est. ${item.estimatedCost}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              title="Edit item details"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              title="Delete item & recalculate"
              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
