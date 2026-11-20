import React, { useState } from 'react';
import { Barra, Estado, Kpi, Seccion, Fuente } from '../ui.jsx';
import { agrupar, bs, mill, pct, GRUPOS, FUNCIONAMIENTO_POA, estadoS2Global } from '../lib/calc.js';

export default function Funcionamiento({ r, params, cambiarParametros, puede }) {
  const [propios, setPropios] = useState(params.baseIngresosPropios);
  const [copa, setCopa] = useState(params.baseCoparticipacion);
  const [fuenteBase, setFuenteBase] = useState(params.fuenteBase);
  const [guardado, setGuardado] = useState(false);

  const limite = r.s1.limite;
  const proyeccion = r.fraccion > 0 ? r.funcDevengado / r.fraccion : 0;
  const organos = agrupar(r.func, (l) => l.prog).map((g) => ({
    ...g,
    nombre: g.clave === '000' ? 'Órgano Ejecutivo' : 'Concejo Municipal (Deliberativo)',
    ...estadoS2Global(g.vigente, g.devengado, r.fraccion, params),
  }));
  const grupos = agrupar(r.func, (l) => l.obj.charAt(0))
    .map((g) => ({ ...g, nombre: GRUPOS[g.clave] || g.clave }))
    .filter((g) => g.vigente > 0)
    .sort((a, b) => b.vigente - a.vigente);
  const fuentes = agrupar(r.func, (l) => `${l.ff}/${l.of}`).sort((a, b) => b.vigente - a.vigente);
  const variacionPOA = ((r.funcVigente - FUNCIONAMIENTO_POA) / FUNCIONAMIENTO_POA) * 100;

  const guardar = (e) => {
    e.preventDefault();
    cambiarParametros({ ...params, baseIngresosPropios: Number(propios) || 0, baseCoparticipacion: Number(copa) || 0, fuenteBase: fuenteBase || 'Ingresado por el usuario' });
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2500);
  };

  return (
    <>
      <header className="cab">
        <div>
          <p className="ante"><a href="#/">Tablero</a> / Funcionamiento</p>
          <h1>El funcionamiento usa el {pct(r.s1.uso)} del límite legal</h1>
          <p className="sub">Ley 031, Disposición Transitoria Novena: el gasto de funcionamiento no puede superar el 25 % de los ingresos propios más la coparticipación tributaria.</p>
        </div>
      </header>

      <div className="grid-4">
        <Kpi titulo="S1 · Uso del límite (vigente)" valor={pct(r.s1.uso)} nota={<Estado estado={r.s1.estado} texto={`${r.s1.estado === 'rojo' ? 'Rojo' : r.s1.estado === 'amarillo' ? 'Amarillo' : 'Verde'}: amarillo desde ${params.s1.amarillo} %, rojo sobre ${params.s1.rojo} %`} />} estado={r.s1.estado} />
        <Kpi titulo="Límite legal (25 %)" valor={`Bs ${mill(limite)}`} nota={`Base Bs ${mill(r.s1.base)} · ${params.fuenteBase}`} />
        <Kpi titulo="Funcionamiento vigente" valor={`Bs ${mill(r.funcVigente)}`} nota={`${variacionPOA >= 0 ? '+' : ''}${pct(variacionPOA)} frente al POA (Bs ${mill(FUNCIONAMIENTO_POA)})`} />
        <Kpi titulo="Devengado al corte" valor={`Bs ${mill(r.funcDevengado)}`} nota={`Al ritmo actual cerraría en Bs ${mill(proyeccion)} (${pct((proyeccion / limite) * 100)} del límite)`} />
      </div>

      <Seccion titulo="Uso del límite">
        <div className="limite">
          {[
            ['Presupuesto vigente (peor caso: se gasta todo)', r.funcVigente],
            ['Proyección al cierre al ritmo actual', proyeccion],
            ['Devengado al corte', r.funcDevengado],
          ].map(([t, v]) => {
            const u = (v / limite) * 100;
            const est = u > params.s1.rojo ? 'rojo' : u >= params.s1.amarillo ? 'amarillo' : 'verde';
            return (
              <div className="limite-fila" key={t}>
                <span>{t}</span>
                <Barra valor={u / 1.2} esperado={100 / 1.2} estado={est} etiqueta={`${t}: ${pct(u)} del límite`} />
                <strong className="num">{pct(u)}</strong>
              </div>
            );
          })}
        </div>
        <Fuente>La escala llega a 120 %; la línea negra marca el 100 % del límite.</Fuente>
      </Seccion>

      <div className="grid-2">
        <Seccion titulo="Por órgano">
          <div className="tabla-caja">
            <table>
              <thead><tr><th>Órgano</th><th className="num">Vigente (Bs)</th><th className="num">Devengado (Bs)</th><th className="num">% ejec.</th><th>Estado</th></tr></thead>
              <tbody>
                {organos.map((o) => (
                  <tr key={o.clave}>
                    <td><a href={`#/programas/${o.clave}`}>{o.nombre}</a></td>
                    <td className="num">{bs(o.vigente)}</td>
                    <td className="num">{bs(o.devengado)}</td>
                    <td className="num">{pct(o.pct)}</td>
                    <td><Estado estado={o.estado} sentido={o.sentido} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3>Fuentes usadas</h3>
          <ul className="lista">
            {fuentes.map((f) => (
              <li key={f.clave}><strong>{f.clave}</strong> {f.lineas[0].ofDesc}: Bs {bs(f.vigente)}</li>
            ))}
          </ul>
          <Fuente>Solo se permiten 20/210 y 41/113 para funcionamiento (Ley 2296, art. 3).</Fuente>
        </Seccion>
        <Seccion titulo="Por tipo de gasto">
          <div className="tabla-caja">
            <table>
              <thead><tr><th>Grupo</th><th className="num">Vigente (Bs)</th><th className="num">Devengado (Bs)</th></tr></thead>
              <tbody>
                {grupos.map((g) => (
                  <tr key={g.clave}><td>{g.nombre}</td><td className="num">{bs(g.vigente)}</td><td className="num">{bs(g.devengado)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </Seccion>
      </div>

      <Seccion titulo="Base de cálculo del límite">
        <p className="texto">Por defecto se usan los ingresos programados en el POA 2026. Cuando el municipio entregue la ejecución de recursos, reemplázalos por lo recaudado o por la proyección al cierre.</p>
        {!puede('editarBase') && <p className="texto"><strong>Base actual:</strong> ingresos propios Bs {bs(params.baseIngresosPropios)} + coparticipación Bs {bs(params.baseCoparticipacion)} ({params.fuenteBase}). Solo el rol Administrador puede cambiarla.</p>}
        {puede('editarBase') && <form className="formulario" onSubmit={guardar}>
          <label>Ingresos propios (Bs)
            <input type="number" min="0" step="1" value={propios} onChange={(e) => setPropios(e.target.value)} />
          </label>
          <label>Coparticipación tributaria (Bs)
            <input type="number" min="0" step="1" value={copa} onChange={(e) => setCopa(e.target.value)} />
          </label>
          <label>Origen de la cifra
            <input type="text" value={fuenteBase} onChange={(e) => setFuenteBase(e.target.value)} />
          </label>
          <div className="acciones">
            <button className="boton" type="submit">Recalcular límite</button>
            {guardado && <span role="status" className="ok">Límite recalculado.</span>}
          </div>
        </form>}
      </Seccion>
    </>
  );
}
