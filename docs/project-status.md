# CEROFALLAS — ESTADO ACTUAL

## Control maestro de fases — actualizado 2026-09-04

Este es el único documento de seguimiento de fases. Se conserva la numeración del apartado 33 de `../Prompt_Maestro_CeroFallas_V2.md`. Los registros históricos siguientes son evidencia de avances, no una segunda hoja de ruta. La entrega universitaria editable continúa en su archivo maestro independiente.

Estados: **Base lista** = definición o implementación local con evidencia; no equivale a validación de planta ni producción. **Parcial** = faltan requisitos o validaciones. **Pendiente** = sin implementación validada. **En curso** = trabajo transversal que continuará hasta el cierre.


| Fase | Alcance original | Estado | Evidencia y condición para cerrar |
|---|---|---|---|
| 0 | Confirmación del alcance | Base lista | Web responsive y módulos acordados; mantener decisiones ante cambios. |
| 1 | Preparación del entorno | Base lista | React/Vite, Git y emuladores operativos; entorno documentado. |
| 2 | Requerimientos | Base lista | Requisitos, casos de uso y aceptación documentados; validar datos reales pendientes. |
| 3 | Modelo de datos | Base lista | Modelo lógico y colecciones operativas; reconciliar diferencias de implementación e integraciones. |
| 4 | Arquitectura | Base lista | React + Firebase; SAP, BI y predictivo desacoplados; falta validar servicios externos. |
| 5 | Diseño de interfaz | Parcial | UI responsive y 15 mockups; comprobar recorridos completos y adaptar lo aún conceptual. |
| 6 | Configuración de Firebase | Parcial | Configuración local y reglas; índices y entorno cloud pendientes de despliegue autorizado. |
| 7 | Autenticación | Base lista local | Login, persistencia y rutas protegidas; revisión final por perfiles pendiente. |
| 8 | Catálogo de equipos | Parcial | Alta, consulta, edición y desactivación; faltan códigos/modelos y catálogo de planta. |
| 9 | Mantenimiento correctivo | Base funcional local | Registro, duración, consulta y anulación auditada; revisión integral y datos reales pendientes. |
| 10 | Mantenimiento preventivo | Base funcional local | Planes, ejecuciones y reprogramación atómica para frecuencias calendario. Faltan validar frecuencias reales y definir horómetro/condición. |
| 11 | Checklist de montacargas | Base funcional local | 25 puntos y resultado operativo; aprobación técnica de plantilla y equipos reales pendientes. |
| 12 | Históricos y filtros | Parcial avanzado | Paginación de todos los listados; filtros de estado, área, equipo y fechas. Recorridos autenticados aprobados en correctivos, incidentes y preventivos. Faltan otros roles y decidir búsqueda global. |
| 13 | Dashboard | Parcial avanzado | Agenda, prioridades, períodos 7/30/90, tendencia y correctivos por área conectados; recorrido autenticado aprobado localmente. Falta validación con datos reales y criterios gerenciales finales. |
| 14 | Seguridad y roles | Parcial avanzado | Catálogo de 11 roles, doble validación rol + permiso y backend privilegiado local para crear/actualizar cuentas. Faltan despliegue cloud, asignación institucional y prueba integral de los 11 roles. |
| 15 | Power BI | Pendiente de integración | Obtener modalidad de acceso, consulta/esquema autorizado y conexión segura; licencia de publicación no demuestra acceso de todos los lectores. |
| 16 | Publicación en Internet | Pendiente | Hosting preparado localmente; requiere proyecto, revisión de seguridad, configuración e índices y autorización de costos si aplica. |
| 17 | Dataset predictivo | Pendiente | Sin histórico real; acordar recopilación, calidad y etiquetado. |
| 18 | Ingeniería de variables | Propuesta, no validada | Variables descritas; construirlas y comprobar disponibilidad sin fuga de datos. |
| 19 | Entrenamiento y comparación | Pendiente | Comparar modelos cuando existan datos suficientes; no hay métricas reales. |
| 20 | Integración de predicciones | Pendiente | Pantalla conceptual; falta servicio y resultados versionados validados. |
| 21 | Automatización cada 24 horas | Pendiente | Depende de fuentes, modelo, infraestructura y costos autorizados. |
| 22 | Pruebas generales | En curso | Suite del 2026-09-04: 123/123, build y recorridos autenticados administrador/técnico; no es aceptación final. Faltan nube y matriz integral de roles. |
| 23 | Documentación | En curso | Entrega 2 Word/PDF y documentación técnica; actualizar al cerrar avances y completar datos académicos. |
| 24 | Presentación final | Parcial | Guía de defensa incluida en entrega 2; falta ensayo final y evidencia del sistema terminado. |

### Medición del avance

**Proyecto completo estimado: 62 %. Aplicación web principal en entorno local: 87 %.**

La medición completa incluye aquello que todavía depende de planta, nube y datos predictivos; por eso es menor que el estado de la aplicación local. Se usa una ponderación estable para no aumentar el porcentaje solo por agregar pantallas:

| Bloque | Peso del proyecto | Cumplimiento verificable | Aporte |
|---|---:|---:|---:|
| Análisis, diseño y documentación | 15 % | 85 % | 12.75 % |
| Aplicación web principal | 40 % | 87 % | 34.80 % |
| Seguridad y pruebas | 15 % | 80 % | 12.00 % |
| Publicación e integraciones SAP/Power BI | 15 % | 10 % | 1.50 % |
| Predictivo y automatización | 15 % | 5 % | 0.75 % |
| **Total redondeado** | **100 %** |  | **62 %** |

Solo se acredita como cumplimiento aquello implementado o documentado con evidencia. Una base local no equivale a despliegue cloud, datos reales o aceptación de planta. Recalcular con estos mismos pesos al cerrar criterios verificables.

### Punto de reanudación y orden inmediato

1. Fase 12: completar recorridos autenticados de históricos y decidir búsqueda global. Correctivos e incidentes ya filtran por estado, área, equipo y fechas; los selectores recorren hasta 1,000 opciones.
2. Fase 14: ampliar pruebas negativas de las funciones de usuarios y validar la matriz institucional completa; publicar solo después de configurar proyecto, App Check/costos y ambiente cloud autorizado.
3. Fase 10: validar en planta frecuencias y datos de horómetro/condición. No inventar reprogramaciones automáticas para esos dos métodos.
4. Integraciones: recibir consulta SQL/esquema, conectividad, catálogo real y definición de acceso a Power BI. Avisar al usuario antes de SAP y no almacenar credenciales en frontend.

Incidentes se conserva como **módulo adicional transversal**, relacionado con históricos (12), dashboard (13) y seguridad (14). Los encabezados anteriores «Fase 12: incidentes» fueron una desviación de nomenclatura, no el cierre de la fase original de históricos.

### Regla de cierre y actualización

Al terminar un avance, actualizar esta tabla y registrar: cambio concreto, pruebas realmente ejecutadas, pendientes, dependencias y siguiente paso. No marcar una fase completa solo por tener pantalla o build exitoso. No atribuir porcentajes globales sin criterios de aceptación medibles. La evidencia de pruebas anterior conserva su fecha: no implica una nueva ejecución hoy.

## Avance vigente — 2026-09-04

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
- `npm run emulators:save` quedó probado: guarda Authentication y Firestore, recupera la exportación temporal ante el error de renombrado de Windows y conserva la copia anterior. La instantánea actual contiene dos cuentas locales y datos demo; todo está ignorado por Git.
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
