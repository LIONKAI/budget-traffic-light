import React, { useState } from 'react';
import { Seccion, Fuente } from '../ui.jsx';

export default function Metodologia({ params, cambiarParametros, restaurarParametros }) {
  const [s2, setS2] = useState(params.s2);
  const [s1, setS1] = useState(params.s1);
  const [ejec, setEjec] = useState(params.ejecutadoDesde);
  const [msg, setMsg] = useState('');

  const guardar = (e) => {
    e.preventDefault();
    const n = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, Number(v)]));
    const a = n(s2);
    if (!(a.amarilloMin <= a.verdeMin && a.verdeMin <= a.verdeMax && a.verdeMax <= a.amarilloMax)) {
      setMsg('Los rangos de S2 deben cumplir: amarillo mínimo ≤ verde mínimo ≤ verde máximo ≤ amarillo máximo.');
      return;
    }
    cambiarParametros({ ...params, s2: a, s1: n(s1), ejecutadoDesde: Number(ejec) });
    setMsg('Umbrales guardados. Todo el sistema ya usa los nuevos valores.');
  };

  const campo = (obj, set, k, label) => (
    <label key={k}>{label}
      <input type="number" step="0.1" value={obj[k]} onChange={(e) => set({ ...obj, [k]: e.target.value })} />
    </label>
  );

  return (
    <>
      <header className="cab">
        <div>
          <p className="ante"><a href="#/">Tablero</a> / Metodología</p>
          <h1>Cómo se calculan los semáforos</h1>
        </div>
      </header>

      <Seccion titulo="Indicadores">
        <div className="tabla-caja">
          <table>
            <thead><tr><th>Indicador</th><th>Pregunta</th><th>Cálculo</th><th>Dato que usa</th><th>Estado en el piloto</th></tr></thead>
            <tbody>
              <tr><td>S1 · Límite legal de funcionamiento</td><td>¿Cerraremos el año dentro del 25 %?</td><td>Funcionamiento vigente ÷ (25 % × (ingresos propios + coparticipación))</td><td>Programas 000 y 001 del SIGEP; base del POA o recaudación real</td><td>Estimado</td></tr>
              <tr><td>S2 · Ejecución del gasto</td><td>¿Gastamos al ritmo previsto?</td><td>(% devengado ÷ % del año transcurrido) × 100</td><td>Ejecución de gastos del SIGEP</td><td>Completo</td></tr>
              <tr><td>S3 · Cumplimiento de recaudación</td><td>¿Entra el dinero que se proyectó?</td><td>Recaudado ÷ programado a la fecha</td><td>Ejecución de recursos del SIGEP</td><td>Falta el dato</td></tr>
              <tr><td>S4 · Avance físico-financiero</td><td>¿Lo pagado corresponde a obra hecha?</td><td>% avance financiero − % avance físico</td><td>Reporte de las unidades ejecutoras</td><td>Falta el dato</td></tr>
            </tbody>
          </table>
        </div>
        <Fuente>Base legal del límite: Ley 031 Marco de Autonomías, Disposición Transitoria Novena; Ley 2296, art. 3 (citadas en el POA 2026 del municipio).</Fuente>
      </Seccion>

      <Seccion titulo="Umbrales (a validar por Contaduría)">
        <form className="formulario" onSubmit={guardar}>
          <fieldset>
            <legend>S2 · ritmo de ejecución (% del ritmo esperado)</legend>
            <div className="grid-4">
              {campo(s2, setS2, 'amarilloMin', 'Amarillo desde')}
              {campo(s2, setS2, 'verdeMin', 'Verde desde')}
              {campo(s2, setS2, 'verdeMax', 'Verde hasta')}
              {campo(s2, setS2, 'amarilloMax', 'Amarillo hasta')}
            </div>
          </fieldset>
          <fieldset>
            <legend>S1 · uso del límite legal (%)</legend>
            <div className="grid-4">
              {campo(s1, setS1, 'amarillo', 'Amarillo desde')}
              {campo(s1, setS1, 'rojo', 'Rojo sobre')}
              <label>Apertura “ejecutada” desde (% devengado)
                <input type="number" step="0.1" value={ejec} onChange={(e) => setEjec(e.target.value)} />
              </label>
            </div>
          </fieldset>
          <div className="acciones">
            <button className="boton" type="submit">Guardar umbrales</button>
            <button className="boton secundario" type="button" onClick={() => { restaurarParametros(); setMsg('Se restauraron los valores propuestos.'); window.location.reload(); }}>Restaurar valores propuestos</button>
          </div>
          {msg && <p role="status" className="ok">{msg}</p>}
        </form>
      </Seccion>

      <Seccion titulo="Alcance de este piloto">
        <ul className="lista">
          <li>Funciona con datos reales del SIGEP y valida que los totales cuadren antes de usarlos.</li>
          <li>No tiene usuarios ni base de datos en servidor: los datos importados y los umbrales se guardan solo en el navegador donde se cargan.</li>
          <li>El ritmo esperado supone un gasto lineal a lo largo del año, porque todavía no hay programación mensual.</li>
          <li>Para uso continuo en el municipio corresponde la versión completa descrita en la propuesta técnica (usuarios, base de datos, alertas y bitácora).</li>
        </ul>
      </Seccion>
    </>
  );
}
