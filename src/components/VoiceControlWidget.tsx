import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  X, 
  ChevronRight, 
  Check, 
  Bot, 
  HelpCircle, 
  ArrowRight,
  ShoppingBag,
  CreditCard,
  Layers,
  Store,
  DollarSign
} from 'lucide-react';
import { PartyPlan, ShoppingItem, ItemCategory } from '../types';

interface VoiceControlWidgetProps {
  plan: PartyPlan | null;
  onUpdatePlan: (updated: PartyPlan) => void;
  onNavigateTab: (tab: 'plan' | 'calculator' | 'optimizer' | 'timeline') => void;
  onOpenCheckout: () => void;
  onOpenRecipeModal: () => void;
  onToggleChat: () => void;
}

export const VoiceControlWidget: React.FC<VoiceControlWidgetProps> = ({
  plan,
  onUpdatePlan,
  onNavigateTab,
  onOpenCheckout,
  onOpenRecipeModal,
  onToggleChat
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastResponse, setLastResponse] = useState<string | null>(null);
  const [isSpeechMuted, setIsSpeechMuted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [actionHistory, setActionHistory] = useState<Array<{ text: string; time: string; type: string }>>([]);
  const [audioLevel, setAudioLevel] = useState(0);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize Speech Synthesis & Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
        console.warn('Speech recognition is not supported in this browser.');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);

        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          const finalCommand = lastResult[0].transcript.trim();
          if (finalCommand) {
            handleProcessCommand(finalCommand);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Voice recognition event error:', event.error);
        if (event.error === 'not-allowed') {
          setIsListening(false);
          speak("Microphone access was denied. Please allow microphone permissions to use voice control.");
        }
      };

      recognition.onend = () => {
        // If user intended continuous listening, restart
        if (isListening) {
          try {
            recognition.start();
          } catch (e) {
            setIsListening(false);
          }
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [isListening]);

  // Audio level simulation during listening
  useEffect(() => {
    let interval: any;
    if (isListening) {
      interval = setInterval(() => {
        setAudioLevel(Math.floor(Math.random() * 80) + 20);
      }, 100);
    } else {
      setAudioLevel(0);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  // Voice speech feedback (TTS)
  const speak = (text: string) => {
    setLastResponse(text);
    if (isSpeechMuted || !synthRef.current) return;

    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    
    // Choose pleasant English voice if available
    const voices = synthRef.current.getVoices();
    const enVoice = voices.find(v => (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')) && v.lang.startsWith('en')) || voices.find(v => v.lang.startsWith('en'));
    if (enVoice) {
      utterance.voice = enVoice;
    }

    synthRef.current.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      setIsListening(false);
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      speak("Voice assistant paused.");
    } else {
      setTranscript('');
      try {
        recognitionRef.current.start();
        setIsListening(true);
        speak("I'm listening. You can tell me to add items, check your budget, find store aisles, or checkout.");
      } catch (e) {
        console.warn('Could not start recognition:', e);
      }
    }
  };

  // Process voice commands (server AI + instant local fallback)
  const handleProcessCommand = async (rawCommand: string) => {
    const cmd = rawCommand.toLowerCase();
    let spokenOutput = '';
    let actionTaken = '';

    // Log to history
    const addHistory = (type: string, text: string) => {
      setActionHistory(prev => [
        { type, text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) },
        ...prev.slice(0, 9)
      ]);
    };

    // 1. Navigation Commands
    if (cmd.includes('calculator') || cmd.includes('drink formula') || cmd.includes('portion')) {
      onNavigateTab('calculator');
      spokenOutput = "Opening Beverage and Food Calculator.";
      actionTaken = "Switched to Calculator View";
      speak(spokenOutput);
      addHistory('navigation', actionTaken);
      return;
    }

    if (cmd.includes('aisle') || cmd.includes('route') || cmd.includes('optimizer') || cmd.includes('store map')) {
      onNavigateTab('optimizer');
      spokenOutput = "Opening CymbalMart Supercenter Aisle Route Optimizer.";
      actionTaken = "Switched to Store Optimizer View";
      speak(spokenOutput);
      addHistory('navigation', actionTaken);
      return;
    }

    if (cmd.includes('timeline') || cmd.includes('milestone') || cmd.includes('prep schedule')) {
      onNavigateTab('timeline');
      spokenOutput = "Opening Party Prep Timeline.";
      actionTaken = "Switched to Timeline View";
      speak(spokenOutput);
      addHistory('navigation', actionTaken);
      return;
    }

    if (cmd.includes('shopping list') || cmd.includes('checklist') || cmd.includes('show list') || cmd.includes('go to plan')) {
      onNavigateTab('plan');
      spokenOutput = "Showing your shopping checklist.";
      actionTaken = "Switched to Shopping List View";
      speak(spokenOutput);
      addHistory('navigation', actionTaken);
      return;
    }

    if (cmd.includes('checkout') || cmd.includes('place order') || cmd.includes('finish order') || cmd.includes('curbside pickup') || cmd.includes('delivery')) {
      onOpenCheckout();
      spokenOutput = "Opening Checkout and Fulfillment screen.";
      actionTaken = "Opened Checkout Screen";
      speak(spokenOutput);
      addHistory('checkout', actionTaken);
      return;
    }

    if (cmd.includes('recipe') || cmd.includes('dish') || cmd.includes('add cocktail') || cmd.includes('batch cocktail')) {
      onOpenRecipeModal();
      spokenOutput = "Opening AI Recipe and Dish Breakdown.";
      actionTaken = "Opened Recipe Modal";
      speak(spokenOutput);
      addHistory('recipe', actionTaken);
      return;
    }

    if (cmd.includes('chat') || cmd.includes('assistant') || cmd.includes('cymbalmart assistant') || cmd.includes('concierge')) {
      onToggleChat();
      spokenOutput = "Opening CymbalMart Assistant Chat.";
      actionTaken = "Toggled Assistant Chat";
      speak(spokenOutput);
      addHistory('chat', actionTaken);
      return;
    }

    // 2. Budget Queries and Auto-Recalculation
    if (cmd.includes('budget') || cmd.includes('total') || cmd.includes('how much') || cmd.includes('cost')) {
      if (plan) {
        const totalEstimated = plan.items.reduce((s, i) => s + (i.estimatedCost || 0), 0);
        const target = plan.budget.target;
        const diff = Math.abs(totalEstimated - target);
        const isOver = totalEstimated > target;
        const perGuest = (totalEstimated / Math.max(1, plan.headcount.total)).toFixed(2);

        spokenOutput = `Your estimated shopping total is $${totalEstimated}. You are $${diff} ${isOver ? 'over' : 'under'} your $${target} budget target. That comes out to $${perGuest} per guest.`;
        actionTaken = `Budget query: $${totalEstimated} total / $${target} target`;
        speak(spokenOutput);
        addHistory('budget', actionTaken);
        return;
      }
    }

    // 3. Apply Budget Savings / Auto Align
    if (cmd.includes('save') || cmd.includes('saving') || cmd.includes('align') || cmd.includes('store brand') || cmd.includes('swap')) {
      if (plan) {
        let savingsCount = 0;
        let totalSaved = 0;
        const updatedItems = plan.items.map(item => {
          if (item.budgetAlternative && item.budgetAlternative.estimatedCost < item.estimatedCost) {
            savingsCount++;
            totalSaved += (item.estimatedCost - item.budgetAlternative.estimatedCost);
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

        if (savingsCount > 0) {
          onUpdatePlan({ ...plan, items: updatedItems });
          spokenOutput = `Applied ${savingsCount} CymbalMart store brand swaps, saving you $${totalSaved} dollars! Your budget has been automatically recalculated.`;
          actionTaken = `Auto-aligned budget: Saved $${totalSaved}`;
        } else {
          spokenOutput = "Your shopping list is already fully optimized with CymbalMart store brand savings!";
          actionTaken = "Budget already optimized";
        }
        speak(spokenOutput);
        addHistory('savings', actionTaken);
        return;
      }
    }

    // 4. Aisle Queries
    if (cmd.includes('where is') || cmd.includes('where are') || cmd.includes('which aisle') || cmd.includes('locate')) {
      if (cmd.includes('ice')) {
        spokenOutput = "Crystal Clear Party Ice is located in Aisle 18 in the freezer department.";
      } else if (cmd.includes('plate') || cmd.includes('cup') || cmd.includes('tableware') || cmd.includes('napkin') || cmd.includes('fork')) {
        spokenOutput = "Paper goods, compostable tableware, and party cups are located in Aisle 17.";
      } else if (cmd.includes('snack') || cmd.includes('chip') || cmd.includes('salsa') || cmd.includes('dip')) {
        spokenOutput = "Chips, dips, and party snacks are located in Aisle 9 in the pantry department.";
      } else if (cmd.includes('wine') || cmd.includes('beer') || cmd.includes('drink') || cmd.includes('soda') || cmd.includes('seltzers')) {
        spokenOutput = "Beverages, craft beers, wines, and canned seltzers are in Aisle 11.";
      } else if (cmd.includes('cake') || cmd.includes('dessert') || cmd.includes('bread') || cmd.includes('buns')) {
        spokenOutput = "Bakery buns, decorated cakes, and pastries are in Aisle 3.";
      } else if (cmd.includes('meat') || cmd.includes('burger') || cmd.includes('steak') || cmd.includes('chicken') || cmd.includes('hot dog')) {
        spokenOutput = "Fresh meats and grilling essentials are in Aisle 7.";
      } else if (cmd.includes('balloon') || cmd.includes('decor') || cmd.includes('banner')) {
        spokenOutput = "Themed party decor, balloon arches, and party favors are in Aisle 14.";
      } else {
        spokenOutput = "You can view all items organized by their CymbalMart Supercenter aisle numbers in the Aisle Route tab.";
      }
      speak(spokenOutput);
      addHistory('aisle', spokenOutput);
      return;
    }

    // 5. Quantity Formulas (Ice / Drinks)
    if (cmd.includes('how much ice') || cmd.includes('how many drinks') || cmd.includes('formula')) {
      if (plan) {
        const guests = plan.headcount.total;
        const iceLbs = Math.round(guests * 1.5);
        const bags = Math.ceil(iceLbs / 10);
        spokenOutput = `For ${guests} guests, the catering standard is ${iceLbs} pounds of ice (about ${bags} 10-pound bags) and approximately ${Math.round(guests * 4)} total beverages for a 4-hour event.`;
        speak(spokenOutput);
        addHistory('formula', spokenOutput);
        return;
      }
    }

    // 6. Check off / Mark purchased item
    if (cmd.includes('mark') || cmd.includes('check off') || cmd.includes('purchased') || cmd.includes('bought') || cmd.includes('got the')) {
      if (plan) {
        const targetWord = cmd.replace(/mark|check off|purchased|bought|got the|as/g, '').trim();
        let matched = false;
        const updatedItems = plan.items.map(item => {
          if (!matched && (item.name.toLowerCase().includes(targetWord) || targetWord.includes(item.name.toLowerCase()))) {
            matched = true;
            return {
              ...item,
              isPurchased: true,
              actualCost: item.actualCost ?? item.estimatedCost
            };
          }
          return item;
        });

        if (matched) {
          onUpdatePlan({ ...plan, items: updatedItems });
          spokenOutput = `Marked ${targetWord} as purchased! Recalculated your remaining items and spent budget.`;
          actionTaken = `Checked off item matching "${targetWord}"`;
        } else {
          spokenOutput = `Could not find an item matching "${targetWord}". Try saying the exact item name.`;
          actionTaken = `Item "${targetWord}" not found`;
        }
        speak(spokenOutput);
        addHistory('check', actionTaken);
        return;
      }
    }

    // 7. Remove item
    if (cmd.includes('remove') || cmd.includes('delete') || cmd.includes('drop')) {
      if (plan) {
        const targetWord = cmd.replace(/remove|delete|drop|from my list|from the cart/g, '').trim();
        const beforeCount = plan.items.length;
        const filtered = plan.items.filter(i => !i.name.toLowerCase().includes(targetWord) && !targetWord.includes(i.name.toLowerCase()));
        
        if (filtered.length < beforeCount) {
          onUpdatePlan({ ...plan, items: filtered });
          spokenOutput = `Removed ${targetWord} from your shopping list. Budget totals have been automatically recalculated.`;
          actionTaken = `Deleted item matching "${targetWord}"`;
        } else {
          spokenOutput = `No item matching "${targetWord}" was found on your list.`;
          actionTaken = `Could not find "${targetWord}" to delete`;
        }
        speak(spokenOutput);
        addHistory('remove', actionTaken);
        return;
      }
    }

    // 8. Add item command
    if (cmd.includes('add') || cmd.includes('put') || cmd.includes('include')) {
      if (plan) {
        let cleanName = cmd.replace(/add|put|include|to my list|to the list|to cart|to my cart/g, '').trim();
        
        // Extract quantity if present (e.g. "3 bags of ice", "2 packs of burger buns")
        let qty = '1';
        let unit = 'pack';
        let estCost = 10;
        let aisle = 'Aisle 9 (Pantry)';
        let category: ItemCategory = 'food_mains';

        const qtyMatch = cleanName.match(/^(\d+)\s*(bags?|packs?|boxes?|bottles?|lbs?|cases?|cans?)?\s*(of\s*)?(.*)$/i);
        if (qtyMatch) {
          qty = qtyMatch[1];
          unit = qtyMatch[2] || 'pack';
          cleanName = qtyMatch[4] || cleanName;
        }

        // Smart categorization
        const lowerItem = cleanName.toLowerCase();
        if (lowerItem.includes('ice')) {
          category = 'emergency_essentials';
          aisle = 'Aisle 18 (Freezer)';
          estCost = Number(qty) * 3.5;
          unit = '10-lb bags';
        } else if (lowerItem.includes('beer') || lowerItem.includes('wine') || lowerItem.includes('soda') || lowerItem.includes('cider') || lowerItem.includes('juice') || lowerItem.includes('mixer')) {
          category = 'beverages_bar';
          aisle = 'Aisle 11 (Beverages)';
          estCost = Number(qty) * 12;
        } else if (lowerItem.includes('plate') || lowerItem.includes('cup') || lowerItem.includes('napkin') || lowerItem.includes('cutlery')) {
          category = 'tableware_disposables';
          aisle = 'Aisle 17 (Paper Goods)';
          estCost = Number(qty) * 6;
        } else if (lowerItem.includes('chip') || lowerItem.includes('dip') || lowerItem.includes('cracker') || lowerItem.includes('cheese') || lowerItem.includes('nuts')) {
          category = 'appetizers_snacks';
          aisle = 'Aisle 9 (Snacks & Pantry)';
          estCost = Number(qty) * 5.5;
        } else if (lowerItem.includes('cake') || lowerItem.includes('cookie') || lowerItem.includes('pastry') || lowerItem.includes('dessert') || lowerItem.includes('donut')) {
          category = 'desserts_bakery';
          aisle = 'Aisle 3 (Bakery)';
          estCost = Number(qty) * 14;
        } else if (lowerItem.includes('balloon') || lowerItem.includes('banner') || lowerItem.includes('streamer') || lowerItem.includes('decor')) {
          category = 'decorations_theme';
          aisle = 'Aisle 14 (Party Supplies)';
          estCost = Number(qty) * 9;
        } else {
          estCost = Number(qty) * 8;
        }

        const newItem: ShoppingItem = {
          id: `voice-item-${Date.now()}`,
          name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
          category,
          quantity: qty,
          unit,
          estimatedCost: estCost,
          store: 'CymbalMart Supercenter',
          department: 'Grocery',
          aisle,
          isPurchased: false,
          priority: 'must_have',
          notes: 'Added via CymbalMart Hands-Free Voice Control'
        };

        const updatedItems = [newItem, ...plan.items];
        onUpdatePlan({ ...plan, items: updatedItems });

        spokenOutput = `Added ${qty} ${unit} of ${cleanName} to ${aisle} for estimated $${estCost}. Budget totals recalculated.`;
        actionTaken = `Added ${cleanName} ($${estCost})`;
        speak(spokenOutput);
        addHistory('add', actionTaken);
        return;
      }
    }

    // 9. Change Guest Count / Headcount
    if (cmd.includes('guest') || cmd.includes('people') || cmd.includes('headcount')) {
      const numMatch = cmd.match(/\d+/);
      if (numMatch && plan) {
        const newCount = parseInt(numMatch[0], 10);
        if (newCount > 0 && newCount < 500) {
          const ratio = newCount / Math.max(1, plan.headcount.total);
          const updatedItems = plan.items.map(item => {
            const currentQtyNum = parseFloat(item.quantity);
            if (!isNaN(currentQtyNum) && currentQtyNum > 0) {
              const scaledQty = Math.max(1, Math.round(currentQtyNum * ratio));
              const scaledCost = Math.round(item.estimatedCost * ratio);
              return {
                ...item,
                quantity: `${scaledQty}`,
                estimatedCost: scaledCost
              };
            }
            return item;
          });

          onUpdatePlan({
            ...plan,
            headcount: {
              ...plan.headcount,
              adults: newCount,
              teens: 0,
              kids: 0,
              total: newCount
            },
            items: updatedItems
          });

          spokenOutput = `Rescaled party to ${newCount} guests and automatically adjusted all item quantities and budget totals!`;
          actionTaken = `Updated headcount to ${newCount} guests`;
          speak(spokenOutput);
          addHistory('headcount', actionTaken);
          return;
        }
      }
    }

    // 10. Fallback server processing for complex conversational requests
    try {
      const res = await fetch('/api/voice-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: rawCommand,
          currentPlan: plan
        })
      });
      const data = await res.json();
      if (data.spokenReply) {
        speak(data.spokenReply);
        addHistory('ai', data.spokenReply);
      }
    } catch (e) {
      spokenOutput = `I heard: "${rawCommand}". You can ask me to add items, check your budget, or navigate store aisles hands-free.`;
      speak(spokenOutput);
      addHistory('inquiry', spokenOutput);
    }
  };

  return (
    <>
      {/* Floating Hands-Free Voice Control Pill */}
      <div className="fixed bottom-6 left-6 z-40 flex items-center gap-2 animate-fadeIn">
        <div className={`relative flex items-center gap-2 p-1.5 pr-4 rounded-full shadow-2xl backdrop-blur-md transition-all duration-300 border ${
          isListening 
            ? 'bg-rose-950/90 border-rose-500/80 shadow-rose-500/20 text-white' 
            : 'bg-slate-900/95 border-slate-700/80 text-white'
        }`}>
          {/* Main Mic Button */}
          <button
            onClick={toggleListening}
            title={isListening ? "Mute / Stop Voice Assistant" : "Activate Hands-Free Voice Assistant"}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all shadow-md ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-amber-400 text-slate-950 hover:bg-amber-300'
            }`}
          >
            {isListening ? (
              <Mic className="w-5 h-5 animate-bounce" />
            ) : (
              <MicOff className="w-5 h-5 text-slate-950" />
            )}
          </button>

          {/* Status info & soundwave */}
          <div 
            onClick={() => setIsModalOpen(true)}
            className="cursor-pointer select-none"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold tracking-tight">
                {isListening ? "Voice Control Active" : "Hands-Free Voice"}
              </span>
              <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-rose-400 animate-ping' : 'bg-slate-500'}`} />
            </div>
            
            {isListening ? (
              <div className="flex items-center gap-0.5 mt-0.5">
                <span className="text-[10px] text-rose-300 font-medium truncate max-w-[130px]">
                  {transcript || "Listening for command..."}
                </span>
              </div>
            ) : (
              <span className="text-[10px] text-slate-400 block leading-tight">
                Click to speak commands
              </span>
            )}
          </div>

          {/* Voice Output Speaker Mute Toggle */}
          <button
            onClick={() => {
              setIsSpeechMuted(!isSpeechMuted);
              if (!isSpeechMuted && synthRef.current) {
                synthRef.current.cancel();
              }
            }}
            title={isSpeechMuted ? "Unmute spoken replies" : "Mute spoken replies"}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {isSpeechMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>

          {/* Expand Details Modal Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            title="Open Voice Command Hub"
            className="p-1 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Voice Command Control Center Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-950 text-white">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                  isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-amber-400 text-slate-950'
                }`}>
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">
                      CymbalMart Hands-Free Voice Control
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      Supercenter #1042
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Complete your party shopping plan hands-free using natural speech
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Voice Status Stage */}
            <div className="p-6 bg-gradient-to-b from-slate-900 to-slate-950 text-white border-b border-slate-800 text-center space-y-4">
              <div className="flex flex-col items-center justify-center">
                <button
                  onClick={toggleListening}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl ${
                    isListening
                      ? 'bg-gradient-to-tr from-rose-600 to-rose-400 text-white scale-110 shadow-rose-500/40 ring-4 ring-rose-500/30 animate-pulse'
                      : 'bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 hover:scale-105 shadow-amber-400/20'
                  }`}
                >
                  {isListening ? (
                    <Mic className="w-9 h-9" />
                  ) : (
                    <MicOff className="w-9 h-9" />
                  )}
                </button>

                <div className="mt-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    isListening ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-slate-800 text-slate-400'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-rose-400 animate-ping' : 'bg-slate-500'}`} />
                    {isListening ? "Listening continuously • Speak anytime" : "Microphone paused • Click to start"}
                  </span>
                </div>
              </div>

              {/* Live Transcript Display Box */}
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-left min-h-[50px] flex items-center justify-between">
                <div className="flex-1">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-0.5">
                    Recognized Speech:
                  </span>
                  <p className="text-sm font-semibold text-amber-300 italic">
                    {transcript || (isListening ? "Speak a command (e.g., 'Add 3 bags of ice', 'What is my budget?')..." : "Press the microphone button above to start.")}
                  </p>
                </div>

                {isListening && transcript && (
                  <button
                    onClick={() => handleProcessCommand(transcript)}
                    className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shrink-0 transition-colors shadow-xs"
                  >
                    Execute
                  </button>
                )}
              </div>

              {/* Spoken Response Readout */}
              {lastResponse && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-left flex items-start gap-2.5">
                  <Bot className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs text-emerald-200 leading-relaxed">
                    <strong className="text-emerald-400 block text-[10px] uppercase tracking-wider">CymbalMart Voice Feedback:</strong>
                    {lastResponse}
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Voice Cheat Sheet */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Try Speaking Any Of These Hands-Free Commands:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => handleProcessCommand("Add 3 bags of party ice to my list")}
                    className="p-2.5 rounded-xl bg-white hover:bg-amber-50 border border-slate-200 text-left transition-all group shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 group-hover:text-amber-900">
                      <span>"Add 3 bags of ice"</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-0.5">Adds items & auto-recalculates budget</span>
                  </button>

                  <button
                    onClick={() => handleProcessCommand("What is my total budget right now?")}
                    className="p-2.5 rounded-xl bg-white hover:bg-amber-50 border border-slate-200 text-left transition-all group shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 group-hover:text-amber-900">
                      <span>"What is my total budget?"</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-0.5">Speaks current spent, target, & per-guest cost</span>
                  </button>

                  <button
                    onClick={() => handleProcessCommand("Apply all savings and swap to store brands")}
                    className="p-2.5 rounded-xl bg-white hover:bg-amber-50 border border-slate-200 text-left transition-all group shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 group-hover:text-amber-900">
                      <span>"Apply all store brand savings"</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-0.5">Auto-swaps CymbalMart brands & recalculates</span>
                  </button>

                  <button
                    onClick={() => handleProcessCommand("Where is the party ice in the store?")}
                    className="p-2.5 rounded-xl bg-white hover:bg-amber-50 border border-slate-200 text-left transition-all group shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 group-hover:text-amber-900">
                      <span>"Where is the ice located?"</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-0.5">Directs to Aisle 18 in the freezer section</span>
                  </button>

                  <button
                    onClick={() => handleProcessCommand("Change headcount to 24 guests")}
                    className="p-2.5 rounded-xl bg-white hover:bg-amber-50 border border-slate-200 text-left transition-all group shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 group-hover:text-amber-900">
                      <span>"Change headcount to 24 guests"</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-0.5">Scales all portions, quantities, & budget</span>
                  </button>

                  <button
                    onClick={() => handleProcessCommand("Open checkout for curbside pickup")}
                    className="p-2.5 rounded-xl bg-white hover:bg-amber-50 border border-slate-200 text-left transition-all group shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 group-hover:text-amber-900">
                      <span>"Proceed to checkout"</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-0.5">Hands-free order fulfillment confirmation</span>
                  </button>
                </div>
              </div>

              {/* Action History Log */}
              {actionHistory.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Recent Voice Actions:
                  </h4>
                  <div className="space-y-1.5">
                    {actionHistory.map((act, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs">
                        <span className="font-semibold text-slate-800">{act.text}</span>
                        <span className="text-[10px] text-slate-400">{act.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-3.5 bg-white border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSpeechMuted(!isSpeechMuted)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    isSpeechMuted ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {isSpeechMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isSpeechMuted ? "Spoken Replies Muted" : "Spoken Audio Active"}</span>
                </button>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
