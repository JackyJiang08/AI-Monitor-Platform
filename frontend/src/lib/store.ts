import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MapEntity } from './mockData';

interface AuthState {
  isLoggedIn: boolean;
  userEmail: string | null;
  login: (email: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      userEmail: null,
      login: (email) => set({ isLoggedIn: true, userEmail: email }),
      logout: () => {
        set({ isLoggedIn: false, userEmail: null });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('portfolio');
        }
      },
    }),
    { name: 'auth-storage' }
  )
);

interface AppState {
  events: MapEntity[];
  summary: { bullets: (string | { html: string, timeAgo: string })[], updatedAt: string } | null;
  isLoading: boolean;
  error: string | null;
  fetchLiveNews: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  events: [],
  summary: null,
  isLoading: false,
  error: null,
  
  fetchLiveNews: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/news');
      if (!res.ok) {
        throw new Error('Failed to fetch live news');
      }
      const data = await res.json();
      
      const update: Partial<AppState> = { isLoading: false };
      
      // If we got valid events, replace the mock data entirely
      if (data.events && Array.isArray(data.events) && data.events.length > 0) {
        update.events = data.events;
      }
      if (data.summary) {
        update.summary = data.summary;
      }
      
      set(update);
    } catch (err: unknown) {
      console.error("Error fetching live news:", err);
      set({ error: err instanceof Error ? err.message : "Failed to fetch live news", isLoading: false });
    }
  }
}));
