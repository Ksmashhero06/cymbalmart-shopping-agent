import React, { useState } from 'react';
import { X, Sparkles, Plus, Loader2, Utensils, CheckCircle } from 'lucide-react';
import { ShoppingItem } from '../types';

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItems: (items: ShoppingItem[]) => void;
  headcount: number;
}

export const RecipeModal: React.FC<RecipeModalProps> = ({
  isOpen,
  onClose,
  onAddItems,
  headcount
}) => {
  const [concept, setConcept] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedItems, setGeneratedItems] = useState<ShoppingItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!concept.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/plan/add-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeOrConcept: concept,
          headcount: headcount || 15
        })
      });

      const data = await res.json();
      if (data.items && Array.isArray(data.items)) {
        setGeneratedItems(data.items);
        setSelectedIds(new Set(data.items.map((i: any) => i.id)));
      }
    } catch (err) {
      console.error('Error generating recipe breakdown:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleConfirmAdd = () => {
    const itemsToAdd = generatedItems.filter(i => selectedIds.has(i.id));
    if (itemsToAdd.length > 0) {
      onAddItems(itemsToAdd);
    }
    onClose();
    setConcept('');
    setGeneratedItems([]);
  };

  const exampleIdeas = [
    'Build-your-own Street Taco Bar',
    'Signature Passionfruit Rum Punch Bowl',
    'Artisanal Truffle Popcorn & Pretzel Bar',
    'Avocado Toast & Mimosa Brunch Station'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                AI Recipe & Station Breakdown
              </h3>
              <p className="text-xs text-slate-500">
                Turn any dish, cocktail, or food station into calibrated grocery items.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Input form */}
          <form onSubmit={handleGenerate} className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Recipe, Cocktail, or Party Station Idea
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="e.g. Gourmet Sliders & Crispy Onions, Sangria Pitcher"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-medium"
              />
              <button
                type="submit"
                disabled={isLoading || !concept.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-all shrink-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Breakdown
                  </>
                )}
              </button>
            </div>

            {/* Quick Inspiration Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 font-medium">Try:</span>
              {exampleIdeas.map((idea, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setConcept(idea);
                  }}
                  className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors"
                >
                  {idea}
                </button>
              ))}
            </div>
          </form>

          {/* Generated items list */}
          {generatedItems.length > 0 && (
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Generated Shopping Items ({selectedIds.size} selected)
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Est. Subtotal: $
                  {generatedItems
                    .filter(i => selectedIds.has(i.id))
                    .reduce((acc, i) => acc + (i.estimatedCost || 0), 0)}
                </span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {generatedItems.map((item) => {
                  const isSelected = selectedIds.has(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleSelect(item.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-50/70 border-amber-300 text-slate-900'
                          : 'bg-slate-50 border-slate-200 text-slate-500 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                            isSelected
                              ? 'bg-amber-500 border-amber-600 text-white'
                              : 'bg-white border-slate-300'
                          }`}
                        >
                          {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{item.name}</p>
                          <p className="text-[11px] text-slate-500">
                            {item.quantity} {item.unit} • {item.store} ({item.department})
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900 shrink-0">
                        ${item.estimatedCost}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          {generatedItems.length > 0 && (
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAdd}
                disabled={selectedIds.size === 0}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                Add {selectedIds.size} Items to Plan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
