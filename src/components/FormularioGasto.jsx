import { useState } from 'react';
import { PlusCircle, AlertCircle, CheckCircle2 } from 'lucide-react';

const hoyISO = () => new Date().toISOString().split('T')[0];

export default function FormularioGasto({ onAgregarGasto, categorias }) {
  const categoriaInicial = categorias.length > 0 ? categorias[0].nombre : '';

  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState(categoriaInicial);
  const [fecha, setFecha] = useState(hoyISO());
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  const validar = () => {
    const desc = descripcion.trim();
    const montoNum = parseFloat(monto);

    if (!desc) return 'Ingresa una descripción.';
    if (desc.length > 80) return 'La descripción es demasiado larga (máx. 80 caracteres).';
    if (!Number.isFinite(montoNum)) return 'El monto debe ser un número válido.';
    if (montoNum <= 0) return 'El monto debe ser mayor a 0.';
    if (montoNum > 1000000) return 'El monto parece demasiado alto. Revísalo.';
    if (!fecha) return 'La fecha es obligatoria.';
    if (fecha > hoyISO()) return 'La fecha no puede ser futura.';
    if (!categoria) return 'Selecciona una categoría.';
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setExito(false);

    const errorValidacion = validar();
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    onAgregarGasto({
      id: Date.now(),
      fecha,
      categoria,
      descripcion: descripcion.trim(),
      monto: parseFloat(monto),
    });

    setDescripcion('');
    setMonto('');
    setFecha(hoyISO());
    setError('');
    setExito(true);
    setTimeout(() => setExito(false), 1800);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6 h-full">
      <h2 className="text-base font-semibold text-gray-800 mb-1">
        Agregar gasto
      </h2>
      <p className="text-xs text-gray-500 mb-4">
        Registra un movimiento del mes actual
      </p>

      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        <div>
          <label htmlFor="f-desc" className="block text-xs font-medium text-gray-600 mb-1">
            Descripción
          </label>
          <input
            id="f-desc"
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            placeholder="Ej. Fotocopias"
            maxLength={80}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="f-monto" className="block text-xs font-medium text-gray-600 mb-1">
              Monto (Bs.)
            </label>
            <input
              id="f-monto"
              type="number"
              step="0.01"
              min="0"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="0,00"
            />
          </div>
          <div>
            <label htmlFor="f-fecha" className="block text-xs font-medium text-gray-600 mb-1">
              Fecha
            </label>
            <input
              id="f-fecha"
              type="date"
              value={fecha}
              max={hoyISO()}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        <div>
          <label htmlFor="f-cat" className="block text-xs font-medium text-gray-600 mb-1">
            Categoría
          </label>
          <select
            id="f-cat"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            disabled={categorias.length === 0}
          >
            {categorias.length === 0 ? (
              <option value="">Sin categorías</option>
            ) : (
              categorias.map((cat) => (
                <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
              ))
            )}
          </select>
        </div>

        <button
          type="submit"
          className="bg-gray-900 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-gray-800 active:scale-[0.98] transition-all w-full justify-center text-sm font-medium disabled:opacity-50"
          disabled={categorias.length === 0}
        >
          <PlusCircle className="w-4 h-4" />
          Agregar gasto
        </button>
      </form>

      {error && (
        <p className="mt-3 flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </p>
      )}
      {exito && (
        <p className="mt-3 flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          Gasto agregado.
        </p>
      )}
    </div>
  );
}
