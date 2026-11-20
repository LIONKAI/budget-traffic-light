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
import Login from './pages/Login.jsx';
import { sesionActual, cerrarSesion, puede, ROLES } from './auth.js';

const MENU = [
  ['#/', 'Tablero general'],
  ['#/programas', 'Programas'],
  ['#/funcionamiento', 'Funcionamiento'],
  ['#/fuentes', 'Fuentes'],
  ['#/importar', 'Importar datos', 'importar'],
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
  const [sesion, setSesion] = useState(sesionActual);
  if (!sesion) return <Login onEntrar={setSesion} />;
  return <Sistema sesion={sesion} salir={() => { cerrarSesion(); setSesion(null); window.location.hash = '#/'; }} />;
}

function Sistema({ sesion, salir }) {
  const ruta = useRuta();
  const [datos, setDatos] = useState(cargarDatos);
  const [params, setParams] = useState(cargarParametros);
  const r = useMemo(() => resumen(datos.lineas, datos.meta.corte, params), [datos, params]);

  const ctx = {
    datos, params, r, sesion,
    puede: (permiso) => puede(sesion, permiso),
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
  else if (base === 'importar') pagina = puede(sesion, 'importar') ? <Importar {...ctx} /> : <SinPermiso />;
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
          {MENU.filter(([, , permiso]) => !permiso || puede(sesion, permiso)).map(([href, txt]) => (
            <li key={href}>
              <a href={href} aria-current={activo(href) ? 'page' : undefined}>{txt}</a>
            </li>
          ))}
        </ul>
        <div className="menu-usuario">
          <p>{sesion.nombre}</p>
          <small>{ROLES[sesion.rol].nombre}</small>
          <button type="button" onClick={salir}>Cerrar sesión</button>
        </div>
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

function SinPermiso() {
  return (
    <header className="cab">
      <div>
        <p className="ante"><a href="#/">Tablero</a></p>
        <h1>Esta sección es solo para el rol Administrador</h1>
        <p className="sub">Tu usuario tiene permiso de consulta. Pide a la Dirección de Finanzas que cargue los datos.</p>
      </div>
    </header>
  );
}
