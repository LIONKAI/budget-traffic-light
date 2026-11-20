import React from 'react';
import { Estado } from '../ui.jsx';
import { bs, mill, pct, fechaLarga, nombrePrograma, ETIQUETA } from '../lib/calc.js';

export default function Reporte({ datos, r, params }) {
  const esperado = r.fraccion * 100;
  const totalSinEjec = r.sinEjecucion.reduce((a, x) => a + x.vigente, 0);
  const hoy = new Date().toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <article className="reporte">
      <div className="no-imprimir acciones-reporte">
        <p className="ante"><a href="#/">Tablero</a> / Reporte</p>
        <button className="boton" type="button" onClick={() => window.print()}>Imprimir o guardar como PDF</button>
      </div>

      <header className="reporte-cab">
        <p>{datos.meta.entidad || 'Gobierno Autónomo Municipal de General Saavedra'}</p>
        <h1>Informe de seguimiento presupuestario</h1>
        <p>Ejecución de gastos al {fechaLarga(datos.meta.corte)} · emitido el {hoy}</p>
      </header>

      <h2>1. Resumen</h2>
      <table>
        <tbody>
          <tr><th scope="row">Presupuesto inicial</th><td className="num">Bs {bs(r.inicial, 2)}</td></tr>
          <tr><th scope="row">Modificaciones aprobadas</th><td className="num">Bs {bs(r.modificaciones, 2)}</td></tr>
          <tr><th scope="row">Presupuesto vigente</th><td className="num">Bs {bs(r.vigente, 2)}</td></tr>
          <tr><th scope="row">Devengado</th><td className="num">Bs {bs(r.devengado, 2)} ({pct(r.s2.pct)})</td></tr>
          <tr><th scope="row">Pagado</th><td className="num">Bs {bs(r.pagado, 2)}</td></tr>
          <tr><th scope="row">Avance esperado a la fecha</th><td className="num">{pct(esperado)}</td></tr>
        </tbody>
      </table>

      <h2>2. Indicadores semafóricos</h2>
      <table>
        <thead><tr><th>Indicador</th><th>Resultado</th><th>Estado</th></tr></thead>
        <tbody>
          <tr><td>S1 · Límite legal de funcionamiento (estimado)</td><td>Vigente Bs {bs(r.funcVigente)} sobre un límite de Bs {bs(r.s1.limite)}: {pct(r.s1.uso)}</td><td><Estado estado={r.s1.estado} /></td></tr>
          <tr><td>S2 · Ejecución del gasto</td><td>{pct(r.s2.pct)} ejecutado frente a {pct(esperado)} esperado: ritmo {pct(r.s2.ritmo)}</td><td><Estado estado={r.s2.estado} /></td></tr>
          <tr><td>S3 · Cumplimiento de recaudación</td><td>Falta la ejecución de recursos del SIGEP</td><td><Estado estado="sinDato" /></td></tr>
          <tr><td>S4 · Avance físico-financiero</td><td>Falta el reporte de avance físico</td><td><Estado estado="sinDato" /></td></tr>
        </tbody>
      </table>
      <p className="nota">Base del límite S1: {params.fuenteBase} (Bs {bs(r.s1.base)}). Distribución de aperturas: {['rojo', 'agotado', 'amarillo', 'verde', 'ejecutado'].map((k) => `${r.dist[k].n} ${ETIQUETA[k].toLowerCase()}`).join(', ')}.</p>

      <h2>3. Ejecución por programa</h2>
      <table>
        <thead><tr><th>Programa</th><th className="num">Vigente (Bs)</th><th className="num">Devengado (Bs)</th><th className="num">%</th><th>Estado</th></tr></thead>
        <tbody>
          {r.programas.map((p) => (
            <tr key={p.cod}>
              <td>{p.cod} · {p.nombre}</td>
              <td className="num">{bs(p.vigente)}</td>
              <td className="num">{bs(p.devengado)}</td>
              <td className="num">{pct(p.pct)}</td>
              <td><Estado estado={p.estado} sentido={p.sentido} /></td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>4. Aperturas sin ejecución</h2>
      <p>{r.sinEjecucion.length} aperturas con al menos Bs 50.000 vigentes no registran gasto: Bs {mill(totalSinEjec)} en total.</p>
      <table>
        <thead><tr><th>Apertura</th><th>Programa</th><th>Tipo</th><th className="num">Vigente (Bs)</th></tr></thead>
        <tbody>
          {r.sinEjecucion.map((a) => (
            <tr key={a.clave}><td>{a.nombre}</td><td>{a.prog} · {nombrePrograma(a.prog)}</td><td>{a.tipo}</td><td className="num">{bs(a.vigente)}</td></tr>
          ))}
        </tbody>
      </table>

      <h2>5. Partidas con presupuesto agotado</h2>
      <p>{r.partidasAgotadas.length} partidas de actividades (al menos Bs 10.000) ya devengaron todo su vigente antes de fin de año. Revisar si el gasto continúa hasta diciembre.</p>
      <table>
        <thead><tr><th>Partida</th><th>Actividad</th><th>Programa</th><th className="num">Vigente (Bs)</th></tr></thead>
        <tbody>
          {r.partidasAgotadas.map((l, i) => (
            <tr key={i}><td>{l.obj} · {l.objDesc}</td><td>{l.apertura}</td><td>{l.prog}</td><td className="num">{bs(l.vigente)}</td></tr>
          ))}
        </tbody>
      </table>

      <h2>6. Notas</h2>
      <ul>
        <li>Fuente: {datos.meta.fuente}, archivo {datos.meta.archivo}.</li>
        <li>El avance esperado supone un gasto lineal durante el año, a falta de una programación mensual.</li>
        <li>Una actividad al 100 % antes de diciembre se marca como Agotado (alerta); un proyecto al 100 %, como Ejecutado.</li>
        <li>Rangos de S2: verde entre {params.s2.verdeMin} % y {params.s2.verdeMax} % del ritmo esperado; amarillo entre {params.s2.amarilloMin} % y {params.s2.amarilloMax} %; rojo fuera de esos rangos.</li>
        <li>Piloto académico elaborado por Ingeniería de Sistemas y Contaduría Pública, Unifranz.</li>
      </ul>
    </article>
  );
}
