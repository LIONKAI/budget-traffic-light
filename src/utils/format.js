/**
 * Formateadores reutilizables para la app.
 * Mantenemos toda la lógica de presentación aquí para evitar duplicación.
 */

const formatterBs = new Intl.NumberFormat('es-BO', {
  style: 'currency',
  currency: 'BOB',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Devuelve "1.200,00 Bs." (Bolivia). Tolera strings o números. */
export function formatBs(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return '— Bs.';
  // Intl pone "Bs" al inicio en algunos navegadores; lo normalizamos al final.
  return formatterBs
    .format(n)
    .replace(/^BOB\s?/, '')
    .replace(/Bs\.?\s?/, '')
    .trim() + ' Bs.';
}

/** Formato corto sin símbolo, útil para inputs. */
export function formatNumber(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return '0,00';
  return new Intl.NumberFormat('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

/** Formatea una fecha ISO (YYYY-MM-DD) a "12 jun 2026". */
export function formatFecha(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}
