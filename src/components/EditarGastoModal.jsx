import { useEffect, useState } from 'react';
import { Save, X } from 'lucide-react';

/**
 * Modal de edición de un gasto.
 * - Bloquea el scroll del body mientras está abierto.
 * - Cierra con Escape o clic en el backdrop.
 * - Reusa las mismas reglas de validación que el formulario de alta.
 */
export default function EditarGastoModal({ gasto, categorias, onGuardar, onCerrar }) {
  const [descripcion, setDescripcion] = useState(gasto.descripcion);
  const [monto, setMonto] = useState(String(gasto.monto));
  const [categoria, setCategoria] = useState(gasto.categoria);
  const [fecha, setFecha] = useState(gasto.fecha);
  const [error, setError] = useState('');

  // Cerrar con Escape + bloquear scroll del body.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onCerrar();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onCerrar]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const montoNum = parseFloat(monto);

    if (!descripcion.trim()) return setError('La descripción no puede estar vacía.');
    if (!Number.isFinite(montoNum) || montoNum <= 0) return setError('El monto debe ser mayor a 0.');
    if (!fecha) return setError('La fecha es obligatoria.');

    onGuardar({
      ...gasto,
      descripcion: descripcion.trim(),
      monto: montoNum,
      categoria,
      fecha,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onCerrar}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 border-b pb-3">
          <h2 id="modal-title" className="text-xl font-bold text-gray-800">
            Editar Gasto
          </h2>
          <button
            type="button"
            onClick={onCerrar}
            className="p-1 rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-100"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="ed-desc" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <input
              id="ed-desc"
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="ed-monto" className="block text-sm font-medium text-gray-700 mb-1">
                Monto (Bs.)
              </label>
              <input
                id="ed-monto"
                type="number"
                step="0.01"
                min="0"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="ed-fecha" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha
              </label>
              <input
                id="ed-fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="ed-cat" className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              id="ed-cat"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {categorias.map((c) => (
                <option key={c.id} value={c.nombre}>{c.nombre}</option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCerrar}
              className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
