# Avance: incidentes, consultas y dashboard

## Qué se agregó y para qué sirve

- **Incidentes:** digitadores y operadores Airlay pueden capturar ubicación, equipo opcional, descripción y prioridad. El instante de reporte lo fija el servidor. El formulario no sustituye el procedimiento de emergencia de planta.
- **Seguimiento:** administrador y soporte pueden revisar, poner en atención, resolver o anular. Se exige motivo. Se puede vincular un correctivo existente de la misma área y, si se conoce, del mismo equipo. La relación se almacena en `incidents.linkedCorrectiveId`; todavía no hay creación automática ni referencia inversa en el correctivo.
- **Dashboard:** cuatro conteos agregados de Firestore sobre todos los registros permitidos: correctivos completados, ejecuciones completadas, planes activos e incidentes abiertos. No son conteos sobre una lista limitada. No se presenta cumplimiento global, MTBF ni OEE sin datos suficientes.
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

Los servicios de consulta están en `src/services/firebase/reporting.js`. Un fallo de conexión no se muestra como cero. La consulta de usuarios continúa sin permisos de escritura para impedir que alguien se convierta en administrador desde el navegador.

## Cómo probar localmente

1. Mantener Authentication y Firestore Emulator activos (9099 y 8080).
2. Ejecutar `npm run dev` y abrir http://127.0.0.1:5173.
3. Usar la cuenta de prueba existente. El script `node scripts/upgrade-emulator-profiles.mjs` agrega los nuevos permisos sólo a administradores activos en `demo-cerofallas` local.
4. Abrir Incidentes → Reportar incidente; seleccionar área y describir al menos 10 caracteres. El equipo es opcional.
5. Guardar y comprobar el reporte en el listado. Abrir Auditoría para revisar el evento `incident`.
6. Dar seguimiento con motivo; probar el filtro de estado y la anulación. Un registro anulado no se puede volver a modificar.
7. Abrir Inicio y actualizar: un incidente abierto incrementa el conteo; al resolverlo deja de contar como abierto.
8. Abrir Usuarios, Mi perfil y Repuestos. Sin sincronización real, Stock debe explicar que no hay datos, no inventar cantidades.
9. Ejecutar `npm test` con el emulador Firestore activo y `npm run build`.

## Permisos nuevos

- Reportantes: `incident.create`, `incident.read`, `audit.write`; `equipment.read` para selección del catálogo. La lectura de incidentes actualmente es global para quien recibe `incident.read`, no está segmentada por área o autor.
- Administrador/soporte: además `incident.manage`; las reglas verifican el rol para el seguimiento.
- Dashboard: `dashboard.read` más el permiso de lectura de cada fuente. Sin permiso de fuente, la tarjeta muestra un guion.
- Consulta de perfiles: `users.read`; stock: `stock.read`.

No se aprovisionaron cuentas nuevas ni se cambiaron roles no administrativos existentes. Falta definir y desplegar los perfiles institucionales con mínimo privilegio.

## Límites y siguientes pasos

Validación funcional manual del nuevo flujo por el usuario; paginación real en históricos y stock; administración privilegiada de identidades; dashboard gerencial con vistas agregadas sin abrir acceso innecesario a datos fuente; integración SQL Server/SAP; Power BI; dataset predictivo real y despliegue público.
El PDF de segunda entrega conserva su fotografía del estado anterior; no se regeneró automáticamente en este avance.
