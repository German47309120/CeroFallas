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

## PRUEBA P-015 — Turnos institucionales automáticos

Fecha: 2026-09-07

Casos automatizados:

1. Turno 2 permanece activo hasta las 05:59 y Turno 1 inicia exactamente a las 06:00.
2. Turno 1 permanece activo hasta las 17:59 y Turno 2 inicia exactamente a las 18:00.
3. El cálculo interpreta correctamente fechas UTC utilizando `America/Guatemala`.
4. Jefaturas y Gerencia reciben turno mixto de 08:00 a 18:00, de lunes a viernes.
5. El fin de semana se muestra fuera del turno mixto.
6. Los roles operativos conservan Turno 1/Turno 2 y el checklist propone el turno correspondiente.

Resultado obtenido: 6 de 6 casos aprobados.

Estado: APROBADA TÉCNICAMENTE.

## PRUEBA P-016 — Guía integrada y recuperación global

Fecha: 2026-09-08

Casos automatizados:

1. La guía muestra al Montacarguista el checklist sin conceder formularios de mantenimiento.
2. Gerencia recibe recorridos de consulta sin enlaces de escritura.
3. La guía explica arquitectura, ruta de defensa y límites de los datos demostrativos.
4. El control central permite `/ayuda` a los once roles y amplía la matriz a 231 decisiones.
5. La aplicación mantiene el contenido normal mientras no exista una excepción.
6. Una excepción sustituye la pantalla por recuperación segura sin revelar el error interno.

Resultado obtenido: 5 pruebas nuevas de presentación aprobadas; matriz de rutas actualizada y suite integral aprobada con 187/187 pruebas web.

Estado: APROBADA TÉCNICAMENTE.

## PRUEBA P-017 — Resiliencia del dashboard ante índices en construcción

Fecha: 2026-09-08

Caso automatizado y verificación publicada:

1. Una tendencia con error y sin datos muestra un aviso local con estado accesible.
2. El componente no intenta leer `buckets` cuando la consulta no produjo datos.
3. El resto del dashboard permanece visible con incidentes, agenda e indicadores disponibles.
4. Las variantes ascendentes requeridas se publicaron en Firestore; durante su construcción la interfaz conserva el funcionamiento parcial.

Resultado obtenido: suite integral aprobada con 188/188 pruebas web, lint limpio y build de producción exitoso. La URL HTTPS dejó de mostrar la recuperación global y presentó el aviso controlado en la tendencia.

Estado: APROBADA TÉCNICAMENTE. El dashboard HTTPS volvió a presentar 18 correctivos, promedio de 1 h 14 min, 73 % preventivos a tiempo, tendencia y distribución por área sin recuperación global ni aviso temporal.

## PRUEBA P-018 — Aceptación cloud por roles y rutas

Fecha: 2026-09-08

Casos ejecutados contra `cerofallas-pg2-german-2026`:

1. Las once cuentas configuradas iniciaron sesión correctamente.
2. Cada cuenta leyó su perfil y coincidió en rol, estado activo y permisos con el catálogo del código.
3. Nueve colecciones permitieron o rechazaron lectura conforme al permiso efectivo de cada rol.
4. Trece rutas publicadas respondieron HTTP 200.
5. Cuatro encabezados HTTPS coincidieron con la configuración de seguridad.

Resultado obtenido: 149 verificaciones aprobadas. La prueba fue de solo lectura, no generó registros y no imprimió contraseñas.

Estado: APROBADA TÉCNICAMENTE. Pendientes recorridos institucionales de escritura y evidencia multidispositivo.

## PRUEBA P-019 — Escrituras controladas en Firebase publicado

Fecha: 2026-09-08

Casos ejecutados:

1. Técnico de Mantenimiento registró un correctivo y una ejecución preventiva no programada.
2. Digitador reportó un incidente de prioridad baja.
3. Montacarguista registró un checklist completo y apto.
4. Cada operación creó su auditoría con el mismo actor.
5. Gerencia, Digitador, Técnico y Montacarguista intentaron una escritura fuera de su permiso y fueron rechazados.
6. La segunda ejecución reconoció los ocho documentos existentes y no generó duplicados.

Resultado obtenido: cuatro operaciones y cuatro auditorías creadas, cuatro rechazos correctos, 293 documentos cloud legibles. Los registros se identifican como pruebas técnicas no operativas.

Estado: APROBADA TÉCNICAMENTE.

## PRUEBA P-020 — Privacidad del inicio de sesión y lenguaje de producto

Fecha: 2026-09-08

Casos automatizados:

1. Correo inválido, cuenta inexistente, cuenta desactivada y contraseña incorrecta devuelven exactamente el mismo mensaje al usuario.
2. Problemas de red y exceso de intentos conservan mensajes operativos útiles sin confirmar la existencia de una cuenta.
3. Login, cabecera, perfil, dashboard, guía y administración no presentan nombres del proveedor ni de la base de datos.

Resultado obtenido en esta prueba: suite integral aprobada con 191/191 pruebas web dentro del emulador de reglas, lint limpio y build de producción exitoso.

Estado: APROBADA TÉCNICAMENTE.

## PRUEBA P-021 — Contrato seguro de stock SAP / SQL Server

Fecha: 2026-09-08

Casos automatizados:

1. Se aceptan consultas de solo lectura iniciadas por `SELECT` o `WITH`.
2. Se rechazan instrucciones de escritura, definición, ejecución y `SELECT INTO`.
3. Se normalizan los cuatro campos autorizados desde alias en español o SAP Business One.
4. Se rechazan filas incompletas, cantidades inválidas e identificadores duplicados.
5. El navegador no recibe servidor, usuario, contraseña ni consulta SQL.

Resultado obtenido: 5/5 casos del contrato SAP aprobados, incluyendo servidor simple e instancia nombrada. Suite integral vigente: 197/197 pruebas web, lint limpio y build de producción exitoso.

Estado: BASE TÉCNICA APROBADA. La prueba de conectividad se documenta en P-023.

## PRUEBA P-022 — Tiempo oficial y navegación desde indicadores

Fecha: 2026-09-09

Casos verificados:

1. Correctivos y preventivos se crean en estado en curso con `startedAt` igual al tiempo del servidor.
2. Solo el mismo técnico puede finalizarlos; `endedAt` vuelve a ser el tiempo del servidor.
3. Equipo, área, plan, programación, autor y hora inicial permanecen inmutables durante la finalización.
4. La finalización exige auditoría atómica y rechaza registros completados directamente con fechas digitadas.
5. El checklist asigna fecha, hora y turno al guardar y las reglas rechazan sustituciones.
6. Las cuatro tarjetas principales enlazan a incidentes, planes o correctivos con el contexto del indicador y del área.

Resultado obtenido: 196/196 pruebas web aprobadas, incluyendo 33 decisiones focalizadas de reglas; lint limpio y build de producción exitoso.

Estado: APROBADA TÉCNICAMENTE.

## PRUEBA P-023 — Diagnóstico seguro de conectividad SAP

Fecha: 2026-09-11

Casos verificados:

1. La configuración y consulta local pasan validación sin abrir conexión ni imprimir secretos.
2. El conector separa de forma válida un host y una instancia SQL Server nombrada.
3. La corrida seca se detiene sin publicar cuando la red no permite alcanzar SQL Server.
4. El error presentado contiene únicamente el código técnico seguro `ETIMEOUT`, sin servidor, base, usuario, contraseña, consulta o inventario.
5. El verificador cloud queda alineado al flujo de inicio/finalización con tiempo oficial para una futura instalación nueva.

Resultado obtenido: configuración aprobada; 5/5 pruebas unitarias SAP, suite integral 197/197 con Firestore Emulator, lint y build aprobados. La corrida seca terminó antes de autenticación/consulta porque desde la red actual no fue alcanzable el host ni TCP 1433. No se leyeron ni publicaron datos.

Estado: BLOQUEADA POR CONECTIVIDAD EXTERNA. Repetir desde planta/VPN o con el puerto TCP fijo autorizado; no corresponde cambiar credenciales hasta superar esta capa.
