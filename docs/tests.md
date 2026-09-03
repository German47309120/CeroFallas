# CeroFallas — Registro de pruebas

## PRUEBA P-001 — Build de producción del prototipo

Fecha: 2026-09-02

Función: Construcción React/Vite.

Datos utilizados: Código fuente sin conexión a Firebase.

Resultado esperado: Vite genera `dist/` sin errores.

Resultado obtenido: Build exitoso; 30 módulos transformados.

Estado: APROBADA TÉCNICAMENTE.

Evidencia: Salida de `npm run build`; `dist/index.html` y recursos generados.

## PRUEBA P-002 — Dashboard en escritorio

Fecha: 2026-09-02

Función: Interfaz responsive y navegación principal.

Datos utilizados: Estados demostrativos sin registros.

Resultado esperado: Sidebar visible, encabezado, cuatro indicadores y dos paneles sin desbordamiento evidente.

Resultado obtenido: Pantalla renderizada correctamente en el navegador integrado.

Estado: APROBADA TÉCNICAMENTE.

Evidencia: Inspección DOM y captura visual durante la sesión de desarrollo.

## PRUEBA P-003 — Dashboard y menú móvil

Fecha: 2026-09-02

Función: Responsive a 390 × 844 px.

Datos utilizados: Estados demostrativos.

Resultado esperado: Navegación colapsada, menú accesible, tarjetas legibles y acción principal utilizable.

Resultado obtenido: El menú se abrió correctamente y los indicadores se organizaron en dos columnas.

Estado: APROBADA TÉCNICAMENTE.

Evidencia: Captura visual e inspección DOM.

## PRUEBA P-004 — Navegación a Correctivos

Fecha: 2026-09-02

Función: Ruta SPA `/correctivos`.

Datos utilizados: Prototipo local.

Resultado esperado: El enlace abre el módulo y cierra visualmente el menú móvil.

Resultado obtenido: URL y título cambiaron a Correctivos; la vista apareció correctamente; cero errores de consola registrados.

Estado: APROBADA TÉCNICAMENTE.

Evidencia: URL `http://127.0.0.1:5173/correctivos`, encabezado visible y captura móvil.

## Limitación de estas pruebas

Las pruebas P-001 a P-004 validan únicamente el esqueleto visual local. No validan autenticación, permisos, persistencia, datos reales ni despliegue.
