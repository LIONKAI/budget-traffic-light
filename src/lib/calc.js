// Cálculos e indicadores del semáforo presupuestario.

export const PROGRAMAS = {
  '000': 'Funcionamiento Ejecutivo',
  '001': 'Funcionamiento Deliberativo',
  '097': 'Partidas no asignables: activos financieros',
  '099': 'Partidas no asignables: deudas',
  '100': 'Promoción y fomento a la producción agropecuaria',
  '110': 'Saneamiento básico',
  '130': 'Desarrollo y preservación del medio ambiente',
  '140': 'Aseo urbano y residuos sólidos',
  '160': 'Servicio de alumbrado público',
  '170': 'Infraestructura urbana y rural',
  '180': 'Gestión de caminos vecinales',
  '190': 'Catastro urbano y rural',
  '200': 'Gestión de salud',
  '210': 'Gestión de educación',
  '220': 'Desarrollo y promoción del deporte',
  '230': 'Cultura y patrimonio',
  '240': 'Desarrollo y fomento del turismo',
  '250': 'Grupos vulnerables y de la mujer',
  '251': 'Prevención de la violencia hacia la mujer',
  '260': 'Defensa y protección de la niñez y adolescencia',
  '270': 'Vialidad y transporte público',
  '280': 'Defensa del consumidor',
  '310': 'Gestión de riesgos',
  '319': 'Atención de desastres o emergencias',
  '330': 'Servicios de seguridad ciudadana',
  '340': 'Fortalecimiento institucional',
  '350': 'Desarrollo económico local y empleo',
};
export const nombrePrograma = (cod, fallback) => PROGRAMAS[cod] || fallback || `Programa ${cod}`;

export const GRUPOS = {
  '1': 'Servicios personales',
  '2': 'Servicios no personales',
  '3': 'Materiales y suministros',
  '4': 'Activos reales',
  '5': 'Activos financieros',
  '6': 'Servicio de la deuda y otros pasivos',
  '7': 'Transferencias',
  '8': 'Impuestos, regalías y tasas',
  '9': 'Otros gastos',
};

// Parámetros por defecto. Contaduría los valida; se pueden ajustar en "Metodología".
export const PARAMETROS_BASE = {
  s2: { verdeMin: 90, verdeMax: 110, amarilloMin: 75, amarilloMax: 120 },
  s1: { amarillo: 90, rojo: 100 },
  ejecutadoDesde: 99.5, // % de ejecución desde el cual una apertura se considera ejecutada
  // Base del límite del 25 % (Ley 031, Disp. Trans. 9.ª): ingresos propios + coparticipación tributaria.
  // Por defecto, montos programados en el POA 2026 (Cuadro 10). Reemplazar por lo recaudado cuando se tenga.
  baseIngresosPropios: 11770929,
  baseCoparticipacion: 13337821,
  fuenteBase: 'Programado POA 2026 (Cuadro 10)',
};

export const PROGRAMAS_FUNCIONAMIENTO = ['000', '001'];
export const FUNCIONAMIENTO_POA = 5141556; // Ejecutivo 3.783.061 + Deliberativo 1.358.495 (POA 2026, sección 2.4.3)

/** Fracción del año transcurrida a la fecha de corte (31/10 = 10/12). */
export function fraccionAnio(corte) {
  if (!corte) return 10 / 12;
  const [a, m, d] = corte.split('-').map(Number);
  const diasMes = new Date(a, m, 0).getDate();
  return Math.min(1, (m - 1 + d / diasMes) / 12);
}

export const sumar = (lineas, k) => lineas.reduce((a, l) => a + (l[k] || 0), 0);

export function agrupar(lineas, claveFn) {
  const m = new Map();
  for (const l of lineas) {
    const k = claveFn(l);
    if (!m.has(k)) m.set(k, { clave: k, vigente: 0, devengado: 0, pagado: 0, inicial: 0, modificaciones: 0, lineas: [] });
    const g = m.get(k);
    g.vigente += l.vigente;
    g.devengado += l.devengado;
    g.pagado += l.pagado;
    g.inicial += l.inicial;
    g.modificaciones += l.modificaciones;
    g.lineas.push(l);
  }
  return [...m.values()];
}

/** Estado S2 de un conjunto: compara % ejecutado con % esperado a la fecha. */
// tipo: 'Proyecto' | 'Actividad' | undefined (conjuntos: programa, fuente, total)
export function estadoS2(vigente, devengado, fraccion, p, tipo) {
  if (vigente <= 0) return { estado: 'sinPresupuesto', pct: 0, ritmo: 0, sentido: '' };
  const pct = (devengado / vigente) * 100;
  const ritmo = pct / fraccion; // 100 = va exactamente al ritmo esperado
  if (pct >= p.ejecutadoDesde) {
    // Una actividad recurrente (sueldos, combustible...) que ya gastó todo antes de fin de año
    // se quedó sin presupuesto: es una alerta. Un proyecto al 100 % simplemente terminó.
    if (tipo === 'Actividad' && fraccion < 1) return { estado: 'agotado', pct, ritmo, sentido: '' };
    return { estado: 'ejecutado', pct, ritmo, sentido: '' };
  }
  const { verdeMin, verdeMax, amarilloMin, amarilloMax } = p.s2;
  let estado = 'rojo';
  if (ritmo >= verdeMin && ritmo <= verdeMax) estado = 'verde';
  else if ((ritmo >= amarilloMin && ritmo < verdeMin) || (ritmo > verdeMax && ritmo <= amarilloMax)) estado = 'amarillo';
  const sentido = ritmo < verdeMin ? 'atrasado' : ritmo > verdeMax ? 'adelantado' : '';
  return { estado, pct, ritmo, sentido };
}

/** Estado global de S2 (sin la regla de "ejecutado"). */
export function estadoS2Global(vigente, devengado, fraccion, p) {
  return estadoS2(vigente, devengado, fraccion, { ...p, ejecutadoDesde: 1000 });
}

export function estadoS1(funcionamientoVigente, p) {
  const base = p.baseIngresosPropios + p.baseCoparticipacion;
  const limite = base * 0.25;
  const uso = limite > 0 ? (funcionamientoVigente / limite) * 100 : 0;
  const estado = uso > p.s1.rojo ? 'rojo' : uso >= p.s1.amarillo ? 'amarillo' : 'verde';
  return { base, limite, uso, estado };
}

export const ETIQUETA = {
  verde: 'Verde',
  amarillo: 'Amarillo',
  rojo: 'Rojo',
  ejecutado: 'Ejecutado',
  agotado: 'Agotado',
  sinPresupuesto: 'Sin presupuesto',
  sinDato: 'Sin dato',
};

export function resumen(lineas, corte, p) {
  const f = fraccionAnio(corte);
  const vigente = sumar(lineas, 'vigente');
  const devengado = sumar(lineas, 'devengado');
  const pagado = sumar(lineas, 'pagado');
  const inicial = sumar(lineas, 'inicial');
  const modificaciones = sumar(lineas, 'modificaciones');
  const s2 = estadoS2Global(vigente, devengado, f, p);

  const aperturas = agrupar(lineas, (l) => l.cat)
    .filter((a) => a.vigente > 0)
    .map((a) => ({
      ...a,
      prog: a.lineas[0].prog,
      nombre: a.lineas[0].apertura,
      tipo: a.lineas[0].tipo,
      ...estadoS2(a.vigente, a.devengado, f, p, a.lineas[0].tipo),
    }));

  const dist = { rojo: { n: 0, v: 0 }, agotado: { n: 0, v: 0 }, amarillo: { n: 0, v: 0 }, verde: { n: 0, v: 0 }, ejecutado: { n: 0, v: 0 } };
  aperturas.forEach((a) => { if (dist[a.estado]) { dist[a.estado].n += 1; dist[a.estado].v += a.vigente; } });

  const programas = agrupar(lineas, (l) => l.prog)
    .filter((g) => g.vigente > 0)
    .map((g) => ({
      ...g,
      cod: g.clave,
      nombre: nombrePrograma(g.clave, g.lineas[0].apertura),
      naperturas: new Set(g.lineas.map((l) => l.cat)).size,
      ...estadoS2Global(g.vigente, g.devengado, f, p),
    }))
    .sort((a, b) => b.vigente - a.vigente);

  const func = lineas.filter((l) => PROGRAMAS_FUNCIONAMIENTO.includes(l.prog));
  const funcVigente = sumar(func, 'vigente');
  const funcDevengado = sumar(func, 'devengado');
  const s1 = estadoS1(funcVigente, p);

  // Alertas: aperturas con al menos Bs 50.000 y sin ningún devengado
  const sinEjecucion = aperturas
    .filter((a) => a.devengado === 0 && a.vigente >= 50000)
    .sort((a, b) => b.vigente - a.vigente);

  // Partidas de actividades que ya consumieron todo su presupuesto antes de fin de año
  const partidasAgotadas = f < 1
    ? lineas
      .filter((l) => l.tipo === 'Actividad' && l.vigente >= 10000 && (l.devengado / l.vigente) * 100 >= p.ejecutadoDesde)
      .sort((a, b) => b.vigente - a.vigente)
    : [];

  return {
    partidasAgotadas,
    fraccion: f, vigente, devengado, pagado, inicial, modificaciones, s2,
    aperturas, dist, programas, func, funcVigente, funcDevengado, s1, sinEjecucion,
  };
}

// Formatos
export const bs = (n, dec = 0) => Number(n || 0).toLocaleString('es-BO', { minimumFractionDigits: dec, maximumFractionDigits: dec });
export const mill = (n) => `${(n / 1e6).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} M`;
export const pct = (n, dec = 1) => `${Number(n || 0).toLocaleString('es-BO', { minimumFractionDigits: dec, maximumFractionDigits: dec })} %`;
export const fechaLarga = (iso) => {
  if (!iso) return 'sin fecha';
  const [a, m, d] = iso.split('-').map(Number);
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${d} de ${meses[m - 1]} de ${a}`;
};
export const fechaCorta = (iso) => (iso ? iso.split('-').reverse().join('/') : '');
