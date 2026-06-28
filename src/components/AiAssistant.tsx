/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useErp } from '../store/erpStore';
import { 
  Sparkles, 
  X, 
  Send, 
  ArrowDownCircle, 
  HelpCircle, 
  Loader2, 
  User, 
  Bot 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export default function AiAssistant() {
  const { queryAIAssistant } = useErp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hello! I am your real-time **BusinessFlow V2 AI Assistant**. I have parsed your active multi-tenant database records.\n\nAsk me anything about daily revenues, attendance anomalies, pending tasks, or outstanding student tuition balances!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Analyst is booting context...');

  const scrollRef = useRef<HTMLDivElement>(null);

  // Status message rotation for great UX loading
  useEffect(() => {
    if (!isLoading) return;
    const statuses = [
      'Querying multi-tenant database...',
      'Isolating active tenant ledger...',
      'Calculating transaction aggregates...',
      'Synthesizing analyst insights...',
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % statuses.length;
      setStatusMessage(statuses[i]);
    }, 2000);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isLoading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}-u`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setStatusMessage('Accessing local tenant schemas...');

    try {
      const responseText = await queryAIAssistant(textToSend);
      const aiMsg: Message = {
        id: `msg-${Date.now()}-a`,
        sender: 'ai',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: `msg-${Date.now()}-err`,
        sender: 'ai',
        text: "I experienced an analytical timeout reaching the server API. Please re-issue your command in a few moments.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChipClick = (prompt: string) => {
    handleSend(prompt);
  };

  const formatText = (text: string) => {
    // Process markdown headers, bolding, list blocks
    return text.split('\n').map((line, idx) => {
      let content: React.ReactNode = line;
      
      // Headers
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="text-xs font-extrabold text-zinc-950 dark:text-zinc-100 uppercase tracking-wider mt-3 mb-1.5">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={idx} className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mt-4 mb-2">{line.replace('## ', '')}</h3>;
      }

      // Bullets
      if (line.startsWith('* ') || line.startsWith('- ')) {
        const bulletText = line.substring(2);
        content = (
          <span className="flex items-start gap-1.5 my-1 pl-1">
            <span className="text-emerald-500 mt-1">•</span>
            <span>{parseBold(bulletText)}</span>
          </span>
        );
      } else {
        content = parseBold(line);
      }

      return <p key={idx} className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed min-h-[1em]">{content}</p>;
    });
  };

  const parseBold = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-bold text-zinc-950 dark:text-zinc-100">{part}</strong> : part);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          id="ai-assistant-trigger"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all cursor-pointer ${
            isOpen 
              ? 'bg-rose-500 hover:bg-rose-600 text-white rotate-90' 
              : 'bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 hover:bg-zinc-850 dark:hover:bg-zinc-100'
          }`}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Sparkles className="w-5 h-5 animate-pulse" />}
        </button>
      </div>

      {/* Slide-out Chat Console */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="ai-assistant-panel"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-24 right-6 w-full max-w-md h-[550px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden z-40 flex flex-col"
          >
            {/* Header */}
            <div className="bg-zinc-950 dark:bg-zinc-900 text-white p-4 flex items-center justify-between border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-100">
                    BusinessFlow AI
                  </h3>
                  <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Analyst V2 Live
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conversational Viewport */}
            <div 
              ref={scrollRef}
              className="flex-grow overflow-y-auto p-4 space-y-4 bg-zinc-50/50 dark:bg-zinc-950/20 scrollbar-thin"
            >
              {messages.map((m) => (
                <div 
                  key={m.id}
                  className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'ai' && (
                    <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-850 dark:text-zinc-100 border border-zinc-200/50 dark:border-zinc-700/50 shrink-0">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl p-3 text-xs shadow-xs space-y-1 ${
                    m.sender === 'user'
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 rounded-tr-none'
                      : 'bg-white dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 border border-zinc-200/50 dark:border-zinc-800 rounded-tl-none'
                  }`}>
                    <div className="whitespace-pre-line select-text">
                      {m.sender === 'user' ? m.text : formatText(m.text)}
                    </div>
                    <span className="block text-[9px] text-zinc-400 dark:text-zinc-500 text-right mt-1.5">
                      {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {m.sender === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-950 shrink-0">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {/* Loader */}
              {isLoading && (
                <div className="flex gap-3 justify-start items-start">
                  <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-850 dark:text-zinc-100 border border-zinc-200/50 dark:border-zinc-700/50 shrink-0">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  </div>
                  <div className="bg-white dark:bg-zinc-850 text-zinc-500 rounded-2xl rounded-tl-none p-3 text-xs border border-zinc-200/50 dark:border-zinc-800 shadow-xs flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                    <span className="font-mono text-[10px] tracking-wide animate-pulse">{statusMessage}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action Prompts */}
            <div className="px-4 py-2 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-850 flex gap-1.5 overflow-x-auto scrollbar-none shrink-0 py-2">
              <button
                onClick={() => handleChipClick('How much did we earn today?')}
                className="text-[10px] font-medium px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg whitespace-nowrap transition-colors cursor-pointer shrink-0"
              >
                📊 Today's Revenue
              </button>
              <button
                onClick={() => handleChipClick('Show unpaid student fees.')}
                className="text-[10px] font-medium px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg whitespace-nowrap transition-colors cursor-pointer shrink-0"
              >
                💸 Unpaid Fees
              </button>
              <button
                onClick={() => handleChipClick('Who was absent today?')}
                className="text-[10px] font-medium px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg whitespace-nowrap transition-colors cursor-pointer shrink-0"
              >
                📝 Absentees
              </button>
              <button
                onClick={() => handleChipClick('Top employee analysis')}
                className="text-[10px] font-medium px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg whitespace-nowrap transition-colors cursor-pointer shrink-0"
              >
                🏆 Staff Report
              </button>
            </div>

            {/* Message Input Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                placeholder="Ask me about revenues, attendance, tasks..."
                className="flex-grow text-xs px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-850 dark:text-zinc-100 focus:outline-hidden disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-9 h-9 bg-zinc-950 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40 text-white dark:text-zinc-950 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
