# CEROFALLAS — ESTADO ACTUAL

## Control maestro de fases — actualizado 2026-09-29

Este es el único documento de seguimiento de fases. Se conserva la numeración del apartado 33 de `../Prompt_Maestro_CeroFallas_V2.md`. Los registros históricos siguientes son evidencia de avances, no una segunda hoja de ruta. La entrega universitaria editable continúa en su archivo maestro independiente.

Estados: **Base lista** = definición o implementación local con evidencia; no equivale a validación de planta ni producción. **Parcial** = faltan requisitos o validaciones. **Pendiente** = sin implementación validada. **En curso** = trabajo transversal que continuará hasta el cierre.


| Fase | Alcance original | Estado | Evidencia y condición para cerrar |
|---|---|---|---|
| 0 | Confirmación del alcance | Base lista | Web responsive y módulos acordados; mantener decisiones ante cambios. |
| 1 | Preparación del entorno | Base lista | React/Vite, Git y emuladores operativos; entorno documentado. |
| 2 | Requerimientos | Base lista | Requisitos, casos de uso y aceptación documentados; validar datos reales pendientes. |
| 3 | Modelo de datos | Base lista | Modelo lógico y colecciones operativas; reconciliar diferencias de implementación e integraciones. |
| 4 | Arquitectura | Base lista avanzada | React + servicio cloud; SAP, BI y predictivo desacoplados. El agente local de stock SQL Server está implementado, valida instancias nombradas y protege secretos; falta conectividad real. |
| 5 | Diseño de interfaz | Parcial avanzado | UI responsive y 15 mockups; turno vigente visible según rol y hora Guatemala. Falta aceptación visual institucional y adaptar lo aún conceptual. |
| 6 | Configuración de Firebase | Base cloud funcional | Proyecto personal enlazado; Firestore Standard en `us-central1`, configuración web, reglas e índices publicados. App Check está preparado en código; faltan registro de clave, observación de métricas, enforcement y revisión final de costos. |
| 7 | Autenticación | Base cloud funcional verificada | Correo/contraseña y once cuentas/perfiles operativos; inicio de sesión cloud comprobado y 242 decisiones de acceso por URL verificadas. Functions administrativas esperan decisión sobre Blaze. |
| 8 | Catálogo de equipos | Parcial | Alta, consulta, edición y desactivación; faltan códigos/modelos y catálogo de planta. |
| 9 | Mantenimiento correctivo | Base funcional avanzada | Inicio y finalización separados con tiempo oficial del servidor, duración derivada, consulta y anulación auditada; datos reales pendientes. |
| 10 | Mantenimiento preventivo | Base funcional publicada avanzada | Planes y ejecuciones con tiempo oficial, reprogramación y anulación auditadas; Gantt dinámico de vencidos y próximas ocho semanas publicado. Faltan validar frecuencias reales, duración planificada y horómetro/condición. |
| 11 | Checklist de montacargas | Base funcional avanzada | 25 puntos, fecha/hora/turno oficiales no editables, resultado operativo y anulación privilegiada con auditoría atómica. El turno se recalcula al guardar, se actualiza en pantalla y las reglas rechazan valores manipulados. Aprobación técnica de plantilla y equipos reales pendientes. |
| 12 | Históricos y filtros | Base funcional publicada avanzada | Paginación transversal, filtros estructurados, auditoría legible y ficha por equipo con historial consolidado según permisos. Búsqueda textual limitada a páginas cargadas; falta aceptación de planta. |
| 13 | Dashboard | Base funcional local avanzada | Indicadores navegables hacia su detalle filtrado, agenda, prioridades, períodos, siete áreas, tendencia, promedio de atención, preventivos a tiempo e incidentes por estado; falta aceptación gerencial real. |
| 14 | Seguridad y roles | Base cloud verificada | Once perfiles institucionales estables, cuatro escrituras cloud permitidas con auditoría y cuatro prohibidas rechazadas, 132 decisiones locales de escritura y 253 combinaciones de rol/ruta. Faltan firma de aceptación institucional y backend administrativo cloud. |
| 15 | Power BI y datos SAP | Preparación avanzada | Consulta SAP REP% y diseño del reporte privado documentados; Gerencia puede exportar un dataset analítico sin credenciales con correctivos, planes, ejecuciones e incidentes. Falta ejecutar SAP, construir/publicar el PBIX privado y configurar gateway y actualización. |
| 16 | Publicación en Internet | Base HTTPS publicada | Hosting Spark disponible en `https://cerofallas-pg2-german-2026.web.app`; las rutas directas y cuatro encabezados de seguridad responden correctamente. App Check está preparado pero no impuesto; faltan registro/métricas, aceptación móvil/roles, dominio personalizado y Functions si se aprueba Blaze. |
| 17 | Dataset predictivo | Contrato y demo publicada | Esquema, origen, etiqueta y generador reproducible; 32 resultados sintéticos de ocho equipos y cuatro fechas están publicados con marca demostrativa. Histórico real, definición oficial y calidad siguen pendientes. |
| 18 | Ingeniería de variables | Base demostrativa | Once variables con corte temporal, validación y pruebas; falta confirmar disponibilidad y construirlas con fuentes reales. |
| 19 | Entrenamiento y comparación | Laboratorio demo | Regresión logística y Random Forest comparados con división temporal y métricas reproducibles; no existen métricas reales ni modelo productivo. |
| 20 | Integración de predicciones | Simulación cloud segura | Pantalla responsive consulta resultados fechados desde una colección de solo lectura, filtra por equipo y conserva trazabilidad, versión y advertencia permanente. Faltan servicio automatizado y resultados con histórico real validado. |
| 21 | Automatización cada 24 horas | Pendiente | Depende de fuentes, modelo, infraestructura y costos autorizados. |
| 22 | Pruebas generales | En curso avanzado | Suite vigente: 224 pruebas web y 3 predictivas; `npm test` administra Firestore Emulator automáticamente. Once cuentas y la matriz publicada están verificadas. Falta aceptación institucional multidispositivo. |
| 23 | Documentación | Base local avanzada | Entrega 2 Word/PDF, documentación técnica, guía integrada por permisos y fuente maestra de estudio cargada en NotebookLM. Falta actualizar al cierre definitivo y completar datos académicos. |
| 24 | Presentación final | Parcial | Guía de defensa incluida en entrega 2; falta ensayo final y evidencia del sistema terminado. |

### Medición del avance

**Proyecto completo estimado: 83 %. Aplicación web principal: 98 %. Base publicada en Internet: operativa.**

La medición completa incluye aquello que todavía depende de planta, nube y datos predictivos; por eso es menor que el estado de la aplicación local. Se usa una ponderación estable para no aumentar el porcentaje solo por agregar pantallas:

| Bloque | Peso del proyecto | Cumplimiento verificable | Aporte |
|---|---:|---:|---:|
| Análisis, diseño y documentación | 15 % | 88 % | 13.20 % |
| Aplicación web principal | 40 % | 98 % | 39.20 % |
| Seguridad y pruebas | 15 % | 99 % | 14.85 % |
| Publicación e integraciones SAP/Power BI | 15 % | 65 % | 9.75 % |
| Predictivo y automatización | 15 % | 40 % | 6.00 % |
| **Total redondeado** | **100 %** |  | **83 %** |

Solo se acredita como cumplimiento aquello implementado o documentado con evidencia. Una base local no equivale a despliegue cloud, datos reales o aceptación de planta. Recalcular con estos mismos pesos al cerrar criterios verificables.

### Punto de reanudación y orden inmediato

1. Fase 14: validar recorridos de escritura con responsables institucionales en la URL HTTPS publicada y documentar su aceptación.
2. Fase 10: validar en planta frecuencias y datos de horómetro/condición. No inventar reprogramaciones automáticas para esos dos métodos.
3. Fase 16: completar aceptación móvil/roles, App Check y decisión de dominio personalizado; Hosting y Firestore ya están publicados.
4. Integraciones: repetir la corrida seca desde la red de planta/VPN o con el puerto TCP fijo de la instancia. Solo después de validar filas y almacenes se podrá autorizar la publicación de stock. Nunca almacenar credenciales en frontend o Git.

## Avance vigente — 2026-09-29

### Datos controlados para la exposición

- Se completaron en Firebase **60 equipos, 60 planes preventivos, 60 ejecuciones preventivas, 60 correctivos, 60 incidentes, 60 checklist de montacargas y 60 resultados predictivos**.
- Se agregaron 213 documentos con identificadores independientes y la marca `dataOrigin=presentation_demo`; los resultados predictivos mantienen además su carácter demostrativo. No deben presentarse como histórico real de planta.
- El stock no fue rellenado con datos ficticios: ya contiene **1,967 documentos** provenientes de las cargas existentes y se conservó sin modificaciones.
- Usuarios, credenciales, sesiones y los 93 eventos de auditoría existentes permanecieron sin cambios.
- El publicador exige doble confirmación del proyecto, bloquea emuladores, crea únicamente documentos inexistentes y puede ejecutarse con `--dry-run`. Una segunda simulación confirmó cero escrituras pendientes, por lo que el proceso es idempotente.
- Verificación del avance: conteos cloud confirmados, lint limpio, 3/3 pruebas predictivas y build de producción aprobado. La suite web completa no se repitió porque el puerto fijo 8080 de sus pruebas está ocupado por un servicio Java externo `AuthServiceApplication`; el último resultado integral vigente continúa siendo 224/224.

La ampliación aporta material visual para la defensa, pero no cambia el porcentaje global: no sustituye catálogo real de planta, aceptación institucional, Power BI privado ni automatización predictiva con histórico real.

## Avance vigente — 2026-09-23

### Revisión integral por usuarios y lenguaje de producción

- Se contrastaron los once perfiles publicados con las catorce rutas, sus permisos derivados y las colecciones autorizadas. La aceptación cloud cerró con **161 verificaciones aprobadas** sin modificar datos ni exponer contraseñas.
- El verificador idempotente de operaciones confirmó que ya existen las ocho evidencias controladas de correctivo, preventivo, incidente y checklist con su auditoría. No creó duplicados y Firebase rechazó los cuatro intentos de escritura fuera de rol.
- El lote demostrativo base conserva **325 documentos** presentes y legibles bajo las reglas activas.
- Se retiraron de las pantallas operativas comentarios propios del desarrollo, la defensa académica, fases pendientes e infraestructura. La ayuda quedó enfocada en tareas del usuario y los formularios muestran instrucciones operativas directas.
- Verificación posterior: **222/222 pruebas web y de reglas**, **3/3 pruebas predictivas**, lint limpio y build de producción exitoso.
- El porcentaje global permanece en **83 %**: esta revisión mejora calidad y aceptación técnica, pero no sustituye datos reales de planta, integración SAP/Power BI, App Check ni automatización predictiva.

### Trazabilidad de la tercera entrega y ficha consolidada de equipo

- Se contrastaron las 14 entidades, 6 procesos, 26 casos de uso, 10 componentes de arquitectura y 15 mockups del segundo entregable contra la implementación actual.
- Sin atribuir puntaje parcial, la cobertura documental alcanza **91.5 %** y la cobertura de casos de uso alcanza **92.3 %**: 24 de 26 casos están completamente demostrables. Estas métricas no sustituyen el avance global del proyecto, que permanece en 83 % por sus dependencias externas.
- CU-012 quedó completo con una ficha por activo. La línea de tiempo reúne correctivos, preventivos, checklist, incidentes y riesgo predictivo, consultando únicamente las colecciones permitidas para el perfil autenticado.
- Se añadieron índices compuestos para mantener las consultas por equipo ordenadas en el servidor.
- Verificación: **224/224 pruebas web y de reglas**, **3/3 pruebas predictivas**, lint y build aprobados; la matriz cubre **253 decisiones de rol y ruta**. Hosting e índices están publicados y la aceptación cloud cerró con **11 cuentas, 15 rutas y 162 verificaciones aprobadas**.

## Avance vigente — 2026-09-22

### Turno oficial reforzado y diagnóstico SAP actualizado

- El checklist dejó de reutilizar el turno calculado al abrir el formulario: ahora lo recalcula inmediatamente antes de guardar y refresca la indicación visible cada 30 segundos.
- Firestore ya exigía que el turno coincidiera con la hora oficial de la solicitud; una prueba negativa específica demuestra que un cliente no puede enviar el turno contrario.
- Se agregó cobertura del turno nocturno al atravesar las 00:00. La verificación completa cerró con 219/219 pruebas web, 3/3 predictivas, lint limpio y build de producción exitoso.
- La configuración SAP y la consulta de solo lectura siguen válidas. Con WireGuard activo, el nombre del servidor se resuelve, pero también el puerto TCP 4000 proporcionado permanece inaccesible y la corrida seca finaliza con `ESOCKET` antes de autenticarse o consultar datos.
- Próximo dato requerido para SAP: verificar si 4000 es realmente el puerto TCP de SQL Server mostrado por `sys.dm_exec_connections` y confirmar que WireGuard permite ese destino. No se publicará inventario hasta que la corrida seca informe filas y almacenes válidos.

### Simulación predictiva fechada publicada

- Se publicó una colección independiente `riskPredictions` con 32 resultados sintéticos: ocho equipos en cuatro fechas de corte entre junio y septiembre de 2026.
- Cada documento conserva puntuación, nivel, horizonte de 30 días, variables, explicación, modelo y versión. Todos declaran `isDemonstration=true` y `dataOrigin=synthetic_demo`.
- La pantalla `/riesgo` consulta el histórico, resume el último corte, filtra por equipo y mantiene visible la prohibición de utilizar la simulación para decisiones operativas.
- Las reglas permiten lectura únicamente a perfiles con `prediction.read` y bloquean todas las escrituras desde el navegador. El publicador técnico exige doble confirmación del proyecto y utiliza identificadores idempotentes.
- Evidencia: lote cloud base de 325 documentos legible, 11 cuentas, 14 rutas y 161 verificaciones publicadas aprobadas; 222/222 pruebas web, 3/3 predictivas, lint y build aprobados.
- El avance global sube a 83 % por integrar y publicar resultados trazables. No se acredita como modelo real, histórico real ni automatización de 24 horas.

Incidentes se conserva como **módulo adicional transversal**, relacionado con históricos (12), dashboard (13) y seguridad (14). Los encabezados anteriores «Fase 12: incidentes» fueron una desviación de nomenclatura, no el cierre de la fase original de históricos.

### Regla de cierre y actualización

Al terminar un avance, actualizar esta tabla y registrar: cambio concreto, pruebas realmente ejecutadas, pendientes, dependencias y siguiente paso. No marcar una fase completa solo por tener pantalla o build exitoso. No atribuir porcentajes globales sin criterios de aceptación medibles. La evidencia de pruebas anterior conserva su fecha: no implica una nueva ejecución hoy.

## Avance vigente — 2026-09-19

### Exportación analítica y cronograma publicados

- El reporte gerencial permite a Gerencia, Administrador y Soporte exportar un CSV UTF-8 con correctivos, planes, ejecuciones preventivas e incidentes. La exportación recorre todas las páginas, omite identidades y credenciales y neutraliza fórmulas de hoja de cálculo.
- El módulo Preventivos presenta un Gantt dinámico de planes activos vencidos y de las próximas ocho semanas. La barra representa la fecha programada; la duración permanece pendiente de incorporarse al plan.
- El enlace público de Power BI fue retirado. La consulta REP% y la construcción de un reporte privado con SQL Server, gateway y enlace autenticado están documentadas.
- La corrida seca SAP del 19 de septiembre volvió a finalizar con `ETIMEOUT` antes de autenticarse. SSMS no estaba abierto durante el diagnóstico, por lo que sigue pendiente identificar el puerto TCP que utiliza su conexión funcional; no se leyeron ni publicaron registros.
- Cierre vigente: 217/217 pruebas web, 3/3 predictivas, lint y build aprobados; once perfiles y 150 verificaciones cloud aprobadas tras sincronizar el permiso de exportación.

### Verificación autónoma y limpieza de producción

- `npm test` ahora inicia Firestore Emulator, ejecuta las pruebas y lo detiene automáticamente; `npm run verify` vuelve a ser reproducible desde una terminal limpia.
- ESLint excluye `tmp/`, que contiene artefactos generados para documentación y no código entregable de la aplicación.
- El script temporal de captura hacia Figma fue retirado del HTML de producción. El preflight bloquea futuras capturas de diseño o referencias locales dentro del build.
- Cierre vigente: 206/206 pruebas web y reglas, 3/3 pruebas predictivas, lint limpio y build exitoso.

### Catálogo institucional estable de usuarios

- Se creó y vinculó el proyecto personal `cerofallas-pg2-german-2026` en plan Spark. Cloud Firestore Standard quedó en `us-central1` con protección contra eliminación; reglas e índices compilados se publicaron antes de cargar información.
- La aplicación web `CeroFallas Web` quedó configurada mediante `.env.local`, ignorado por Git. Un importador cloud con doble confirmación de proyecto creó o reutilizó once identidades y publicó 274 registros demo sin cuenta de servicio ni reglas temporales abiertas.
- La comprobación cloud inicial leyó 285 documentos —once perfiles más 274 registros— bajo las reglas publicadas. Tras la aceptación de escritura controlada, el verificador confirmó 293 documentos: cuatro operaciones técnicas y sus cuatro auditorías se sumaron sin alterar los registros base.
- Las rutas `/`, login, módulos operativos, recursos, riesgo, administración, perfil y ayuda respondieron HTTP 200 directamente. La respuesta HTTPS incluyó `nosniff`, política de referencia, `SAMEORIGIN` y bloqueo de cámara/micrófono/ubicación.
- Cloud Functions no se desplegó porque el proyecto continúa en Spark. Alta, actualización y contraseña desde el panel Usuarios requieren Blaze; las cuentas iniciales se prepararon con un procedimiento único local y credenciales fuera de Git.
- Se corrigió una caída del dashboard publicada: una consulta agregada podía devolver `failed-precondition` mientras Firestore construía un índice y la vista intentaba leer una tendencia sin datos. El gráfico ahora presenta un aviso aislado sin ocultar los demás indicadores; la regresión quedó cubierta por la prueba web 188. Se publicaron las variantes ascendentes necesarias y la consulta de tendencia reutiliza ese orden, evitando depender de un índice descendente durante su construcción. En HTTPS se comprobaron 18 correctivos, promedio de 1 h 14 min, 73 % preventivos a tiempo, barras temporales y distribución por área.
- `npm run verify:published-roles -- --project=cerofallas-pg2-german-2026` inició sesión con las once cuentas cloud y contrastó su perfil y permisos sobre nueve colecciones. Junto con catorce rutas y cuatro encabezados HTTPS completó 150 verificaciones sin realizar escrituras ni imprimir contraseñas.
- `npm run verify:published-writes` creó una evidencia idempotente en correctivos, preventivos, incidentes y checklist, cada una con auditoría. Cuatro roles no autorizados recibieron `permission-denied`; una segunda ejecución creó cero duplicados y reconoció los ocho documentos existentes.
- El inicio de sesión unificó correo inválido, cuenta inexistente, cuenta desactivada y contraseña incorrecta bajo el mismo mensaje genérico. La interfaz operativa dejó de mencionar proveedores o nombres internos de base de datos; dos archivos de prueba nuevos fijan esa política.
- Se implementó el agente local `scripts/sap-stock-sync.mjs`: acepta una sola consulta `SELECT`/`WITH`, bloquea escritura y DDL, normaliza los cuatro campos autorizados, rechaza duplicados y limita cada corrida a 50,000 filas. Su modo de revisión no publica datos y la publicación requiere confirmar exactamente el proyecto cloud.
- La configuración, consulta real y credenciales SAP permanecen en `.local/`, fuera de Git. Cinco pruebas validan consultas permitidas/prohibidas, alias de SAP Business One, calidad del resultado y separación segura de servidor/instancia.
- `npm run sap:stock:check` aprobó configuración y consulta sin conectarse. La corrida seca terminó con `ETIMEOUT` antes de autenticación o consulta; el equipo actual no alcanzó el host ni TCP 1433. No se leyeron filas ni se publicó stock. El error visible quedó sanitizado y no expone datos de conexión.
- El verificador de escrituras publicadas fue actualizado para instalaciones nuevas: correctivos y preventivos ahora se inician y finalizan en pasos separados con tiempo oficial del servidor, y el checklist usa hora y turno oficiales. La evidencia histórica existente no se modificó ni se volvió a ejecutar en cloud.
- El módulo de repuestos consulta un documento de estado separado: si existe una sincronización exitosa muestra fecha, registros y almacenes; si no existe, conserva una advertencia explícita. Solo perfiles con `stock.read` pueden leerlo y ninguna sesión del navegador puede escribirlo.
- Hosting y las nuevas reglas fueron publicados en `cerofallas-pg2-german-2026`; la ruta HTTPS `/repuestos` respondió 200 con `SAMEORIGIN` y `nosniff`. No se ejecutó el verificador de escrituras cloud ni se publicó stock SAP.
- Se agregó `/analitica` para perfiles con `dashboard.read`. La pantalla acepta solo enlaces HTTPS oficiales de Power BI, diferencia acceso autenticado de publicación pública, advierte su riesgo y mantiene operativa la aplicación si falta el reporte.
- El Hosting actualizado y la verificación cloud cerraron con 11 cuentas, 14 rutas y 150 comprobaciones de solo lectura. La suite vigente cerró 202/202 pruebas web con Firestore Emulator; lint y build permanecen limpios.
- App Check quedó preparado con reCAPTCHA Enterprise y renovación automática de token. Solo se activa en cloud cuando existe la clave pública; permanece apagado en emuladores. La suite subió a 205/205 pruebas, lint y build limpios. Enforcement continúa desactivado hasta registrar dominio, observar métricas y validar dispositivos.

- Se consolidaron los once accesos de prueba en una sola fuente local, `.local/project-users.json`, y en una guía legible también local. Ambos están ignorados por Git para impedir que las contraseñas entren al repositorio.
- `german.hernandez@novafiber.com.gt` quedó como Administrador de la aplicación y superusuario. Los otros diez accesos usan el dominio `@novafiber.com.gt` y cubren exactamente los diez roles restantes.
- Las identidades existentes se actualizaron conservando sus UID y perfiles; no se generaron duplicados. El proceso es idempotente, valida dominio, roles, correos únicos y longitud de contraseñas, y se niega a operar fuera de los emuladores locales.
- `npm run configure:project-users` aplica la fuente única y `npm run verify:demo-roles` comprobó las once sesiones mediante **142 verificaciones** de perfil, permisos de lectura y rechazo del backend a la administración no autorizada.
- Tres pruebas nuevas validan la estructura del catálogo. La preparación anterior que dividía las credenciales en dos archivos fue retirada para evitar versiones contradictorias.
- Los correos institucionales existen por ahora únicamente en el emulador `demo-cerofallas`; no se creó Firebase Cloud, DNS, hosting real ni conexión SAP.
- “Mi perfil” ahora muestra el nombre correcto del rol, estado y entorno en lenguaje claro, además de traducir cada permiso técnico a una acción comprensible sin ocultar su identificador de referencia.
- El dashboard incorpora filtro real por las siete áreas autorizadas. La selección se aplica de forma coherente a indicadores, agenda preventiva, incidentes prioritarios, cumplimiento, promedio correctivo y tendencia; el servicio rechaza identificadores de área fuera del catálogo.
- La matriz de escritura ejecutó 12 operaciones sobre los once roles en un proyecto Firestore aislado: 132 decisiones correctas entre permisos y rechazos. Cubre creación y administración de equipos, correctivos, planes, ejecuciones, checklist e incidentes con auditoría atómica; la evidencia está en `docs/role-write-acceptance.md`.
- El historial de montacargas permite al Administrador o Soporte anular una inspección mediante motivo obligatorio. La operación conserva las 25 respuestas, autor y fecha originales, agrega estado/motivo y crea la auditoría en el mismo lote; reglas directas impiden usar el permiso desde cualquier otro rol.
- El historial preventivo permite anular una ejecución únicamente a Administrador o Soporte, con motivo y auditoría obligatorios. Si era la última ejecución que reprogramó un plan calendario, una transacción restaura la fecha programada original; si existe una ejecución posterior, el plan no retrocede.
- La pantalla de Auditoría traduce acciones y entidades técnicas a lenguaje de negocio y resuelve el nombre del actor desde los perfiles autorizados, conservando el UID para trazabilidad. Si el perfil ya no existe o falla la consulta, muestra el identificador original sin inventar información.
- Se agregó una puerta central de acceso dentro del área autenticada. Antes de renderizar una pantalla, contrasta la URL con el permiso efectivo; cubre consultas, altas, ediciones y administración, incluyendo identificadores dinámicos. Una denegación conserva la navegación y muestra una explicación sin ejecutar la pantalla solicitada.
- La matriz de rutas evalúa 22 rutas contra los once perfiles: 242 decisiones reproducibles. Tres pruebas de presentación adicionales verifican contenido autorizado, reemplazo seguro de una URL denegada y espera mientras carga el perfil. Las reglas de Firestore continúan siendo la autoridad final aunque alguien intente omitir la interfaz.
- El dataset local demostrativo creció de 75 a **274 registros deterministas**: 14 equipos, 18 planes, 36 ejecuciones preventivas, 48 correctivos, 24 incidentes, 30 inspecciones, 20 repuestos simulados y 84 eventos de auditoría. Cubre las siete áreas y estados apto, atención y fuera de servicio; los equipos conservan modelo/serie pendientes para no inventar datos de planta.
- `npm run verify:demo-data` comprueba cantidades, relaciones equipo/plan/auditoría, cobertura de áreas y que toda existencia simulada permanezca identificada como `demo-local`. La carga puede repetirse sin multiplicar registros porque utiliza identificadores estables.
- La instantánea local se exportó a `emulator-data` y conserva respaldos fechados. El exportador ahora valida metadatos, cuentas y archivos Firestore no vacíos antes de sustituir la copia vigente; también gestiona la anomalía observada donde Firebase CLI devuelve código 1 aunque el emulador genere archivos completos e idénticos por SHA-256.
- La barra superior dejó de mostrar “Turno actual: por configurar”. Calcula el turno con `America/Guatemala`: Turno 1 de 06:00 a 18:00, Turno 2 de 18:00 a 06:00 y turno mixto de 08:00 a 18:00 de lunes a viernes para las cinco jefaturas/roles gerenciales definidos. Se actualiza cada minuto.
- El formulario de checklist propone automáticamente el turno operativo correspondiente a la fecha/hora actual, pero conserva el selector editable para capturas históricas o correcciones. Seis pruebas cubren límites exactos, UTC, horario mixto, fin de semana, roles operativos y fecha inválida.
- La nueva ruta `/ayuda` está disponible para todos los perfiles autenticados. Personaliza accesos rápidos y flujos según permisos, explica React/Firebase/reglas/integraciones y propone una demostración de cinco minutos con advertencias claras sobre datos provisionales. Tres pruebas confirman personalización para Montacarguista, Gerencia y contenido de defensa.
- Una barrera global de errores envuelve la aplicación completa. Ante una excepción inesperada reemplaza la pantalla por recuperación segura, permite reintentar o volver al inicio y no expone el mensaje interno ni conserva contenido potencialmente sensible. Dos pruebas verifican operación normal y estado de recuperación.

### Matriz demostrativa completa de roles

- Se prepararon 11 cuentas ficticias: Administrador, Soporte, Técnico de Mantenimiento, Montacarguista, Jefe de Mantenimiento, Operador de Airlay, Digitador, Supervisor, Encargado de línea, Jefe de Producción y Gerencia.
- `npm run seed:demo-roles` crea mediante el backend los nueve perfiles que faltaban y es idempotente: la segunda ejecución informó 0 creados y 9 existentes. Las credenciales aleatorias quedan únicamente en `.local/demo-role-users.json`, ignorado por Git.
- Authentication y Firestore se exportaron nuevamente. La instantánea fue revisada y contiene 11 identidades; la pantalla Usuarios mostró 11 perfiles activos con sus roles correctos.
- `npm run verify:demo-roles` inició sesión con diez cuentas cuyas credenciales están disponibles localmente y realizó 129 verificaciones: perfil propio, permisos almacenados, lectura permitida/denegada en nueve colecciones y rechazo del backend para todo rol no administrador.
- El Técnico de Mantenimiento restante conserva la validación manual anterior: navegación limitada y acceso directo a Usuarios denegado. No se reemplazó su contraseña solo para incorporarlo al script.
- Los emuladores se reiniciaron importando la instantánea persistente. No se accedió a SAP, SQL Server, Firebase cloud ni datos reales.
- Se cerró el alcance local de búsqueda: estado, área, equipo y fechas operan en servidor sobre el histórico; el texto busca solo dentro de las páginas cargadas. No se integrará un motor externo de búsqueda en esta etapa sin necesidad, evaluación de datos y autorización de costo.
- Fase 16 preparada en `docs/deployment-checklist.md`: incluye puertas de autorización, controles de secretos, preflight, orden de despliegue, aceptación por roles y recuperación. No se vinculó proyecto, no se inició sesión y no se ejecutó despliegue.
- Dashboard ampliado con tres lecturas defendibles a partir de las fuentes ya autorizadas: promedio de duración correctiva, porcentaje de ejecuciones preventivas a tiempo e incidentes abiertos por estado. Los valores sin base evaluable muestran `—`; no se presentan como OEE o MTBF.
- Evidencia demo vigente de 30 días: promedio correctivo de 74 minutos sobre 18 registros, 8 de 11 preventivos a tiempo y 22 incidentes abiertos. El dataset contiene además 20 checklist aptos, 8 con atención y 2 fuera de servicio.
- Nueva función `resetAppUserPassword`: exclusiva del Administrador, valida contraseña temporal, impide restablecer la cuenta propia y registra solicitud/resultado sin almacenar el secreto. La pantalla solo muestra el control al editar otro usuario.
- Functions Emulator reconoció `createAppUser`, `updateAppUser` y `resetAppUserPassword`. El restablecimiento real no se ejecutó sobre cuentas demo para no invalidar accesos; validadores y presentación sí fueron probados. Cierre técnico: 128/128 pruebas, 129 verificaciones de roles y build exitoso.
- Laboratorio predictivo creado en `predictive/`: esquema estricto, generador de 1,200 filas sintéticas, división temporal 80/20, regresión logística y Random Forest. Tres pruebas Python aprobadas.
- Resultado demostrativo reproducible: 380 eventos objetivo; PR-AUC 0.4737 para regresión y 0.4802 para Random Forest. El archivo declara `demonstration_only`, queda en `.local/` y no se integra como riesgo operativo.
- `docs/predictive-plan.md` define campos, fuentes futuras, prevención de fuga, calidad, métricas, selección del segundo modelo y camino a ejecución cada 24 horas. No se usaron datos reales ni se entrenó un modelo productivo.
- `/riesgo` dejó de ser una pantalla conceptual: presenta el laboratorio, comparación Regresión logística/Random Forest, avance 2 de 4, datos requeridos y huella reproducible. La advertencia impide confundir la demo sintética con una predicción de planta.
- Se verificó `/riesgo` en navegador y en viewport 390 × 844; el desbordamiento inicial de la tabla se confinó a su contenedor y la página quedó sin desplazamiento horizontal global.
- ESLint y sus complementos de React quedaron instalados como dependencias de desarrollo. Se corrigieron dependencias inestables o redundantes sin alterar los recorridos; `npm run lint` termina con 0 errores y 1 advertencia de organización del contexto de autenticación.
- Cierre vigente: 191/191 pruebas web, 3/3 pruebas predictivas y build de producción exitosos. Las matrices institucionales adicionales completaron 149 verificaciones cloud de cuentas/rutas, cuatro escrituras permitidas, cuatro rechazadas, 132 decisiones locales de escritura y 231 combinaciones de rol/ruta. `npm run verify` reúne los controles de código en un comando.
- Recorridos reales de interfaz completados con Montacarguista, Operador Airlay, Jefe de Mantenimiento y Gerencia. Se comprobaron menús, acciones visibles, formularios permitidos y denegaciones por URL; no se guardaron operaciones ni se cambiaron contraseñas.
- El recorrido de Montacargas detectó un resultado vacío causado por el valor demo legado `fit_with_observations`. La interfaz ahora lo presenta de forma compatible y el generador usa los valores oficiales `attention_required`/`fit`; el dataset vigente contiene 274 registros demo y conserva una prueba contra etiquetas vacías.
- ESLint quedó en 0 errores y 0 advertencias después de estabilizar dependencias de consultas y documentar la excepción de recarga rápida del contexto de autenticación.
- Los valores iniciales de fecha/hora de correctivos, ejecuciones preventivas e inspecciones ahora se calculan explícitamente en `America/Guatemala`. También se normalizan las fechas de planes al editar o seleccionar; dos pruebas cubren el cambio de día entre UTC y Guatemala.
- `npm run preflight` ejecuta un diagnóstico de publicación sin red ni mutaciones: comprobó 14 condiciones locales y mantuvo 2 bloqueos correctos (`.env.local` y `.firebaserc` ausentes). `npm run preflight:cloud` devuelve error mientras esos requisitos no estén autorizados, evitando un despliegue accidental.
- El preflight no imprime valores de ambiente, verifica que Git no rastree `.local`, exportaciones de emuladores, `.env`, claves o cuentas de servicio y bloquea un paquete JavaScript mayor de 500 kB. Cinco pruebas cubren interpretación, no exposición, tamaño de build y bloqueo cloud.
- El paquete compartido de ~800 kB se separó por responsabilidad en React, autenticación, Firestore y plataforma Firebase. El mayor quedó en 308.12 kB (90.87 kB comprimidos), una reducción aproximada del 61.5 %. Se preservó el orden estricto de ejecución y el build se abrió desde `vite preview`; el login renderizó correctamente después de detectar y corregir una primera configuración que compilaba pero quedaba en blanco.
- El build de producción se sirvió localmente y se solicitaron 12 rutas directas (`/`, login, módulos, administración y perfil): todas respondieron HTTP 200 con el punto de montaje React. Esto valida la distribución local; el rewrite de Firebase Hosting deberá repetirse en la URL cloud.
- Firebase Hosting declara encabezados base `nosniff`, política de referencia, `SAMEORIGIN` y bloqueo de cámara/micrófono/ubicación. CSP se definirá con los dominios reales de Firebase y Power BI para no bloquear integraciones legítimas.
- Hosting Emulator confirmó HTTP 200 y rewrite de `/riesgo`, pero la respuesta demo no incluyó encabezados personalizados. El preflight comprueba nombres y valores; la verificación HTTP definitiva permanece como criterio de aceptación en la URL cloud.

Siguiente paso: ejecutar aceptación visual institucional con representantes de rol y completar datos reales de equipos/frecuencias. Después, acompañar la configuración cloud y las integraciones, avisando al usuario antes de SAP o SQL Server.

## Avance anterior — 2026-09-04

### Administración privilegiada de usuarios y persistencia verificada

- Se implementaron dos funciones backend locales: `createAppUser` y `updateAppUser`. Solo aceptan una sesión activa cuyo perfil Firestore tenga rol `administrator`; la interfaz por sí sola no concede la autorización.
- Crear una cuenta coordina Firebase Authentication, perfil con permisos derivados del catálogo de roles y auditoría sin contraseña. Si falla Firestore, elimina la identidad recién creada para evitar una cuenta huérfana.
- Actualizar sincroniza nombre, rol y estado con Authentication; revierte el cambio de identidad si falla el perfil. El servidor impide que el administrador se desactive o retire su propio rol.
- La pantalla Usuarios permite crear y editar perfiles únicamente al administrador. Se comprobó en navegador la creación de `tecnico.demo@cerofallas.local`, sus siete permisos, navegación limitada y denegación directa de `/admin/usuarios`.
- Se comprobó también que el backend rechaza el intento de desactivar al propio administrador y que la creación deja un evento en Auditoría.
- Recorrido autenticado de históricos: Correctivos cargó 12 registros y el filtro `Completado + Línea 1` devolvió 3; Incidentes cargó 7 y `Reportado` devolvió 3; Preventivos mostró 10 planes y 10 ejecuciones con estado de reprogramación. La Fase 12 sigue abierta por los demás roles y la decisión de búsqueda global.
- Suite vigente: 123/123 pruebas aprobadas y build de producción exitoso. Las pruebas nuevas verifican normalización, contraseña temporal, roles/estados inválidos, equivalencia exacta entre los 11 roles, autorización administrativa y bloqueo de auto-desactivación.
- El build servido como producción ya no queda en blanco cuando faltan variables Firebase: muestra el login, explica que el ambiente no está configurado y deshabilita el acceso. Se verificó en `vite preview`; con configuración cloud válida deberá repetirse la prueba antes de publicar.
- Se probaron dos estrategias de separación manual del bundle y se descartaron porque compilaban pero rompían el arranque servido. Se conserva el build funcional con advertencia no bloqueante del bloque compartido (~800 kB); la optimización requiere una estrategia compatible y prueba de navegador.
- `npm run emulators:save` quedó probado: guarda Authentication y Firestore, recupera la exportación temporal ante el error de renombrado de Windows y conserva la copia anterior. En ese avance contenía dos cuentas; la instantánea vigente fue ampliada a 11. Todo está ignorado por Git.
- Backend instalado en `functions/` con Firebase Admin 14.3.0 y Functions 7.3.2 para Node 22. `npm audit --omit=dev` reporta siete vulnerabilidades moderadas en la cadena transitiva oficial de Storage/HTTP/UUID. No se aplicó `--force`, porque propone degradar Firebase Admin con cambio incompatible; se revisará antes de publicar.
- No se accedió a SAP/SQL Server, Firebase cloud, cuentas reales ni datos productivos. Las funciones siguen únicamente en el emulador y todavía no tienen validación cloud/App Check.

Siguiente paso: reforzar la prueba directa de autorización de funciones, completar recorridos históricos por roles y preparar una lista de publicación sin desplegar. Antes de cualquier conexión SAP se avisará al usuario.

### Avance anterior: persistencia local y desglose por área

- Se diagnosticó por qué la cuenta anterior dejó de funcionar: Firebase Emulator había sido reiniciado sin importación/exportación. Se guardó una copia válida con Authentication y Firestore y se comprobó que el usuario demo vuelve a iniciar sesión después del reinicio.
- Nuevo comando `npm run emulators:start`: importa `emulator-data/` cuando existe y exporta al terminar normalmente. La carpeta está ignorada por Git y no contiene datos de producción.
- Dashboard ampliado con ranking de correctivos completados por área dentro del período seleccionado. Reutiliza exclusivamente la consulta autorizada de correctivos; no amplía permisos ni mezcla registros fuera de la ventana.
- Validación autenticada: Línea 1 y Línea 2 muestran 3 correctivos cada una; Línea 3 muestra 2 en la ventana demo de 30 días. Las áreas sin actividad no se presentan como cero ficticio.
- Verificación: build exitoso, revisión visual aprobada en escritorio y viewport móvil de 390 × 844, y 115/115 pruebas. Estimación local: 85 %; proyecto completo se mantiene en 60 % porque no se acreditan SAP, nube o predictivo.
- No se accedió a SAP/SQL Server, Firebase cloud o cuentas reales.

Siguiente paso: backend privilegiado de identidades o preparación controlada de publicación; ambos requieren separar claramente ambiente local y cloud.

### Avance anterior: datos demo y tendencia gerencial

- Generador idempotente de 75 registros locales: 8 equipos, 10 planes, 10 ejecuciones, 12 correctivos, 7 incidentes, 6 inspecciones, 10 repuestos y 12 eventos de auditoría. Los identificadores y textos señalan que no son información real de planta.
- Cuenta administrativa exclusiva del emulador con contraseña aleatoria en `.local/demo-login.txt`; la carpeta está ignorada por Git. No se versionó ni transmitió una credencial real.
- Dashboard validado con sesión autenticada: 6 incidentes abiertos, 3 planes vencidos, 4 próximos, 8 correctivos y 6 preventivos en la ventana de 30 días al momento de la prueba.
- Nueva gráfica comparativa de actividad correctiva y preventiva para 7, 30 o 90 días. Los intervalos excluyen el instante final del corte y no se presentan como cumplimiento, OEE o MTBF.
- Verificación visual aprobada en escritorio, build exitoso y 114/114 pruebas aprobadas. El script demo fue ejecutado dos veces sin duplicar registros.
- Estimación vigente: 60 % del proyecto completo y 84 % de la aplicación web local. SAP, SQL Server, Firebase cloud y datos productivos permanecen intactos.

Siguiente paso: agregados gerenciales por área con mínimo privilegio o backend de cuentas, seguido por preparación de publicación. Antes de SAP se mantiene la obligación de avisar al usuario.

### Avance anterior: reprogramación preventiva atómica

- Al completar una ejecución vinculada a un plan por calendario, la siguiente fecha se calcula desde el día realmente ejecutado. Se soportan días, semanas y meses; el fin de mes se ajusta al último día válido, incluido año bisiesto.
- Ejecución, actualización del plan y dos eventos de auditoría se confirman en una sola transacción. Si una escritura falla, ninguna queda aplicada.
- Un técnico con `preventive.execute` solo puede actualizar los cinco campos de reprogramación y únicamente si la misma operación crea una ejecución válida del mismo plan y equipo. No adquiere permiso general `preventive.manage`.
- Los planes por horas de uso o condición quedan marcados `manual_required`; no se inventa una próxima fecha mientras falten horómetro y criterio técnico validados.
- Verificación: build exitoso y 112/112 pruebas aprobadas con Firestore Emulator. Incluye cálculo calendario, extremos mensuales, operación coordinada y rechazo de cambios sin ejecución vinculada.
- Estimación vigente: 59 % del proyecto completo y 82 % de la aplicación web local, según la ponderación registrada arriba. No se accedió a SAP/SQL Server ni a servicios cloud.

Siguiente paso: recorrido visual autenticado; después, backend privilegiado de cuentas y cierre de operaciones administrativas. La integración SAP continúa detenida hasta avisar al usuario y recibir su intervención.

### Avance anterior: filtro seguro por equipo

- Correctivos e incidentes permiten consultar por un equipo exacto antes de paginar. Estado y fechas se pueden combinar con el equipo; área y equipo son alternativas excluyentes para mantener una consulta clara y un conjunto controlado de índices.
- El selector reutiliza el catálogo paginado de equipos. Solo se carga y muestra cuando el perfil tiene `equipment.read`; sin ese permiso permanece deshabilitado y no revela nombres del catálogo.
- La validación rechaza identificadores vacíos, mal formados o combinados simultáneamente con área antes de llegar a Firestore.
- Se declararon índices para equipo/fecha y estado/equipo/fecha en correctivos e incidentes. Permanecen locales y deben desplegarse y validarse en el proyecto cloud autorizado antes de producción.
- Verificación: build exitoso y 107/107 pruebas aprobadas con Firestore Emulator. Incluye filtros combinados por equipo, rechazo de parámetros inválidos y presentación restringida sin permiso de catálogo.
- No se accedió a SAP/SQL Server, no se solicitaron credenciales y no se modificaron cuentas, datos reales o servicios cloud.

Siguiente paso: recorrido visual autenticado de históricos y dashboard; después, definir la reprogramación preventiva y el backend privilegiado de cuentas. Fase 12 continúa parcial hasta completar esas validaciones y resolver el alcance de búsqueda global.

### Avance anterior: filtros combinados, período y defensa en profundidad

- Correctivos e incidentes aplican Estado + Área + Desde/Hasta en Firestore antes de paginar. Área y equipo se mantendrán separados hasta implementar el selector de equipo para evitar combinaciones e índices innecesarios.
- Dashboard con 7/30/90 días para actividad completada. El período se incluye en la identidad de la consulta para no mostrar resultados anteriores al cambiarlo. No limita incidentes abiertos ni agenda preventiva.
- Reglas reforzadas: actualizar equipos, correctivos, planes, ejecuciones o inspecciones requiere el permiso `.manage` correspondiente y que `roleId` sea `administrator` o `support`. El control de interfaz deja de ser la única barrera.
- Prueba negativa: un perfil `supervisor` con todos los permisos `.manage` asignados por error no pudo modificar ninguna de las cinco colecciones.
- Verificación: build exitoso y 103/103 pruebas aprobadas con emulador local. No se instaló ESLint, por lo que lint sigue sin ejecución. Advertencia de bundle compartido pendiente.
- No se modificaron cuentas, roles existentes, datos reales ni servicios cloud; tampoco se accedió a SAP/SQL Server. Las reglas e índices siguen únicamente en el repositorio hasta un despliegue autorizado.

Siguiente paso registrado entonces: filtro por equipo con selector seguro, completado en el avance vigente. Continúan pendientes el recorrido autenticado de históricos/dashboard y el backend privilegiado de cuentas. Antes de SAP se debe avisar al usuario para que ingrese personalmente su cuenta; las credenciales nunca van al frontend o al repositorio.

### Avance anterior: área, período y matriz de roles

- Correctivos e incidentes combinan estado, área y rango de fechas en consultas de servidor antes de paginar. Las siete áreas confirmadas provienen del catálogo institucional.
- Declarados índices para área/fecha y estado/área/fecha en ambas colecciones; no desplegados en nube.
- Dashboard: período seleccionable de 7, 30 o 90 días para correctivos y preventivos completados. Incidentes abiertos no se filtran por antigüedad porque un incidente antiguo pendiente continúa abierto. Agenda preventiva mantiene su ventana de próximos siete días respecto del corte.
- Catálogo central con 11 roles confirmados y descripciones de permisos. Valida permisos conocidos, duplicados y dependencias mínimas de lectura/auditoría. Administrador y soporte son los únicos perfiles propuestos con permisos `.manage`.
- La pantalla de Usuarios presenta esta matriz solo como referencia. No crea cuentas, cambia roles ni escribe perfiles. El script de creación local reutiliza el catálogo para futuros administradores de prueba; no se ejecutó.
- Verificación: build y 102/102 pruebas aprobados con emulador temporal. Incluye filtros combinados, períodos, roles y presentación segura de la matriz.
- `npm run lint` no se pudo ejecutar porque el script existe pero ESLint no está instalado. No se instaló ninguna dependencia; build y pruebas sí se ejecutaron. Persiste la advertencia no bloqueante del bloque compartido (~800 kB).
- No hubo acceso a SAP/SQL Server, credenciales, servicios de producción o cuentas reales. Antes de esa fase se avisará al usuario.

Pendientes inmediatos: recorrido autenticado; filtro por equipo; búsqueda global o autocompletado; backend privilegiado para cuentas; agregados gerenciales. SAP, Power BI, publicación y predictivo siguen bloqueados por preparación/datos/decisiones externas y no se simulan como terminados.

### Avance anterior: fechas, catálogo y selectores

- Correctivos e incidentes permiten filtrar Desde/Hasta en servidor. El día se interpreta en America/Guatemala y Hasta incluye el día completo mediante límite exclusivo del siguiente día.
- La interfaz valida formato y orden antes de aplicar fechas; editar campos no dispara lecturas hasta pulsar Aplicar fechas. Limpiar reinicia estado, fechas y búsqueda local.
- Equipos se incorporó al histórico paginado y filtra estado en servidor; queda eliminada la ventana fija de 50 en el catálogo visible.
- Los selectores de formularios recorren automáticamente equipos y planes en páginas de 100, con desempate por ID. Límite de seguridad: 1,000; si se excede, falla explícitamente en vez de presentar una lista incompleta.
- Índice de equipo por estado/código declarado, no desplegado. Los filtros combinados existentes reutilizan índices de estado y fecha declarados; el emulador no prueba creación de índices en nube.
- Verificación final: 90/90 pruebas y build aprobados. Incluye día completo de Guatemala, rango invertido, equipo paginado/filtrado y selectores con más de 100 registros sin omisiones o duplicados.
- No se consultó SAP, no se solicitaron credenciales, no se desplegó a Firebase y no se modificaron usuarios ni datos reales.

Pendientes antes de cerrar Fase 12: recorridos autenticados; filtros de área/equipo; decidir búsqueda global segura o mantener búsqueda incremental; tratar catálogos mayores a 1,000 con autocompletado en servidor. Fases 13–14 siguen parciales. Para SAP/SQL Server, detenerse y avisar al usuario antes de cualquier acceso.

### Avance anterior: paginación transversal

- Extendida la carga incremental de 25 registros a incidentes, planes preventivos, ejecuciones, inspecciones, auditoría, stock y perfiles de usuario.
- Incidentes filtra estado en servidor. Guardar seguimiento reinicia el histórico sin confundir fallo de recarga con fallo de escritura.
- Planes ordenados por próxima fecha ascendente; ejecuciones e inspecciones por fecha descendente. Los dos históricos preventivos tienen controles independientes.
- Auditoría, stock y usuarios continúan de solo lectura. Búsqueda textual limitada explícitamente a registros cargados, no búsqueda global de SAP.
- Controles compartidos con carga, recuento, reintento y fin de resultados; un fallo no se presenta como ausencia de información. Se conserva lo ya cargado si falla una página adicional.
- Servicio limitado a colecciones predefinidas; Firestore conserva la autorización efectiva. Índice de incidentes por estado/fecha declarado, no desplegado.
- Pruebas: 81/81 aprobadas con emulador temporal, incluyendo las 7 fuentes nuevas, desempates, fin exacto, filtro de estado y rechazo sin permisos; pruebas de render para ausencia de acceso y preservación de filas ante errores. Build exitoso; advertencia de tamaño compartido (~800 kB) pendiente.
- Limitaciones: los documentos sin campo de orden no aparecen; las consultas no son una instantánea transaccional y cambios concurrentes requieren Actualizar. Las pruebas de render no sustituyen interacción visual autenticada. No se modificaron datos reales, cuentas, roles ni el Word académico.

Siguiente trabajo interno: filtros estructurados de históricos y revisión de selectores limitados; después avanzar dashboard y administración privilegiada sin desplegar ni ampliar accesos de forma implícita. Dependencias externas siguen pendientes: consulta SQL/esquema, conexión de planta, catálogo real, histórico predictivo y decisiones de publicación/costo.

### Avance anterior del día: correctivos y consolidación

- Consolidado este documento con fases 0–24, estados, condiciones de cierre y orden de reanudación, conservando el historial.
- Correctivos: carga incremental de 25 registros mediante cursor; desempate por ID; filtro de estado aplicado antes del límite en Firestore.
- Búsqueda de texto explícitamente limitada a registros cargados; botón Actualizar reinicia consulta y Cargar más amplía el histórico.
- Respuestas antiguas se descartan al cambiar consulta/sesión; errores de carga adicional conservan los registros ya cargados. Se deduplican IDs entre páginas.
- Añadido índice status + startedAt para correctivos; no desplegado en nube. Los registros sin startedAt no aparecen; las escrituras concurrentes requieren Actualizar y no se promete una instantánea histórica inmutable.
- Verificación: build exitoso; 65/65 pruebas aprobadas con Firestore Emulator. Prueba de 61 correctivos con fechas iguales, filtro global de estado, página final exacta, lista vacía, permisos y parámetros inválidos.
- La primera ejecución de pruebas falló por emulador apagado, no por una aserción funcional. Se inició temporalmente el emulador existente, se ejecutó toda la suite y se apagó al terminar. No se instalaron dependencias ni se desplegaron servicios.
- Pendiente: validación visual autenticada de paginación y dashboard; no se alteraron cuentas ni el documento académico que el usuario está revisando.

Siguiente paso registrado entonces: paginación de incidentes. Implementada en la continuación anterior de este documento; Fase 12 sigue sin cierre por filtros y validaciones pendientes.

## Registro anterior — 2026-09-03: dashboard

Continuación: dashboard operativo conectado y login actualizado.

- Login con mensaje aprobado: «Cuida tus equipos. Fortalece tu operación».
- Dashboard con incidentes abiertos, planes con fecha vencida, próximos 7 días y correctivos completados; ejecuciones preventivas acumuladas en panel secundario.
- Agenda: hasta 5 vencidos y 5 próximos; conteos agregados completos, independientes del límite de listas.
- Atención: hasta 5 incidentes críticos y 5 altos abiertos, antiguos primero por prioridad.
- Hora de Guatemala, corte explícito, actualización manual y estados de error/sin permiso sin ceros ficticios. No hay filtros por área/período ni gráficos aún.
- Consultas solo de lectura del servidor; no se ampliaron permisos ni se modificaron usuarios. Gerencia con solo dashboard.read todavía necesita agregados seguros, no permisos a las fuentes.
- Índices compuestos declarados en firestore.indexes.json; no desplegados en nube. El emulador no valida la disponibilidad de índices de producción.
- Carga diferida por rutas: el bloque principal bajó de 881.57 a 797.09 kB sin comprimir en este avance; persiste advertencia de tamaño por dependencias compartidas.

Verificación vigente: 59/59 pruebas aprobadas (fechas, permisos, render y consultas reales al emulador) y build aprobado. Login comprobado en navegador. Recorrido visual autenticado del nuevo dashboard pendiente con la cuenta del usuario; no se conoce su contraseña ni se creó una cuenta adicional.

Limitación registrada en ese momento: una ejecución no reprogramaba `nextDueAt`. Esto fue corregido posteriormente para planes calendario; horas y condición continúan manuales. Las consultas paralelas del dashboard no constituyen una instantánea transaccional.

## Registro anterior — Fase 12

Fase 12: incidentes implementados técnicamente; avance adicional en consultas administrativas y dashboard.

- Reporte de incidentes con validación, prioridad, área y equipo opcional.
- Seguimiento exclusivo de administrador/soporte con motivo y auditoría atómica obligatoria.
- Vínculo a correctivo existente, con validación de área y equipo; sin conversión automática todavía.
- Inicio con conteos agregados reales de correctivos, ejecuciones preventivas, planes activos e incidentes abiertos.
- Consultas de perfiles/usuarios, auditoría y stock; Mi perfil funcional.
- Navegación filtrada por permisos; nuevas reglas de Firestore y 14 pruebas adicionales.
- Administrador existente del emulador actualizado con permisos de las nuevas consultas; no se cambiaron otros roles ni se crearon cuentas.

Verificación: 43/43 pruebas automatizadas y build de producción aprobados. Revisión de navegador limitada a la pantalla de acceso; el nuevo flujo autenticado requiere validación manual del usuario. Advertencia no bloqueante de bundle de aproximadamente 875 kB; queda pendiente dividir carga por rutas.

Siguiente trabajo: validar recorrido manual documentado en `docs/guia-avance-incidentes.md`, paginación de históricos, alta y administración privilegiada de usuarios, agregados gerenciales con mínimo privilegio, integración segura de stock y preparación de Power BI/predictivo.

Pendiente externo: consulta/esquema SQL autorizado, conectividad de planta, equipos reales, histórico, modalidad Power BI y autorización de cualquier costo cloud. Stock no contiene existencias inventadas. El entregable académico se conserva como versión histórica.

## Registro anterior — Fase 11

Fecha: 2026-09-03

Fase: Fase 11 — Checklist de montacargas

Paso: 11.1 — Plantilla versionada, inspección y resultado operativo

Estado: COMPLETADO TÉCNICAMENTE

Objetivo alcanzado:

Crear un checklist diario integral debido a que la planta no posee un formulario oficial suministrado para el proyecto.

Último resultado confirmado:

- Plantilla `forklift-daily-v1`, versión 1, con 25 puntos en cuatro secciones.
- Revisa llantas, horquillas, mástil/cadenas, mangueras, cilindros, fugas, aceite, refrigerante, batería, frenos, dirección, elevación, inclinación, bocina, luces y elementos de seguridad.
- Cada punto admite Bueno, Requiere atención, Fuera de servicio o No aplica.
- Los puntos críticos están identificados y cualquier falla crítica produce `out_of_service`.
- Las condiciones defectuosas exigen observación antes de guardar.
- Se registran montacargas, operador, fecha/hora, turno, horómetro, versión de plantilla, respuestas y resultado calculado.
- El selector muestra únicamente equipos activos identificados como montacargas.
- La inspección y su auditoría se guardan atómicamente; el borrado físico está prohibido.

Pruebas exitosas:

- Suite completa: 29 de 29 pruebas aprobadas.
- P-014: plantilla completa validada en navegador.
- Una falla ficticia en freno de servicio produjo una falla crítica y “Fuera de servicio — no operar”.
- `npm run build`: aprobado después de la corrección del estado incompleto.

Pendientes externos:

- Códigos y modelos reales de montacargas.
- Validación del checklist por el responsable de seguridad o mantenimiento de planta.
- Evidencia fotográfica, condicionada a la decisión futura sobre Firebase Cloud Storage y facturación.
- Identidad del futuro técnico de soporte.

Riesgos vigentes:

- La plantilla es una propuesta técnica y debe aprobarse en planta antes de considerarse institucional.
- No existe histórico real suficiente para validar modelos predictivos.

Siguiente acción exacta:

Iniciar la Fase 12 — incidentes operativos para Digitadores y Operadores de Airlay, orientados al reporte gerencial y posible conversión a correctivo.
