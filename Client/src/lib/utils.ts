import { clsx, type ClassValue } from 'clsx'; //Resolving the "CSS class name conflict" problem
import { twMerge } from 'tailwind-merge'; //Handling style overriding

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// getNow() function for get time and avoid code duplication
export const getNow = () => new Date().toLocaleTimeString([], { 
  hour: '2-digit', minute: '2-digit', hour12: false 
});