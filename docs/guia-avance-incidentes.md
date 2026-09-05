# Avance: incidentes, consultas y dashboard

## Qué se agregó y para qué sirve

- **Incidentes:** digitadores y operadores Airlay pueden capturar ubicación, equipo opcional, descripción y prioridad. El instante de reporte lo fija el servidor. El formulario no sustituye el procedimiento de emergencia de planta.
- **Seguimiento:** administrador y soporte pueden revisar, poner en atención, resolver o anular. Se exige motivo. Se puede vincular un correctivo existente de la misma área y, si se conoce, del mismo equipo. La relación se almacena en `incidents.linkedCorrectiveId`; todavía no hay creación automática ni referencia inversa en el correctivo.
- **Dashboard:** incidentes abiertos, planes con fecha vencida, próximos 7 días y correctivos completados; ejecuciones completadas en panel secundario. Los conteos son agregados completos. Las listas muestran hasta 5 planes por grupo y hasta 5 incidentes críticos + 5 altos. No se presenta cumplimiento global, MTBF ni OEE sin datos suficientes.
- **Usuarios:** consulta de perfiles, roles, estado y permisos. No crea identidades ni modifica privilegios todavía.
- **Auditoría:** consulta de los últimos 100 eventos, búsqueda en esa ventana y visualización del motivo.
- **Stock:** interfaz de lectura con código, descripción, cantidad, almacén y fecha de sincronización. Colección `stock`, sin escrituras desde navegador. SAP aún no está conectado.
- **Mi perfil:** muestra la identidad, rol, entorno y permisos de la sesión.
- **Navegación:** oculta módulos sin permiso. La protección efectiva sigue estando en Firestore y en las pantallas.

## Cómo está construido

El flujo es pantalla React → validación → servicio Firebase → reglas → base de datos.
`src/utils/incidents.js` contiene la validación reutilizable; `src/services/firebase/incidents.js` encapsula la persistencia.
La creación usa un lote y el seguimiento una transacción. Las reglas exigen que exista un evento de auditoría nuevo en la misma operación mediante `getAfter`; si falla cualquier escritura no se confirma el cambio.
La transacción comprueba el estado vigente antes de modificar, evitando sobrescribir una anulación concurrente.

Las consultas generales están en `src/services/firebase/reporting.js`; las del dashboard en `src/services/firebase/dashboard.js`. Un fallo de conexión no se muestra como cero. La consulta de usuarios continúa sin permisos de escritura para impedir que alguien se convierta en administrador desde el navegador.

El dashboard divide responsabilidades: React presenta la pantalla; `utils/dashboard.js` define la ventana temporal y las fuentes autorizadas; el servicio consulta Firestore; las reglas siguen autorizando cada lectura. Se usa hora de Guatemala para presentar fechas. El corte define una ventana de 168 horas, incluyendo su inicio y excluyendo su fin. Las lecturas se ejecutan en paralelo, no como una instantánea transaccional. Los planes sin `nextDueAt` no participan en la agenda.

Una ejecución asociada a un plan calendario reprograma la siguiente fecha de forma atómica desde el día ejecutado. Los planes por horas o condición exigen revisión manual hasta contar con horómetro y reglas técnicas validadas. Las frecuencias continúan siendo estimadas. Las rutas usan `React.lazy` y `Suspense`: cada pantalla se descarga cuando se necesita; Firebase y React siguen formando parte de la carga compartida.

## Cómo probar localmente

1. Mantener Authentication y Firestore Emulator activos (9099 y 8080).
2. Ejecutar `npm run dev` y abrir http://127.0.0.1:5173.
3. Usar la cuenta de prueba local. El acceso administrativo vigente está en `.local/demo-login.txt`, archivo ignorado por Git. No copiar esa contraseña a documentación ni código.
4. Abrir Incidentes → Reportar incidente; seleccionar área y describir al menos 10 caracteres. El equipo es opcional.
5. Guardar y comprobar el reporte en el listado. Abrir Auditoría para revisar el evento `incident`.
6. Dar seguimiento con motivo; probar el filtro de estado y la anulación. Un registro anulado no se puede volver a modificar.
7. Abrir Inicio y actualizar: un incidente abierto incrementa el conteo; al resolverlo deja de contar como abierto.
8. Abrir Usuarios y comprobar que el administrador puede crear o actualizar cuentas. El técnico demo debe ver navegación limitada y recibir acceso denegado al abrir directamente `/admin/usuarios`.
9. Abrir Mi perfil y Repuestos. Sin sincronización real, Stock debe explicar que no hay datos, no inventar cantidades.
10. Ejecutar `npm test` con el emulador Firestore activo y `npm run build`. Antes de cerrar los emuladores, guardar cambios con `npm run emulators:save`.

### Datos demostrativos y tendencia — 2026-09-04

- Con los emuladores activos, `npm run seed:demo` crea o refresca 75 registros coherentes sin multiplicarlos. Todos usan identificadores deterministas y referencias válidas entre equipos y actividades.
- `npm run seed:demo-user` crea una cuenta administrativa exclusivamente local y guarda el acceso aleatorio en `.local/demo-login.txt`, ruta ignorada por Git. Se ejecuta una vez por sesión limpia del emulador.
- En Inicio se validaron visualmente los conteos, las listas prioritarias, la agenda y la gráfica correctivos vs. preventivos. Cambiar 7/30/90 días vuelve a consultar y reagrupar el período.
- La gráfica representa volumen de actividad completada. No debe explicarse como cumplimiento, disponibilidad, OEE, MTBF o predicción.
- El panel incluye además correctivos completados por área, usando el mismo período seleccionado y sin aumentar permisos.
- Resultado vigente: build exitoso y 123/123 pruebas aprobadas. No se accedió a SAP, SQL Server, Firebase cloud ni datos reales.

### Recorrido del dashboard actualizado

- Entrar con la cuenta local existente y abrir Inicio. Confirmar el nuevo mensaje del login antes de entrar.
- Pulsar Actualizar datos: comprobar la fecha de corte y los estados de carga.
- Comparar los incidentes abiertos con el listado. Resueltos y anulados no cuentan; el panel prioritario no incluye prioridad media/baja.
- Comparar agenda con planes activos: antes del corte = fecha vencida; desde corte hasta antes de 7 días = próximos. Anulados y pausados no cuentan.
- Revisar en ventana estrecha y móvil: tarjetas apiladas, textos y botones completos. Confirmar la navegación hacia preventivos e incidentes.
- Un perfil sin permisos de fuente debe ver un guion y una explicación, no datos ni cero. La prueba automatizada comprueba además que Firestore rechaza la consulta.
- No desplegar sin crear los índices declarados y validar en un entorno cloud autorizado. Las pruebas locales no validan índices de producción.

Resultado automatizado del avance: 59/59 pruebas. Login comprobado visualmente; recorrido autenticado pendiente del usuario. No se cambiaron contraseñas ni se crearon cuentas nuevas.

## Permisos nuevos

- Reportantes: `incident.create`, `incident.read`, `audit.write`; `equipment.read` para selección del catálogo. La lectura de incidentes actualmente es global para quien recibe `incident.read`, no está segmentada por área o autor.
- Administrador/soporte: además `incident.manage`; las reglas verifican el rol para el seguimiento.
- Dashboard: `dashboard.read` más el permiso de lectura de cada fuente. Sin permiso de fuente, la tarjeta muestra un guion.
- Consulta de perfiles: `users.read`; stock: `stock.read`.

No se aprovisionaron cuentas nuevas ni se cambiaron roles no administrativos existentes. Falta definir y desplegar los perfiles institucionales con mínimo privilegio.

## Límites y siguientes pasos

### Administración de usuarios — 2026-09-04

- Usuarios muestra un formulario de alta y edición solo cuando el perfil activo tiene rol `administrator`. Elegir el rol deriva automáticamente sus permisos; la contraseña temporal solo se usa para crear la identidad y no se guarda en Firestore ni en auditoría.
- Las funciones `createAppUser` y `updateAppUser` vuelven a comprobar la sesión, el perfil activo y el rol en el servidor. Ocultar un botón no es el control de seguridad.
- El backend sincroniza Authentication con el perfil Firestore. Si una de las partes falla, compensa o revierte para no dejar una identidad huérfana o un perfil incoherente.
- El administrador no puede desactivarse ni quitarse su propio rol. Esta regla fue comprobada en navegador y devolvió rechazo del servidor.
- Se creó una cuenta técnica ficticia y se verificó que solo ve Correctivos, Preventivos, Equipos y Repuestos. La ruta administrativa directa fue denegada.
- Con administrador se recorrieron Correctivos (12 registros; 3 al filtrar completados de Línea 1), Incidentes (7 registros; 3 reportados) y Preventivos (10 planes y 10 ejecuciones). Los filtros se aplicaron sobre Firestore y los historiales terminaron sin errores.
- Todo este flujo sigue en emuladores locales. Antes de producción faltan despliegue controlado, App Check, revisión de costos/dependencias y pruebas de los demás roles institucionales.

### Seguridad reforzada — 2026-09-04

- La interfaz oculta acciones según permisos, pero Firestore verifica además el rol para cualquier modificación posterior de equipos, correctivos, planes, ejecuciones e inspecciones.
- Solo `administrator` y `support` pueden superar esa doble condición. Asignar accidentalmente `.manage` a otro rol no habilita la operación.
- Para demostrarlo: describir la prueba de un supervisor con cinco permisos `.manage`; las cinco actualizaciones fueron rechazadas. La suite más reciente contiene 115/115 pruebas aprobadas.
- Estas reglas están en el repositorio local, no desplegadas. No se han cambiado perfiles existentes ni se ha ingresado a SAP.

### Área, dashboard y roles — 2026-09-04

- En Correctivos e Incidentes, seleccionar Estado, Área, Desde/Hasta y pulsar Aplicar filtros. Área y fechas viajan a Firestore; el texto permanece sobre registros cargados.
- En Inicio, elegir 7, 30 o 90 días. El período cambia correctivos completados y ejecuciones preventivas; no elimina incidentes abiertos antiguos ni cambia la agenda de próximos siete días.
- En Usuarios, abrir los roles de referencia. La matriz explica permisos técnicos, pero no contiene controles para guardar o asignar roles.
- Resultado automatizado: 102/102 pruebas y build exitoso. El lint sigue no disponible porque ESLint no está instalado en el proyecto.
- No usar el frontend para crear identidades o elevar privilegios. Esa función requiere un backend privilegiado, validación del rol solicitante, auditoría y configuración cloud autorizada.
- No se accedió a SAP. Antes de ingresar credenciales SQL, el usuario debe intervenir y el secreto nunca debe incorporarse al código cliente.

### Filtro por equipo — 2026-09-04

- En Correctivos e Incidentes se puede elegir Área o Equipo, pero no ambos. Estado y Desde/Hasta sí se combinan con cualquiera de esas dos opciones.
- El selector consulta el catálogo autorizado y permite localizar tanto equipos activos como históricos. Un perfil sin `equipment.read` lo ve deshabilitado y no recibe los nombres del catálogo.
- Pulsar Aplicar filtros reinicia la paginación y envía el identificador exacto del equipo a Firestore; Limpiar restaura todos los filtros.
- Se declararon los índices compuestos requeridos en `firestore.indexes.json`, pero todavía no se han desplegado ni validado en Firebase cloud.
- Resultado técnico de ese bloque: build exitoso y 107/107 pruebas aprobadas con el emulador local. La suite vigente aumentó posteriormente a 112/112.

### Reprogramación preventiva — 2026-09-04

- Seleccionar un plan activo y registrar la ejecución. Si la frecuencia es calendario, CeroFallas calcula la nueva fecha desde el día ejecutado y actualiza el plan en la misma transacción.
- Días y semanas se suman como períodos completos. En meses se conserva el día cuando existe; por ejemplo, 31 de enero + 1 mes se ajusta al último día de febrero.
- La ejecución registra `rescheduleStatus`: `automatic`, `manual_required` o `not_applicable`. Los registros anteriores se muestran explícitamente como anteriores al nuevo estado.
- Un técnico no puede editar los demás datos del plan. Las reglas solo aceptan la actualización automática cuando existe en la misma operación una ejecución del mismo plan, equipo y usuario.
- Los planes por horas o condición no se reprograman automáticamente porque aún faltan el horómetro y la regla técnica oficial. Esto evita presentar una fecha inventada como dato real.
- Resultado vigente: build exitoso y 112/112 pruebas aprobadas. No se conectó SAP, SQL Server ni Firebase de producción.

### Filtros de fecha y selectores — 2026-09-04

- Correctivos e incidentes tienen Desde/Hasta. Aplicar fechas valida el rango y reinicia la paginación; Hasta incluye todas las horas del día seleccionado en Guatemala.
- Cambiar solo el texto de una fecha no consulta Firestore: hay que pulsar Aplicar fechas. El estado sí se aplica inmediatamente en servidor.
- Equipos ahora es un catálogo paginado con filtro de estado global. El texto se mantiene como búsqueda sobre registros cargados.
- Los formularios recorren equipos y planes por páginas de 100 hasta 1,000. Más de 1,000 produce error explícito: la solución futura es autocompletado con búsqueda en servidor, no aumentar indefinidamente el límite.
- Probar rangos de un día, varios días, límite inicial/final, rango invertido, cambio de estado y Limpiar. Verificar la hora de registros cerca de medianoche.
- Resultado: 90/90 pruebas y build exitoso. No se accedió a SAP ni a servicios cloud.

### Históricos extendidos — 2026-09-04

- Incidentes, preventivos, inspecciones, auditoría, stock y usuarios ahora permiten Cargar más (25 por consulta). Planes y ejecuciones se recorren por separado.
- El estado de incidentes se aplica antes de paginar. Tras guardar seguimiento, se recarga la primera página del estado seleccionado: un incidente que cambió de estado puede desaparecer correctamente de esa lista.
- En auditoría, stock, usuarios e incidentes, el texto busca solo entre registros cargados. Sin coincidencias no significa ausencia de datos en páginas posteriores.
- Probar Actualizar, Cargar más, cambio de estado y error de conexión; comprobar que se conserven filas ya cargadas al fallar la página siguiente. Cada fuente mantiene sus permisos originales.
- No se crearon usuarios ni se integró SAP. Los selectores de formularios aún deben revisarse, pues usan servicios distintos de los históricos.
- Verificación técnica: 81/81 pruebas y build aprobado. Recorrido autenticado en navegador pendiente; no se han publicado índices en nube.

### Correctivos paginados — 2026-09-04

1. Abrir Correctivos con una sesión autorizada. Se consultan los primeros 25 por inicio descendente.
2. Pulsar Cargar más para ampliar el listado; con más de 50 registros, ahora pueden recorrerse los restantes.
3. Cambiar Estado: la consulta vuelve a empezar y filtra en Firestore, no solo dentro de la primera página.
4. Buscar texto: el contador y el aviso indican que se buscan coincidencias entre registros cargados. Una búsqueda sin coincidencias no implica que no existan en páginas posteriores.
5. Actualizar reinicia la consulta. Es necesario si otro usuario modifica registros durante el recorrido.
6. Si falla una carga adicional, los datos anteriores permanecen y puede reintentarse. Si falta el índice en nube, se debe desplegar en el entorno autorizado antes de dar por validada la consulta.

Implementación: `correctiveHistory.js` usa cursor de documento y lee un registro extra para detectar la siguiente página; `usePagedHistory.js` administra carga, errores, cambios de consulta y deduplicación. Ninguno realiza escrituras. La prueba automática de 61 registros valida consultas y permisos; la interacción autenticada queda pendiente. Fase 12 sigue parcial.

Validación funcional manual del nuevo flujo por el usuario; paginación real en históricos y stock; administración privilegiada de identidades; dashboard gerencial con vistas agregadas sin abrir acceso innecesario a datos fuente; integración SQL Server/SAP; Power BI; dataset predictivo real y despliegue público.
El PDF de segunda entrega conserva su fotografía del estado anterior; no se regeneró automáticamente en este avance.
