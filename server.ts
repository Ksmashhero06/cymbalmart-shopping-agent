import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set in environment.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Fallback generator when API key is not yet set or in offline sandbox mode
function generateFallbackPlan(params: any): any {
  const adults = Number(params.headcount?.adults) || 12;
  const kids = Number(params.headcount?.kids) || 0;
  const teens = Number(params.headcount?.teens) || 0;
  const total = adults + kids + teens;
  const budget = Number(params.budget?.target) || 350;
  const theme = params.theme || "Celebration";
  const title = params.title || `${theme} Party`;
  const specialReq = params.specialRequests || params.notes || "None";

  return {
    id: "plan-" + Date.now(),
    title: title,
    theme: theme,
    partyType: params.partyType || "birthday",
    durationHours: Number(params.durationHours) || 4,
    headcount: { adults, teens, kids, total },
    budget: {
      target: budget,
      tier: params.budget?.tier || "moderate",
      currency: "$",
    },
    barType: params.barType || "beer_wine",
    venue: params.venue || "Indoor/Living Room",
    vibe: params.vibe || "Fun, relaxed, and welcoming",
    specialRequests: specialReq,
    dietaryRestrictions: params.dietaryRestrictions || [],
    summary: `Curated for CymbalMart Supercenter shoppers: A complete, budget-optimized party shopping plan for your ${total}-guest ${theme} gathering. Calibrated with precise portions, CymbalMart store aisle navigation, and private-label savings to keep you comfortably within your $${budget} target.`,
    expertTips: [
      `Buy 1.5 lbs of CymbalMart Crystal Pure Ice per guest (${Math.round(total * 1.5)} lbs total) — keep 2 bags strictly for drink glasses and 1 for bottle cooling tubs.`,
      "Chill CymbalMart Signature white wines, craft seltzers, and sodas at least 6 hours before guests arrive to avoid fridge crowding.",
      "Pre-order custom decorated sheet cakes or artisan slider platters 24 hours in advance via CymbalMart Bakery & Deli.",
      "Stock up on CymbalMart Heavy-Duty compostable plates and napkins (1.5x guest count) so guests can comfortably take second servings."
    ],
    signatureItem: {
      name: `CymbalMart ${theme} Sunset Sparkler`,
      description: "A crowd-pleasing batch beverage with sparkling cider, fresh citrus slices, and pomegranate juice.",
      ingredientsList: ["CymbalMart Sparkling Apple Cider", "CymbalMart 100% Pomegranate Juice", "Fresh Organic Navel Oranges", "Fresh Mint Sprigs", "Frozen CymbalMart Mixed Berries"]
    },
    timelineMilestones: [
      {
        timing: "1-2 Weeks Before",
        tasks: [
          "Choose CymbalMart party supplies, balloon garland kits, and themed banner decor (Aisle 14)",
          "Verify glassware, cooler capacities, and serving platters"
        ]
      },
      {
        timing: "3-4 Days Before",
        tasks: [
          "Purchase pantry dry goods, canned mixers, sodas, and paper tableware at CymbalMart (Aisle 9 & 17)",
          "Confirm guest headcount, RSVP counts, and final dietary restrictions"
        ]
      },
      {
        timing: "1 Day Before",
        tasks: [
          "Pick up fresh produce, artisanal cheeses, deli sliders, and bakery desserts (Aisles 1, 3, 5)",
          "Pre-batch mocktail/punch base in pitchers and marinate grill items",
          "Chill wine, beers, and canned sodas in the beverage cooler"
        ]
      },
      {
        timing: "Day-Of (Morning)",
        tasks: [
          "Express Curbside Pickup or Same-Day Delivery for fresh ice bags (Aisle 18 Freezer) and custom bakery items",
          "Set up buffet stations, drink bar, ice buckets, and labeled recycling bins"
        ]
      }
    ],
    portionGuidelines: [
      {
        label: "Appetizers & Finger Foods",
        recommended: `${Math.round(total * 6)} pieces total`,
        reasoning: "Catering formula: 5-6 bite-sized appetizers per guest for a 4-hour mingling event."
      },
      {
        label: "Beverages (Alcoholic + NA)",
        recommended: `${Math.round(total * 4)} drinks total`,
        reasoning: "2 drinks per adult in the 1st hour, plus 1 drink per hour thereafter."
      },
      {
        label: "Party Ice",
        recommended: `${Math.round(total * 1.5)} lbs (${Math.ceil((total * 1.5) / 10)} 10-lb bags)`,
        reasoning: "1.5 lbs per guest ensures ample clean glass ice plus cooler tub chilling."
      }
    ],
    fulfillment: {
      method: "pickup",
      storeName: "CymbalMart Supercenter #1042",
      storeAddress: "742 Evergreen Terrace, Metro Plaza",
      timeSlot: "Saturday, 11:00 AM - 12:00 PM"
    },
    items: [
      {
        id: "item-1",
        name: "CymbalMart Artisan Cheese & Charcuterie Tasting Board",
        category: "appetizers_snacks",
        quantity: `${Math.ceil(total / 8)}`,
        unit: "large platters",
        estimatedCost: Math.round(budget * 0.14),
        store: "CymbalMart Supercenter",
        department: "Deli & Gourmet",
        aisle: "Aisle 5 (Deli Counter)",
        isCymbalMartBrand: true,
        isPurchased: false,
        priority: "must_have",
        notes: "Includes aged cheddar, creamy brie, cured prosciutto, water crackers, and dried apricots.",
        budgetAlternative: {
          name: "CymbalMart Value Cheese Block & Salami Trio (Self-Slice)",
          estimatedCost: Math.round(budget * 0.08),
          savingsAmount: Math.round(budget * 0.06),
          isCymbalMartBrand: true,
          tip: "Slice cheese at home 2 hours before the party to save 40% over pre-arranged platters."
        }
      },
      {
        id: "item-2",
        name: "CymbalMart Fresh Bakery Pretzel Sliders & Pulled Meat Kit",
        category: "food_mains",
        quantity: `${Math.round(total * 2)}`,
        unit: "sliders",
        estimatedCost: Math.round(budget * 0.22),
        store: "CymbalMart Supercenter",
        department: "Bakery & Meat",
        aisle: "Aisle 3 & 7",
        isCymbalMartBrand: true,
        isPurchased: false,
        priority: "must_have",
        notes: "Fresh pretzel slider buns paired with slow-roasted pork or shredded chicken.",
        budgetAlternative: {
          name: "CymbalMart Value Pack Mini Burger Buns & Ground Beef Patties",
          estimatedCost: Math.round(budget * 0.15),
          savingsAmount: Math.round(budget * 0.07),
          isCymbalMartBrand: true,
          tip: "Pre-formed ground beef patties provide high yield at wholesale prices."
        }
      },
      {
        id: "item-3",
        name: "CymbalMart Fresh Organic Farm Crisp Salad Kit with Vinaigrette",
        category: "food_mains",
        quantity: `${Math.ceil(total / 6)}`,
        unit: "family bowls",
        estimatedCost: Math.round(budget * 0.08),
        store: "CymbalMart Supercenter",
        department: "Fresh Produce",
        aisle: "Aisle 1 (Produce)",
        isCymbalMartBrand: true,
        isPurchased: false,
        priority: "must_have",
        notes: "Crisp spring mix, sweet grape tomatoes, shaved parmesan, and garlic croutons."
      },
      {
        id: "item-4",
        name: "CymbalMart Reserve Estate Wines & Craft IPA Beer Assortment",
        category: "beverages_bar",
        quantity: `${Math.ceil(adults * 0.5)} bottles wine / ${Math.ceil(adults * 1.5)} beers`,
        unit: "bottles/cans",
        estimatedCost: Math.round(budget * 0.20),
        store: "CymbalMart Supercenter",
        department: "Beverages & Spirits",
        aisle: "Aisle 11 (Beer & Wine)",
        isCymbalMartBrand: true,
        isPurchased: false,
        priority: "must_have",
        notes: "Chilled Pinot Grigio, Cabernet Sauvignon, and refreshing citrus craft beer.",
        budgetAlternative: {
          name: "CymbalMart Club Pack Seltzers & House Select Wine",
          estimatedCost: Math.round(budget * 0.13),
          savingsAmount: Math.round(budget * 0.07),
          isCymbalMartBrand: true,
          tip: "CymbalMart Club 24-packs cut per-can cost down to $0.85."
        }
      },
      {
        id: "item-5",
        name: "CymbalMart Pure Sparkling Water 24pk & Fresh Citrus Mix",
        category: "beverages_bar",
        quantity: "2",
        unit: "cases + 8 fresh limes/lemons",
        estimatedCost: Math.round(budget * 0.07),
        store: "CymbalMart Supercenter",
        department: "Beverages",
        aisle: "Aisle 9 (Beverage Aisle)",
        isCymbalMartBrand: true,
        isPurchased: false,
        priority: "must_have",
        notes: "Lime, grapefruit, and berry sparkling waters + fresh sliced citrus garnishes."
      },
      {
        id: "item-6",
        name: "CymbalMart Crystal Clear Filtered Party Ice (10-lb Bags)",
        category: "beverages_bar",
        quantity: `${Math.ceil((total * 1.5) / 10)}`,
        unit: "10-lb bags",
        estimatedCost: Math.ceil((total * 1.5) / 10) * 3.5,
        store: "CymbalMart Supercenter",
        department: "Freezer Essentials",
        aisle: "Aisle 18 (Ice Merchandiser)",
        isCymbalMartBrand: true,
        isPurchased: false,
        priority: "must_have",
        notes: "Buy morning of party or request curbside loading directly into trunk."
      },
      {
        id: "item-7",
        name: `CymbalMart ${theme} Coordinated Decor & Balloon Arch Kit`,
        category: "decorations_theme",
        quantity: "1",
        unit: "complete kit",
        estimatedCost: Math.round(budget * 0.09),
        store: "CymbalMart Supercenter",
        department: "Party Supplies",
        aisle: "Aisle 14 (Party & Celebration)",
        isCymbalMartBrand: true,
        isPurchased: false,
        priority: "must_have",
        notes: "Includes balloon strip, glue dots, matching theme banner, and table runner."
      },
      {
        id: "item-8",
        name: "CymbalMart Eco-Friendly Compostable Dinner Plates & Linen Napkins",
        category: "tableware_disposables",
        quantity: `${Math.round(total * 2)}`,
        unit: "sets",
        estimatedCost: Math.round(budget * 0.07),
        store: "CymbalMart Supercenter",
        department: "Paper Goods",
        aisle: "Aisle 17 (Paper & Tableware)",
        isCymbalMartBrand: true,
        isPurchased: false,
        priority: "must_have",
        notes: "Sturdy sugarcane fiber plates (soak-proof) + 3-ply ultra soft napkins."
      },
      {
        id: "item-9",
        name: "CymbalMart Fresh Bakery Mini Cupcake & Macaron Platter",
        category: "desserts_bakery",
        quantity: `${Math.round(total * 1.2)}`,
        unit: "servings",
        estimatedCost: Math.round(budget * 0.09),
        store: "CymbalMart Supercenter",
        department: "Bakery",
        aisle: "Aisle 3 (Fresh Bakery)",
        isCymbalMartBrand: true,
        isPurchased: false,
        priority: "must_have",
        notes: "Bite-sized desserts prevent cake-cutting bottlenecks during mingling."
      },
      {
        id: "item-10",
        name: "CymbalMart Host Emergency & Clean-Up Kit",
        category: "emergency_essentials",
        quantity: "1",
        unit: "kit",
        estimatedCost: 12,
        store: "CymbalMart Supercenter",
        department: "Household & Cleaning",
        aisle: "Aisle 16 (Cleaning & Paper)",
        isCymbalMartBrand: true,
        isPurchased: false,
        priority: "must_have",
        notes: "Heavy flex trash liners, glass marker pens for cups, and quick surface sanitizing wipes."
      }
    ]
  };
}

// 1. Generate full party shopping plan for CymbalMart
app.post("/api/plan/generate", async (req, res) => {
  try {
    const userParams = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      console.log("No Gemini API key, using intelligent CymbalMart template engine");
      return res.json({ plan: generateFallbackPlan(userParams) });
    }

    const prompt = `You are the CymbalMart AI Party Planner Shopping Agent.
Your goal is to convert the user's party intent into a meticulously curated, budget-conscious grocery and party supply shopping list available at CymbalMart Supercenter.

Parameters:
- Event Title: ${userParams.title || "Celebration"}
- Theme & Vibe: ${userParams.theme || "Festive"} (${userParams.vibe || "Fun and welcoming"})
- Event Type: ${userParams.partyType || "birthday"}
- Duration: ${userParams.durationHours || 4} hours
- Headcount: Adults: ${userParams.headcount?.adults || 12}, Teens: ${userParams.headcount?.teens || 0}, Kids: ${userParams.headcount?.kids || 0} (Total: ${(userParams.headcount?.adults || 12) + (userParams.headcount?.teens || 0) + (userParams.headcount?.kids || 0)})
- Budget: $${userParams.budget?.target || 350} (Tier: ${userParams.budget?.tier || "moderate"})
- Bar / Beverage style: ${userParams.barType || "beer_wine"}
- Venue: ${userParams.venue || "Indoor Home"}
- Special Requests & Constraints: ${userParams.specialRequests || userParams.notes || "None"}
- Dietary Restrictions: ${JSON.stringify(userParams.dietaryRestrictions || [])}

Instructions:
1. Map items to real CymbalMart store departments and aisle locations:
   - Produce: "Aisle 1 (Produce)"
   - Fresh Bakery: "Aisle 3 (Bakery)"
   - Deli & Prepared Foods: "Aisle 5 (Deli & Prepared)"
   - Meat & Seafood: "Aisle 7 (Meat & Seafood)"
   - Snacks, Condiments & Pantry: "Aisle 9 (Pantry & Snacks)"
   - Beverages, Wine & Beer: "Aisle 11 (Beverages & Wine)"
   - Party Supplies, Balloons & Decor: "Aisle 14 (Party Supplies)"
   - Paper Goods & Tableware: "Aisle 17 (Paper & Tableware)"
   - Freezer & Ice: "Aisle 18 (Freezer & Ice)"
2. Calculate precise quantities:
   - Food portions: 5-6 bite-sized appetizers/guest/hr or full dinner portions. Include dedicated dietary items for any restrictions specified.
   - Beverages: 2 drinks per guest in 1st hour, 1 drink/hr thereafter. Ice rule: 1.5 lbs per person.
   - Tableware: 1.5x plates, 2 napkins per person.
3. Budget Optimization:
   - Provide smart CymbalMart private label alternatives ("CymbalMart Fresh", "CymbalMart Great Value") with calculated savings for high-cost items.
4. Total estimated cost must align closely with the target budget $${userParams.budget?.target || 350}.
5. Set store to "CymbalMart Supercenter".

Return a valid JSON object matching the schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            theme: { type: Type.STRING },
            partyType: { type: Type.STRING },
            durationHours: { type: Type.NUMBER },
            headcount: {
              type: Type.OBJECT,
              properties: {
                adults: { type: Type.NUMBER },
                teens: { type: Type.NUMBER },
                kids: { type: Type.NUMBER },
                total: { type: Type.NUMBER },
              },
              required: ["adults", "teens", "kids", "total"]
            },
            budget: {
              type: Type.OBJECT,
              properties: {
                target: { type: Type.NUMBER },
                tier: { type: Type.STRING },
                currency: { type: Type.STRING },
              },
              required: ["target", "tier", "currency"]
            },
            barType: { type: Type.STRING },
            venue: { type: Type.STRING },
            vibe: { type: Type.STRING },
            specialRequests: { type: Type.STRING },
            summary: { type: Type.STRING },
            expertTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            signatureItem: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                ingredientsList: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["name", "description", "ingredientsList"]
            },
            timelineMilestones: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timing: { type: Type.STRING },
                  tasks: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["timing", "tasks"]
              }
            },
            portionGuidelines: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  recommended: { type: Type.STRING },
                  reasoning: { type: Type.STRING }
                },
                required: ["label", "recommended", "reasoning"]
              }
            },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  category: { type: Type.STRING },
                  quantity: { type: Type.STRING },
                  unit: { type: Type.STRING },
                  estimatedCost: { type: Type.NUMBER },
                  store: { type: Type.STRING },
                  department: { type: Type.STRING },
                  aisle: { type: Type.STRING },
                  isCymbalMartBrand: { type: Type.BOOLEAN },
                  isPurchased: { type: Type.BOOLEAN },
                  priority: { type: Type.STRING },
                  notes: { type: Type.STRING },
                  budgetAlternative: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      estimatedCost: { type: Type.NUMBER },
                      tip: { type: Type.STRING },
                      isCymbalMartBrand: { type: Type.BOOLEAN },
                      savingsAmount: { type: Type.NUMBER }
                    }
                  }
                },
                required: ["id", "name", "category", "quantity", "unit", "estimatedCost", "store", "department", "isPurchased", "priority"]
              }
            }
          },
          required: ["title", "theme", "headcount", "budget", "summary", "expertTips", "timelineMilestones", "items", "portionGuidelines"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    if (!parsed.id) parsed.id = "plan-" + Date.now();
    if (!parsed.dietaryRestrictions) parsed.dietaryRestrictions = userParams.dietaryRestrictions || [];
    if (!parsed.specialRequests) parsed.specialRequests = userParams.specialRequests || userParams.notes || "";
    if (!parsed.fulfillment) {
      parsed.fulfillment = {
        method: "pickup",
        storeName: "CymbalMart Supercenter #1042",
        storeAddress: "742 Evergreen Terrace, Metro Plaza",
        timeSlot: "Saturday, 11:00 AM - 12:00 PM"
      };
    }
    res.json({ plan: parsed });
  } catch (error: any) {
    console.error("Error generating plan with Gemini:", error);
    res.json({ plan: generateFallbackPlan(req.body) });
  }
});

// 1.5 Auto-Align budget endpoint
app.post("/api/budget/auto-align", async (req, res) => {
  try {
    const { plan } = req.body;
    if (!plan || !plan.items) {
      return res.status(400).json({ error: "Missing plan" });
    }

    const targetBudget = plan.budget?.target || 350;
    let currentTotal = plan.items.reduce((s: number, i: any) => s + (i.estimatedCost || 0), 0);

    // Swap items with budgetAlternative if available until under budget
    const updatedItems = plan.items.map((item: any) => {
      if (currentTotal > targetBudget && item.budgetAlternative && item.budgetAlternative.estimatedCost < item.estimatedCost) {
        const diff = item.estimatedCost - item.budgetAlternative.estimatedCost;
        currentTotal -= diff;
        return {
          ...item,
          name: item.budgetAlternative.name,
          estimatedCost: item.budgetAlternative.estimatedCost,
          isCymbalMartBrand: true,
          notes: `${item.notes || ''} (Auto-aligned with CymbalMart Value option. Saved $${diff})`
        };
      }
      return item;
    });

    res.json({
      plan: {
        ...plan,
        items: updatedItems
      }
    });
  } catch (err) {
    console.error("Auto align error:", err);
    res.status(500).json({ error: "Failed to align budget" });
  }
});

// 2. Chat with CymbalMart Assistant
app.post("/api/chat", async (req, res) => {
  try {
    const { message, currentPlan, history } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Intelligent CymbalMart Assistant fallback response
      const lowerMsg = (message || "").toLowerCase();
      let reply = `Hello! I'm your CymbalMart Assistant at Supercenter #1042. `;
      let actions = [
        {
          label: "Locate Store Aisles",
          actionType: "custom_prompt",
          payload: "Where are party ice, snacks, and tableware located in CymbalMart?"
        },
        {
          label: "CymbalMart Brand Savings",
          actionType: "custom_prompt",
          payload: "How much can I save by switching to CymbalMart store brands?"
        },
        {
          label: "Curbside Pickup Info",
          actionType: "custom_prompt",
          payload: "How do I use Curbside Express Pickup at Supercenter #1042?"
        }
      ];

      if (lowerMsg.includes("ice") || lowerMsg.includes("cooler")) {
        const guestCount = currentPlan?.headcount?.total || 20;
        const recIce = Math.round(guestCount * 1.5);
        const bags = Math.ceil(recIce / 10);
        reply += `Crystal Clear Filtered Party Ice is in Aisle 18 (Freezer section). For ${guestCount} guests, you'll need ~${recIce} lbs (${bags}x 10-lb bags). Pro-tip: keep 2 bags strictly for drink glasses and the rest for the cooler tubs!`;
      } else if (lowerMsg.includes("vegan") || lowerMsg.includes("gluten") || lowerMsg.includes("diet")) {
        reply += `In Aisle 1 (Produce) and Aisle 5 (Deli), we have certified Gluten-Free crackers, vegan guacamole, and pre-cut crudité platters. Would you like me to recommend a party-size appetizer kit?`;
      } else if (lowerMsg.includes("save") || lowerMsg.includes("budget") || lowerMsg.includes("cut")) {
        reply += `Switching brand-name items to CymbalMart Fresh and CymbalMart Great Value private-label items typically saves 30%–40% on your total cart. You can also use the 'Auto-Align to Budget' button on your dashboard to save instantly!`;
      } else if (lowerMsg.includes("pickup") || lowerMsg.includes("delivery") || lowerMsg.includes("order")) {
        reply += `Curbside Express Pickup at Supercenter #1042 is open 7:00 AM - 9:00 PM daily at Bays 1-12. Same-Day Delivery is free for orders over $50 with a 2-hour window!`;
      } else {
        reply += `For your "${currentPlan?.title || "Party"}" with ${currentPlan?.headcount?.total || 15} guests, I can help you find items across our aisles, suggest portion adjustments, recommend recipes, or answer any questions about your order!`;
      }

      return res.json({
        reply,
        suggestedActions: actions
      });
    }

    const systemInstruction = `You are the "CymbalMart Assistant", the friendly, knowledgeable AI customer concierge and party shopping specialist for CymbalMart Supercenter #1042.
Your role is to assist retail customers and event hosts with:
1. Navigating CymbalMart aisles:
   - Aisle 1: Fresh Produce, Organic Fruit, Salad Greens
   - Aisle 3: Fresh Bakery, Custom Decorated Cakes, Artisan Slider Buns
   - Aisle 5: Deli, Prepared Charcuterie Platters, Dips & Cheeses
   - Aisle 7: Fresh Meat, Poultry, Seafood, Grilling Essentials
   - Aisle 9: Pantry, Chips, Crackers, Condiments & Mixers
   - Aisle 11: Beverages, Craft Beer, Estate Wines & Seltzers
   - Aisle 14: Party Supplies, Themed Balloon Arches, Banners & Favors
   - Aisle 16: Cleaning Supplies, Heavy Trash Bags, Stain Wipes
   - Aisle 17: Paper Goods, Compostable Tableware, Napkins, Cutlery
   - Aisle 18: Freezer Essentials & Crystal Clear Party Ice (10-lb & 20-lb bags)
2. Solving catering, drink, and ice quantity formulas (1.5 lbs ice/guest; 2 drinks 1st hr + 1 drink/hr after).
3. Helping customers save money with CymbalMart private labels ("CymbalMart Fresh", "CymbalMart Great Value", "CymbalMart Signature").
4. Answering questions regarding Curbside Pickup (Bays 1-12), Same-Day Delivery, and store services.
5. Suggesting relevant products or recipes with concise, friendly, practical advice.

Current Customer Party Context:
Title: ${currentPlan?.title}
Theme: ${currentPlan?.theme}
Headcount: ${JSON.stringify(currentPlan?.headcount)}
Budget Target: $${currentPlan?.budget?.target}
Dietary Restrictions: ${JSON.stringify(currentPlan?.dietaryRestrictions)}
Current Items in Cart: ${currentPlan?.items?.length || 0}
Current Total: $${currentPlan?.items?.reduce((s: number, i: any) => s + (i.estimatedCost || 0), 0) || 0}

Respond warmly, concisely, and practically as CymbalMart Assistant. Return JSON format with reply and 1-3 suggested action prompt buttons.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `Customer message: ${message}\n\nChat history: ${JSON.stringify(history || [])}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING, description: "Friendly, helpful customer service response from CymbalMart Assistant with specific aisle numbers, recommendations, and clear steps." },
            suggestedActions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  actionType: { type: Type.STRING },
                  payload: { type: Type.STRING }
                },
                required: ["label", "actionType"]
              }
            }
          },
          required: ["reply"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({
      reply: parsed.reply || "I'm here to help with your CymbalMart shopping needs!",
      suggestedActions: parsed.suggestedActions || []
    });
  } catch (error: any) {
    console.error("Error in CymbalMart Assistant chat:", error);
    res.json({
      reply: "Hello! I'm your CymbalMart Assistant. Our Supercenter is stocked with fresh bakery items, chilled beverages, and party supplies. How can I help you find what you need today?",
      suggestedActions: [
        {
          label: "Find Store Aisles",
          actionType: "custom_prompt",
          payload: "Show me where party supplies and ice are located in the store"
        }
      ]
    });
  }
});

// 3. AI Smart Item Generator / Recipe Breakdown
app.post("/api/plan/add-recipe", async (req, res) => {
  try {
    const { recipeOrConcept, headcount, targetBudget } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        items: [
          {
            id: "recipe-item-" + Date.now() + "-1",
            name: `${recipeOrConcept} Primary Ingredients`,
            category: "food_mains",
            quantity: `${headcount || 12}`,
            unit: "servings",
            estimatedCost: 28,
            store: "Supermarket",
            department: "Grocery",
            isPurchased: false,
            priority: "must_have",
            notes: `Calculated for ${headcount || 12} guests.`
          }
        ]
      });
    }

    const prompt = `Break down the recipe or party concept "${recipeOrConcept}" into exact grocery shopping items for ${headcount} guests.
Provide specific quantities, estimated cost in USD, the optimal grocery department, and the recommended store.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              category: { type: Type.STRING },
              quantity: { type: Type.STRING },
              unit: { type: Type.STRING },
              estimatedCost: { type: Type.NUMBER },
              store: { type: Type.STRING },
              department: { type: Type.STRING },
              isPurchased: { type: Type.BOOLEAN },
              priority: { type: Type.STRING },
              notes: { type: Type.STRING }
            },
            required: ["name", "category", "quantity", "unit", "estimatedCost", "store", "department", "priority"]
          }
        }
      }
    });

    const items = JSON.parse(response.text || "[]").map((item: any, idx: number) => ({
      ...item,
      id: item.id || `recipe-${Date.now()}-${idx}`,
      isPurchased: false
    }));

    res.json({ items });
  } catch (error) {
    console.error("Error breaking down recipe:", error);
    res.status(500).json({ error: "Failed to break down recipe" });
  }
});

// 4. Hands-Free Voice Command Processor
app.post("/api/voice-command", async (req, res) => {
  try {
    const { transcript, currentPlan } = req.body;
    const ai = getGeminiClient();

    if (!transcript || typeof transcript !== "string") {
      return res.status(400).json({ error: "Missing transcript" });
    }

    if (!ai) {
      // Local fallback for offline mode
      return res.json({
        spokenReply: "Received your command: " + transcript,
        intent: "general_inquiry",
        action: null
      });
    }

    const systemInstruction = `You are the CymbalMart Hands-Free Voice Control Engine for Supercenter #1042.
The user is speaking hands-free to manage their party shopping plan.
Analyze the user's spoken voice transcript and produce a structured intent and action.

Supported intents & actions:
- "add_item": user wants to add an item (extract item name, quantity, estimatedCost, category, aisle)
- "remove_item": user wants to remove an item (extract itemName)
- "update_quantity": user wants to change quantity (extract itemName, quantity, delta)
- "toggle_purchased": user wants to check/uncheck an item (extract itemName, isPurchased)
- "align_budget": user wants to apply savings/swaps or align with target budget
- "change_budget": user wants to set new target budget (extract newBudget)
- "change_headcount": user wants to change guest count (extract headcount)
- "query_budget": user asks about budget, totals, or savings
- "query_aisle": user asks where something is in the store
- "query_formula": user asks about ice or drink quantity formulas
- "navigate_tab": user wants to switch view ('plan' | 'calculator' | 'optimizer' | 'timeline')
- "open_checkout": user wants to proceed to checkout or review order
- "complete_checkout": user wants to confirm or finalize order
- "general_chat": general question or greeting

Provide a concise, natural, friendly spokenReply that sounds great when read aloud by browser text-to-speech.

Current Plan Context:
Title: ${currentPlan?.title}
Headcount: ${currentPlan?.headcount?.total || 15}
Target Budget: $${currentPlan?.budget?.target || 350}
Current Items Count: ${currentPlan?.items?.length || 0}
Current Items: ${JSON.stringify((currentPlan?.items || []).map((i: any) => ({ id: i.id, name: i.name, qty: i.quantity, cost: i.estimatedCost, aisle: i.aisle })))}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `Spoken transcript: "${transcript}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            spokenReply: { type: Type.STRING, description: "Clear, helpful conversational speech response to speak back to the user hands-free." },
            intent: { type: Type.STRING },
            action: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                itemName: { type: Type.STRING },
                quantity: { type: Type.STRING },
                estimatedCost: { type: Type.NUMBER },
                category: { type: Type.STRING },
                aisle: { type: Type.STRING },
                newBudget: { type: Type.NUMBER },
                headcount: { type: Type.NUMBER },
                tab: { type: Type.STRING },
                fulfillmentMethod: { type: Type.STRING }
              }
            }
          },
          required: ["spokenReply", "intent"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error) {
    console.error("Error processing voice command:", error);
    res.status(500).json({
      spokenReply: "I heard your request. How else can I assist with your CymbalMart shopping plan?",
      intent: "error"
    });
  }
});

// Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Party Planner Shopping Agent server running on http://localhost:${PORT}`);
  });
}

startServer();
