export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export type Model = 'grok-4-fast' | 'secondmind-agent-v1' | 'deepseek' | 'gemini-2.5-pro' | 'gpt-5';

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  model: Model;
  createdAt: Date;
  updatedAt: Date;
}

