import React, { useEffect, useMemo, useState } from 'react';
import { cargarDatos, cargarParametros, guardarDatos, guardarParametros, borrarDatos, borrarParametros, datosOficiales } from './store.js';
import { resumen, fechaCorta } from './lib/calc.js';
import Tablero from './pages/Tablero.jsx';
import Programas from './pages/Programas.jsx';
import Programa from './pages/Programa.jsx';
import Fuentes from './pages/Fuentes.jsx';
import Funcionamiento from './pages/Funcionamiento.jsx';
import Importar from './pages/Importar.jsx';
import Reporte from './pages/Reporte.jsx';
import Metodologia from './pages/Metodologia.jsx';

const MENU = [
  ['#/', 'Tablero general'],
  ['#/programas', 'Programas'],
  ['#/funcionamiento', 'Funcionamiento'],
  ['#/fuentes', 'Fuentes'],
  ['#/importar', 'Importar datos'],
  ['#/reporte', 'Reporte'],
  ['#/metodologia', 'Metodología'],
];

function useRuta() {
  const [ruta, setRuta] = useState(() => window.location.hash || '#/');
  useEffect(() => {
    const f = () => {
      setRuta(window.location.hash || '#/');
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);
  return ruta;
}

export default function App() {
  const ruta = useRuta();
  const [datos, setDatos] = useState(cargarDatos);
  const [params, setParams] = useState(cargarParametros);
  const r = useMemo(() => resumen(datos.lineas, datos.meta.corte, params), [datos, params]);

  const ctx = {
    datos, params, r,
    usarDatos: (d) => { setDatos(d); return guardarDatos(d); },
    restaurarDatos: () => { borrarDatos(); setDatos(datosOficiales); },
    cambiarParametros: (p) => { setParams(p); guardarParametros(p); },
    restaurarParametros: () => { borrarParametros(); setParams(cargarParametros()); },
  };

  const [base, sub] = ruta.replace(/^#\/?/, '').split('/');
  let pagina;
  if (!base) pagina = <Tablero {...ctx} />;
  else if (base === 'programas' && sub) pagina = <Programa {...ctx} cod={decodeURIComponent(sub)} />;
  else if (base === 'programas') pagina = <Programas {...ctx} />;
  else if (base === 'funcionamiento') pagina = <Funcionamiento {...ctx} />;
  else if (base === 'fuentes') pagina = <Fuentes {...ctx} />;
  else if (base === 'importar') pagina = <Importar {...ctx} />;
  else if (base === 'reporte') pagina = <Reporte {...ctx} />;
  else if (base === 'metodologia') pagina = <Metodologia {...ctx} />;
  else pagina = <Tablero {...ctx} />;

  const activo = (href) => (href === '#/' ? !base : href.slice(2) === base);

  return (
    <div className="app">
      <a className="saltar" href="#contenido">Ir al contenido</a>
      <nav className="menu" aria-label="Menú principal">
        <a className="marca" href="#/">
          <svg width="22" height="40" viewBox="0 0 22 40" aria-hidden="true">
            <rect x="1" y="1" width="20" height="38" rx="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="11" cy="10" r="4.5" fill="#E2614F" />
            <circle cx="11" cy="20" r="4.5" fill="#E5A83B" />
            <circle cx="11" cy="30" r="4.5" fill="#4CB37A" />
          </svg>
          <span>
            <strong>Semáforo</strong>
            <small>GAM General Saavedra</small>
          </span>
        </a>
        <ul>
          {MENU.map(([href, txt]) => (
            <li key={href}>
              <a href={href} aria-current={activo(href) ? 'page' : undefined}>{txt}</a>
            </li>
          ))}
        </ul>
        <div className="menu-pie">
          <p>Corte de datos</p>
          <strong>{fechaCorta(datos.meta.corte)}</strong>
          <p>{datos.meta.oficial ? 'Datos oficiales cargados' : 'Datos importados en este navegador'}</p>
        </div>
      </nav>
      <main id="contenido" className="contenido">
        {pagina}
        <footer className="pie">
          Piloto académico · Proyecto Integrador Intermedio II · Unifranz · Ingeniería de Sistemas y Contaduría Pública.
          Datos: {datos.meta.fuente}, {datos.meta.archivo}.
        </footer>
      </main>
    </div>
  );
}
