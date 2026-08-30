export type PartyType =
  | 'birthday'
  | 'dinner_party'
  | 'cocktail_reception'
  | 'bbq_cookout'
  | 'kids_party'
  | 'holiday_celebration'
  | 'baby_shower'
  | 'game_night'
  | 'graduation'
  | 'other';

export type BarType = 'full_bar' | 'beer_wine' | 'mocktails_only' | 'byob' | 'kid_friendly';
export type BudgetTier = 'budget' | 'moderate' | 'premium' | 'luxury';
export type ItemCategory =
  | 'food_mains'
  | 'appetizers_snacks'
  | 'beverages_bar'
  | 'desserts_bakery'
  | 'decorations_theme'
  | 'tableware_disposables'
  | 'entertainment_favors'
  | 'emergency_essentials';

export interface ShoppingItem {
  id: string;
  name: string;
  category: ItemCategory;
  quantity: string;
  unit: string;
  estimatedCost: number;
  actualCost?: number;
  store: string;
  department: string;
  aisle?: string;
  isCymbalMartBrand?: boolean;
  isPurchased: boolean;
  priority: 'must_have' | 'nice_to_have' | 'optional';
  notes?: string;
  budgetAlternative?: {
    name: string;
    estimatedCost: number;
    tip: string;
    isCymbalMartBrand?: boolean;
    savingsAmount?: number;
  };
}

export interface DietaryDetail {
  restriction: string;
  count: number;
}

export interface FulfillmentDetails {
  method: 'delivery' | 'pickup' | 'in_store';
  storeName: string;
  storeAddress: string;
  timeSlot: string;
  contactPhone?: string;
  specialInstructions?: string;
}

export interface CheckoutDetails {
  isCompleted: boolean;
  orderNumber?: string;
  placedAt?: string;
  fulfillmentMethod: 'delivery' | 'pickup' | 'in_store';
  subtotal: number;
  cymbalClubSavings: number;
  estimatedTax: number;
  total: number;
  estimatedTime: string;
}

export interface PartyPlan {
  id: string;
  title: string;
  theme: string;
  partyType: PartyType;
  date?: string;
  durationHours: number;
  headcount: {
    adults: number;
    teens: number;
    kids: number;
    total: number;
  };
  budget: {
    target: number;
    tier: BudgetTier;
    currency: string;
  };
  barType: BarType;
  venue: string;
  vibe: string;
  specialRequests?: string;
  dietaryRestrictions: DietaryDetail[];
  summary: string;
  expertTips: string[];
  signatureItem?: {
    name: string;
    description: string;
    ingredientsList: string[];
  };
  timelineMilestones: {
    timing: string; // e.g., "1-2 Weeks Before", "3 Days Before", "1 Day Before", "Day-Of (Morning)"
    tasks: string[];
  }[];
  items: ShoppingItem[];
  portionGuidelines: {
    label: string;
    recommended: string;
    reasoning: string;
  }[];
  fulfillment?: FulfillmentDetails;
  checkout?: CheckoutDetails;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  suggestedActions?: {
    label: string;
    actionType: 'add_item' | 'apply_substitution' | 'modify_budget' | 'custom_prompt';
    payload?: any;
  }[];
}
