# Semáforo Presupuestario · GAM General Saavedra

Piloto académico (Proyecto Integrador Intermedio II, Unifranz) que muestra la ejecución del gasto del municipio con indicadores semafóricos, a partir del reporte de ejecución presupuestaria de gastos del SIGEP.

## Usuarios de prueba
| Usuario | Contraseña | Rol | Puede |
| --- | --- | --- | --- |
| finanzas | Finanzas2026 | Administrador | Ver todo, importar reportes, ajustar umbrales y base del límite |
| consulta | Consulta2026 | Consulta | Ver tableros, programas y reportes |

Es un acceso de demostración (usuarios definidos en `src/auth.js`, contraseñas en SHA-256); no es seguridad real.

## Qué hace
- **Tablero general**: presupuesto vigente, devengado, ritmo de ejecución (S2), límite de funcionamiento (S1 estimado), aperturas sin ejecución y top 10 de programas.
- **Programas**: los 26 programas con buscador; detalle por proyecto/actividad y por partida.
- **Funcionamiento**: uso del límite legal del 25 % (Ley 031) con base editable.
- **Fuentes**: ejecución por fuente y organismo financiador.
- **Importar datos**: carga un nuevo reporte .xls del SIGEP, valida totales y lo usa en el navegador.
- **Reporte**: informe imprimible o en PDF.
- **Metodología**: fórmulas y umbrales editables.

Colores: “Rojo · atrasado” / “Rojo · adelantado” indican el sentido del desvío. Una actividad al 100 % antes de diciembre se marca **Agotado** (se quedó sin presupuesto); un proyecto al 100 %, **Ejecutado**.

Datos incluidos: ejecución de gastos al 31/10/2026 (954 líneas, vigente Bs 43.567.402,58; devengado Bs 26.289.031,19).

## Publicar en Vercel
1. Sube esta carpeta a un repositorio de GitHub (sin `node_modules` ni `dist`).
2. En vercel.com: **Add New → Project**, importa el repositorio.
3. Vercel detecta Vite solo (`npm run build`, salida `dist`). Pulsa **Deploy**.

También con la CLI: `npm i -g vercel` y luego `vercel --prod` dentro de la carpeta.

## Probar en local
```
npm install
npm run dev
```

## Actualizar los datos oficiales
```
npm run datos -- "ruta/EJECUCION_PRESUPUESTARIA__AL_DD-MM-AAAA.xls"
```
Regenera `src/data/oficial.json`. Luego vuelve a publicar.

## Límites del piloto
- Sin usuarios ni base de datos en servidor: lo importado se guarda solo en el navegador.
- S3 (recaudación) y S4 (avance físico) esperan datos del municipio.
- El ritmo esperado supone gasto lineal (no hay programación mensual).
