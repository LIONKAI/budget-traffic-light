/**
 * Lógica única del semáforo presupuestario.
 * Convierte un porcentaje de ejecución en:
 *   - estado lógico (verde/amarillo/rojo)
 *   - clase Tailwind para el fondo
 *   - color RGB sólido (para el glow y los gráficos)
 *   - texto descriptivo
 *
 * Umbrales:
 *   < 61%   → verde (bajo control)
 *   61–85%  → amarillo (cerca del límite)
 *   ≥ 86%   → rojo (excediendo)
 */
export function getEstadoSemaforo(porcentaje) {
  if (porcentaje >= 86) {
    return {
      estado: 'rojo',
      colorClass: 'bg-red-500',
      colorHex: '#ef4444',
      glowRgba: 'rgba(239, 68, 68, 0.55)',
      texto: 'Cuidado, estás excediendo tu presupuesto',
    };
  }
  if (porcentaje >= 61) {
    return {
      estado: 'amarillo',
      colorClass: 'bg-yellow-400',
      colorHex: '#facc15',
      glowRgba: 'rgba(250, 204, 21, 0.55)',
      texto: 'Atención, estás cerca del límite',
    };
  }
  return {
    estado: 'verde',
    colorClass: 'bg-green-500',
    colorHex: '#22c55e',
    glowRgba: 'rgba(34, 197, 94, 0.55)',
    texto: 'Vas bien, tu presupuesto está bajo control',
  };
}

/** Calcula el % de ejecución a partir del estado completo. */
export function calcularPorcentaje(datos) {
  const ingreso = Number(datos.ingresoTotal) || 0;
  const gasto = datos.gastos.reduce((acc, g) => acc + Number(g.monto || 0), 0);
  return {
    ingreso,
    gasto,
    saldo: ingreso - gasto,
    porcentaje: ingreso > 0 ? (gasto / ingreso) * 100 : 0,
  };
}
