import { useState } from 'react';
import { Message, ChatResponse } from '../components/types/chat'; 
import { getNow } from '../lib/utils';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'ai',
      text: "Hi! Can I help you?",
      timestamp: getNow()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    // 1. add user message to the chat window immediately
    const userMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: text,
      timestamp: getNow()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // fetch response from the backend API
      const response = await fetch('http://127.0.0.1:5000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) throw new Error(`Server Error: ${response.status}`);
      const data: ChatResponse = await response.json();
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: data.reply || "Sorry, I'm not sure how to help.",
        timestamp: getNow(),
        hasOrderCard: data.show_repair_card === true
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: 'error',
        type: 'ai',
        text: "System connection failed.",
        timestamp: "Error"
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Variables and functions exposed to external use
  return {
    messages,
    isTyping,
    sendMessage
  };
};