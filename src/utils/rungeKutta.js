/**
 * Runge-Kutta de 4° orden (RK4) y modelo de predicción de presupuesto.
 *
 * ─────────────────────────────────────────────────────────────────────
 * MODELO MATEMÁTICO
 * Sea G(t) el gasto acumulado en el día t del mes.
 * Asumimos la EDO:
 *
 *     dG/dt = r(t)        donde r(t) = r0 + m·(t − t_hoy)
 *
 * - r0 es la tasa de gasto reciente (promedio de los últimos N días).
 * - m  es la pendiente (aceleración/desaceleración) estimada por
 *   regresión lineal simple sobre la tasa diaria observada.
 *
 * Se integra desde t_hoy hasta el último día del mes con paso h = 0.25 d.
 * ─────────────────────────────────────────────────────────────────────
 */

/** Un paso RK4 genérico: dy/dt = f(t, y). */
export function rk4Step(f, t, y, h) {
  const k1 = f(t, y);
  const k2 = f(t + h / 2, y + (h * k1) / 2);
  const k3 = f(t + h / 2, y + (h * k2) / 2);
  const k4 = f(t + h, y + h * k3);
  return y + (h * (k1 + 2 * k2 + 2 * k3 + k4)) / 6;
}

/** Integra de t0 a tf con paso h y devuelve los puntos (t, y). */
export function rk4Integrate(f, t0, y0, tf, h = 0.25) {
  const puntos = [{ t: t0, y: y0 }];
  let t = t0;
  let y = y0;
  while (t < tf - 1e-9) {
    const paso = Math.min(h, tf - t);
    y = rk4Step(f, t, y, paso);
    t += paso;
    puntos.push({ t, y });
  }
  return puntos;
}

/** Días que tiene el mes de la fecha dada. */
function diasDelMes(fecha) {
  return new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).getDate();
}

/** Filtra gastos del mes actual y los agrupa por día (1..diasDelMes). */
function gastosPorDiaMesActual(gastos, referencia) {
  const año = referencia.getFullYear();
  const mes = referencia.getMonth();
  const porDia = {};
  for (const g of gastos) {
    const f = new Date(g.fecha);
    if (f.getFullYear() === año && f.getMonth() === mes) {
      const d = f.getDate();
      porDia[d] = (porDia[d] || 0) + Number(g.monto || 0);
    }
  }
  return porDia;
}

/** Regresión lineal simple. Devuelve { slope, intercept }. */
function regresionLineal(xs, ys) {
  const n = xs.length;
  if (n < 2) return { slope: 0, intercept: ys[0] || 0 };
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (ys[i] - meanY);
    den += (xs[i] - meanX) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  return { slope, intercept: meanY - slope * meanX };
}

/**
 * Predicción principal.
 * @param {{ingresoTotal:number, gastos:Array}} datos
 * @param {Date} [hoy] — por defecto Date.now()
 * @returns {{
 *   serie: Array<{dia:number, real:number|null, proyectado:number, presupuesto:number}>,
 *   gastoActual: number,
 *   gastoProyectadoFinMes: number,
 *   diaHoy: number,
 *   diasTotales: number,
 *   tasaPromedio: number,
 *   pendiente: number,
 *   diaAgotamiento: number|null,
 *   excederaPresupuesto: boolean,
 *   excesoEstimado: number,
 * }}
 */
export function predecirPresupuestoRK4(datos, hoy = new Date()) {
  const ingreso = Number(datos.ingresoTotal) || 0;
  const diasTotales = diasDelMes(hoy);
  const diaHoy = Math.min(hoy.getDate(), diasTotales);

  const porDia = gastosPorDiaMesActual(datos.gastos, hoy);

  // Serie acumulada real para los días 1..diaHoy.
  const real = [];
  let acumulado = 0;
  for (let d = 1; d <= diaHoy; d++) {
    acumulado += porDia[d] || 0;
    real.push({ dia: d, acumulado });
  }
  const gastoActual = acumulado;

  // Tasas diarias observadas (gasto del día d).
  const tasasDiarias = [];
  for (let d = 1; d <= diaHoy; d++) tasasDiarias.push(porDia[d] || 0);

  // Tasa promedio de la "ventana reciente" (últimos N = min(7, diaHoy)).
  const ventana = Math.max(1, Math.min(7, diaHoy));
  const recientes = tasasDiarias.slice(-ventana);
  const tasaPromedio = recientes.reduce((a, b) => a + b, 0) / recientes.length || 0;

  // Pendiente (regresión lineal sobre tasas diarias vs día).
  const xs = tasasDiarias.map((_, i) => i + 1);
  const { slope } = regresionLineal(xs, tasasDiarias);
  // Suavizamos: pendiente con peso 0.5 para no sobre-extrapolar.
  const pendiente = slope * 0.5;

  // r(t) modelo: tasaPromedio + pendiente·(t - diaHoy).
  // No permitimos tasas negativas (no se "des-gasta").
  const f = (t /*, G */) => Math.max(0, tasaPromedio + pendiente * (t - diaHoy));

  // Integramos desde diaHoy hasta diasTotales con RK4.
  const proyeccion = rk4Integrate(f, diaHoy, gastoActual, diasTotales, 0.25);

  // Submuestreo: 1 punto por día para el chart.
  const proyPorDia = new Map();
  for (const p of proyeccion) {
    const dia = Math.round(p.t);
    if (!proyPorDia.has(dia) || Math.abs(p.t - dia) < 0.25) {
      proyPorDia.set(dia, p.y);
    }
  }

  // Día estimado en que se agota el presupuesto (cruza ingreso).
  let diaAgotamiento = null;
  if (ingreso > 0) {
    for (const p of proyeccion) {
      if (p.y >= ingreso) {
        diaAgotamiento = Math.round(p.t * 10) / 10;
        break;
      }
    }
  }

  const gastoProyectadoFinMes = proyeccion[proyeccion.length - 1]?.y ?? gastoActual;
  const excesoEstimado = Math.max(0, gastoProyectadoFinMes - ingreso);

  // Serie unificada para Recharts: día 1..diasTotales.
  const serie = [];
  for (let d = 1; d <= diasTotales; d++) {
    const realPunto = real.find((r) => r.dia === d);
    serie.push({
      dia: d,
      real: realPunto ? realPunto.acumulado : null,
      proyectado: proyPorDia.has(d) ? proyPorDia.get(d) : null,
      presupuesto: ingreso,
    });
  }
  // En el día de hoy, ambos coinciden — útil para que las dos líneas se conecten.
  if (serie[diaHoy - 1]) serie[diaHoy - 1].proyectado = gastoActual;

  return {
    serie,
    gastoActual,
    gastoProyectadoFinMes,
    diaHoy,
    diasTotales,
    tasaPromedio,
    pendiente,
    diaAgotamiento,
    excederaPresupuesto: gastoProyectadoFinMes > ingreso,
    excesoEstimado,
  };
}
