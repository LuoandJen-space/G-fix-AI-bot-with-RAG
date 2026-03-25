//core React imports
import React, { useState, useRef, useEffect } from 'react';
//icons from lucide-react
import {
  MessageSquare, Send, Bot, X, Minus,
  Wrench, Smartphone,  Banknote, Zap, Paperclip, Smile
} from 'lucide-react';
//Animation Library
import { motion, AnimatePresence } from 'framer-motion';
//Custom utility functions(clsx and tailwind merge) for Dynamically merge CSS class names
//import { cn } from './lib/utils'; 
import { BackgroundMockup } from './components/layout/BackgroundMockup';
import { ChatMessage } from './components/chat/ChatMessage';
import { useChat } from './hooks/useChat'; //Custom hook to manage chat state and logic, including messages, input handling, and API communication

export default function App() {
  //UI
  const [isOpen, setIsOpen] = useState(true);//Boolean value to control the window open or close
  const [inputValue, setInputValue] = useState(''); //Bind the text in the input box
  const scrollRef = useRef<HTMLDivElement>(null);

  //Chat State and Logic
  const { messages, isTyping, sendMessage } = useChat();
  // Automatically scroll to the bottom, whenever messages or isTyping changes, ensuring the latest message is always visible to the user.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]); //Monitoring Target

  // Function to handle sending messages.
const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return; //if the input is empty or AI is still typing, do nothing
    //Hook provieded. Required API -> AI response
    sendMessage (inputValue);
    setInputValue(''); //clear the input box
  }

  // The main return statement of the App component, which renders the chat interface. It conditionally renders either the chat window or the launcher button based on the isOpen state.
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 relative overflow-hidden">
      <BackgroundMockup />
      <AnimatePresence>
        {isOpen ? ( // If isOpen is true, render the chat window, otherwise render the launcher button
          <motion.div // main chat window 
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
                  <h2 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">G-Fix Solution</h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Your Professional Personal AI Assistant</p>
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
                <ChatMessage key={msg.id} msg={msg} />
              ))}

              {/*AI input status indicator*/}
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
                    placeholder="Please enter your message here..."
                    rows={1}
                  />
                  <button onClick={handleSend} className="absolute right-2 w-8 h-8 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                {/* Footer with additional buttons and icons */}
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
          /*laucher buttern when the chat window is closed*/
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