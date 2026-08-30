import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Truck, 
  Store, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  DollarSign, 
  ShieldCheck, 
  QrCode, 
  Printer, 
  Share2, 
  ArrowRight,
  SlidersHorizontal,
  Plus,
  Minus,
  Tag,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PartyPlan, ShoppingItem } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PartyPlan;
  onUpdatePlan: (updated: PartyPlan) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  plan,
  onUpdatePlan
}) => {
  const [fulfillmentMethod, setFulfillmentMethod] = useState<'pickup' | 'delivery' | 'in_store'>('pickup');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('Saturday, 10:00 AM - 11:00 AM');
  const [deliveryAddress, setDeliveryAddress] = useState('742 Evergreen Terrace, Apt 4B');
  const [hostPhone, setHostPhone] = useState('(555) 382-9910');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [activeStep, setActiveStep] = useState<'review' | 'refine' | 'confirm'>('review');

  if (!isOpen) return null;

  const totalEstimated = plan.items.reduce((acc, item) => acc + (item.estimatedCost || 0), 0);
  const targetBudget = plan.budget.target;
  const isOverBudget = totalEstimated > targetBudget;
  const overAmount = (totalEstimated - targetBudget).toFixed(2);

  // CymbalMart Club Perks & Discounts
  const cymbalClubMemberDiscount = totalEstimated > 100 ? 15.00 : totalEstimated * 0.05;
  const deliveryFee = fulfillmentMethod === 'delivery' ? (totalEstimated >= 50 ? 0 : 5.99) : 0;
  const estimatedTax = totalEstimated * 0.07;
  const finalTotal = Math.max(0, totalEstimated - cymbalClubMemberDiscount + deliveryFee + estimatedTax);

  // Available brand swaps for budget alignment
  const swapOpportunities = plan.items.filter(
    item => item.budgetAlternative && item.budgetAlternative.estimatedCost < item.estimatedCost
  );

  const totalPotentialSavings = swapOpportunities.reduce(
    (acc, item) => acc + (item.estimatedCost - (item.budgetAlternative?.estimatedCost || 0)),
    0
  );

  // 1-Click Auto Align Budget
  const handleApplyAllSwaps = () => {
    const updatedItems = plan.items.map(item => {
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

    onUpdatePlan({
      ...plan,
      items: updatedItems
    });
  };

  // Adjust guest headcount slider in refine step
  const handleRescaleGuests = (delta: number) => {
    const newTotal = Math.max(2, plan.headcount.total + delta);
    const ratio = newTotal / plan.headcount.total;

    const rescaledItems = plan.items.map(item => {
      // Rescale cost proportional to guests for consumables
      const isConsumable = ['food_mains', 'appetizers_snacks', 'beverages_bar', 'desserts_bakery', 'tableware_disposables'].includes(item.category);
      if (isConsumable) {
        const newCost = Math.max(2, Math.round(item.estimatedCost * ratio));
        return {
          ...item,
          estimatedCost: newCost
        };
      }
      return item;
    });

    onUpdatePlan({
      ...plan,
      headcount: {
        ...plan.headcount,
        adults: Math.max(1, Math.round(plan.headcount.adults * ratio)),
        total: newTotal
      },
      items: rescaledItems
    });
  };

  const handlePlaceOrder = () => {
    const generatedOrderNum = 'CYM-' + Math.floor(100000 + Math.random() * 900000);
    setOrderNumber(generatedOrderNum);
    setOrderPlaced(true);
    setActiveStep('confirm');

    const updatedPlan: PartyPlan = {
      ...plan,
      fulfillment: {
        method: fulfillmentMethod,
        storeName: 'CymbalMart Supercenter #1042',
        storeAddress: '742 Metro Parkway, Sector 4',
        timeSlot: selectedTimeSlot,
        contactPhone: hostPhone
      },
      checkout: {
        isCompleted: true,
        orderNumber: generatedOrderNum,
        placedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fulfillmentMethod,
        subtotal: totalEstimated,
        cymbalClubSavings: cymbalClubMemberDiscount,
        estimatedTax,
        total: finalTotal,
        estimatedTime: selectedTimeSlot
      }
    };

    onUpdatePlan(updatedPlan);

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  CymbalMart Refine & Checkout
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                  Supercenter #1042
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Finalize constraints, verify budget alignment, and lock in your order
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Bar (Refine vs Confirm) */}
        {!orderPlaced && (
          <div className="flex border-b border-slate-100 bg-white px-6 py-2.5 gap-4 text-xs font-semibold">
            <button
              onClick={() => setActiveStep('review')}
              className={`flex items-center gap-1.5 pb-1 border-b-2 transition-colors ${
                activeStep === 'review'
                  ? 'border-amber-500 text-amber-900 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>1. Budget & Items Review</span>
            </button>

            <button
              onClick={() => setActiveStep('refine')}
              className={`flex items-center gap-1.5 pb-1 border-b-2 transition-colors ${
                activeStep === 'refine'
                  ? 'border-amber-500 text-amber-900 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>2. Fulfillment & Constraints</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-800">
          
          {/* STEP 1: REVIEW & BUDGET ALIGNMENT */}
          {activeStep === 'review' && !orderPlaced && (
            <div className="space-y-5">
              
              {/* Budget Alignment Banner */}
              <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isOverBudget ? 'bg-amber-50/80 border-amber-200' : 'bg-emerald-50/80 border-emerald-200'
              }`}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      isOverBudget ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200 text-emerald-900'
                    }`}>
                      {isOverBudget ? `Over Budget by $${overAmount}` : 'Perfectly Budget Aligned'}
                    </span>
                    <span className="text-xs font-medium text-slate-600">
                      Target: ${targetBudget} • Total: ${totalEstimated.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {isOverBudget
                      ? `We found ${swapOpportunities.length} CymbalMart private label alternatives to save $${totalPotentialSavings.toFixed(2)}.`
                      : 'All items are calibrated to your guest count and stay comfortably within target budget.'}
                  </p>
                </div>

                {isOverBudget && swapOpportunities.length > 0 && (
                  <button
                    onClick={handleApplyAllSwaps}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm shrink-0 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Auto-Align to Budget (Save ${totalPotentialSavings.toFixed(2)})
                  </button>
                )}
              </div>

              {/* Items Summary Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/40">
                <div className="px-4 py-2.5 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Shopping Cart Items ({plan.items.length} total)</span>
                  <span>Est. Price</span>
                </div>
                <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
                  {plan.items.map((item) => (
                    <div key={item.id} className="px-4 py-2.5 flex items-center justify-between text-xs hover:bg-white transition-colors">
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold text-slate-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {item.quantity} {item.unit} • {item.aisle || item.department}
                        </p>
                      </div>
                      <span className="font-bold text-slate-900 shrink-0">
                        ${item.estimatedCost}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Step Trigger */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveStep('refine')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all"
                >
                  <span>Continue to Fulfillment & Constraints</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: REFINE CONSTRAINTS & FULFILLMENT */}
          {activeStep === 'refine' && !orderPlaced && (
            <div className="space-y-6">
              
              {/* Host Quick Constraint Adjustment */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-slate-700" />
                    <span className="text-xs font-bold text-slate-900">
                      Quick Headcount Refiner
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    {plan.headcount.total} Guests Total
                  </span>
                </div>

                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-600">
                    Need to scale guest count up or down last-minute?
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRescaleGuests(-2)}
                      className="p-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700"
                      title="Decrease by 2 guests"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-bold text-xs text-slate-900 w-8 text-center">
                      {plan.headcount.total}
                    </span>
                    <button
                      onClick={() => handleRescaleGuests(2)}
                      className="p-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700"
                      title="Increase by 2 guests"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Dietary Restriction Tags */}
                {plan.dietaryRestrictions && plan.dietaryRestrictions.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-slate-500">Dietary Safe Flags:</span>
                    {plan.dietaryRestrictions.map((diet, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {diet.restriction} ({diet.count} guests)
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Fulfillment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select CymbalMart Fulfillment Option
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* Curbside Pickup */}
                  <button
                    type="button"
                    onClick={() => setFulfillmentMethod('pickup')}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      fulfillmentMethod === 'pickup'
                        ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                        <Store className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        FREE
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900">Curbside Pickup</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Loaded into trunk at Supercenter #1042</p>
                    </div>
                  </button>

                  {/* Express Delivery */}
                  <button
                    type="button"
                    onClick={() => setFulfillmentMethod('delivery')}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      fulfillmentMethod === 'delivery'
                        ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                        <Truck className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        Same-Day
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900">Express Delivery</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Direct to your doorstep in 2-hour window</p>
                    </div>
                  </button>

                  {/* In-Store Navigator */}
                  <button
                    type="button"
                    onClick={() => setFulfillmentMethod('in_store')}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      fulfillmentMethod === 'in_store'
                        ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                        Self Shop
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900">Smart Aisle Map</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Optimized walking route through aisles</p>
                    </div>
                  </button>

                </div>
              </div>

              {/* Time Slot & Host Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Requested Time Window
                  </label>
                  <select
                    value={selectedTimeSlot}
                    onChange={(e) => setSelectedTimeSlot(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Saturday, 9:00 AM - 10:00 AM">Saturday, 9:00 AM - 10:00 AM</option>
                    <option value="Saturday, 10:00 AM - 11:00 AM">Saturday, 10:00 AM - 11:00 AM (Recommended)</option>
                    <option value="Saturday, 1:00 PM - 2:00 PM">Saturday, 1:00 PM - 2:00 PM</option>
                    <option value="Saturday, 4:00 PM - 5:00 PM">Saturday, 4:00 PM - 5:00 PM</option>
                    <option value="Friday (Day Before), 5:00 PM - 6:00 PM">Friday (Day Before), 5:00 PM - 6:00 PM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Host Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={hostPhone}
                    onChange={(e) => setHostPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Financial Calculation & CymbalMart Club Savings */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Cart Subtotal ({plan.items.length} items)</span>
                  <span>${totalEstimated.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    CymbalMart Plus Member Savings
                  </span>
                  <span>-${cymbalClubMemberDiscount.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Fulfillment & Service</span>
                  <span>{deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Estimated Tax</span>
                  <span>${estimatedTax.toFixed(2)}</span>
                </div>

                <div className="pt-2 border-t border-slate-700 flex items-center justify-between text-sm font-bold text-white">
                  <span>Estimated Total</span>
                  <span className="text-base text-amber-400 font-extrabold">
                    ${finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep('review')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Back to Review
                </button>

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-500/20 transition-all hover:scale-[1.02]"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Place CymbalMart Express Order</span>
                </button>
              </div>

            </div>
          )}

          {/* STEP 3: ORDER CONFIRMED (FINAL RECEIPT) */}
          {orderPlaced && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-extrabold text-slate-900">
                  Party Shopping Plan Confirmed!
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Order <span className="font-bold text-slate-900">#{orderNumber}</span> has been sent to CymbalMart Supercenter #1042.
                </p>
              </div>

              {/* Digital Barcode Card */}
              <div className="max-w-sm mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-center gap-2 text-slate-700 text-xs font-bold">
                  <QrCode className="w-4 h-4 text-amber-600" />
                  <span>Curbside / Express Scan Code</span>
                </div>
                <div className="h-12 bg-slate-900 rounded-lg flex items-center justify-center text-white tracking-[0.3em] font-mono text-sm font-bold">
                  |||||| |||| ||||||| |||
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>Slot: {selectedTimeSlot}</span>
                  <span>{plan.items.length} items</span>
                </div>
              </div>

              {/* Quick Summary Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-left max-w-lg mx-auto">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-medium block">Total Charged</span>
                  <span className="text-xs font-bold text-slate-900">${finalTotal.toFixed(2)}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                  <span className="text-[10px] text-emerald-700 font-medium block">Cymbal Club Saved</span>
                  <span className="text-xs font-bold text-emerald-800">${cymbalClubMemberDiscount.toFixed(2)}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-500 font-medium block">Store Location</span>
                  <span className="text-xs font-bold text-slate-900 truncate block">Supercenter #1042</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Packing Slip
                </button>

                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
