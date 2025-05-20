import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface TokenStore {
  token: string | null;
  setToken: (token: string | null) => void;
}

export const useTokenStore = create<TokenStore>()(
  persist(
    (set) => ({
      token: "",
      setToken: (token) => set(() => ({ token })),
    }),
    {
      name: "token-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
