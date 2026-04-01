// src/components/chat/ChatMessage.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';
//Custom utility functions(clsx and tailwind merge) for Dynamically merge CSS class names
import { cn } from '../../lib/utils'; 
import { Message } from '../types/chat';
import { OrderCard } from './OrderCard';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  msg: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ msg }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: msg.type === 'user' ? 10 : -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "flex items-start gap-3 max-w-[85%]",
        msg.type === 'ai' ? "mr-auto" : "ml-auto flex-row-reverse"
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded-full shrink-0 flex items-center justify-center",
        msg.type === 'user' ? "bg-slate-200 dark:bg-slate-800" : "bg-blue-500 text-white"
      )}>
        {msg.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div className={cn("space-y-1", msg.type === 'user' && "text-right")}>
        <div className={cn(
          "p-3 rounded-2xl text-xs leading-relaxed shadow-sm border",
          msg.type === 'user'
            ? "bg-blue-600 text-white border-transparent rounded-tr-none"
            : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-tl-none"
        )}>
          <div className={cn("markdown-content", msg.type === 'user' ? "text-white" : "text-slate-800 dark:text-slate-200")}>
            <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
          {msg.hasOrderCard && <OrderCard />}
        </div>
        <p className="text-[9px] text-slate-400 px-1">{msg.timestamp}</p>
      </div>
    </motion.div>
  );
};