# 🚦 Semáforo Presupuestario

> Aplicación web interactiva para el control y monitoreo de las finanzas personales, con un sistema visual tipo semáforo y **predicción dinámica del cierre de mes** mediante el método de Runge-Kutta de cuarto orden (RK4).

Proyecto interdisciplinario desarrollado en conjunto entre las carreras de **Contaduría Pública** e **Ingeniería de Sistemas** de la Universidad Privada Franz Tamayo, con el respaldo matemático de la asignatura de **Métodos Numéricos**.

---

## ✨ Características principales

- **Semáforo visual** que clasifica el nivel de ejecución del presupuesto en tres estados:
  - 🟢 **Verde** — bajo control (ejecución < 61%)
  - 🟡 **Amarillo** — cerca del límite (61% – 85%)
  - 🔴 **Rojo** — excediendo (≥ 86%)
- **Glow ambiental**: los bordes de la pantalla se iluminan suavemente con el color del estado actual, en estado rojo con un sutil efecto de pulso.
- **Predicción a fin de mes** calculada en tiempo real mediante integración numérica del método de Runge-Kutta de 4° orden:
  - Tasa promedio diaria + pendiente atenuada
  - Día estimado de agotamiento del presupuesto
  - Gráfico comparativo de gasto real vs. proyección
- **Gestión completa de gastos**: agregar, editar y eliminar movimientos con validaciones estrictas.
- **Presupuesto mensual editable** desde el dashboard.
- **Persistencia automática** en `localStorage` (los datos sobreviven a recargas).
- **Diseño responsive y profesional** con layout de dashboard ejecutivo en pantallas grandes.
- **Formato de moneda boliviano** (`1.200,00 Bs.`) y fechas en español.

---

## 🧮 Sobre el modelo predictivo

El módulo de predicción modela la evolución del gasto acumulado *G(t)* mediante una ecuación diferencial ordinaria:

```
dG/dt = r(t) = r₀ + m·(t − t_hoy)
```

donde:

- **r₀** es la tasa promedio diaria de los últimos 7 días.
- **m** es la pendiente estimada por regresión lineal sobre las tasas diarias (atenuada al 50%).

La EDO se integra de forma numérica desde el día actual hasta el último día del mes utilizando el clásico esquema de **Runge-Kutta de cuarto orden**:

```
k₁ = f(t, y)
k₂ = f(t + h/2, y + h·k₁/2)
k₃ = f(t + h/2, y + h·k₂/2)
k₄ = f(t + h,   y + h·k₃)

y_{n+1} = y_n + (h/6)·(k₁ + 2k₂ + 2k₃ + k₄)
```

con paso de integración `h = 0.25 días`.

---

## 🛠 Stack tecnológico

| Componente       | Tecnología                                          |
|------------------|-----------------------------------------------------|
| Framework UI     | React 19                                            |
| Build tool       | Vite 8                                              |
| Estilos          | Tailwind CSS 3                                      |
| Iconografía      | lucide-react                                        |
| Visualización    | recharts 3 (gráficos SVG)                           |
| Persistencia     | Web Storage API (`localStorage`)                    |
| Calidad de código| ESLint 10 con plugins de React Hooks y React Refresh|

---

## 📂 Estructura del proyecto

```
src/
├── App.jsx                      # Componente raíz, estado global, layout
├── main.jsx                     # Punto de entrada
├── index.css                    # Estilos base (Tailwind)
├── components/
│   ├── Dashboard.jsx            # Semáforo + KPIs + barra de progreso
│   ├── FormularioGasto.jsx      # Alta de movimientos
│   ├── HistorialGastos.jsx      # Tabla con editar/eliminar
│   ├── EditarGastoModal.jsx     # Modal de edición
│   ├── PrediccionRK.jsx         # Tarjeta de predicción + gráfico
│   └── GlowOverlay.jsx          # Efecto luminoso de los bordes
├── hooks/
│   └── useLocalStorage.js       # Hook de persistencia tolerante a errores
├── utils/
│   ├── semaforo.js              # Lógica única del semáforo (color, estado, texto)
│   ├── rungeKutta.js            # RK4 genérico + predictor de presupuesto
│   └── format.js                # Formateadores Bs. y fechas en español
└── data/
    └── mockData.js              # Datos de arranque (solo si no hay localStorage)
```

---

## 🚀 Cómo ejecutar el proyecto

### Opción 1: demo en vivo

👉 https://sem-foro-presupuestario.vercel.app/

### Opción 2: ejecución local

**Prerrequisitos:** Git y Node.js 18 o superior.

```bash
# 1. Clonar el repositorio
git clone https://github.com/LIONKAI/budget-traffic-light.git
cd budget-traffic-light

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo
npm run dev
```

Abrir [http://localhost:5173](http://localhost:5173) en el navegador.

### Otros comandos útiles

```bash
npm run build      # Compila la versión de producción en dist/
npm run preview    # Previsualiza el build de producción
npm run lint       # Ejecuta ESLint sobre el código fuente
```

---

## 📄 Informe del proyecto

El documento `Informe_Semaforo_Presupuestario.docx` contiene el informe académico completo del proyecto: planteamiento del problema, marco teórico (incluyendo el desarrollo formal del método de Runge-Kutta), metodología, implementación, resultados numéricos y conclusiones.

---

## 👥 Créditos

- **Autor principal:** Rolando Raúl Gutiérrez — Universidad Privada Franz Tamayo
- **Carreras involucradas:** Contaduría Pública e Ingeniería de Sistemas
- **Asignatura de respaldo:** Métodos Numéricos
- **Gestión:** 2026

---

## 📜 Licencia

Este proyecto se distribuye bajo los términos descritos en el archivo [LICENSE](./LICENSE).
