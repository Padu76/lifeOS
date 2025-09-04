import { create } from 'zustand';
type State = { score: number; setScore:(n:number)=>void };
export const useStore = create<State>((set)=>({ score: 0, setScore:(n)=>set({score:n}) }));
