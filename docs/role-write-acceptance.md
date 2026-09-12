# Evidencia de aceptación técnica — escrituras por rol

Fecha: 2026-09-07

Entorno: Firebase Emulator Suite, proyecto aislado `demo-cerofallas-role-write-matrix`
Comando: `npm test -- --run tests/role-write-matrix.rules.test.js`

## Objetivo

Comprobar que la autorización no dependa únicamente de botones ocultos en la interfaz. Cada operación se envía directamente a Firestore con una sesión autenticada por rol; las reglas deben aceptar la operación autorizada y rechazar la no autorizada.

## Resultado

Se evaluaron 12 operaciones contra los 11 roles: **132 decisiones de autorización correctas**. Las 12 pruebas finalizaron aprobadas. La base aislada se limpia antes de cada escenario y no modifica los registros demostrativos utilizados por la aplicación.

| Rol | Equipo | Correctivo | Plan preventivo | Ejecución preventiva | Checklist | Incidente | Modificar/anular/seguimiento |
|---|---|---|---|---|---|---|---|
| Administrador de la aplicación | Sí | Sí | Sí | Sí | Sí | Sí | Sí |
| Técnico de soporte | Sí | Sí | Sí | Sí | Sí | Sí | Sí |
| Técnico de Mantenimiento | No | Sí | No | Sí | No | No | No |
| Montacarguista | No | No | No | No | Sí | No | No |
| Jefe de Mantenimiento | No | Sí | No | Sí | No | No | No |
| Operador de Airlay | No | No | No | No | No | Sí | No |
| Digitador | No | No | No | No | No | Sí | No |
| Supervisor | No | Sí | No | Sí | No | No | No |
| Encargado de línea | No | Sí | No | Sí | No | No | No |
| Jefe de Producción | No | Sí | No | Sí | No | No | No |
| Gerencia | No | No | No | No | No | No | No |

“Modificar/anular/seguimiento” agrupa seis comprobaciones independientes: equipos, correctivos, planes, ejecuciones, inspecciones e incidentes. Actualmente solo Administrador y Técnico de soporte poseen esos permisos privilegiados.

## Escenarios protegidos

- El correctivo exige duración válida, técnico responsable y autor coincidente con la sesión.
- La ejecución preventiva sin plan se registra como no programada y no inventa una próxima fecha.
- Anular una ejecución preventiva exige Administrador o Soporte, motivo y auditoría. Solo revierte la agenda cuando esa ejecución continúa siendo la última asociada al plan.
- El checklist exige plantilla vigente, 25 respuestas, turno y operador coincidente.
- Anular un checklist exige Administrador o Soporte, motivo de 10 a 500 caracteres y auditoría dentro del mismo lote; las respuestas no pueden cambiarse.
- El incidente se crea junto con su auditoría en una operación atómica.
- Las modificaciones conservan creador, fecha original y relaciones históricas.
- Ninguna colección permite borrado físico desde la aplicación.

## Pendiente de aceptación institucional

La evidencia automatizada demuestra la aplicación de la matriz acordada. Antes de producción, un responsable de cada grupo deberá ejecutar su recorrido en la interfaz y firmar o aprobar la matriz final. Los cambios de política deben realizarse en el catálogo de roles, reglas, pruebas y documentación como una sola modificación controlada.

## Control complementario de rutas

Comando: `npm test -- --run tests/route-access.test.js tests/route-access-view.test.jsx`

Se evaluaron 22 rutas protegidas contra los once perfiles: **242 decisiones de acceso por URL**. Incluye consultas, formularios nuevos, ediciones con identificador, stock, riesgo, reporte gerencial, ayuda y administración. La prueba de presentación confirma tres estados: contenido autorizado, explicación de acceso restringido y espera mientras se carga el perfil.

Este control no sustituye las reglas de Firestore. Su función es impedir que una URL escrita manualmente muestre una operación ajena al rol; Firestore vuelve a comprobar el permiso cuando existe una lectura o escritura.
