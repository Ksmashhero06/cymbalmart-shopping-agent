export interface PartyCalculatorInput {
  adults: number;
  teens: number;
  kids: number;
  hours: number;
  partyStyle: 'cocktail_bites' | 'full_meal' | 'casual_snacks' | 'bbq_cookout';
  drinkPreference: 'heavy' | 'moderate' | 'light' | 'non_alcoholic';
  weather: 'indoor' | 'outdoor_warm' | 'outdoor_cool';
}

export interface PartyCalculatedMetrics {
  totalGuests: number;
  totalDrinks: number;
  wineBottles: number;
  beerCans: number;
  liquorBottles750ml: number;
  sodaAndMixerLiters: number;
  waterGallons: number;
  iceLbs: number;
  iceBags10lb: number;
  appetizerBites: number;
  proteinLbs: number;
  sideLbs: number;
  largePizzas: number;
  cakeServings: number;
  platesCount: number;
  cupsCount: number;
  napkinsCount: number;
  trashBagsCount: number;
}

export function calculatePartyMetrics(input: PartyCalculatorInput): PartyCalculatedMetrics {
  const totalGuests = Math.max(1, (input.adults || 0) + (input.teens || 0) + (input.kids || 0));
  const adultGuests = Math.max(0, input.adults || 0);
  const hours = Math.max(1, input.hours || 3);

  // Drinks formula:
  // First hour: 2 drinks/adult, subsequent hours: 1 drink/hr
  let drinkMultiplier = 1.0;
  if (input.drinkPreference === 'heavy') drinkMultiplier = 1.35;
  if (input.drinkPreference === 'light') drinkMultiplier = 0.75;
  if (input.drinkPreference === 'non_alcoholic') drinkMultiplier = 0.8;

  const baseDrinksPerAdult = (2 + (hours - 1) * 1) * drinkMultiplier;
  const drinksPerNonAdult = (1 + (hours - 1) * 0.75);
  const totalDrinks = Math.round(adultGuests * baseDrinksPerAdult + (input.teens + input.kids) * drinksPerNonAdult);

  // Bar breakdown (assuming standard full/moderate bar split: 50% wine, 30% beer, 20% liquor or NA)
  // 1 bottle wine = 5 glasses (750ml)
  // 1 bottle liquor = 16 cocktails (750ml)
  let wineGlasses = input.drinkPreference === 'non_alcoholic' ? 0 : Math.round(adultGuests * (baseDrinksPerAdult * 0.45));
  let beerCans = input.drinkPreference === 'non_alcoholic' ? 0 : Math.round(adultGuests * (baseDrinksPerAdult * 0.35));
  let liquorDrinks = input.drinkPreference === 'non_alcoholic' ? 0 : Math.round(adultGuests * (baseDrinksPerAdult * 0.20));

  const wineBottles = Math.ceil(wineGlasses / 5);
  const liquorBottles750ml = Math.ceil(liquorDrinks / 16);

  // Non-alcoholic soda & mixers
  const sodaAndMixerLiters = Math.ceil((totalDrinks * 0.4 * 0.25) + (input.kids + input.teens) * 1.2);
  const waterGallons = Math.ceil((totalGuests * hours * 0.15) / 3.78 + (input.weather === 'outdoor_warm' ? 1.5 : 0.5));

  // Ice Calculation:
  // Standard: 1.5 lbs per person. Hot outdoor: 2.2 lbs per person (tubs + glasses).
  const icePerGuest = input.weather === 'outdoor_warm' ? 2.2 : 1.5;
  const iceLbs = Math.round(totalGuests * icePerGuest);
  const iceBags10lb = Math.ceil(iceLbs / 10);

  // Food calculations
  let appetizerBites = 0;
  let proteinLbs = 0;
  let sideLbs = 0;

  if (input.partyStyle === 'cocktail_bites') {
    // 5-6 bites per hour
    appetizerBites = Math.round(totalGuests * Math.min(hours * 4.5, 18));
  } else if (input.partyStyle === 'full_meal' || input.partyStyle === 'bbq_cookout') {
    appetizerBites = Math.round(totalGuests * 3); // Pre-dinner snacks
    proteinLbs = Number(((adultGuests * 0.45 + (input.teens * 0.4) + (input.kids * 0.25))).toFixed(1));
    sideLbs = Number(((totalGuests * 0.35)).toFixed(1));
  } else {
    // casual snacks
    appetizerBites = Math.round(totalGuests * 8);
  }

  // Pizza calculation: 3 slices per adult/teen, 2 per kid. (1 large pizza = 8 slices)
  const totalSlices = (adultGuests + input.teens) * 3 + input.kids * 2;
  const largePizzas = Math.ceil(totalSlices / 8);

  const cakeServings = Math.round(totalGuests * 1.1);

  // Tableware:
  const platesCount = Math.round(totalGuests * (input.partyStyle === 'cocktail_bites' ? 2.5 : 1.8));
  const cupsCount = Math.round(totalGuests * 2); // 2 per person or 1 if labeled
  const napkinsCount = Math.round(totalGuests * (input.partyStyle === 'cocktail_bites' ? 4 : 3));
  const trashBagsCount = Math.ceil(totalGuests / 10) + 1;

  return {
    totalGuests,
    totalDrinks,
    wineBottles,
    beerCans,
    liquorBottles750ml,
    sodaAndMixerLiters,
    waterGallons,
    iceLbs,
    iceBags10lb,
    appetizerBites,
    proteinLbs,
    sideLbs,
    largePizzas,
    cakeServings,
    platesCount,
    cupsCount,
    napkinsCount,
    trashBagsCount
  };
}
