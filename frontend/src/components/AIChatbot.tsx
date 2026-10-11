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
      // Split on bold markdown **...**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <span key={pIdx} className="font-semibold text-white drop-shadow-xs">
              {part.slice(2, -2)}
            </span>
          );
        }
        return part;
      });

      return (
        <span key={idx} className="block leading-relaxed min-h-[1.25rem]">
          {renderedParts}
        </span>
      );
    });
  };

  return (
    <div id="chatbot-root" className="fixed bottom-6 right-6 z-50 select-none flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 25 }}
            transition={{ type: 'spring', damping: 28, stiffness: 360 }}
            className="flex flex-col w-[94vw] sm:w-[430px] h-[610px] max-h-[85vh] bg-slate-950/40 rounded-3xl shadow-2xl border border-white/20 backdrop-blur-2xl overflow-hidden mb-3 text-slate-800"
            style={{
              transformOrigin: 'bottom right',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4), 0 0 40px rgba(99, 102, 241, 0.2)'
            }}
          >
            {/* Ultra-Modern Glassmorphic Title Bar */}
            <div className="relative overflow-hidden bg-slate-900/90 backdrop-blur-xl border-b border-white/10 p-4 text-white">
              {/* Subtle ambient glow in the header background */}
              <div className="absolute -top-12 -left-12 w-36 h-36 bg-indigo-500/30 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -top-12 -right-12 w-36 h-36 bg-purple-500/25 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-indigo-500/30">
                      <div className="w-full h-full bg-slate-950/80 rounded-[14px] flex items-center justify-center backdrop-blur-xs">
                        <Bot className="w-5 h-5 text-indigo-300" />
                      </div>
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-semibold text-sm tracking-tight text-white">
                        Hostel Assistant
                      </h3>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <p className="text-[11px] text-slate-400 font-medium">
                        Online • 24/7 Support
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={handleClearChat}
                    title="Clear chat"
                    className="p-2 text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 rounded-xl transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    title="Minimize"
                    className="p-2 text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 rounded-xl transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Action Suggestion Chips */}
            <div className="px-3.5 py-2.5 bg-slate-900/60 backdrop-blur-md border-b border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
              {QUICK_ACTIONS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.prompt)}
                    disabled={isTyping}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-white/5 hover:bg-indigo-600 hover:text-white border border-white/10 hover:border-indigo-400 rounded-full transition-all whitespace-nowrap shadow-xs cursor-pointer active:scale-95 disabled:opacity-50 backdrop-blur-xs"
                  >
                    <Icon className="w-3.5 h-3.5 text-indigo-400 group-hover:text-white" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Messages Stream with Sleek Modern Chat Wallpaper Background */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-4 text-sm relative"
              style={{
                backgroundColor: '#0b0f19',
                backgroundImage: `
                  radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 40%),
                  radial-gradient(circle at 90% 80%, rgba(168, 85, 247, 0.08) 0%, transparent 40%),
                  radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px)
                `,
                backgroundSize: '100% 100%, 100% 100%, 20px 20px',
              }}
            >
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
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shrink-0 text-white mb-1 shadow-md shadow-indigo-500/20">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}

                      <div
                        className={`relative rounded-2xl px-4 py-3 shadow-md ${
                          isUser
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs shadow-indigo-900/30'
                            : 'bg-slate-900/90 border border-white/10 text-slate-100 rounded-bl-xs shadow-black/40 backdrop-blur-md'
                        }`}
                      >
                        <div className="text-xs sm:text-[13px] leading-relaxed break-words">
                          {formatMessageText(msg.text)}
                        </div>

                        {!isUser && (
                          <div className="mt-2.5 pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                            <span>{msg.timestamp}</span>
                            <button
                              onClick={() => copyToClipboard(msg.text, msg.id)}
                              className="hover:text-indigo-400 transition-colors cursor-pointer flex items-center gap-1 opacity-70 hover:opacity-100"
                            >
                              {copiedId === msg.id ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {isUser && (
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shrink-0 text-white mb-1 shadow-md shadow-blue-500/20">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <span className="text-[10px] text-slate-500 mt-1 mr-9 font-medium">
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
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shrink-0 text-white mb-1">
                    <Bot className="w-4 h-4 animate-bounce" />
                  </div>
                  <div className="bg-slate-900/90 border border-white/10 rounded-2xl rounded-bl-xs px-4 py-3 shadow-md backdrop-blur-md">
                    <div className="flex items-center space-x-1.5">
                      <motion.span
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                        className="w-2 h-2 bg-indigo-400 rounded-full"
                      />
                      <motion.span
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }}
                        className="w-2 h-2 bg-indigo-400 rounded-full"
                      />
                      <motion.span
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }}
                        className="w-2 h-2 bg-indigo-400 rounded-full"
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
            <div className="p-3.5 bg-slate-900/90 border-t border-white/10 backdrop-blur-xl">
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
                    className="w-full pl-4 pr-9 py-2.5 text-xs sm:text-sm bg-slate-800/80 border border-white/10 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 transition-all text-white placeholder-slate-400 disabled:opacity-50"
                  />
                  {inputMessage && (
                    <button
                      type="button"
                      onClick={() => setInputMessage('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
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
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 text-white disabled:text-slate-500 p-2.5 rounded-2xl transition-all shadow-md shadow-indigo-600/30 disabled:shadow-none cursor-pointer disabled:cursor-not-allowed flex items-center justify-center shrink-0 border border-white/10"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button with Ambient Glow */}
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
            className="absolute right-16 top-1/2 -translate-y-1/2 bg-slate-900/95 border border-white/10 text-white text-xs px-3.5 py-2 rounded-2xl whitespace-nowrap shadow-2xl flex items-center gap-2 backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="font-medium">Need help? Ask Assistant</span>
            <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45 border-r border-t border-white/10" />
          </motion.div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Hostel Assistant"
          className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/40 hover:shadow-indigo-500/60 flex items-center justify-center cursor-pointer transition-all border-2 border-white/40 focus:outline-none"
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