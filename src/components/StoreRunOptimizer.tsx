import React from 'react';
import { Store, Check, CheckCircle2, ShoppingBag, MapPin, ArrowRight, ExternalLink } from 'lucide-react';
import { PartyPlan, ShoppingItem } from '../types';

interface StoreRunOptimizerProps {
  plan: PartyPlan;
  onTogglePurchased: (itemId: string) => void;
}

export const StoreRunOptimizer: React.FC<StoreRunOptimizerProps> = ({
  plan,
  onTogglePurchased
}) => {
  // Group items by store
  const storeMap: Record<string, ShoppingItem[]> = {};
  plan.items.forEach(item => {
    const s = item.store || 'Supermarket';
    if (!storeMap[s]) storeMap[s] = [];
    storeMap[s].push(item);
  });

  const stores = Object.keys(storeMap);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Intro Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
              <Store className="w-4 h-4 text-purple-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Store Run Optimizer & Shopping Route
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Items sorted by vendor and grocery aisle to optimize your shopping route. Check off items live on your phone while walking the aisles.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold bg-purple-50 text-purple-700 px-3 py-1.5 rounded-xl border border-purple-100 shrink-0">
          <ShoppingBag className="w-4 h-4" />
          {stores.length} Destination Stores
        </div>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {stores.map((storeName, storeIdx) => {
          const items = storeMap[storeName];
          const totalCost = items.reduce((acc, i) => acc + (i.estimatedCost || 0), 0);
          const purchasedCount = items.filter(i => i.isPurchased).length;
          const isStoreDone = purchasedCount === items.length && items.length > 0;

          // Sub-group by department within store
          const deptMap: Record<string, ShoppingItem[]> = {};
          items.forEach(item => {
            const d = item.department || 'General';
            if (!deptMap[d]) deptMap[d] = [];
            deptMap[d].push(item);
          });

          return (
            <div
              key={storeName}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                isStoreDone ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'
              }`}
            >
              {/* Store Header */}
              <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-sm">
                    {storeIdx + 1}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      {storeName}
                      {isStoreDone && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Complete
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {purchasedCount} of {items.length} items acquired
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-slate-900">${totalCost}</span>
                  <p className="text-[10px] text-slate-400">Estimated</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-1">
                <div
                  className="bg-purple-600 h-1 transition-all duration-300"
                  style={{ width: `${(purchasedCount / Math.max(1, items.length)) * 100}%` }}
                />
              </div>

              {/* Aisle items */}
              <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
                {Object.entries(deptMap).map(([deptName, deptItems]) => (
                  <div key={deptName} className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Aisle / Dept: {deptName}
                    </span>
                    <div className="space-y-1">
                      {deptItems.map(item => (
                        <div
                          key={item.id}
                          onClick={() => onTogglePurchased(item.id)}
                          className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer border transition-colors ${
                            item.isPurchased
                              ? 'bg-slate-50 text-slate-400 border-slate-100'
                              : 'bg-white hover:bg-purple-50/50 text-slate-800 border-slate-200/60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 ${
                                item.isPurchased
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : 'border-slate-300 bg-white'
                              }`}
                            >
                              {item.isPurchased && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className={`truncate font-medium ${item.isPurchased ? 'line-through' : ''}`}>
                              {item.name}
                            </span>
                            <span className="text-[11px] text-slate-400 shrink-0">
                              ({item.quantity} {item.unit})
                            </span>
                          </div>
                          <span className="font-bold text-slate-900 shrink-0 ml-2">
                            ${item.estimatedCost}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
