import React, { useState, useEffect } from 'react';
import { X, Check, Trash2 } from 'lucide-react';
import { ShoppingItem, ItemCategory } from '../types';
import { CATEGORY_LABELS } from '../utils/export';

interface ItemEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ShoppingItem) => void;
  onDelete?: (itemId: string) => void;
  initialItem?: ShoppingItem | null;
}

export const ItemEditModal: React.FC<ItemEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialItem
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ItemCategory>('food_mains');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pack');
  const [estimatedCost, setEstimatedCost] = useState(15);
  const [actualCost, setActualCost] = useState<number | undefined>(undefined);
  const [store, setStore] = useState('Supermarket');
  const [department, setDepartment] = useState('Grocery');
  const [priority, setPriority] = useState<'must_have' | 'nice_to_have' | 'optional'>('must_have');
  const [notes, setNotes] = useState('');
  const [isPurchased, setIsPurchased] = useState(false);

  useEffect(() => {
    if (initialItem) {
      setName(initialItem.name);
      setCategory(initialItem.category);
      setQuantity(initialItem.quantity);
      setUnit(initialItem.unit);
      setEstimatedCost(initialItem.estimatedCost);
      setActualCost(initialItem.actualCost);
      setStore(initialItem.store);
      setDepartment(initialItem.department);
      setPriority(initialItem.priority);
      setNotes(initialItem.notes || '');
      setIsPurchased(initialItem.isPurchased);
    } else {
      setName('');
      setCategory('food_mains');
      setQuantity('1');
      setUnit('pack');
      setEstimatedCost(15);
      setActualCost(undefined);
      setStore('Supermarket');
      setDepartment('Grocery');
      setPriority('must_have');
      setNotes('');
      setIsPurchased(false);
    }
  }, [initialItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const item: ShoppingItem = {
      id: initialItem ? initialItem.id : `item-${Date.now()}`,
      name: name.trim(),
      category,
      quantity: quantity.trim() || '1',
      unit: unit.trim() || 'item',
      estimatedCost: Number(estimatedCost) || 0,
      actualCost: actualCost !== undefined && !isNaN(Number(actualCost)) ? Number(actualCost) : undefined,
      store: store.trim() || 'Supermarket',
      department: department.trim() || 'General',
      priority,
      notes: notes.trim() || undefined,
      isPurchased
    };

    onSave(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-base font-bold text-slate-900">
            {initialItem ? 'Edit Shopping Item' : 'Add New Shopping Item'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Item Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sourdough Baguettes, Prosecco, Balloon Arch Kit"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-medium"
            />
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-medium bg-white"
              >
                {Object.entries(CATEGORY_LABELS).map(([catKey, val]) => (
                  <option key={catKey} value={catKey}>
                    {val.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-medium bg-white"
              >
                <option value="must_have">Must Have (Essential)</option>
                <option value="nice_to_have">Nice to Have</option>
                <option value="optional">Optional / Backup</option>
              </select>
            </div>
          </div>

          {/* Quantity & Unit & Estimated Cost */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Quantity
              </label>
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="2"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Unit
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="bottles, lbs, packs"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Est. Cost ($)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-medium"
              />
            </div>
          </div>

          {/* Store & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Store
              </label>
              <input
                type="text"
                value={store}
                onChange={(e) => setStore(e.target.value)}
                placeholder="Trader Joe's, Costco, Target, Amazon"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Aisle / Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Produce, Deli, Liquor, Paper Goods"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-medium"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Preparation / Buying Note
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Chill overnight, buy morning of, gluten-free label"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-medium"
            />
          </div>

          {/* Purchased Status & Actual Cost */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isPurchased}
                onChange={(e) => setIsPurchased(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span className="text-xs font-semibold text-slate-800">
                Mark as Purchased
              </span>
            </label>

            {isPurchased && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Actual Cost:</span>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
                  <input
                    type="number"
                    step="any"
                    value={actualCost !== undefined ? actualCost : estimatedCost}
                    onChange={(e) => setActualCost(Number(e.target.value))}
                    className="w-24 pl-6 pr-2 py-1 rounded-lg border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            {initialItem && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(initialItem.id);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Item
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Save Item
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
