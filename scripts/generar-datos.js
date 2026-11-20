// Genera src/data/oficial.json a partir del reporte SIGEP.
// Uso: npm run datos -- "ruta/al/EJECUCION_PRESUPUESTARIA__AL_31-10-2026.xls"
import fs from 'node:fs';
import path from 'node:path';
import XLSX from 'xlsx';
import { leerReporte, validar, matrizDesdeHoja, corteDesdeNombre } from '../src/lib/parser.js';

const ruta = process.argv[2];
if (!ruta) {
  console.error('Indica la ruta del reporte .xls del SIGEP.');
  process.exit(1);
}

const wb = XLSX.read(fs.readFileSync(ruta), { type: 'buffer' });
const filas = matrizDesdeHoja(XLSX, wb.Sheets[wb.SheetNames[0]]);
const rep = leerReporte(filas);
const val = validar(rep);

console.log(`Líneas: ${rep.lineas.length}`);
val.ok.forEach((m) => console.log('OK    ', m));
val.avisos.forEach((m) => console.log('AVISO ', m));
val.errores.forEach((m) => console.log('ERROR ', m));
if (val.errores.length) process.exit(1);

const datos = {
  meta: {
    corte: corteDesdeNombre(path.basename(ruta)),
    archivo: path.basename(ruta),
    entidad: rep.entidad,
    fuente: 'Reporte SIGEP de ejecución presupuestaria de gastos',
    oficial: true,
  },
  totalGeneral: rep.totalGeneral,
  lineas: rep.lineas,
};
fs.writeFileSync(new URL('../src/data/oficial.json', import.meta.url), JSON.stringify(datos));
console.log('Generado src/data/oficial.json, corte', datos.meta.corte);
