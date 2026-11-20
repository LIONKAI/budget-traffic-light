import oficial from './data/oficial.json';
import { PARAMETROS_BASE } from './lib/calc.js';

const K_DATOS = 'semaforo.datos.v1';
const K_PARAMS = 'semaforo.params.v1';

function leer(k) {
  try {
    const s = window.localStorage.getItem(k);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}
function escribir(k, v) {
  try {
    if (v === null) window.localStorage.removeItem(k);
    else window.localStorage.setItem(k, JSON.stringify(v));
    return true;
  } catch {
    return false;
  }
}

export const datosOficiales = oficial;

export function cargarDatos() {
  const d = leer(K_DATOS);
  return d && Array.isArray(d.lineas) && d.lineas.length ? d : oficial;
}
export function guardarDatos(d) {
  return escribir(K_DATOS, d);
}
export function borrarDatos() {
  escribir(K_DATOS, null);
}

export function cargarParametros() {
  const p = leer(K_PARAMS);
  return p ? { ...PARAMETROS_BASE, ...p, s1: { ...PARAMETROS_BASE.s1, ...p.s1 }, s2: { ...PARAMETROS_BASE.s2, ...p.s2 } } : PARAMETROS_BASE;
}
export function guardarParametros(p) {
  return escribir(K_PARAMS, p);
}
export function borrarParametros() {
  escribir(K_PARAMS, null);
}
