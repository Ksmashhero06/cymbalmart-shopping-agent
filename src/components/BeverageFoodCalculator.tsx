import React, { useState } from 'react';
import { 
  Calculator, 
  Wine, 
  Beer, 
  GlassWater, 
  Sparkles, 
  Flame, 
  Utensils, 
  Pizza, 
  Cake, 
  Layers, 
  Users, 
  Clock, 
  Sun,
  Info,
  Check
} from 'lucide-react';
import { calculatePartyMetrics, PartyCalculatorInput } from '../utils/calculator';
import { PartyPlan } from '../types';

interface BeverageFoodCalculatorProps {
  currentPlan?: PartyPlan | null;
  onApplyCalculationsToPlan?: (metrics: any) => void;
}

export const BeverageFoodCalculator: React.FC<BeverageFoodCalculatorProps> = ({
  currentPlan,
  onApplyCalculationsToPlan
}) => {
  const [adults, setAdults] = useState<number>(currentPlan?.headcount.adults || 16);
  const [teens, setTeens] = useState<number>(currentPlan?.headcount.teens || 0);
  const [kids, setKids] = useState<number>(currentPlan?.headcount.kids || 0);
  const [hours, setHours] = useState<number>(currentPlan?.durationHours || 4);
  const [partyStyle, setPartyStyle] = useState<'cocktail_bites' | 'full_meal' | 'casual_snacks' | 'bbq_cookout'>('cocktail_bites');
  const [drinkPreference, setDrinkPreference] = useState<'heavy' | 'moderate' | 'light' | 'non_alcoholic'>('moderate');
  const [weather, setWeather] = useState<'indoor' | 'outdoor_warm' | 'outdoor_cool'>('indoor');

  const input: PartyCalculatorInput = {
    adults,
    teens,
    kids,
    hours,
    partyStyle,
    drinkPreference,
    weather
  };

  const metrics = calculatePartyMetrics(input);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Intro Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <Calculator className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Interactive Party Science Calculator
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Catering algorithms calculate precise beverage counts, ice ratios (1.5 lbs/guest rule), food portions, pizza counts, and paper disposables to eliminate under-buying and prevent food waste.
          </p>
        </div>

        {currentPlan && onApplyCalculationsToPlan && (
          <button
            onClick={() => onApplyCalculationsToPlan(metrics)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-all shrink-0"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            Sync Headcount to Active Plan
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders and Controls (Left 5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-600" />
            Guest Headcount & Timing
          </h3>

          {/* Adults Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Adults (Drinking Age)</span>
              <span className="font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                {adults} guests
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={adults}
              onChange={(e) => setAdults(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Teens & Kids Sliders */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">Teens (12-18)</span>
                <span className="font-bold text-slate-800">{teens}</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={teens}
                onChange={(e) => setTeens(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-700"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">Kids (&lt;12)</span>
                <span className="font-bold text-slate-800">{kids}</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={kids}
                onChange={(e) => setKids(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-700"
              />
            </div>
          </div>

          {/* Duration Slider */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Party Duration
              </span>
              <span className="font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                {hours} Hours
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
            />
          </div>

          {/* Party Food Style */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Food Service Format
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              {[
                { key: 'cocktail_bites', label: 'Cocktail & Heavy Bites' },
                { key: 'full_meal', label: 'Full Buffet Dinner' },
                { key: 'bbq_cookout', label: 'BBQ & Cookout Grill' },
                { key: 'casual_snacks', label: 'Casual Finger Foods' },
              ].map((style) => (
                <button
                  key={style.key}
                  type="button"
                  onClick={() => setPartyStyle(style.key as any)}
                  className={`p-2 rounded-xl text-left border transition-all ${
                    partyStyle === style.key
                      ? 'bg-slate-900 text-white font-bold border-slate-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          {/* Drink Preference & Weather */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Bar Vibe
              </label>
              <select
                value={drinkPreference}
                onChange={(e) => setDrinkPreference(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="moderate">Moderate Drinkers (Standard)</option>
                <option value="heavy">Festive / High Consumption (+35%)</option>
                <option value="light">Casual / Light Drinkers (-25%)</option>
                <option value="non_alcoholic">Mocktail / Non-Alcoholic Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Environment & Heat
              </label>
              <select
                value={weather}
                onChange={(e) => setWeather(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="indoor">Indoor / Climate-Controlled</option>
                <option value="outdoor_warm">Outdoor Warm / Summer (+50% Ice)</option>
                <option value="outdoor_cool">Outdoor Cool / Evening</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Breakdown Cards (Right 7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Beverages Section */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Wine className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Beverage & Bar Quantities
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Total Estimated Drinks: <strong className="text-slate-800">{metrics.totalDrinks} servings</strong>
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                Formula: 2 drinks 1st hr + 1/hr
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                <Wine className="w-4 h-4 text-purple-600 mx-auto" />
                <span className="block text-xl font-black text-slate-900 mt-1">
                  {metrics.wineBottles}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Wine Bottles (750ml)</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                <Beer className="w-4 h-4 text-amber-600 mx-auto" />
                <span className="block text-xl font-black text-slate-900 mt-1">
                  {metrics.beerCans}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Beer Cans / Bottles</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                <GlassWater className="w-4 h-4 text-cyan-600 mx-auto" />
                <span className="block text-xl font-black text-slate-900 mt-1">
                  {metrics.liquorBottles750ml}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Liquor 750ml (Cocktails)</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                <Sparkles className="w-4 h-4 text-blue-600 mx-auto" />
                <span className="block text-xl font-black text-slate-900 mt-1">
                  {metrics.iceBags10lb}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">10-lb Ice Bags ({metrics.iceLbs} lbs)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-2 text-xs text-blue-900">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>Pro-Tip for Ice:</strong> Dedicate at least 1 clean 10-lb bag strictly for drinks (with a clean ice scoop), and keep remaining bags in cooler tubs for chilling bottles.
              </span>
            </div>
          </div>

          {/* Food & Mains Section */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Food & Catering Quantities
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Calibrated for {metrics.totalGuests} attendees
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 capitalize">
                {partyStyle.replace('_', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                <Utensils className="w-4 h-4 text-emerald-600 mx-auto" />
                <span className="block text-xl font-black text-slate-900 mt-1">
                  {metrics.appetizerBites}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Appetizer Bites</span>
              </div>

              {partyStyle === 'full_meal' || partyStyle === 'bbq_cookout' ? (
                <>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                    <Flame className="w-4 h-4 text-rose-600 mx-auto" />
                    <span className="block text-xl font-black text-slate-900 mt-1">
                      {metrics.proteinLbs} lbs
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">Raw Protein (Mains)</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                    <Layers className="w-4 h-4 text-amber-600 mx-auto" />
                    <span className="block text-xl font-black text-slate-900 mt-1">
                      {metrics.sideLbs} lbs
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">Sides & Salads</span>
                  </div>
                </>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                  <Pizza className="w-4 h-4 text-amber-600 mx-auto" />
                  <span className="block text-xl font-black text-slate-900 mt-1">
                    {metrics.largePizzas}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Large Pizzas (if ordering)</span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                <Cake className="w-4 h-4 text-pink-600 mx-auto" />
                <span className="block text-xl font-black text-slate-900 mt-1">
                  {metrics.cakeServings}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Dessert / Cake Servings</span>
              </div>
            </div>
          </div>

          {/* Tableware & Disposables */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Paper Goods, Cups & Clean-up Needs
                </h4>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="block text-base font-bold text-slate-900">{metrics.platesCount}</span>
                <span className="text-[11px] text-slate-500">Plates (1.5x buffer)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="block text-base font-bold text-slate-900">{metrics.cupsCount}</span>
                <span className="text-[11px] text-slate-500">Drink Cups</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="block text-base font-bold text-slate-900">{metrics.napkinsCount}</span>
                <span className="text-[11px] text-slate-500">Napkins</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="block text-base font-bold text-slate-900">{metrics.trashBagsCount}</span>
                <span className="text-[11px] text-slate-500">Heavy Trash Liners</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
