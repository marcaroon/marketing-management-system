import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark";

interface UIState {
  theme: Theme;
  globalSearchOpen: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setGlobalSearchOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: "light",
      globalSearchOpen: false,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "light" ? "dark" : "light",
        })),
      setGlobalSearchOpen: (globalSearchOpen) => set({ globalSearchOpen }),
    }),
    {
      name: "ui-store",
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
