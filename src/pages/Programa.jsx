import React, { useMemo, useState } from 'react';
import { Barra, Estado, Kpi, Seccion, Fuente } from '../ui.jsx';
import { agrupar, bs, mill, pct, estadoS2Global, GRUPOS } from '../lib/calc.js';

const TONOS = ['#1F5F42', '#4E8C6C', '#8DB8A0', '#B9C9C0', '#D5DFD9', '#6B7A72'];

export default function Programa({ r, cod, params }) {
  const [abiertas, setAbiertas] = useState(() => new Set());
  const prog = r.programas.find((p) => p.cod === cod);
  const esperado = r.fraccion * 100;

  const info = useMemo(() => {
    if (!prog) return null;
    const aperturas = r.aperturas.filter((a) => a.prog === cod).sort((a, b) => b.vigente - a.vigente);
    const fuentes = agrupar(prog.lineas, (l) => `${l.ff}/${l.of}`)
      .map((g) => ({ ...g, desc: g.lineas[0].ofDesc || g.lineas[0].ffDesc }))
      .sort((a, b) => b.vigente - a.vigente);
    const grupos = agrupar(prog.lineas, (l) => l.obj.charAt(0))
      .map((g) => ({ ...g, nombre: GRUPOS[g.clave] || `Grupo ${g.clave}`, ...estadoS2Global(g.vigente, g.devengado, r.fraccion, params) }))
      .filter((g) => g.vigente > 0)
      .sort((a, b) => b.vigente - a.vigente);
    const sinEjec = aperturas.filter((a) => a.devengado === 0);
    return { aperturas, fuentes, grupos, sinEjec };
  }, [prog, r, cod, params]);

  if (!prog) {
    return (
      <>
        <header className="cab"><div><p className="ante"><a href="#/programas">Programas</a></p><h1>No existe el programa {cod}</h1></div></header>
        <p className="texto">Vuelve a la <a href="#/programas">lista de programas</a>.</p>
      </>
    );
  }

  const alternar = (k) => setAbiertas((s) => {
    const n = new Set(s);
    if (n.has(k)) n.delete(k); else n.add(k);
    return n;
  });
  const sinEjecTotal = info.sinEjec.reduce((a, x) => a + x.vigente, 0);

  return (
    <>
      <header className="cab">
        <div>
          <p className="ante"><a href="#/">Tablero</a> / <a href="#/programas">Programas</a> / {prog.cod}</p>
          <h1>{prog.cod} · {prog.nombre}</h1>
          <p className="sub">{prog.naperturas} aperturas · Bs {bs(prog.vigente)} vigente · Bs {bs(prog.devengado)} devengado</p>
        </div>
        <Kpi titulo="Ejecución" valor={pct(prog.pct)} nota={<Estado estado={prog.estado} texto={`${prog.estado === 'rojo' ? 'Rojo' : prog.estado === 'amarillo' ? 'Amarillo' : 'Verde'} · ritmo ${pct(prog.ritmo)}`} />} estado={prog.estado} />
      </header>

      {info.sinEjec.length > 0 && (
        <div className="alerta" role="note">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3 2 21h20L12 3z" /><path d="M12 10v5" /><path d="M12 18h.01" /></svg>
          <div>
            <p><strong>{info.sinEjec.length} {info.sinEjec.length === 1 ? 'apertura' : 'aperturas'} con Bs {bs(sinEjecTotal)} sin ningún gasto</strong></p>
            <p>{info.sinEjec.slice(0, 4).map((a) => `${a.nombre} (Bs ${bs(a.vigente)})`).join('; ')}{info.sinEjec.length > 4 ? '…' : '.'}</p>
          </div>
        </div>
      )}

      <div className="grid-2">
        <Seccion titulo="Financiamiento por fuente">
          <div className="apilada" role="img" aria-label={info.fuentes.map((f) => `${f.clave} ${pct((f.vigente / prog.vigente) * 100)}`).join(', ')}>
            {info.fuentes.map((f, i) => (
              <div key={f.clave} style={{ width: `${(f.vigente / prog.vigente) * 100}%`, background: TONOS[i % TONOS.length] }} />
            ))}
          </div>
          <ul className="leyenda">
            {info.fuentes.map((f, i) => (
              <li key={f.clave}>
                <span className="muestra" style={{ background: TONOS[i % TONOS.length] }} aria-hidden="true" />
                <span><strong>{f.clave}</strong> {f.desc}</span>
                <span className="num">Bs {mill(f.vigente)}</span>
              </li>
            ))}
          </ul>
        </Seccion>
        <Seccion titulo="Por tipo de gasto">
          <div className="tabla-caja">
            <table>
              <thead><tr><th>Grupo</th><th className="num">Vigente (Bs)</th><th className="num">% ejec.</th><th>Estado</th></tr></thead>
              <tbody>
                {info.grupos.map((g) => (
                  <tr key={g.clave}>
                    <td>{g.clave}0000 · {g.nombre}</td>
                    <td className="num">{bs(g.vigente)}</td>
                    <td className="num">{pct(g.pct)}</td>
                    <td><Estado estado={g.estado} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Seccion>
      </div>

      <Seccion titulo="Proyectos y actividades">
        <div className="tabla-caja">
          <table>
            <thead>
              <tr>
                <th>Apertura</th>
                <th>Tipo</th>
                <th className="num">Vigente (Bs)</th>
                <th className="num">Devengado (Bs)</th>
                <th className="col-barra">% ejecución</th>
                <th>Estado</th>
                <th>Avance físico</th>
              </tr>
            </thead>
            <tbody>
              {info.aperturas.map((a) => {
                const abierta = abiertas.has(a.clave);
                return (
                  <React.Fragment key={a.clave}>
                    <tr>
                      <td>
                        <button type="button" className="enlace" aria-expanded={abierta} onClick={() => alternar(a.clave)}>
                          <span aria-hidden="true">{abierta ? '▾' : '▸'}</span> {a.nombre}
                        </button>
                        <span className="codigo">{a.clave}</span>
                      </td>
                      <td>{a.tipo}</td>
                      <td className="num">{bs(a.vigente)}</td>
                      <td className="num">{bs(a.devengado)}</td>
                      <td>
                        <div className="barra-fila">
                          <Barra valor={a.pct} esperado={esperado} estado={a.estado} />
                          <span className="num">{pct(a.pct)}</span>
                        </div>
                      </td>
                      <td><Estado estado={a.estado} /></td>
                      <td className="tenue">{a.tipo === 'Proyecto' ? 'Sin reporte' : 'No aplica'}</td>
                    </tr>
                    {abierta && (
                      <tr className="detalle">
                        <td colSpan="7">
                          <table>
                            <thead><tr><th>Partida</th><th>Fuente</th><th className="num">Vigente</th><th className="num">Devengado</th><th className="num">Pagado</th><th className="num">%</th></tr></thead>
                            <tbody>
                              {a.lineas.slice().sort((x, y) => y.vigente - x.vigente).map((l, i) => (
                                <tr key={i}>
                                  <td>{l.obj} · {l.objDesc}</td>
                                  <td>{l.ff}/{l.of}</td>
                                  <td className="num">{bs(l.vigente, 2)}</td>
                                  <td className="num">{bs(l.devengado, 2)}</td>
                                  <td className="num">{bs(l.pagado, 2)}</td>
                                  <td className="num">{l.vigente ? pct((l.devengado / l.vigente) * 100) : '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        <Fuente>“Ejecutado” = apertura con {pct(params.ejecutadoDesde)} o más devengado. El avance físico se completa cuando las unidades ejecutoras lo reporten (indicador S4).</Fuente>
      </Seccion>
    </>
  );
}
