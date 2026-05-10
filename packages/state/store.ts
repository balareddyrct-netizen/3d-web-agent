import { create } from 'zustand';

interface AgentState {
  isThinking: boolean;
  messages: any[];
  setThinking: (isThinking: boolean) => void;
  addMessage: (msg: any) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  isThinking: false,
  messages: [],
  setThinking: (isThinking) => set({ isThinking }),
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
}));
