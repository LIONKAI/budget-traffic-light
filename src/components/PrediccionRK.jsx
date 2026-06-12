import { useMemo } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, Legend,
} from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle2, LineChart as LineIcon } from 'lucide-react';
import { predecirPresupuestoRK4 } from '../utils/rungeKutta';
import { getEstadoSemaforo } from '../utils/semaforo';
import { formatBs } from '../utils/format';

/**
 * Predicción del presupuesto a fin de mes.
 * La cita al método de integración numérica vive en el footer global de la app.
 */
export default function PrediccionRK({ datos }) {
  const pred = useMemo(() => predecirPresupuestoRK4(datos), [datos]);

  const ingreso = Number(datos.ingresoTotal) || 0;
  const porcentajeProyectado = ingreso > 0 ? (pred.gastoProyectadoFinMes / ingreso) * 100 : 0;
  const estado = getEstadoSemaforo(porcentajeProyectado);

  if (pred.diaHoy === 0 || pred.gastoActual === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6 h-full">
        <h2 className="text-base font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <LineIcon className="w-4 h-4 text-gray-500" />
          Proyección a fin de mes
        </h2>
        <p className="text-sm text-gray-500">
          Registra al menos un gasto del mes para activar la proyección.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <LineIcon className="w-4 h-4 text-gray-500" />
            Proyección a fin de mes
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Estimación dinámica según tu ritmo de gasto reciente
          </p>
        </div>
        <span
          className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
          style={{ backgroundColor: `${estado.colorHex}15`, color: estado.colorHex }}
        >
          {estado.estado}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-5">
        <Tarjeta
          icon={<TrendingUp className="w-3.5 h-3.5" />}
          label="Tasa diaria"
          value={`${formatBs(pred.tasaPromedio)}`}
          sub="por día"
        />
        <Tarjeta
          icon={<LineIcon className="w-3.5 h-3.5" />}
          label="Gasto proyectado"
          value={formatBs(pred.gastoProyectadoFinMes)}
          sub={`día ${pred.diasTotales}`}
          highlight={estado.colorHex}
        />
        <Tarjeta
          icon={pred.excederaPresupuesto
            ? <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            : <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />}
          label={pred.excederaPresupuesto ? 'Exceso estimado' : 'Holgura estimada'}
          value={formatBs(
            pred.excederaPresupuesto
              ? pred.excesoEstimado
              : Math.max(0, ingreso - pred.gastoProyectadoFinMes)
          )}
        />
        <Tarjeta
          icon={<AlertTriangle className="w-3.5 h-3.5 text-gray-500" />}
          label="Agotamiento"
          value={pred.diaAgotamiento ? `Día ${pred.diaAgotamiento}` : '—'}
          sub={pred.diaAgotamiento ? `de ${pred.diasTotales}` : 'no se agota'}
        />
      </div>

      <div className="flex-1 min-h-[260px]">
        <ResponsiveContainer>
          <LineChart data={pred.serie} margin={{ top: 5, right: 18, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="dia"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              label={{ value: 'Día del mes', position: 'insideBottom', offset: -2, fontSize: 10, fill: '#9ca3af' }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
            />
            <Tooltip
              formatter={(v) => (v == null ? '—' : formatBs(v))}
              labelFormatter={(d) => `Día ${d}`}
              contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e5e7eb' }}
            />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} iconType="line" />
            <ReferenceLine
              y={ingreso}
              stroke="#94a3b8"
              strokeDasharray="4 4"
              label={{ value: 'Presupuesto', fontSize: 10, fill: '#94a3b8', position: 'insideTopRight' }}
            />
            <ReferenceLine
              x={pred.diaHoy}
              stroke="#cbd5e1"
              strokeDasharray="2 2"
              label={{ value: 'Hoy', fontSize: 10, fill: '#94a3b8', position: 'insideTop' }}
            />
            <Line
              type="monotone"
              dataKey="real"
              name="Gasto real"
              stroke="#1f2937"
              strokeWidth={2.5}
              dot={false}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="proyectado"
              name="Proyección"
              stroke={estado.colorHex}
              strokeWidth={2.5}
              strokeDasharray="6 4"
              dot={false}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Tarjeta({ icon, label, value, sub, highlight }) {
  return (
    <div className="bg-gray-50/70 rounded-xl p-3 ring-1 ring-gray-100">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-gray-500 mb-1">
        {icon}<span>{label}</span>
      </div>
      <p
        className="text-sm font-bold leading-tight"
        style={highlight ? { color: highlight } : { color: '#1f2937' }}
      >
        {value}
      </p>
      {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}
