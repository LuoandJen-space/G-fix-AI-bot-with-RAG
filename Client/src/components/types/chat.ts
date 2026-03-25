//TypeScript interface for message structure, defining the shape of message objects used in the app
export type MessageRole = 'user' | 'ai';
export interface Message {
    id: string;
    type: MessageRole;
    text: string;
    timestamp: string;
    hasOrderCard?: boolean;
}
export interface ChatResponse {
  reply: string;
  show_repair_card: boolean;
}