/**
 * Overlay fijo que ilumina los bordes de la pantalla con el color del semáforo.
 *
 * Implementación:
 *  - <div> fixed inset-0, pointer-events-none (no bloquea clicks).
 *  - Doble box-shadow inset:
 *      • externa (1ª): difuminado amplio, muy suave.
 *      • interna (2ª): halo más concentrado en el borde.
 *  - Transición lenta de 1.2s para que cambiar de color luzca orgánico.
 *  - Pulso opcional (intensidad) cuando hay alerta roja, vía animación CSS.
 */
export default function GlowOverlay({ glowRgba, estado }) {
  // Cuanto más cerca del rojo, más intenso el glow.
  const intensidadExt = estado === 'rojo' ? 220 : estado === 'amarillo' ? 180 : 140;
  const intensidadInt = estado === 'rojo' ? 90  : estado === 'amarillo' ? 70  : 50;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-0 transition-[box-shadow] duration-1000 ease-out ${
        estado === 'rojo' ? 'animate-glow-pulse' : ''
      }`}
      style={{
        boxShadow: `
          inset 0 0 ${intensidadExt}px ${intensidadExt / 2}px ${glowRgba},
          inset 0 0 ${intensidadInt}px ${intensidadInt / 3}px ${glowRgba}
        `,
      }}
    />
  );
}
