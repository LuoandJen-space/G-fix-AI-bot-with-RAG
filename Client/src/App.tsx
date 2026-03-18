import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare, Send, Bot, User, X, Minus,
  Wrench, Smartphone, ShieldCheck, Banknote, Zap, Paperclip, Smile
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './lib/utils'; // 如果 App.tsx 在 src 根目录，这个写法是对的


// 1. 抽离时间工具函数，解决重复调用问题
const getNow = () => new Date().toLocaleTimeString([], {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
});
interface Message {
  id: string;
  type: 'user' | 'ai';
  text: string;
  timestamp: string;
  hasOrderCard?: boolean;
}

// 模拟背景，建议后续移至独立文件
const BackgroundMockup = () => (
  <div className="absolute inset-0 z-0 p-12 opacity-20 pointer-events-none select-none overflow-hidden">
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="h-8 w-48 bg-slate-400 rounded animate-pulse" />
      <div className="grid grid-cols-3 gap-6">
        <div className="h-32 bg-slate-400 rounded-xl animate-pulse" />
        <div className="h-32 bg-slate-400 rounded-xl animate-pulse" />
        <div className="h-32 bg-slate-400 rounded-xl animate-pulse" />
      </div>
      <div className="h-64 bg-slate-400 rounded-xl w-full animate-pulse" />
    </div>
  </div>
);

// 手机维修专用卡片组件
const OrderCard = () => (
  <div className="bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/50 rounded-xl p-3 flex items-center gap-3 mt-3 shadow-md">
    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
      <Wrench className="w-5 h-5" />
    </div>
    <div className="flex-1 overflow-hidden">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">维修进度：已检测</p>
      <p className="text-xs text-slate-800 dark:text-slate-100 font-bold">iPhone 屏幕更换</p>
      <div className="flex items-center gap-1 mt-0.5">
        <ShieldCheck className="w-3 h-3 text-emerald-500" />
        <span className="text-[9px] text-emerald-500 font-medium">原厂品质保障</span>
      </div>
    </div>
    <button className="text-[10px] font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors">
      详情
    </button>
  </div>
);

export default function App() {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {id: 'welcome',
      type: 'ai',
      text: "Hi! How are you?",
      timestamp: getNow()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);
const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;
    const messageToSend = inputValue;
    const userMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: messageToSend,
      timestamp: getNow()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);
    try {
      // 强制使用 127.0.0.1，这是最稳妥的本地 IP
const response = await fetch('http://127.0.0.1:5000/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: messageToSend }),
});
      if (!response.ok) {
        throw new Error(`服务器响应错误: ${response.status}`);
      }

      // 在这里定义 data，确保它在 try 块的作用域内
      const data = await response.json();
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: data.reply || "抱歉，我暂时无法回答这个问题。",
        timestamp: getNow(),
        hasOrderCard: data.show_repair_card === true
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("连接失败详细原因:", error); // 这行会在浏览器 F12 里打印具体原因
      setMessages(prev => [...prev, {
          id: 'error',
          type: 'ai',
          text: "系统连接失败，请检查维修店后台是否在线。",
          timestamp: "Error"
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 relative overflow-hidden">
      <BackgroundMockup />
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] h-[650px] flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl overflow-hidden"
          >
            {/* Header */}
            <header className="h-16 px-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">FixIt 维修助手</h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">专业在线</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setIsOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                  <Minus className="w-5 h-5" />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </header>
            {/* Message Stream */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: msg.type === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn("flex items-start gap-3 max-w-[85%]", msg.type === 'ai' ? "mr-auto" : "ml-auto flex-row-reverse")}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full shrink-0 flex items-center justify-center",
                    msg.type === 'user' ? "bg-slate-200 dark:bg-slate-800" : "bg-blue-500 text-white"
                  )}>
                    {msg.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={cn("space-y-1", msg.type === 'user' && "text-right")}>
                    <div className={cn("p-3 rounded-2xl text-xs leading-relaxed shadow-sm border",
                      msg.type === 'user'
                        ? "bg-blue-600 text-white border-transparent rounded-tr-none"
                        : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-tl-none"
                    )}>
                      <p>{msg.text}</p>
                      {msg.hasOrderCard && <OrderCard />}
                    </div>
                    <p className="text-[9px] text-slate-400 px-1">{msg.timestamp}</p>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex items-start gap-3 mr-auto">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white"><Bot className="w-4 h-4" /></div>
                  <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none flex gap-1">
                    <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" />
                    <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <footer className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex flex-col gap-3">
                <div className="relative flex items-center">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    className="w-full pr-12 pl-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 resize-none transition-all placeholder:text-slate-400"
                    placeholder="咨询维修价格或二手机行情..."
                    rows={1}
                  />
                  <button onClick={handleSend} className="absolute right-2 w-8 h-8 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex justify-between items-center px-1">
                  <div className="flex items-center gap-3">
                    <button className="text-slate-400 hover:text-blue-500 transition-colors"><Wrench className="w-4 h-4" /></button>
                    <button className="text-slate-400 hover:text-blue-500 transition-colors"><Banknote className="w-4 h-4" /></button>
                    <button className="text-slate-400 hover:text-blue-500 transition-colors"><Paperclip className="w-4 h-4" /></button>
                  </div>
                  <div className="flex items-center gap-1 opacity-50">
                    <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">FixIt AI Engine</span>
                  </div>
                </div>
              </div>
            </footer>
          </motion.div>
        ) : (
          <motion.button
            key="launcher"
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
          >
            <MessageSquare className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}