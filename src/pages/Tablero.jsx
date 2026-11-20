import React from 'react';
import { Barra, Estado, Kpi, Semaforo, Seccion, Fuente } from '../ui.jsx';
import { mill, pct, bs, fechaLarga, nombrePrograma } from '../lib/calc.js';

export default function Tablero({ datos, r, params }) {
  const esperado = r.fraccion * 100;
  const brecha = esperado - r.s2.pct;
  const titulo = brecha > 0.5
    ? `El gasto va ${Math.round(brecha)} puntos por debajo del ritmo esperado`
    : brecha < -0.5
      ? `El gasto va ${Math.round(-brecha)} puntos por encima del ritmo esperado`
      : 'El gasto va al ritmo esperado';
  const top = r.programas.slice(0, 10);
  const totalSinEjec = r.sinEjecucion.reduce((a, x) => a + x.vigente, 0);

  return (
    <>
      <header className="cab">
        <div>
          <p className="ante">Gestión {datos.meta.corte.slice(0, 4)} · corte al {fechaLarga(datos.meta.corte)}</p>
          <h1>{titulo}</h1>
        </div>
        <a className="boton" href="#/reporte">Ver reporte imprimible</a>
      </header>

      <div className="grid-4">
        <Kpi titulo="Presupuesto vigente" valor={`Bs ${mill(r.vigente)}`} nota={`Inicial ${mill(r.inicial)} + modificaciones ${mill(r.modificaciones)}`} />
        <Kpi titulo="Devengado" valor={`Bs ${mill(r.devengado)}`} nota={`${pct(r.s2.pct)} del vigente · pagado ${mill(r.pagado)}`} />
        <Kpi titulo="Avance esperado al corte" valor={pct(esperado)} nota="Proporción del año transcurrida" />
        <Kpi titulo="Ritmo de ejecución (S2)" valor={pct(r.s2.ritmo)} nota={<Estado estado={r.s2.estado} texto={`${r.s2.estado === 'rojo' ? 'Rojo' : r.s2.estado === 'amarillo' ? 'Amarillo' : 'Verde'} · 100 % sería ir al ritmo previsto`} />} estado={r.s2.estado} />
      </div>

      <Seccion titulo="Indicadores semafóricos">
        <div className="grid-4">
          <Semaforo codigo="S1" nombre="Límite legal de funcionamiento" estado={r.s1.estado}
            detalle={`${pct(r.s1.uso)} del límite`}
            nota={`Estimado: vigente Bs ${mill(r.funcVigente)} / límite Bs ${mill(r.s1.limite)}. Base: ${params.fuenteBase}.`} />
          <Semaforo codigo="S2" nombre="Ejecución del gasto" estado={r.s2.estado}
            detalle={`ritmo ${pct(r.s2.ritmo)}`}
            nota={`${pct(r.s2.pct)} ejecutado contra ${pct(esperado)} esperado.`} />
          <Semaforo codigo="S3" nombre="Cumplimiento de recaudación" estado="sinDato"
            detalle="" nota="Falta el reporte de ejecución de recursos del SIGEP." />
          <Semaforo codigo="S4" nombre="Avance físico-financiero" estado="sinDato"
            detalle="" nota="Falta el reporte de avance físico de las unidades ejecutoras." />
        </div>
      </Seccion>

      <div className="grid-4">
        {[
          ['rojo', 'en rojo'],
          ['amarillo', 'en amarillo'],
          ['verde', 'en verde'],
          ['ejecutado', 'ya ejecutadas'],
        ].map(([k, t]) => (
          <div key={k} className="conteo">
            <span className={`punto-grande fondo-${k}`} aria-hidden="true" />
            <div>
              <p className="conteo-n">{r.dist[k].n} aperturas {t}</p>
              <p className="conteo-v">Bs {mill(r.dist[k].v)} del vigente</p>
            </div>
          </div>
        ))}
      </div>

      {r.sinEjecucion.length > 0 && (
        <Seccion titulo={`${r.sinEjecucion.length} aperturas con Bs ${mill(totalSinEjec)} sin ningún gasto`}>
          <p className="texto">Proyectos y actividades con al menos Bs 50.000 de presupuesto vigente y devengado cero a la fecha de corte.</p>
          <div className="tabla-caja">
            <table>
              <thead>
                <tr><th>Apertura</th><th>Programa</th><th>Tipo</th><th className="num">Vigente (Bs)</th></tr>
              </thead>
              <tbody>
                {r.sinEjecucion.slice(0, 8).map((a) => (
                  <tr key={a.clave}>
                    <td>{a.nombre}</td>
                    <td><a href={`#/programas/${a.prog}`}>{a.prog} · {nombrePrograma(a.prog)}</a></td>
                    <td>{a.tipo}</td>
                    <td className="num">{bs(a.vigente)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {r.sinEjecucion.length > 8 && <Fuente>Se muestran 8 de {r.sinEjecucion.length}. La lista completa está en el reporte.</Fuente>}
        </Seccion>
      )}

      <Seccion titulo="Los 10 programas con mayor presupuesto" accion={<a href="#/programas">Ver los {r.programas.length} programas</a>}>
        <div className="tabla-caja">
          <table>
            <thead>
              <tr>
                <th>Programa</th>
                <th className="num">Vigente (Bs)</th>
                <th className="num">Devengado (Bs)</th>
                <th className="col-barra">% ejecución vs. {pct(esperado)} esperado</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {top.map((p) => (
                <tr key={p.cod}>
                  <td><a href={`#/programas/${p.cod}`}>{p.cod} · {p.nombre}</a></td>
                  <td className="num">{bs(p.vigente)}</td>
                  <td className="num">{bs(p.devengado)}</td>
                  <td>
                    <div className="barra-fila">
                      <Barra valor={p.pct} esperado={esperado} estado={p.estado} />
                      <span className="num">{pct(p.pct)}</span>
                    </div>
                  </td>
                  <td><Estado estado={p.estado} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Fuente>Fuente: {datos.meta.fuente} al {fechaLarga(datos.meta.corte)} ({datos.lineas.length} líneas). La línea negra marca el avance esperado.</Fuente>
      </Seccion>
    </>
  );
}
