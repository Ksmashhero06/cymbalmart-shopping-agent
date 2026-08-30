import React from 'react';
import { 
  Sparkles, 
  Calculator, 
  ShoppingBag, 
  Store, 
  Clock, 
  MessageSquareText, 
  Download, 
  PlusCircle,
  MapPin,
  CheckCircle2,
  SlidersHorizontal,
  CreditCard,
  Mic
} from 'lucide-react';
import { PartyPlan } from '../types';

interface HeaderProps {
  activeTab: 'plan' | 'calculator' | 'stores' | 'timeline';
  setActiveTab: (tab: 'plan' | 'calculator' | 'stores' | 'timeline') => void;
  currentPlan: PartyPlan | null;
  onOpenNewPlanModal: () => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
  onOpenExportModal: () => void;
  onOpenCheckoutModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentPlan,
  onOpenNewPlanModal,
  onToggleChat,
  isChatOpen,
  onOpenExportModal,
  onOpenCheckoutModal
}) => {
  const totalEstimated = currentPlan?.items.reduce((acc, i) => acc + (i.estimatedCost || 0), 0) || 0;
  const itemsCount = currentPlan?.items.length || 0;

  return (
    <header id="app-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* CymbalMart Brand & Store Location */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20 shrink-0 font-black text-xl">
              C
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                  CymbalMart
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200/80">
                  <Sparkles className="w-3 h-3 mr-1 text-amber-600" />
                  Party Shopping Agent
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate font-medium">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>Supercenter #1042 • Curbside & Same-Day Delivery</span>
              </div>
            </div>
          </div>

          {/* CUJ Stepper / Tabs */}
          <nav className="hidden lg:flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 text-xs font-semibold">
            {/* Step 1 */}
            <button
              id="step-define-event"
              onClick={onOpenNewPlanModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white/60 transition-all"
              title="Define event type, theme, budget, guest count, and special requests"
            >
              <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">1</span>
              <span>Define Event</span>
            </button>

            {/* Step 2 */}
            <button
              id="step-review-list"
              onClick={() => setActiveTab('plan')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'plan'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center text-[10px] font-bold">2</span>
              <span>Review & Align Budget</span>
            </button>

            {/* Step 3 */}
            <button
              id="step-refine-checkout"
              onClick={onOpenCheckoutModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white/60 transition-all"
              title="Adjust constraints and finalize CymbalMart order"
            >
              <span className="w-4 h-4 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center text-[10px] font-bold">3</span>
              <span>Refine & Checkout</span>
            </button>
          </nav>

          {/* Action Buttons & Cart Summary */}
          <div className="flex items-center gap-2 shrink-0">
            {currentPlan && (
              <button
                id="btn-checkout-top"
                onClick={onOpenCheckoutModal}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold text-xs shadow-md shadow-rose-500/20 hover:from-amber-600 hover:to-rose-600 transition-all"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Checkout (${totalEstimated})</span>
              </button>
            )}

            <button
              id="btn-export-plan"
              onClick={onOpenExportModal}
              title="Export or Print Shopping List"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Print / Export</span>
            </button>

            <button
              id="btn-new-plan"
              onClick={onOpenNewPlanModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5 text-slate-700" />
              <span className="hidden sm:inline">New Event</span>
            </button>

            <button
              id="btn-toggle-chat-drawer"
              onClick={onToggleChat}
              title="Chat with CymbalMart Assistant"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isChatOpen
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-amber-100 text-amber-950 hover:bg-amber-200/80 border border-amber-300 shadow-xs'
              }`}
            >
              <MessageSquareText className="w-4 h-4 text-amber-700" />
              <span className="hidden sm:inline">CymbalMart Assistant</span>
              <span className="sm:hidden">Assistant</span>
            </button>
          </div>

        </div>

        {/* Sub-nav tools bar */}
        <div className="flex items-center justify-between py-2 border-t border-slate-100 text-xs font-medium overflow-x-auto gap-4">
          <div className="flex items-center gap-1">
            <button
              id="nav-tab-plan"
              onClick={() => setActiveTab('plan')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                activeTab === 'plan'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Shopping Plan ({itemsCount})</span>
            </button>

            <button
              id="nav-tab-calculator"
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                activeTab === 'calculator'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Portion & Drink Science</span>
            </button>

            <button
              id="nav-tab-stores"
              onClick={() => setActiveTab('stores')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                activeTab === 'stores'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Aisle Navigator</span>
            </button>

            <button
              id="nav-tab-timeline"
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                activeTab === 'timeline'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Prep Countdown</span>
            </button>
          </div>

          {currentPlan && (
            <div className="hidden sm:flex items-center gap-2 text-slate-500 text-[11px] font-medium shrink-0">
              <span>{currentPlan.title}</span>
              <span>•</span>
              <span className="font-semibold text-slate-800">${totalEstimated} est. / ${currentPlan.budget.target} target</span>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

