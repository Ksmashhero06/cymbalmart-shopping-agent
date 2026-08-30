import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Users, 
  DollarSign, 
  Clock, 
  Wine, 
  MapPin, 
  Loader2, 
  AlertCircle,
  Plus,
  Trash2,
  PartyPopper,
  Flame,
  Gamepad2,
  GlassWater
} from 'lucide-react';
import { PartyType, BarType, BudgetTier, DietaryDetail } from '../types';
import { PARTY_PRESETS, PartyPreset } from '../data/presets';

interface PartyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (params: any) => Promise<void>;
  isLoading: boolean;
}

export const PartyForm: React.FC<PartyFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading
}) => {
  const [title, setTitle] = useState('Summer Sunset Garden Soirée');
  const [theme, setTheme] = useState('Mediterranean Garden Chic');
  const [partyType, setPartyType] = useState<PartyType>('cocktail_reception');
  const [adults, setAdults] = useState(16);
  const [teens, setTeens] = useState(0);
  const [kids, setKids] = useState(0);
  const [durationHours, setDurationHours] = useState(4);
  const [targetBudget, setTargetBudget] = useState(400);
  const [budgetTier, setBudgetTier] = useState<BudgetTier>('moderate');
  const [barType, setBarType] = useState<BarType>('full_bar');
  const [venue, setVenue] = useState('Backyard & Patio');
  const [vibe, setVibe] = useState('Warm string lights, artisan appetizers, signature spritz bar, upbeat acoustic playlist');
  const [dietaryList, setDietaryList] = useState<DietaryDetail[]>([
    { restriction: 'Vegetarian', count: 3 },
    { restriction: 'Gluten-Free', count: 2 }
  ]);
  const [notes, setNotes] = useState('');

  // Quick dietary add state
  const [newDietName, setNewDietName] = useState('');
  const [newDietCount, setNewDietCount] = useState(1);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: PartyPreset) => {
    setTitle(preset.title);
    setTheme(preset.theme);
    setPartyType(preset.partyType);
    setAdults(preset.headcount.adults);
    setTeens(preset.headcount.teens);
    setKids(preset.headcount.kids);
    setDurationHours(preset.durationHours);
    setTargetBudget(preset.budget.target);
    setBudgetTier(preset.budget.tier);
    setBarType(preset.barType);
    setVenue(preset.venue);
    setVibe(preset.vibe);
    setDietaryList(preset.dietaryRestrictions || []);
  };

  const handleAddDietary = () => {
    if (!newDietName.trim()) return;
    setDietaryList(prev => [...prev, { restriction: newDietName.trim(), count: Number(newDietCount) || 1 }]);
    setNewDietName('');
    setNewDietCount(1);
  };

  const handleRemoveDietary = (index: number) => {
    setDietaryList(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = adults + teens + kids;
    onSubmit({
      title,
      theme,
      partyType,
      durationHours,
      headcount: { adults, teens, kids, total },
      budget: { target: targetBudget, tier: budgetTier, currency: '$' },
      barType,
      venue,
      vibe,
      dietaryRestrictions: dietaryList,
      notes
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center shadow-xs">
              <PartyPopper className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Plan a New Party & Shopping List
              </h3>
              <p className="text-xs text-slate-500">
                Let the AI Shopping Agent calculate calibrated portions & grocery lists
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

        {/* Body Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Preset Inspiration Carousel */}
          <div>
            <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Quick Inspiration Themes (One-Click Setup)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PARTY_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 text-left transition-all group"
                >
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded">
                    {preset.tag}
                  </span>
                  <p className="font-bold text-slate-900 text-xs mt-1 truncate group-hover:text-amber-900">
                    {preset.theme}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {preset.headcount.total} guests • ${preset.budget.target}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <form id="party-planner-form" onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-100">
            {/* Title & Theme */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Maya's 30th Birthday Bash"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Party Theme / Aesthetic *
                </label>
                <input
                  type="text"
                  required
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="e.g. Disco Tropical, Rustic Italian, Game Day"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* Headcount Breakdown */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  Headcount Breakdown ({adults + teens + kids} total)
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Adults (21+)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={adults}
                    onChange={(e) => setAdults(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Teens (12-20)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={teens}
                    onChange={(e) => setTeens(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Kids (&lt;12)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={kids}
                    onChange={(e) => setKids(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Budget & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Budget Target ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    min="20"
                    value={targetBudget}
                    onChange={(e) => setTargetBudget(Math.max(10, parseInt(e.target.value) || 0))}
                    className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Budget Style
                </label>
                <select
                  value={budgetTier}
                  onChange={(e) => setBudgetTier(e.target.value as BudgetTier)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-slate-900"
                >
                  <option value="budget">Thrifty / Wholesale Bulk</option>
                  <option value="moderate">Moderate / Balanced</option>
                  <option value="premium">Premium / Artisan</option>
                  <option value="luxury">Luxury / Top Shelf</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Duration (Hours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={durationHours}
                  onChange={(e) => setDurationHours(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* Bar Type & Venue */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Beverage / Bar Preference
                </label>
                <select
                  value={barType}
                  onChange={(e) => setBarType(e.target.value as BarType)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-slate-900"
                >
                  <option value="full_bar">Full Bar (Cocktails, Wine, Beer, Mixers)</option>
                  <option value="beer_wine">Beer, Wine & Seltzers Only</option>
                  <option value="mocktails_only">Mocktails & Non-Alcoholic Only</option>
                  <option value="byob">BYOB (Provide Ice, Mixers & Cups)</option>
                  <option value="kid_friendly">Kid-Friendly Juice & Soda Bar</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Venue Setting
                </label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="Backyard, Living Room, Park, Rooftop"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* Dietary Restrictions Manager */}
            <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-200/60 space-y-2">
              <span className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                Dietary Restrictions & Allergies
              </span>

              {/* Current badges */}
              <div className="flex flex-wrap gap-1.5">
                {dietaryList.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-xs font-semibold text-rose-800 shadow-2xs"
                  >
                    {item.restriction} ({item.count} guests)
                    <button
                      type="button"
                      onClick={() => handleRemoveDietary(idx)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add dietary mini form */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newDietName}
                  onChange={(e) => setNewDietName(e.target.value)}
                  placeholder="e.g. Vegan, Halal, Nut Allergy"
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                />
                <input
                  type="number"
                  min="1"
                  value={newDietCount}
                  onChange={(e) => setNewDietCount(parseInt(e.target.value) || 1)}
                  className="w-16 px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddDietary}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Vibe / Atmosphere description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Vibe, Activities & Special Instructions
              </label>
              <textarea
                rows={2}
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
                placeholder="e.g. Lawn games like cornhole, signature sangria station, candlelit string lights..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="party-planner-form"
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 shadow-md shadow-slate-900/10 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                AI Agent Generating Plan...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400" />
                Generate Custom Shopping Plan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
