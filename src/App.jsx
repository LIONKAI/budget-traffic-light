import { useState, useMemo } from 'react';
import { initialData } from './data/mockData';
import { useLocalStorage } from './hooks/useLocalStorage';
import { calcularPorcentaje, getEstadoSemaforo } from './utils/semaforo';
import Dashboard from './components/Dashboard';
import HistorialGastos from './components/HistorialGastos';
import FormularioGasto from './components/FormularioGasto';
import EditarGastoModal from './components/EditarGastoModal';
import GlowOverlay from './components/GlowOverlay';
import PrediccionRK from './components/PrediccionRK';

const STORAGE_KEY = 'semaforo-presupuestario:v1';

function App() {
  const [datos, setDatos] = useLocalStorage(STORAGE_KEY, initialData);
  const [gastoEnEdicion, setGastoEnEdicion] = useState(null);

  const estadoGlobal = useMemo(() => {
    const { porcentaje } = calcularPorcentaje(datos);
    return getEstadoSemaforo(porcentaje);
  }, [datos]);

  const handleAgregarGasto = (nuevoGasto) => {
    setDatos((prev) => ({ ...prev, gastos: [nuevoGasto, ...prev.gastos] }));
  };

  const handleEliminarGasto = (id) => {
    setDatos((prev) => ({ ...prev, gastos: prev.gastos.filter((g) => g.id !== id) }));
  };

  const handleGuardarEdicion = (gastoEditado) => {
    setDatos((prev) => ({
      ...prev,
      gastos: prev.gastos.map((g) => (g.id === gastoEditado.id ? gastoEditado : g)),
    }));
    setGastoEnEdicion(null);
  };

  const handleActualizarIngreso = (nuevoIngreso) => {
    setDatos((prev) => ({ ...prev, ingresoTotal: nuevoIngreso }));
  };

  const handleReiniciar = () => {
    if (window.confirm('¿Reiniciar la app a los datos de ejemplo? Se perderán tus gastos guardados.')) {
      setDatos(initialData);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Glow de bordes — debajo de todo, no captura clicks */}
      <GlowOverlay glowRgba={estadoGlobal.glowRgba} estado={estadoGlobal.estado} />

      {/* Contenido principal */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-6 lg:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
              🚦 Semáforo Presupuestario
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Control inteligente de tus finanzas mensuales
            </p>
          </div>
          <button
            onClick={handleReiniciar}
            className="text-xs text-gray-500 hover:text-red-600 transition-colors hover:underline"
            title="Borra todos los datos guardados y vuelve al ejemplo inicial"
          >
            Reiniciar datos
          </button>
        </header>

        {/* Fila 1: Dashboard + Predicción */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 mb-4 lg:mb-6">
          <div className="lg:col-span-5">
            <Dashboard datos={datos} onActualizarIngreso={handleActualizarIngreso} />
          </div>
          <div className="lg:col-span-7">
            <PrediccionRK datos={datos} />
          </div>
        </div>

        {/* Fila 2: Formulario + Historial */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          <div className="lg:col-span-4">
            <FormularioGasto
              onAgregarGasto={handleAgregarGasto}
              categorias={datos.categorias}
            />
          </div>
          <div className="lg:col-span-8">
            <HistorialGastos
              datos={datos}
              onEliminarGasto={handleEliminarGasto}
              onEditarGasto={(gasto) => setGastoEnEdicion(gasto)}
            />
          </div>
        </div>

        {/* Footer discreto con la cita académica */}
        <footer className="mt-10 pt-6 border-t border-gray-200/60 text-center">
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Proyección estimada mediante integración numérica del{' '}
            <span className="text-gray-500">método de Runge-Kutta de cuarto orden (RK4)</span>{' '}
            aplicado a la tasa de gasto diaria observada.
          </p>
          <p className="text-[10px] text-gray-300 mt-1.5">
            Los resultados son una proyección y pueden variar según tu comportamiento futuro.
          </p>
        </footer>
      </div>

      {gastoEnEdicion && (
        <EditarGastoModal
          gasto={gastoEnEdicion}
          categorias={datos.categorias}
          onGuardar={handleGuardarEdicion}
          onCerrar={() => setGastoEnEdicion(null)}
        />
      )}
    </div>
  );
}

export default App;
