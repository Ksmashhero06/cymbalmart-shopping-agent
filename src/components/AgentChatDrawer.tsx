import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Loader2, 
  ArrowRight, 
  Plus, 
  DollarSign, 
  Wine, 
  Utensils,
  Store,
  MapPin,
  HelpCircle,
  Truck,
  Tag,
  CheckCircle2,
  Package
} from 'lucide-react';
import { PartyPlan, ChatMessage, ShoppingItem } from '../types';

interface AgentChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: PartyPlan;
  onUpdatePlan: (updated: PartyPlan) => void;
  onAddCustomItem: (item: ShoppingItem) => void;
}

export const AgentChatDrawer: React.FC<AgentChatDrawerProps> = ({
  isOpen,
  onClose,
  currentPlan,
  onUpdatePlan,
  onAddCustomItem
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'agent',
      text: `Hello! I'm your CymbalMart Assistant for Supercenter #1042. I'm here to help you shop smart, find aisle locations, save on party groceries, or answer any questions about your order for "${currentPlan.title}". How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        {
          label: 'Aisle 18: Ice & Cooler Needs',
          actionType: 'custom_prompt',
          payload: 'Where can I find ice bags and drink cooling tubs in CymbalMart?'
        },
        {
          label: 'Save $40 With Store Brands',
          actionType: 'custom_prompt',
          payload: 'Show me how to save with CymbalMart private label alternatives.'
        },
        {
          label: 'Signature Batch Drink Recipe',
          actionType: 'custom_prompt',
          payload: 'Suggest a signature party batch cocktail recipe and calculate grocery items.'
        },
        {
          label: 'Curbside Pickup Details',
          actionType: 'custom_prompt',
          payload: 'How does Curbside Express Pickup work at Supercenter #1042?'
        }
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query.trim(),
          currentPlan,
          history: messages.slice(-6)
        })
      });

      const data = await response.json();
      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: data.reply || 'I am ready to help optimize your CymbalMart shopping experience!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: data.suggestedActions || []
      };

      setMessages(prev => [...prev, agentMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          sender: 'agent',
          text: "I'm your CymbalMart Assistant. Our Supercenter #1042 is open for Curbside Pickup and Same-Day Delivery! You can find ice in Aisle 18, bakery items in Aisle 3, and party supplies in Aisle 14.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: any) => {
    if (action.actionType === 'custom_prompt') {
      handleSendMessage(action.payload || action.label);
    } else if (action.actionType === 'add_item' && action.payload) {
      onAddCustomItem(action.payload);
      setMessages(prev => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          sender: 'agent',
          text: `Added "${action.payload.name}" to your shopping plan!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 md:w-[440px] bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-slideInRight">
      
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-900 text-white shadow-xs">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-slate-900 font-black shadow-md">
              <Bot className="w-5 h-5 text-slate-950" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight text-white">
                CymbalMart Assistant
              </h3>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Supercenter #1042
              </span>
            </div>
            <p className="text-[11px] text-slate-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400 inline" />
              Live customer & party concierge
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close CymbalMart Assistant"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Customer Category Chips */}
      <div className="px-4 py-2 bg-slate-100/90 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px] font-medium text-slate-700">
        <button
          onClick={() => handleSendMessage("What aisles are my party items located in at Supercenter #1042?")}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white hover:bg-slate-50 border border-slate-200 shrink-0 transition-colors"
        >
          <Store className="w-3 h-3 text-purple-600" />
          <span>Aisles Map</span>
        </button>

        <button
          onClick={() => handleSendMessage("How can I save money with CymbalMart private label swaps?")}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white hover:bg-slate-50 border border-slate-200 shrink-0 transition-colors"
        >
          <Tag className="w-3 h-3 text-emerald-600" />
          <span>Budget Swaps</span>
        </button>

        <button
          onClick={() => handleSendMessage("How much ice and drinks do I need for this party?")}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white hover:bg-slate-50 border border-slate-200 shrink-0 transition-colors"
        >
          <Wine className="w-3 h-3 text-blue-600" />
          <span>Drinks & Ice</span>
        </button>

        <button
          onClick={() => handleSendMessage("How do I arrange Curbside Pickup or Same-Day Delivery?")}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white hover:bg-slate-50 border border-slate-200 shrink-0 transition-colors"
        >
          <Truck className="w-3 h-3 text-amber-600" />
          <span>Fulfillment</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-slate-50/60">
        {messages.map((msg) => {
          const isAgent = msg.sender === 'agent';
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isAgent ? 'justify-start' : 'justify-end'}`}
            >
              {isAgent && (
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 mt-0.5 shadow-xs font-bold text-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] space-y-2`}>
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                    isAgent
                      ? 'bg-white border border-slate-200/90 text-slate-800'
                      : 'bg-slate-900 text-white'
                  }`}
                >
                  {isAgent && (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-700 mb-1">
                      <span>CymbalMart Assistant</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span
                    className={`block text-[9px] mt-1.5 ${
                      isAgent ? 'text-slate-400' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {/* Suggested Action Chips */}
                {isAgent && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.suggestedActions.map((act, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => handleActionClick(act)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-semibold transition-all shadow-2xs text-left"
                      >
                        <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>{act.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {!isAgent && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-600 max-w-[80%] shadow-xs">
            <Loader2 className="w-4 h-4 animate-spin text-amber-500 shrink-0" />
            <span>CymbalMart Assistant is checking inventory and recommendations...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask CymbalMart Assistant (e.g., aisle locations, deals)..."
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white transition-all shrink-0 shadow-xs"
            title="Send to CymbalMart Assistant"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-center text-slate-400 mt-1.5">
          CymbalMart Assistant • Supercenter #1042 Inventory & Customer Concierge
        </p>
      </div>
    </div>
  );
};
