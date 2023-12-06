export interface ChatMessage {
  to: string;
  from: string;
  messageType: string;
  message: string;
  time: number;
}
