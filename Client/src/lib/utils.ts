import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 顺便把 getNow 也放进去，方便 App.tsx 调用
export const getNow = () => new Date().toLocaleTimeString([], { 
  hour: '2-digit', minute: '2-digit', hour12: false 
});