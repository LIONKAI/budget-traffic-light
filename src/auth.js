// Inicio de sesión de PRUEBA para el piloto.
// Los usuarios están definidos aquí y la sesión vive en el navegador: sirve para demostrar
// los roles, no es seguridad real. La versión de producción usará autenticación en servidor.

export const ROLES = {
  administrador: {
    nombre: 'Administrador (Finanzas)',
    permisos: ['ver', 'importar', 'editarUmbrales', 'editarBase'],
  },
  consulta: {
    nombre: 'Consulta (autoridades)',
    permisos: ['ver'],
  },
};

// Contraseñas guardadas como SHA-256, no en texto plano.
const USUARIOS = [
  { usuario: 'finanzas', nombre: 'Dirección de Finanzas', rol: 'administrador', hash: '26f03380b664d8099968b7cd23daeb6e089f3eb0eeb39d225a495888d78c5f81' },
  { usuario: 'consulta', nombre: 'Usuario de consulta', rol: 'consulta', hash: '8123c283e4d6fb72777fa21f3442fb90eb9f2d5c894c8802e6e280af8e297436' },
];

const K = 'semaforo.sesion.v1';

async function sha256(texto) {
  const datos = new TextEncoder().encode(texto);
  const buf = await crypto.subtle.digest('SHA-256', datos);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function iniciarSesion(usuario, clave) {
  const u = USUARIOS.find((x) => x.usuario === String(usuario).trim().toLowerCase());
  if (!u) return null;
  if ((await sha256(clave)) !== u.hash) return null;
  const sesion = { usuario: u.usuario, nombre: u.nombre, rol: u.rol, desde: new Date().toISOString() };
  try { window.sessionStorage.setItem(K, JSON.stringify(sesion)); } catch { /* sin almacenamiento: la sesión dura hasta recargar */ }
  return sesion;
}

export function sesionActual() {
  try {
    const s = JSON.parse(window.sessionStorage.getItem(K) || 'null');
    return s && ROLES[s.rol] ? s : null;
  } catch {
    return null;
  }
}

export function cerrarSesion() {
  try { window.sessionStorage.removeItem(K); } catch { /* nada que limpiar */ }
}

export const puede = (sesion, permiso) => !!sesion && ROLES[sesion.rol].permisos.includes(permiso);
