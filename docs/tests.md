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

## PRUEBA P-005 — Firebase Hosting local y ruta SPA

Fecha: 2026-09-03

Función: Configuración de Firebase Hosting.

Datos utilizados: Build local y proyecto emulado `demo-cerofallas`.

Resultado esperado: Hosting sirve `dist/` y una entrada directa a `/correctivos` regresa la SPA.

Resultado obtenido: Respuesta HTTP 200; título CeroFallas; encabezado Correctivos visible; cero errores de consola.

Estado: APROBADA TÉCNICAMENTE.

Evidencia: Emulador en `127.0.0.1:5000` y revisión en navegador integrado.

Limitación: No representa un despliegue público ni valida Firestore.

## PRUEBA P-006 — Autenticación local completa

Fecha: 2026-09-03

Función: Firebase Authentication, protección de rutas y cierre de sesión.

Datos utilizados: Authentication Emulator y cuenta ficticia `admin.demo@cerofallas.local`.

Casos ejecutados:

1. Acceso directo sin sesión a `/correctivos`: redirigió a `/login`.
2. Formulario vacío: mostró “Ingresa tu correo y contraseña.”
3. Contraseña incorrecta: permaneció en login y mostró un mensaje seguro.
4. Usuario inexistente: permaneció en login y mostró el mismo mensaje, sin revelar existencia de cuentas.
5. Credenciales correctas: abrió `/correctivos`.
6. Recarga del navegador: conservó la sesión y la ruta protegida.
7. Cierre de sesión: regresó a `/login`.
8. Nuevo acceso directo después de salir: volvió a redirigir a `/login`.

Resultado esperado: Todos los casos se comportan conforme a autenticación segura básica.

Resultado obtenido: Todos los casos aprobados en el emulador local.

Estado: APROBADA TÉCNICAMENTE.

Limitación: Todavía no valida perfiles Firestore, usuarios desactivados ni permisos por rol; esas pruebas corresponden a seguridad y roles.

## PRUEBA P-007 — Reglas de seguridad de equipos

Fecha: 2026-09-03

Función: autorización de perfiles, catálogo de equipos y auditoría en Firestore Emulator.

Casos ejecutados:

1. Lectura sin autenticación rechazada.
2. Lectura permitida a perfil activo con `equipment.read`.
3. Lectura rechazada a perfil desactivado aunque conserve permisos.
4. Creación rechazada a perfil de solo lectura.
5. Creación atómica de equipo y auditoría permitida al administrador.
6. Eliminación física rechazada incluso al administrador.

Resultado obtenido: 6 de 6 pruebas automáticas aprobadas con Vitest y Firebase Rules Unit Testing.

Estado: APROBADA TÉCNICAMENTE.

## PRUEBA P-008 — Flujo integral del catálogo de equipos

Fecha: 2026-09-03

Función: perfil Firestore, permisos, alta, consulta, filtro, edición y desactivación lógica.

Datos utilizados: cuenta, perfil y equipo exclusivamente ficticios en Firebase Emulator Suite.

Resultado obtenido:

1. El administrador autenticado recibió sus permisos desde Firestore.
2. El catálogo vacío no inventó datos de planta.
3. El formulario validó campos obligatorios.
4. Se creó `TEST-EQ-001` junto con su auditoría.
5. La recarga conservó sesión y registro.
6. El filtro mostró correctamente el estado sin coincidencias.
7. La edición cambió nombre y estado a inactivo sin borrar el registro.
8. El build de producción finalizó correctamente.

Estado: APROBADA TÉCNICAMENTE.

Limitación: el catálogo real continúa pendiente de nombres, códigos, modelos y líneas levantados en planta. Los datos del emulador desaparecen al detenerlo.
