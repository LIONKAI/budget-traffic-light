import React, { useMemo, useState } from 'react';
import { Barra, Estado, Seccion, Fuente } from '../ui.jsx';
import { bs, pct, fechaLarga } from '../lib/calc.js';

const COLS = ['ue', 'prog', 'cat', 'apertura', 'tipo', 'ff', 'of', 'obj', 'objDesc', 'inicial', 'modificaciones', 'vigente', 'preventivo', 'compromiso', 'devengado', 'pagado', 'saldoPorPagar', 'saldoPorDevengar'];

export function descargarCSV(lineas, nombre) {
  const esc = (v) => (typeof v === 'number' ? String(v) : `"${String(v ?? '').replace(/"/g, '""')}"`);
  const csv = [COLS.join(','), ...lineas.map((l) => COLS.map((c) => esc(l[c])).join(','))].join('\n');
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function Programas({ datos, r }) {
  const [q, setQ] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const esperado = r.fraccion * 100;

  const lista = useMemo(() => {
    const t = q.trim().toLowerCase();
    return r.programas.filter((p) =>
      (filtro === 'todos' || p.estado === filtro) &&
      (!t || p.cod.includes(t) || p.nombre.toLowerCase().includes(t)));
  }, [q, filtro, r.programas]);

  return (
    <>
      <header className="cab">
        <div>
          <p className="ante"><a href="#/">Tablero</a> / Programas</p>
          <h1>{r.programas.length} programas con presupuesto</h1>
        </div>
        <button className="boton secundario" type="button" onClick={() => descargarCSV(datos.lineas, `ejecucion_${datos.meta.corte}.csv`)}>
          Descargar datos (CSV)
        </button>
      </header>

      <Seccion>
        <div className="filtros">
          <label>Buscar
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Código o nombre" />
          </label>
          <label>Estado
            <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
              <option value="todos">Todos</option>
              <option value="rojo">Rojo</option>
              <option value="amarillo">Amarillo</option>
              <option value="verde">Verde</option>
            </select>
          </label>
        </div>
        <div className="tabla-caja">
          <table>
            <thead>
              <tr>
                <th>Programa</th>
                <th className="num">Aperturas</th>
                <th className="num">Vigente (Bs)</th>
                <th className="num">Devengado (Bs)</th>
                <th className="col-barra">% ejecución</th>
                <th className="num">Ritmo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((p) => (
                <tr key={p.cod}>
                  <td><a href={`#/programas/${p.cod}`}>{p.cod} · {p.nombre}</a></td>
                  <td className="num">{p.naperturas}</td>
                  <td className="num">{bs(p.vigente)}</td>
                  <td className="num">{bs(p.devengado)}</td>
                  <td>
                    <div className="barra-fila">
                      <Barra valor={p.pct} esperado={esperado} estado={p.estado} />
                      <span className="num">{pct(p.pct)}</span>
                    </div>
                  </td>
                  <td className="num">{pct(p.ritmo)}</td>
                  <td><Estado estado={p.estado} /></td>
                </tr>
              ))}
              {!lista.length && (
                <tr><td colSpan="7">Ningún programa coincide con la búsqueda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Fuente>Ritmo = % ejecutado ÷ % esperado al {fechaLarga(datos.meta.corte)} ({pct(esperado)}). 100 % significa que va al ritmo previsto.</Fuente>
      </Seccion>
    </>
  );
}
