import { useState, useEffect } from 'react';

/**
 * Hook para persistir estado en localStorage.
 * - Lee el valor inicial desde localStorage si existe; si no, usa initialValue.
 * - Sincroniza automáticamente cada cambio.
 * - Tolerante a JSON corrupto (devuelve initialValue y limpia la clave).
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored === null) return initialValue;
      return JSON.parse(stored);
    } catch (err) {
      console.warn(`useLocalStorage: clave "${key}" corrupta, se reinicia.`, err);
      window.localStorage.removeItem(key);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`useLocalStorage: no se pudo guardar "${key}".`, err);
    }
  }, [key, value]);

  return [value, setValue];
}
