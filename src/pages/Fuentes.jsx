import React from 'react';
import { Barra, Estado, Seccion, Fuente } from '../ui.jsx';
import { agrupar, bs, pct, estadoS2Global } from '../lib/calc.js';

export default function Fuentes({ datos, r, params }) {
  const esperado = r.fraccion * 100;
  const fuentes = agrupar(datos.lineas, (l) => `${l.ff}/${l.of}`)
    .map((g) => ({
      ...g,
      ffDesc: g.lineas[0].ffDesc,
      ofDesc: g.lineas[0].ofDesc,
      ...estadoS2Global(g.vigente, g.devengado, r.fraccion, params),
    }))
    .filter((g) => g.vigente > 0)
    .sort((a, b) => b.vigente - a.vigente);

  return (
    <>
      <header className="cab">
        <div>
          <p className="ante"><a href="#/">Tablero</a> / Fuentes</p>
          <h1>Ejecución por fuente de financiamiento</h1>
          <p className="sub">Muestra qué fuentes se están usando y cuáles se ejecutan más lento. Ayuda a anticipar saldos que podrían revertirse.</p>
        </div>
      </header>
      <Seccion>
        <div className="tabla-caja">
          <table>
            <thead>
              <tr>
                <th>FF/OF</th>
                <th>Fuente</th>
                <th>Organismo financiador</th>
                <th className="num">Vigente (Bs)</th>
                <th className="num">Devengado (Bs)</th>
                <th className="col-barra">% ejecución</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {fuentes.map((f) => (
                <tr key={f.clave}>
                  <td><strong>{f.clave}</strong></td>
                  <td>{f.ffDesc}</td>
                  <td>{f.ofDesc}</td>
                  <td className="num">{bs(f.vigente)}</td>
                  <td className="num">{bs(f.devengado)}</td>
                  <td>
                    <div className="barra-fila">
                      <Barra valor={f.pct} esperado={esperado} estado={f.estado} />
                      <span className="num">{pct(f.pct)}</span>
                    </div>
                  </td>
                  <td><Estado estado={f.estado} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Fuente>Descripciones de fuente y organismo tal como vienen en el reporte del SIGEP.</Fuente>
      </Seccion>
    </>
  );
}
