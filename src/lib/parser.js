// Lector del reporte SIGEP "Ejecución presupuestaria de gastos" (REgaReportesMultiples).
// El reporte es jerárquico: Entidad > DA > UE > Categoría programática > Fuente > Organismo > Objeto.
// Esta función lo convierte en una tabla plana, una fila por partida, y lo valida.

const NIVELES = ['Entidad', 'DA', 'UE', 'Cat. Prg.', 'FTE', 'Org.'];

// Posición de cada columna numérica en el reporte (columna A = 0)
const COL = {
  inicial: 8, modificaciones: 11, vigente: 12, preventivo: 13,
  compromiso: 14, devengado: 15, pagado: 16, saldoPorPagar: 17, saldoPorDevengar: 20,
};

const num = (v) => {
  if (v === null || v === undefined || v === '') return 0;
  if (typeof v === 'number') return v;
  const n = Number(String(v).replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};
const txt = (v) => (v === null || v === undefined ? '' : String(v).trim());
const r2 = (n) => Math.round(n * 100) / 100;

/**
 * @param {Array<Array<any>>} filas  hoja completa como matriz (columna A = índice 0)
 * @returns {{ lineas: object[], totalGeneral: object|null, entidad: string }}
 */
export function leerReporte(filas) {
  const ctx = {};
  const lineas = [];
  let totalGeneral = null;

  for (const r of filas) {
    if (!r) continue;
    const etiqueta = txt(r[2]);

    if (NIVELES.includes(etiqueta)) {
      ctx[etiqueta] = { cod: txt(r[5]), desc: txt(r[10]) };
      for (const inferior of NIVELES.slice(NIVELES.indexOf(etiqueta) + 1)) delete ctx[inferior];
      continue;
    }

    const objeto = txt(r[1]);
    if (!objeto || r[COL.inicial] === null || r[COL.inicial] === undefined) continue;
    if (objeto === 'Objeto') continue; // fila de títulos
    if (objeto.toUpperCase().startsWith('TOTALES GENERALES')) {
      totalGeneral = {};
      for (const [k, c] of Object.entries(COL)) totalGeneral[k] = num(r[c]);
      continue;
    }

    const cat = ctx['Cat. Prg.'] || { cod: '', desc: '' };
    const partes = cat.cod.split(/\s+/).filter(Boolean); // ej. ["170","0","001"] o ["170","08620280700000","000"]
    const linea = {
      ue: ctx.UE?.desc || '',
      prog: partes[0] || '',
      cat: partes.join(' '),
      apertura: cat.desc,
      tipo: partes[1] && partes[1] !== '0' ? 'Proyecto' : 'Actividad',
      ff: ctx.FTE?.cod || '',
      ffDesc: ctx.FTE?.desc || '',
      of: ctx['Org.']?.cod || '',
      ofDesc: ctx['Org.']?.desc || '',
      obj: objeto,
      objDesc: txt(r[3]),
    };
    for (const [k, c] of Object.entries(COL)) linea[k] = num(r[c]);
    lineas.push(linea);
  }

  const entidad = ctx.Entidad?.desc || '';
  return { lineas, totalGeneral, entidad };
}

/** Revisa que el reporte esté completo y sea consistente. */
export function validar({ lineas, totalGeneral }) {
  const errores = [];
  const avisos = [];
  const ok = [];

  if (!lineas.length) {
    errores.push('No se encontraron partidas. Verifica que sea el reporte de ejecución de gastos del SIGEP.');
    return { errores, avisos, ok };
  }

  const suma = (k) => r2(lineas.reduce((a, l) => a + l[k], 0));
  if (!totalGeneral) {
    avisos.push('El archivo no trae la fila "TOTALES GENERALES"; no se pudo comparar contra el total del reporte.');
  } else {
    const difs = ['vigente', 'devengado', 'pagado']
      .map((k) => [k, r2(suma(k) - totalGeneral[k])])
      .filter(([, d]) => Math.abs(d) > 0.05);
    if (difs.length) difs.forEach(([k, d]) => errores.push(`La suma de ${k} no coincide con el total del reporte (diferencia Bs ${d}).`));
    else ok.push(`La suma de las líneas coincide con el total del reporte: vigente Bs ${fmtBs(suma('vigente'))} y devengado Bs ${fmtBs(suma('devengado'))}.`);
  }

  const pagadoMayor = lineas.filter((l) => l.pagado > l.devengado + 0.01).length;
  const devMayor = lineas.filter((l) => l.devengado > l.vigente + 0.01).length;
  if (pagadoMayor) errores.push(`${pagadoMayor} líneas tienen pagado mayor al devengado.`);
  if (devMayor) errores.push(`${devMayor} líneas tienen devengado mayor al vigente.`);
  if (!pagadoMayor && !devMayor) ok.push('Ninguna línea tiene pagado mayor al devengado ni devengado mayor al vigente.');

  const func = lineas.filter((l) => l.prog === '000' || l.prog === '001');
  const fuentesFunc = [...new Set(func.map((l) => `${l.ff}/${l.of}`))];
  const prohibidas = fuentesFunc.filter((f) => !['20/210', '41/113'].includes(f));
  if (!func.length) avisos.push('No se encontraron los programas de funcionamiento (000 y 001).');
  else if (prohibidas.length) errores.push(`El funcionamiento usa fuentes no permitidas: ${prohibidas.join(', ')}.`);
  else ok.push('El funcionamiento se financia solo con 20/210 y 41/113.');

  const conMod = lineas.filter((l) => l.modificaciones !== 0).length;
  if (conMod) avisos.push(`${conMod} líneas tienen modificaciones aprobadas (Bs ${fmtBs(suma('modificaciones'))}). Se usa el presupuesto vigente como referencia.`);

  const porCat = {};
  lineas.forEach((l) => { porCat[l.cat] = (porCat[l.cat] || 0) + l.vigente; });
  const ceros = Object.values(porCat).filter((v) => v === 0).length;
  if (ceros) avisos.push(`${ceros} aperturas tienen presupuesto vigente cero y no se muestran en el tablero.`);

  return { errores, avisos, ok };
}

export function fmtBs(n, dec = 2) {
  return Number(n || 0).toLocaleString('es-BO', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

/** Lee la matriz de un libro SheetJS ya abierto. */
export function matrizDesdeHoja(XLSX, ws) {
  const rango = XLSX.utils.decode_range(ws['!ref']);
  rango.s.c = 0;
  rango.s.r = 0;
  return XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, range: rango, raw: true, blankrows: true });
}

/** Intenta deducir la fecha de corte del nombre del archivo (ej. "AL 31-10-2026"). */
export function corteDesdeNombre(nombre) {
  const m = String(nombre).match(/(\d{1,2})[-_.\/](\d{1,2})[-_.\/](\d{4})/);
  if (!m) return '';
  const [, d, mes, a] = m;
  return `${a}-${mes.padStart(2, '0')}-${d.padStart(2, '0')}`;
}
