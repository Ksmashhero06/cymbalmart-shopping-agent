import React, { useState, useEffect } from 'react';
import { PartyPlan, ShoppingItem } from './types';
import { PARTY_PRESETS } from './data/presets';
import { Header } from './components/Header';
import { BudgetSummaryCard } from './components/BudgetSummaryCard';
import { ShoppingPlanView } from './components/ShoppingPlanView';
import { BeverageFoodCalculator } from './components/BeverageFoodCalculator';
import { StoreRunOptimizer } from './components/StoreRunOptimizer';
import { PartyTimeline } from './components/PartyTimeline';
import { AgentChatDrawer } from './components/AgentChatDrawer';
import { PartyForm } from './components/PartyForm';
import { ItemEditModal } from './components/ItemEditModal';
import { RecipeModal } from './components/RecipeModal';
import { ExportModal } from './components/ExportModal';
import { CheckoutModal } from './components/CheckoutModal';
import { VoiceControlWidget } from './components/VoiceControlWidget';
import { Sparkles, ShoppingBag, PlusCircle, MessageSquareText } from 'lucide-react';

const STORAGE_KEY = 'party_planner_shopping_plan';

export default function App() {
  const [activePlan, setActivePlan] = useState<PartyPlan | null>(null);
  const [activeTab, setActiveTab] = useState<'plan' | 'calculator' | 'stores' | 'timeline'>('plan');
  const [isLoading, setIsLoading] = useState(false);

  // Modals & Drawers
  const [isNewPlanModalOpen, setIsNewPlanModalOpen] = useState(false);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isItemEditModalOpen, setIsItemEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Initialize plan from localStorage or generate default preset
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setActivePlan(JSON.parse(saved));
        return;
      }
    } catch (e) {
      console.warn('Failed to load saved party plan:', e);
    }

    // Default to preset #1
    const defaultPreset = PARTY_PRESETS[0];
    handleGeneratePlan({
      title: defaultPreset.title,
      theme: defaultPreset.theme,
      partyType: defaultPreset.partyType,
      durationHours: defaultPreset.durationHours,
      headcount: defaultPreset.headcount,
      budget: defaultPreset.budget,
      barType: defaultPreset.barType,
      venue: defaultPreset.venue,
      vibe: defaultPreset.vibe,
      dietaryRestrictions: defaultPreset.dietaryRestrictions
    });
  }, []);

  // Save to localStorage whenever activePlan updates
  const handleUpdatePlan = (updated: PartyPlan) => {
    setActivePlan(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  };

  // Generate new plan via API
  const handleGeneratePlan = async (params: any) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const data = await res.json();
      if (data.plan) {
        handleUpdatePlan(data.plan);
        setIsNewPlanModalOpen(false);
      }
    } catch (err) {
      console.error('Error generating party plan:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Item management
  const handleOpenAddItem = () => {
    setEditingItem(null);
    setIsItemEditModalOpen(true);
  };

  const handleOpenEditItem = (item: ShoppingItem) => {
    setEditingItem(item);
    setIsItemEditModalOpen(true);
  };

  const handleSaveItem = (item: ShoppingItem) => {
    if (!activePlan) return;
    const existingIdx = activePlan.items.findIndex(i => i.id === item.id);
    let newItems = [...activePlan.items];
    if (existingIdx >= 0) {
      newItems[existingIdx] = item;
    } else {
      newItems.unshift(item);
    }
    handleUpdatePlan({
      ...activePlan,
      items: newItems
    });
  };

  const handleDeleteItem = (itemId: string) => {
    if (!activePlan) return;
    handleUpdatePlan({
      ...activePlan,
      items: activePlan.items.filter(i => i.id !== itemId)
    });
  };

  const handleAddRecipeItems = (itemsToAdd: ShoppingItem[]) => {
    if (!activePlan) return;
    handleUpdatePlan({
      ...activePlan,
      items: [...itemsToAdd, ...activePlan.items]
    });
  };

  const handleTogglePurchased = (itemId: string) => {
    if (!activePlan) return;
    const updatedItems = activePlan.items.map(item => {
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
    handleUpdatePlan({
      ...activePlan,
      items: updatedItems
    });
  };

  // Auto align budget via API endpoint or direct client swap
  const handleAutoAlignBudget = async () => {
    if (!activePlan) return;
    try {
      const res = await fetch('/api/budget/auto-align', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: activePlan.items,
          targetBudget: activePlan.budget.target
        })
      });
      const data = await res.json();
      if (data.items) {
        handleUpdatePlan({
          ...activePlan,
          items: data.items
        });
        return;
      }
    } catch (e) {
      console.warn('Auto-align API fallback to client logic:', e);
    }

    // Client fallback swap
    const updated = activePlan.items.map(item => {
      if (item.budgetAlternative && item.budgetAlternative.estimatedCost < item.estimatedCost) {
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

    handleUpdatePlan({
      ...activePlan,
      items: updated
    });
  };

  // Sync calculator metrics to active plan
  const handleApplyCalculationsToPlan = (metrics: any) => {
    if (!activePlan) return;
    handleUpdatePlan({
      ...activePlan,
      headcount: {
        ...activePlan.headcount,
        total: metrics.totalGuests
      }
    });
    setActiveTab('plan');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentPlan={activePlan}
        onOpenNewPlanModal={() => setIsNewPlanModalOpen(true)}
        onToggleChat={() => setIsChatDrawerOpen(!isChatDrawerOpen)}
        isChatOpen={isChatDrawerOpen}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenCheckoutModal={() => setIsCheckoutModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {activePlan ? (
          <>
            {/* Top Budget & Overview Summary Card */}
            <BudgetSummaryCard 
              plan={activePlan} 
              onApplyAllSavings={handleAutoAlignBudget}
              onOpenCheckoutModal={() => setIsCheckoutModalOpen(true)}
            />

            {/* Tab Views */}
            {activeTab === 'plan' && (
              <ShoppingPlanView
                plan={activePlan}
                onUpdatePlan={handleUpdatePlan}
                onOpenAddItemModal={handleOpenAddItem}
                onEditItem={handleOpenEditItem}
                onOpenRecipeModal={() => setIsRecipeModalOpen(true)}
              />
            )}

            {activeTab === 'calculator' && (
              <BeverageFoodCalculator
                currentPlan={activePlan}
                onApplyCalculationsToPlan={handleApplyCalculationsToPlan}
              />
            )}

            {activeTab === 'stores' && (
              <StoreRunOptimizer
                plan={activePlan}
                onTogglePurchased={handleTogglePurchased}
              />
            )}

            {activeTab === 'timeline' && (
              <PartyTimeline plan={activePlan} />
            )}
          </>
        ) : (
          /* Loading Placeholder */
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Initializing Party Planner Shopping Agent...
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Setting up calibrated portion algorithms, store route optimizer, and grocery items.
            </p>
          </div>
        )}
      </main>

      {/* Floating CymbalMart Assistant Chatbot Button */}
      {!isChatDrawerOpen && activePlan && (
        <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-2">
          {/* Helpful callout teaser */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md text-slate-800 text-[11px] font-semibold shadow-lg border border-slate-200 animate-bounce">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Ask CymbalMart Assistant</span>
          </div>

          <button
            id="btn-floating-agent"
            onClick={() => setIsChatDrawerOpen(true)}
            aria-label="Open CymbalMart Assistant Chatbot"
            className="inline-flex items-center gap-2.5 px-4 py-3 rounded-full bg-slate-900 text-white font-bold text-xs shadow-xl shadow-slate-900/30 hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 border border-slate-700/50"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-slate-950 font-black shadow-xs">
              <Sparkles className="w-4 h-4 text-slate-950" />
            </div>
            <div className="text-left">
              <span className="block leading-tight font-extrabold text-white">CymbalMart Assistant</span>
              <span className="block text-[10px] text-amber-300 font-normal">Supercenter #1042 AI</span>
            </div>
          </button>
        </div>
      )}

      {/* Modals & Drawers */}
      <PartyForm
        isOpen={isNewPlanModalOpen}
        onClose={() => setIsNewPlanModalOpen(false)}
        onSubmit={handleGeneratePlan}
        isLoading={isLoading}
      />

      {activePlan && (
        <>
          <AgentChatDrawer
            isOpen={isChatDrawerOpen}
            onClose={() => setIsChatDrawerOpen(false)}
            currentPlan={activePlan}
            onUpdatePlan={handleUpdatePlan}
            onAddCustomItem={(item) => handleSaveItem(item)}
          />

          <ItemEditModal
            isOpen={isItemEditModalOpen}
            onClose={() => setIsItemEditModalOpen(false)}
            onSave={handleSaveItem}
            onDelete={handleDeleteItem}
            initialItem={editingItem}
          />

          <RecipeModal
            isOpen={isRecipeModalOpen}
            onClose={() => setIsRecipeModalOpen(false)}
            onAddItems={handleAddRecipeItems}
            headcount={activePlan.headcount.total}
          />

          <ExportModal
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            plan={activePlan}
          />

          <CheckoutModal
            isOpen={isCheckoutModalOpen}
            onClose={() => setIsCheckoutModalOpen(false)}
            plan={activePlan}
            onUpdatePlan={handleUpdatePlan}
          />

          {/* Hands-Free Voice Control Floating Pill & Modal */}
          <VoiceControlWidget
            plan={activePlan}
            onUpdatePlan={handleUpdatePlan}
            onNavigateTab={(tab) => {
              if (tab === 'optimizer') setActiveTab('stores');
              else setActiveTab(tab);
            }}
            onOpenCheckout={() => setIsCheckoutModalOpen(true)}
            onOpenRecipeModal={() => setIsRecipeModalOpen(true)}
            onToggleChat={() => setIsChatDrawerOpen(prev => !prev)}
          />
        </>
      )}
    </div>
  );
}
