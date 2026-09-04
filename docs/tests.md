# CeroFallas — Registro de pruebas

## PRUEBA P-015 — Incidentes, permisos y consultas (2026-09-03)

Suite completa: **43/43 aprobadas** en Firestore Emulator. Build de producción aprobado.

- Reporte sin equipo, descripción, área, prioridad y selección de equipo validados.
- Creación autorizada con auditoría; rechazo sin auditoría y para lector/desactivado.
- Rechazo de equipo inexistente, campos adicionales, edición por reportante y borrado físico.
- Seguimiento por administrador con auditoría nueva; autor inmutable.
- Conteo agregado de incidentes abiertos comprobado.
- Stock sin escrituras cliente, usuarios sin autoasignación de permisos y consultas administrativas restringidas.
- Navegación oculta administración a perfil montacarguista.

Prueba inicial falló porque la suite anterior no especificaba host de emulador; se corrigió explícitamente a 127.0.0.1:8080 y se repitió exitosamente con `npm test`.
No se validó todavía el recorrido autenticado de las nuevas pantallas en navegador. Sólo se comprobó apertura de login en http://127.0.0.1:5173. La guía de validación manual está en `docs/guia-avance-incidentes.md`.

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

## PRUEBA P-009 — Reglas y cálculo de correctivos

Fecha: 2026-09-03

Casos automatizados agregados:

1. Técnico con permisos registra correctivo y auditoría atómicamente.
2. Perfil de solo lectura no puede crear correctivos.
3. Firestore rechaza duraciones inválidas.
4. Firestore impide el borrado físico de correctivos.
5. Duración calculada correctamente dentro del mismo día.
6. Duración calculada correctamente al cruzar medianoche.
7. Rango invertido rechazado si no se indica día siguiente.
8. Duración superior a 24 horas rechazada.

Resultado obtenido: suite completa con 14 de 14 pruebas aprobadas.

Estado: APROBADA TÉCNICAMENTE.

## PRUEBA P-010 — Flujo integral de correctivos

Fecha: 2026-09-03

Datos utilizados: usuario, equipo y mantenimiento ficticios en Firebase Emulator Suite.

Resultado obtenido:

1. El formulario rechazó campos obligatorios vacíos.
2. Equipo se filtró por Línea 1.
3. El rango 23:30–01:00 con finalización al día siguiente calculó 1 h 30 min.
4. Se guardaron síntoma, clasificación provisional, componente, causa y trabajo.
5. El listado mostró fecha, equipo, área, duración y estado.
6. La edición recuperó todos los datos persistidos.
7. La anulación exigió motivo y conservó el registro visible como anulado.

Estado: APROBADA TÉCNICAMENTE.

Limitaciones: la asignación de varios técnicos y la selección de repuestos desde SAP dependen de los módulos de usuarios y stock. El formulario ya admite repuestos manuales estructurados.

## PRUEBA P-011 — Reglas y lógica preventiva

Fecha: 2026-09-03

Casos automatizados agregados:

1. Planificador autorizado crea un plan estimado con auditoría.
2. Firestore rechaza intervalos preventivos no positivos.
3. Técnico autorizado registra una ejecución con auditoría.
4. Perfil de solo lectura no puede registrar ejecuciones.
5. Planes y ejecuciones no pueden borrarse físicamente.
6. Frecuencias de calendario, horómetro y condición generan textos coherentes.
7. Ejecuciones se clasifican como a tiempo, tardías o no programadas.

Resultado obtenido: suite completa con 22 de 22 pruebas aprobadas.

Estado: APROBADA TÉCNICAMENTE.

## PRUEBA P-012 — Flujo integral de preventivos

Fecha: 2026-09-03

Datos utilizados: cuenta, equipo, plan y ejecución ficticios en Firebase Emulator Suite.

Resultado obtenido:

1. Se creó un plan para `TEST-EQ-001` con frecuencia estimada de 30 días.
2. El listado mostró actividad, equipo, frecuencia, próxima fecha y estado.
3. Al seleccionar el plan, la ejecución completó automáticamente equipo y fecha programada.
4. El rango 08:00–09:15 calculó 1 h 15 min.
5. La ejecución quedó clasificada como “A tiempo”.
6. El historial mostró equipo, actividad, fecha, duración y cumplimiento.
7. La anulación del plan exigió motivo y conservó tanto el plan como su ejecución histórica.

Estado: APROBADA TÉCNICAMENTE.

Limitación: todas las frecuencias permanecen marcadas como estimadas hasta recibir estándares reales de planta.

## PRUEBA P-013 — Reglas y evaluación del checklist

Fecha: 2026-09-03

Casos automatizados agregados:

1. Montacarguista autorizado puede registrar una inspección completa y auditada.
2. Firestore rechaza inspecciones con menos de 25 respuestas.
3. Firestore rechaza un resultado “apto” si declara fallas críticas.
4. Ningún perfil puede borrar físicamente una inspección.
5. Veinticinco respuestas buenas generan resultado apto.
6. Una falla crítica genera fuera de servicio.
7. Una falla no crítica genera requiere atención.
8. Una respuesta ausente o vacía mantiene el checklist incompleto.

Resultado obtenido: suite completa con 29 de 29 pruebas aprobadas.

Estado: APROBADA TÉCNICAMENTE.

## PRUEBA P-014 — Flujo integral de checklist de montacargas

Fecha: 2026-09-03

Datos utilizados: cuenta y montacargas ficticios en Firebase Emulator Suite.

Resultado obtenido:

1. Sólo equipos activos cuyo tipo contiene “Montacargas” aparecieron en el selector.
2. La plantilla v1 mostró 25 puntos agrupados en inspección visual, niveles, operación y seguridad.
3. El formulario permaneció “Checklist incompleto” mientras las respuestas estaban vacías.
4. “Marcar todo bueno” produjo “Apto para operar”.
5. Cambiar el freno de servicio a “Requiere atención” produjo inmediatamente “Fuera de servicio — no operar”.
6. La observación fue obligatoria para el punto defectuoso.
7. La inspección persistida mostró horómetro, turno, una falla crítica y resultado fuera de servicio.

Estado: APROBADA TÉCNICAMENTE.

Limitaciones: la evidencia fotográfica queda pendiente porque Cloud Storage requiere una decisión explícita de facturación. Los modelos reales de montacargas se agregarán después de la visita a planta.
