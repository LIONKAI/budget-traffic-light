import { CalendarDays, Tag, Pencil, Trash2 } from 'lucide-react';
import { formatBs, formatFecha } from '../utils/format';

export default function HistorialGastos({ datos, onEliminarGasto, onEditarGasto }) {
  const gastosOrdenados = [...datos.gastos].sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha)
  );

  const handleEliminar = (gasto) => {
    if (window.confirm(`¿Eliminar el gasto "${gasto.descripcion}" por ${formatBs(gasto.monto)}?`)) {
      onEliminarGasto(gasto.id);
    }
  };

  if (gastosOrdenados.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6 h-full text-center">
        <h2 className="text-base font-semibold text-gray-800 mb-2">Historial de gastos</h2>
        <p className="text-sm text-gray-500">
          Todavía no hay gastos registrados. Agrega uno en el formulario.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Historial de gastos</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Ordenado por fecha descendente
          </p>
        </div>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {gastosOrdenados.length} {gastosOrdenados.length === 1 ? 'registro' : 'registros'}
        </span>
      </div>

      <div className="overflow-x-auto -mx-2 flex-1">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-gray-500 border-b border-gray-100">
              <th className="py-2.5 px-2 font-semibold">Fecha</th>
              <th className="py-2.5 px-2 font-semibold">Categoría</th>
              <th className="py-2.5 px-2 font-semibold">Descripción</th>
              <th className="py-2.5 px-2 text-right font-semibold">Monto</th>
              <th className="py-2.5 px-2 text-right font-semibold w-20">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {gastosOrdenados.map((gasto) => (
              <tr key={gasto.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="py-2.5 px-2 text-gray-600 whitespace-nowrap text-xs">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                    {formatFecha(gasto.fecha)}
                  </span>
                </td>
                <td className="py-2.5 px-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                    <Tag className="w-2.5 h-2.5" />
                    {gasto.categoria}
                  </span>
                </td>
                <td className="py-2.5 px-2 text-gray-700 text-sm">{gasto.descripcion}</td>
                <td className="py-2.5 px-2 text-right font-semibold text-gray-800 whitespace-nowrap text-sm">
                  {formatBs(gasto.monto)}
                </td>
                <td className="py-2.5 px-2 text-right whitespace-nowrap">
                  <div className="inline-flex gap-0.5 opacity-50 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => onEditarGasto(gasto)}
                      className="p-1 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Editar"
                      aria-label={`Editar ${gasto.descripcion}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEliminar(gasto)}
                      className="p-1 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Eliminar"
                      aria-label={`Eliminar ${gasto.descripcion}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
