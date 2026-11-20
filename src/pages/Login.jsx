import React, { useState } from 'react';
import { iniciarSesion } from '../auth.js';

export default function Login({ onEntrar }) {
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError('');
    const s = await iniciarSesion(usuario, clave);
    setEnviando(false);
    if (s) onEntrar(s);
    else setError('Usuario o contraseña incorrectos.');
  };

  return (
    <div className="login">
      <div className="login-caja">
        <div className="login-marca">
          <svg width="28" height="50" viewBox="0 0 22 40" aria-hidden="true">
            <rect x="1" y="1" width="20" height="38" rx="10" fill="#17221D" />
            <circle cx="11" cy="10" r="4.5" fill="#E2614F" />
            <circle cx="11" cy="20" r="4.5" fill="#E5A83B" />
            <circle cx="11" cy="30" r="4.5" fill="#4CB37A" />
          </svg>
          <div>
            <h1>Semáforo Presupuestario</h1>
            <p>Gobierno Autónomo Municipal de General Saavedra</p>
          </div>
        </div>
        <form className="formulario" onSubmit={enviar}>
          <label>Usuario
            <input autoComplete="username" value={usuario} onChange={(e) => setUsuario(e.target.value)} required />
          </label>
          <label>Contraseña
            <input type="password" autoComplete="current-password" value={clave} onChange={(e) => setClave(e.target.value)} required />
          </label>
          <button className="boton" type="submit" disabled={enviando}>{enviando ? 'Verificando…' : 'Ingresar'}</button>
          {error && <p role="alert" className="error">{error}</p>}
        </form>
        <div className="login-nota">
          <p><strong>Usuarios de prueba</strong></p>
          <p><code>finanzas</code> / <code>Finanzas2026</code>: Administrador. Importa datos y ajusta umbrales.</p>
          <p><code>consulta</code> / <code>Consulta2026</code>: Consulta. Solo ve tableros y reportes.</p>
          <p className="tenue">Piloto académico: acceso de demostración, no es un sistema de seguridad real.</p>
        </div>
      </div>
    </div>
  );
}
