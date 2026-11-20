import React, { useState } from 'react';
import { Seccion, Fuente } from '../ui.jsx';
import { leerReporte, validar, matrizDesdeHoja, corteDesdeNombre } from '../lib/parser.js';
import { bs, fechaLarga } from '../lib/calc.js';

const Icono = ({ tipo }) => {
  if (tipo === 'ok') return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E7F4A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10" /></svg>;
  if (tipo === 'aviso') return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9A6505" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3 2 21h20L12 3z" /><path d="M12 10v5" /><path d="M12 18h.01" /></svg>;
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B3261E" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>;
};

export default function Importar({ datos, usarDatos, restaurarDatos }) {
  const [estado, setEstado] = useState('inicio'); // inicio | leyendo | revisado | error
  const [archivo, setArchivo] = useState(null);
  const [rep, setRep] = useState(null);
  const [val, setVal] = useState(null);
  const [corte, setCorte] = useState('');
  const [mensaje, setMensaje] = useState('');

  const elegir = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setArchivo(f);
    setEstado('leyendo');
    setMensaje('');
    try {
      const XLSX = await import('xlsx');
      const wb = XLSX.read(await f.arrayBuffer(), { type: 'array' });
      const filas = matrizDesdeHoja(XLSX, wb.Sheets[wb.SheetNames[0]]);
      const reporte = leerReporte(filas);
      setRep(reporte);
      setVal(validar(reporte));
      setCorte(corteDesdeNombre(f.name));
      setEstado('revisado');
    } catch (err) {
      setEstado('error');
      setMensaje(`No se pudo leer el archivo: ${err.message}. Debe ser el reporte de ejecución de gastos exportado del SIGEP (.xls o .xlsx).`);
    }
  };

  const confirmar = () => {
    const nuevo = {
      meta: {
        corte,
        archivo: archivo.name,
        entidad: rep.entidad,
        fuente: 'Reporte SIGEP de ejecución presupuestaria de gastos',
        oficial: false,
      },
      totalGeneral: rep.totalGeneral,
      lineas: rep.lineas,
    };
    const persistio = usarDatos(nuevo);
    setMensaje(persistio
      ? `Listo: el tablero ya muestra el corte al ${fechaLarga(corte)}. Los datos quedan guardados en este navegador.`
      : `Listo: el tablero ya muestra el corte al ${fechaLarga(corte)}. Este navegador no permite guardarlos; se perderán al cerrar la página.`);
    setEstado('inicio');
    setRep(null);
    setVal(null);
  };

  const cuenta = (k) => (rep ? new Set(rep.lineas.map(k)).size : 0);

  return (
    <>
      <header className="cab">
        <div>
          <p className="ante"><a href="#/">Tablero</a> / Importar datos</p>
          <h1>Importar un nuevo corte del SIGEP</h1>
          <p className="sub">Sube el reporte de ejecución de gastos tal como sale del SIGEP. El sistema lo revisa antes de usarlo.</p>
        </div>
      </header>

      <Seccion titulo="Datos en uso">
        <p className="texto">
          Corte al <strong>{fechaLarga(datos.meta.corte)}</strong> · {datos.lineas.length} líneas · archivo {datos.meta.archivo}
          {datos.meta.oficial ? ' (datos oficiales del piloto).' : ' (importado en este navegador).'}
        </p>
        {!datos.meta.oficial && (
          <button className="boton secundario" type="button" onClick={() => { restaurarDatos(); setMensaje('Se restauraron los datos oficiales del piloto.'); }}>
            Restaurar datos oficiales
          </button>
        )}
        {mensaje && <p role="status" className="ok">{mensaje}</p>}
      </Seccion>

      <Seccion titulo="1. Elige el archivo">
        <label className="subir">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z" /><path d="M14 3v5h5" /><path d="M12 11v6M9 14l3-3 3 3" /></svg>
          <span>{archivo ? archivo.name : 'Seleccionar reporte .xls o .xlsx'}</span>
          <input type="file" accept=".xls,.xlsx" onChange={elegir} />
        </label>
        {estado === 'leyendo' && <p role="status">Leyendo el archivo…</p>}
        {estado === 'error' && <p role="alert" className="error">{mensaje}</p>}
      </Seccion>

      {estado === 'revisado' && rep && val && (
        <Seccion titulo="2. Revisión del archivo">
          <div className="grid-4 conteos">
            <div><strong>{rep.lineas.length}</strong><span>líneas de gasto</span></div>
            <div><strong>{cuenta((l) => l.cat)}</strong><span>aperturas programáticas</span></div>
            <div><strong>{cuenta((l) => `${l.ff}/${l.of}`)}</strong><span>fuentes y organismos</span></div>
            <div><strong>{cuenta((l) => l.ue)}</strong><span>unidades ejecutoras</span></div>
          </div>
          <ul className="revision">
            {val.ok.map((m) => <li key={m}><Icono tipo="ok" /><span>{m}</span></li>)}
            {val.avisos.map((m) => <li key={m}><Icono tipo="aviso" /><span>{m}</span></li>)}
            {val.errores.map((m) => <li key={m}><Icono tipo="error" /><span>{m}</span></li>)}
          </ul>
          <form className="formulario" onSubmit={(e) => { e.preventDefault(); confirmar(); }}>
            <label>Fecha de corte del reporte
              <input type="date" required value={corte} onChange={(e) => setCorte(e.target.value)} />
            </label>
            <div className="acciones">
              <button className="boton" type="submit" disabled={val.errores.length > 0 || !corte}>
                Usar estas {bs(rep.lineas.length)} líneas
              </button>
              <button className="boton secundario" type="button" onClick={() => { setEstado('inicio'); setRep(null); setArchivo(null); }}>Cancelar</button>
            </div>
            {val.errores.length > 0 && <p className="error">Corrige los errores antes de importar: el reporte no cuadra.</p>}
          </form>
        </Seccion>
      )}

      <Fuente>El archivo se procesa dentro del navegador; no se envía a ningún servidor. En esta versión piloto los datos importados quedan solo en el equipo donde se cargan.</Fuente>
    </>
  );
}
