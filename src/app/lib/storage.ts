import { useEffect, useState } from "react";

/**
 * useState persistido no localStorage.
 * Se o storage estiver indisponível (modo privado, bloqueado), funciona só em memória.
 * `migrate` normaliza dados salvos por versões anteriores do app.
 */
export function usePersistentState<T>(key: string, initial: T | (() => T), migrate?: (stored: unknown) => T) {
  const [value, setValue] = useState<T>(() => {
    const fallback = typeof initial === "function" ? (initial as () => T)() : initial;
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      const parsed: unknown = JSON.parse(raw);
      return migrate ? migrate(parsed) : (parsed as T);
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage indisponível: mantém só em memória */
    }
  }, [key, value]);

  return [value, setValue] as const;
}
