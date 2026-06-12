import { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { formatBs } from '../utils/format';
import { getEstadoSemaforo } from '../utils/semaforo';

/**
 * Dashboard compacto, pensado para columna izquierda del layout amplio.
 * Stack vertical: semáforo grande arriba + 3 KPIs apiladas + barra de progreso.
 */
export default function Dashboard({ datos, onActualizarIngreso }) {
  const ingresoTotal = Number(datos.ingresoTotal) || 0;
  const gastoTotal = datos.gastos.reduce((acc, g) => acc + Number(g.monto || 0), 0);

  const saldoDisponible = ingresoTotal - gastoTotal;
  const porcentaje = ingresoTotal > 0 ? (gastoTotal / ingresoTotal) * 100 : 0;
  const porcentajeTexto = porcentaje.toFixed(1);

  const estado = getEstadoSemaforo(porcentaje);

  const [editandoIngreso, setEditandoIngreso] = useState(false);
  const [borradorIngreso, setBorradorIngreso] = useState(String(ingresoTotal));

  const abrirEdicion = () => {
    setBorradorIngreso(String(ingresoTotal));
    setEditandoIngreso(true);
  };

  const confirmarEdicion = () => {
    const valor = parseFloat(borradorIngreso);
    if (Number.isFinite(valor) && valor >= 0) {
      onActualizarIngreso(valor);
    }
    setEditandoIngreso(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6 h-full flex flex-col">
      {/* Semáforo y estado */}
      <div className="flex flex-col items-center text-center pb-5 mb-5 border-b border-gray-100">
        <div className="relative">
          <div
            className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full ${estado.colorClass} shadow-lg flex items-center justify-center transition-colors duration-700`}
            style={{ boxShadow: `0 0 40px ${estado.glowRgba}` }}
            aria-label={`Porcentaje de ejecución: ${porcentajeTexto}%`}
          >
            <span className="text-white text-2xl sm:text-3xl font-bold">
              {porcentajeTexto}%
            </span>
          </div>
        </div>
        <p className="text-sm font-medium text-gray-700 mt-4 max-w-[14rem]">
          {estado.texto}
        </p>

        {/* Barra de progreso */}
        <div className="w-full mt-4 bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full ${estado.colorClass} transition-all duration-700`}
            style={{ width: `${Math.min(porcentaje, 100)}%` }}
          />
        </div>
      </div>

      {/* KPIs apilados */}
      <div className="space-y-3 flex-1">
        {/* Presupuesto editable */}
        <div className="bg-gray-50/70 rounded-xl p-3.5 ring-1 ring-gray-100 group">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
            Presupuesto mensual
          </p>
          {editandoIngreso ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                step="0.01"
                min="0"
                value={borradorIngreso}
                onChange={(e) => setBorradorIngreso(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmarEdicion();
                  if (e.key === 'Escape') setEditandoIngreso(false);
                }}
                className="flex-1 text-lg font-bold border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                type="button"
                onClick={confirmarEdicion}
                className="p-1 text-green-600 hover:bg-green-50 rounded"
                aria-label="Guardar presupuesto"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setEditandoIngreso(false)}
                className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                aria-label="Cancelar edición"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={abrirEdicion}
              className="inline-flex items-center gap-2 text-lg font-bold text-gray-800 hover:text-blue-600 transition-colors"
              title="Editar presupuesto mensual"
            >
              {formatBs(ingresoTotal)}
              <Pencil className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>

        <div className="bg-gray-50/70 rounded-xl p-3.5 ring-1 ring-gray-100">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
            Gasto ejecutado
          </p>
          <p className="text-lg font-bold text-gray-800">{formatBs(gastoTotal)}</p>
        </div>

        <div className="bg-gray-50/70 rounded-xl p-3.5 ring-1 ring-gray-100">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
            Saldo disponible
          </p>
          <p className={`text-lg font-bold ${saldoDisponible < 0 ? 'text-red-500' : 'text-green-600'}`}>
            {formatBs(saldoDisponible)}
          </p>
        </div>
      </div>
    </div>
  );
}
