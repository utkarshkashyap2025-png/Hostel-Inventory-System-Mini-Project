import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bot,
  Send,
  X,
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  BedDouble,
  AlertTriangle,
  Utensils,
  Clock,
  Wrench,
  Wifi,
  ChevronDown,
  User,
  Coffee,
  HelpCircle
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  intent?: string;
}

const QUICK_ACTIONS = [
  { label: 'Vacant Rooms', icon: BedDouble, prompt: 'How many rooms are available?' },
  { label: 'Low Stock', icon: AlertTriangle, prompt: 'What items are low on stock?' },
  { label: 'Mess Timings', icon: Utensils, prompt: 'What are the mess timings?' },
  { label: 'Curfew & Gate', icon: Clock, prompt: 'What is the hostel gate closing time?' },
  { label: 'Maintenance', icon: Wrench, prompt: 'Any pending maintenance complaints?' },
  { label: 'Wi-Fi Access', icon: Wifi, prompt: 'How do I connect to hostel Wi-Fi?' },
  { label: 'Study Rooms', icon: Coffee, prompt: 'Where can I study quietly?' },
  { label: 'Hostel Rules', icon: HelpCircle, prompt: 'What are the hostel rules?' },
];

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpenedBefore, setHasOpenedBefore] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      sender: 'bot',
      text: "👋 **Hello! I'm your Hostel Assistant.**\n\nI can help you with room vacancies, inventory stock, maintenance tickets, mess schedules, hostel rules, or just chat! How can I assist you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasOpenedBefore(true);
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen, messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isTyping) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.reply || "I couldn't process that query. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: data.intent,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error('Chatbot error:', err);
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        sender: 'bot',
        text: "⚠️ **Connection Notice:** Unable to reach the backend server. Please make sure the backend is running (`npm run dev` in `backend/`).",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        text: "🔄 Chat history cleared. How can I help you today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatMessageText = (raw: string) => {
    const lines = raw.split('\n');
    return lines.map((line, idx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-semibold text-slate-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      return (
        <span key={idx} className="block leading-relaxed">
          {renderedParts}
        </span>
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 25 }}
            transition={{ type: 'spring', damping: 28, stiffness: 360 }}
            className="flex flex-col w-[94vw] sm:w-[430px] h-[610px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden mb-3 text-slate-800"
          >
            {/* Redesigned Modern Header */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white p-4.5 flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3.5">
                <div className="relative">
                  <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/25 shadow-inner">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-indigo-700 rounded-full" />
                </div>
                <div>
                  <h3 className="font-semibold text-[15px] tracking-tight leading-tight text-white flex items-center gap-1.5">
                    Hostel Assistant
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 inline" />
                  </h3>
                  <p className="text-xs text-blue-100 font-normal mt-0.5">
                    Always here to help
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 text-white/90">
                <button
                  onClick={handleClearChat}
                  title="Clear chat"
                  className="p-2 hover:bg-white/15 active:scale-95 rounded-xl transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Minimize"
                  className="p-2 hover:bg-white/15 active:scale-95 rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Action Suggestion Chips */}
            <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
              {QUICK_ACTIONS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.prompt)}
                    disabled={isTyping}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 rounded-full transition-all whitespace-nowrap shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <Icon className="w-3.5 h-3.5 text-indigo-500" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50/70 to-white text-sm">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.22 }}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-end gap-2.5 max-w-[88%] group">
                      {!isUser && (
                        <div className="w-7 h-7 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0 text-indigo-600 mb-1 border border-indigo-200 shadow-xs">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}

                      <div
                        className={`relative rounded-2xl px-4 py-3 shadow-xs ${
                          isUser
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs shadow-indigo-200'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                        }`}
                      >
                        <div className="text-xs sm:text-[13px] leading-relaxed break-words">
                          {formatMessageText(msg.text)}
                        </div>

                        {!isUser && (
                          <div className="mt-2.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                            <span>{msg.timestamp}</span>
                            <button
                              onClick={() => copyToClipboard(msg.text, msg.id)}
                              className="hover:text-indigo-600 transition-colors cursor-pointer flex items-center gap-1 opacity-70 hover:opacity-100"
                            >
                              {copiedId === msg.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {isUser && (
                        <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 text-white mb-1 shadow-xs">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <span className="text-[10px] text-slate-400 mt-1 mr-9">
                        {msg.timestamp}
                      </span>
                    )}
                  </motion.div>
                );
              })}

              {/* Bot Thinking / Typing Animation */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-end gap-2.5"
                >
                  <div className="w-7 h-7 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0 text-indigo-600 mb-1 border border-indigo-200">
                    <Bot className="w-4 h-4 animate-bounce" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-xs px-4 py-3 shadow-xs">
                    <div className="flex items-center space-x-1.5">
                      <motion.span
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                        className="w-2 h-2 bg-indigo-500 rounded-full"
                      />
                      <motion.span
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }}
                        className="w-2 h-2 bg-indigo-500 rounded-full"
                      />
                      <motion.span
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }}
                        className="w-2 h-2 bg-indigo-500 rounded-full"
                      />
                      <span className="text-[11px] font-medium text-slate-400 pl-2">
                        Typing...
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3.5 bg-white border-t border-slate-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    disabled={isTyping}
                    className="w-full pl-4 pr-9 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800 placeholder-slate-400 disabled:opacity-50"
                  />
                  {inputMessage && (
                    <button
                      type="button"
                      onClick={() => setInputMessage('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!inputMessage.trim() || isTyping}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-400 p-2.5 rounded-2xl transition-all shadow-md shadow-indigo-200 disabled:shadow-none cursor-pointer disabled:cursor-not-allowed flex items-center justify-center shrink-0"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <motion.div
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="relative"
      >
        {!isOpen && !hasOpenedBefore && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute right-16 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-xl whitespace-nowrap shadow-lg flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Need help? Ask Hostel Assistant</span>
            <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45" />
          </motion.div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Hostel Assistant"
          className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 flex items-center justify-center cursor-pointer transition-all border-2 border-white/40 focus:outline-none"
        >
          {isOpen ? (
            <ChevronDown className="w-6 h-6 transition-transform" />
          ) : (
            <div className="relative">
              <Bot className="w-7 h-7" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-white"></span>
              </span>
            </div>
          )}
        </button>
      </motion.div>
    </div>
  );
}