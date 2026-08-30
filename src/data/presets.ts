import { PartyType, BarType, BudgetTier } from '../types';

export interface PartyPreset {
  id: string;
  title: string;
  theme: string;
  partyType: PartyType;
  durationHours: number;
  headcount: { adults: number; teens: number; kids: number; total: number };
  budget: { target: number; tier: BudgetTier; currency: string };
  barType: BarType;
  venue: string;
  vibe: string;
  dietaryRestrictions: { restriction: string; count: number }[];
  tag: string;
  iconName: string;
}

export const PARTY_PRESETS: PartyPreset[] = [
  {
    id: 'tropical-birthday',
    title: 'Tropical Island Paradise Birthday Bash',
    theme: 'Tropical',
    partyType: 'birthday',
    durationHours: 4,
    headcount: { adults: 18, teens: 2, kids: 0, total: 20 },
    budget: { target: 450, tier: 'moderate', currency: '$' },
    barType: 'full_bar',
    venue: 'Backyard Oasis & Tiki Patio',
    vibe: 'Festive tropical tiki lanterns, coconut & passion fruit cocktails, grilled pineapple skewers, vibrant birthday balloons',
    dietaryRestrictions: [
      { restriction: 'Gluten-Free', count: 3 },
      { restriction: 'Vegetarian', count: 2 }
    ],
    tag: 'Tropical Birthday (20 Guests)',
    iconName: 'PartyPopper'
  },
  {
    id: 'backyard-bbq',
    title: 'Summer Backyard Smokehouse & Lawn Games',
    theme: 'Rustic BBQ & Craft Beer',
    partyType: 'bbq_cookout',
    durationHours: 5,
    headcount: { adults: 16, teens: 4, kids: 4, total: 24 },
    budget: { target: 450, tier: 'moderate', currency: '$' },
    barType: 'beer_wine',
    venue: 'Backyard with Grill & Patio',
    vibe: 'Sunny, laid-back, family-friendly, and hearty',
    dietaryRestrictions: [
      { restriction: 'Vegetarian', count: 3 },
      { restriction: 'Gluten-Free', count: 2 }
    ],
    tag: 'Popular Summer',
    iconName: 'Flame'
  },
  {
    id: 'sunset-tapas',
    title: 'Tuscan Sunset Wine & Tapas Soirée',
    theme: 'Italian Rustic Chic',
    partyType: 'cocktail_reception',
    durationHours: 4,
    headcount: { adults: 14, teens: 0, kids: 0, total: 14 },
    budget: { target: 380, tier: 'premium', currency: '$' },
    barType: 'full_bar',
    venue: 'Living Room & Balcony',
    vibe: 'Sophisticated, candlelit, jazz ambiance, and conversational',
    dietaryRestrictions: [
      { restriction: 'Nut Allergy', count: 1 },
      { restriction: 'Pescatarian', count: 2 }
    ],
    tag: 'Cocktail & Wine',
    iconName: 'Wine'
  },
  {
    id: 'kids-superhero',
    title: 'Galactic Superhero Adventure Blast',
    theme: 'Outer Space Superhero Academy',
    partyType: 'kids_party',
    durationHours: 3,
    headcount: { adults: 10, teens: 2, kids: 12, total: 24 },
    budget: { target: 320, tier: 'budget', currency: '$' },
    barType: 'kid_friendly',
    venue: 'Community Park Pavilion',
    vibe: 'High-energy, colorful, playful games, and photo-ready',
    dietaryRestrictions: [
      { restriction: 'Nut-Free Strict', count: 12 },
      { restriction: 'Dairy-Free', count: 2 }
    ],
    tag: 'Kids & Family',
    iconName: 'Sparkles'
  },
  {
    id: 'cozy-fondue',
    title: 'Alpine Fondue & Board Game Night',
    theme: 'Cozy Winter Chalet',
    partyType: 'game_night',
    durationHours: 4,
    headcount: { adults: 8, teens: 0, kids: 0, total: 8 },
    budget: { target: 200, tier: 'moderate', currency: '$' },
    barType: 'beer_wine',
    venue: 'Dining Room Table',
    vibe: 'Warm, intimate, competitive fun with gourmet dipping snacks',
    dietaryRestrictions: [
      { restriction: 'Vegetarian', count: 2 }
    ],
    tag: 'Intimate Gathering',
    iconName: 'Gamepad2'
  },
  {
    id: 'bridal-brunch',
    title: 'Citrus & Floral Garden Mimosa Brunch',
    theme: 'Pastel Garden Party',
    partyType: 'baby_shower',
    durationHours: 3,
    headcount: { adults: 18, teens: 0, kids: 0, total: 18 },
    budget: { target: 420, tier: 'premium', currency: '$' },
    barType: 'full_bar',
    venue: 'Sunlit Indoor Dining / Garden',
    vibe: 'Fresh, airy, celebratory with build-your-own mimosa bar',
    dietaryRestrictions: [
      { restriction: 'Gluten-Free', count: 3 },
      { restriction: 'Vegetarian', count: 4 }
    ],
    tag: 'Brunch & Shower',
    iconName: 'GlassWater'
  },
  {
    id: 'neon-90s',
    title: 'Neon Retro 90s Dance & Arcade Bash',
    theme: '90s Nostalgia Glow Party',
    partyType: 'birthday',
    durationHours: 5,
    headcount: { adults: 20, teens: 0, kids: 0, total: 20 },
    budget: { target: 500, tier: 'moderate', currency: '$' },
    barType: 'full_bar',
    venue: 'Decorated Basement Lounge',
    vibe: 'Electric neon lights, nostalgic snacks, retro cocktails, dance vibe',
    dietaryRestrictions: [],
    tag: 'Themed Bash',
    iconName: 'PartyPopper'
  }
];
