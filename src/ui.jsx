import React from 'react';
import { ETIQUETA, pct } from './lib/calc.js';

export function Estado({ estado, texto }) {
  return (
    <span className={`estado estado-${estado}`}>
      <span className="punto" aria-hidden="true" />
      {texto || ETIQUETA[estado] || estado}
    </span>
  );
}

/** Barra de ejecución con marca del avance esperado. */
export function Barra({ valor, esperado, estado, etiqueta }) {
  const v = Math.max(0, Math.min(100, valor));
  return (
    <div className="barra" role="img" aria-label={etiqueta || `${pct(valor)} ejecutado; esperado ${pct(esperado)}`}>
      <div className={`barra-relleno fondo-${estado}`} style={{ width: `${v}%` }} />
      {esperado != null && <div className="barra-marca" style={{ left: `${Math.min(100, esperado)}%` }} />}
    </div>
  );
}

export function Kpi({ titulo, valor, nota, estado }) {
  return (
    <div className={`kpi ${estado ? `kpi-${estado}` : ''}`}>
      <p className="kpi-titulo">{titulo}</p>
      <p className="kpi-valor">{valor}</p>
      {nota && <p className="kpi-nota">{nota}</p>}
    </div>
  );
}

export function Semaforo({ codigo, nombre, estado, detalle, nota }) {
  return (
    <div className={`sem sem-${estado}`}>
      <div className="sem-luz" aria-hidden="true">
        <span className={estado === 'rojo' ? 'on rojo' : ''} />
        <span className={estado === 'amarillo' ? 'on amarillo' : ''} />
        <span className={estado === 'verde' ? 'on verde' : ''} />
      </div>
      <div>
        <p className="sem-nombre"><strong>{codigo}</strong> · {nombre}</p>
        <p className="sem-detalle">
          <Estado estado={estado} /> {detalle}
        </p>
        {nota && <p className="sem-nota">{nota}</p>}
      </div>
    </div>
  );
}

export function Seccion({ titulo, accion, children, id }) {
  return (
    <section className="panel" id={id} aria-label={titulo}>
      {(titulo || accion) && (
        <div className="panel-cab">
          {titulo && <h2>{titulo}</h2>}
          {accion}
        </div>
      )}
      {children}
    </section>
  );
}

export function Fuente({ children }) {
  return <p className="fuente">{children}</p>;
}
