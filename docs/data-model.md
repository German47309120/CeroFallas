# CeroFallas — Modelo lógico de datos

Fecha: 2026-09-02

Estado: VERSIÓN INICIAL APROBADA TÉCNICAMENTE

## Principios

- Utilizar identificadores técnicos independientes de nombres visibles.
- Guardar fechas operativas como timestamps completos con zona horaria conocida.
- Utilizar timestamps del servidor para creación y modificación.
- Conservar referencias al catálogo y una copia mínima del nombre/código histórico cuando una modificación futura pueda cambiar su interpretación.
- Aplicar desactivación o anulación lógica en vez de eliminación física.
- Separar planes preventivos de sus ejecuciones.
- Conservar resultados predictivos junto con la versión del modelo o regla.
- No almacenar contraseñas ni credenciales de SAP.

## Convenciones comunes

Los nombres definitivos podrán adaptarse a la tecnología seleccionada. Los campos comunes son:

- `id`: identificador único.
- `status`: estado controlado de la entidad.
- `createdAt`: timestamp del servidor.
- `createdBy`: identificador del usuario creador.
- `updatedAt`: timestamp del servidor de la última modificación.
- `updatedBy`: identificador del último usuario modificador.
- `version`: entero para control de cambios cuando sea necesario.

Las entidades anulables agregarán:

- `isVoided`: booleano.
- `voidedAt`: timestamp.
- `voidedBy`: usuario administrador o soporte.
- `voidReason`: motivo obligatorio.

## USUARIO

Propósito: perfil de aplicación vinculado con la identidad del proveedor de autenticación.

| Campo | Tipo lógico | Obligatorio | Regla |
|---|---|---:|---|
| id | string | Sí | Igual al UID de autenticación |
| displayName | string | Sí | Nombre visible |
| email | string | Sí | Normalizado en minúsculas |
| roleId | string | Sí | Referencia a ROL |
| areaIds | string[] | No | Áreas autorizadas cuando aplique |
| status | enum | Sí | active, disabled |
| createdAt | timestamp | Sí | Servidor |
| createdBy | string | Sí | Administrador |
| updatedAt | timestamp | Sí | Servidor |
| updatedBy | string | Sí | Administrador o soporte |

## ROL

Propósito: agrupar permisos sin dispersar lógica por la interfaz.

| Campo | Tipo lógico | Obligatorio | Regla |
|---|---|---:|---|
| id | string | Sí | Identificador estable |
| name | string | Sí | Nombre visible |
| permissions | string[] | Sí | Permisos controlados por catálogo |
| status | enum | Sí | active, disabled |
| systemRole | boolean | Sí | Impide cambios accidentales en roles base |
| createdAt | timestamp | Sí | Servidor |
| updatedAt | timestamp | Sí | Servidor |

Roles iniciales: administrador, soporte, técnico de mantenimiento, montacarguista, jefe de mantenimiento, operador de Airlay, digitador, supervisor, encargado de línea, jefe de Producción y Gerencia.

## ÁREA

| Campo | Tipo lógico | Obligatorio | Regla |
|---|---|---:|---|
| id | string | Sí | Identificador estable |
| code | string | Sí | Único |
| name | string | Sí | Nombre visible |
| category | enum | Sí | production_line, support_area |
| status | enum | Sí | active, disabled |

Valores iniciales: Línea 1, Línea 2, Línea 3, Línea 4, Abastecimiento, Mantenimiento y Servicios Generales.

## TURNO

| Campo | Tipo lógico | Obligatorio | Regla |
|---|---|---:|---|
| id | string | Sí | Identificador estable |
| name | string | Sí | Turno 1, Turno 2 o Mixto |
| startTime | time | Sí | Hora local |
| endTime | time | Sí | Hora local |
| crossesMidnight | boolean | Sí | Verdadero para Turno 2 |
| weekdays | integer[] | Sí | Días aplicables |
| audience | string | No | Operativo, jefaturas o Gerencia |
| status | enum | Sí | active, disabled |

## EQUIPO

| Campo | Tipo lógico | Obligatorio | Regla |
|---|---|---:|---|
| id | string | Sí | Generado por el sistema |
| code | string | Sí | Único; provisional hasta obtener catálogo real |
| name | string | Sí | Nombre interno autorizado |
| type | string | Sí | Catálogo controlado |
| brand | string | No | Marca |
| model | string | No | Modelo |
| serialNumber | string | No | Proteger según sensibilidad |
| areaId | string | Sí | Referencia a ÁREA |
| status | enum | Sí | active, inactive, out_of_service |
| criticality | enum | No | low, medium, high, critical |
| notes | string | No | Información adicional |
| photoUrl | string | No | Imagen autorizada |
| createdAt/By | audit | Sí | Servidor y usuario |
| updatedAt/By | audit | Sí | Servidor y usuario |

## MANTENIMIENTO_CORRECTIVO

| Campo | Tipo lógico | Obligatorio | Regla |
|---|---|---:|---|
| id | string | Sí | Generado |
| workOrder | string | No | Referencia externa si existe |
| eventDate | date | Sí | Fecha operacional |
| startedAt | timestamp | Sí | Incluye fecha y hora |
| endedAt | timestamp | Sí | Mayor que startedAt |
| durationMinutes | integer | Sí | Calculado; no escrito manualmente |
| areaId | string | Sí | Referencia |
| areaSnapshot | object | Sí | Código y nombre histórico |
| equipmentId | string | Sí | Referencia |
| equipmentSnapshot | object | Sí | Código y nombre histórico |
| shiftId | string | No | Derivado o seleccionado |
| technicianIds | string[] | Sí | Uno o más responsables |
| reportedSymptom | string | Sí | Texto del reporte inicial |
| failureTypeId | string | No | Catálogo pendiente de depuración |
| affectedComponent | string | No | Componente |
| identifiedCause | string | No | Causa encontrada |
| workPerformed | string | Sí | Acción ejecutada |
| spareParts | object[] | No | Código, descripción y cantidad usada |
| observations | string | No | Notas adicionales |
| sourceIncidentId | string | No | Referencia a incidente |
| status | enum | Sí | completed, draft, voided |
| createdAt/By | audit | Sí | Servidor y usuario |
| updatedAt/By | audit | Sí | Solo administrador o soporte |
| void fields | audit | No | Obligatorios al anular |

## PLAN_PREVENTIVO

| Campo | Tipo lógico | Obligatorio | Regla |
|---|---|---:|---|
| id | string | Sí | Generado |
| equipmentId | string | Sí | Equipo activo |
| equipmentSnapshot | object | Sí | Código y nombre |
| activityName | string | Sí | Actividad planificada |
| activityDescription | string | No | Detalle |
| frequencyType | enum | Sí | calendar, days, hours, condition |
| frequencyValue | number | No | Según tipo |
| frequencyUnit | enum | No | day, week, month, hour |
| estimatedFrequency | boolean | Sí | Verdadero mientras no esté validada |
| nextDueAt | timestamp | Sí | Próxima fecha o límite |
| assignedUserIds | string[] | No | Responsables previstos |
| status | enum | Sí | active, paused, completed, voided |
| createdAt/By | audit | Sí | Servidor y usuario |
| updatedAt/By | audit | Sí | Servidor y usuario |

## EJECUCIÓN_PREVENTIVA

| Campo | Tipo lógico | Obligatorio | Regla |
|---|---|---:|---|
| id | string | Sí | Generado |
| planId | string | No | Puede existir ejecución extraordinaria |
| equipmentId | string | Sí | Referencia |
| equipmentSnapshot | object | Sí | Código y nombre |
| scheduledAt | timestamp | No | Fecha planificada |
| startedAt | timestamp | Sí | Inicio real |
| endedAt | timestamp | Sí | Fin real |
| durationMinutes | integer | Sí | Calculado |
| technicianIds | string[] | Sí | Responsables |
| activityPerformed | string | Sí | Trabajo realizado |
| spareParts | object[] | No | Repuestos usados |
| observations | string | No | Notas |
| complianceStatus | enum | Sí | on_time, late, unscheduled |
| status | enum | Sí | completed, draft, voided |
| createdAt/By | audit | Sí | Servidor y usuario |
| updatedAt/By | audit | Sí | Servidor y usuario |
| void fields | audit | No | Obligatorios al anular |

## PLANTILLA_CHECKLIST

Propósito: permitir que los puntos evolucionen sin alterar inspecciones históricas.

| Campo | Tipo lógico | Obligatorio | Regla |
|---|---|---:|---|
| id | string | Sí | Generado |
| name | string | Sí | Nombre y tipo de montacargas |
| version | integer | Sí | Incremental |
| applicableEquipmentTypes | string[] | Sí | Tipos compatibles |
| sections | object[] | Sí | Categorías y puntos |
| status | enum | Sí | draft, active, retired |
| createdAt/By | audit | Sí | Servidor y usuario |

Cada punto de `sections` tendrá `itemId`, `label`, `description`, `required`, `critical` y `applicability`.

## INSPECCIÓN_MONTACARGAS

| Campo | Tipo lógico | Obligatorio | Regla |
|---|---|---:|---|
| id | string | Sí | Generado |
| equipmentId | string | Sí | Montacargas activo |
| equipmentSnapshot | object | Sí | Código y nombre |
| templateId | string | Sí | Plantilla usada |
| templateVersion | integer | Sí | Versión inmutable |
| inspectedAt | timestamp | Sí | Fecha y hora real |
| shiftId | string | Sí | Turno |
| operatorId | string | Sí | Usuario autenticado |
| hourMeter | number | Sí | No negativo |
| answers | object[] | Sí | Copia de punto, estado y observación |
| criticalFailures | integer | Sí | Calculado |
| overallResult | enum | Sí | fit, attention_required, out_of_service |
| generalObservations | string | No | Notas |
| evidenceUrls | string[] | No | Evidencia autorizada |
| status | enum | Sí | completed, voided |
| createdAt/By | audit | Sí | Servidor y operador |
| void fields | audit | No | Solo administrador o soporte |

## INCIDENTE

| Campo | Tipo lógico | Obligatorio | Regla |
|---|---|---:|---|
| id | string | Sí | Generado |
| reportedAt | timestamp | Sí | Fecha del incidente |
| areaId | string | Sí | Ubicación |
| areaSnapshot | object | Sí | Histórico |
| equipmentId | string | No | Puede ser desconocido al reportar |
| equipmentSnapshot | object | No | Histórico |
| reporterId | string | Sí | Digitador u operador |
| description | string | Sí | Texto breve |
| priority | enum | Sí | low, medium, high, critical |
| status | enum | Sí | reported, acknowledged, in_progress, resolved, voided |
| linkedCorrectiveId | string | No | Correctivo relacionado |
| evidenceUrls | string[] | No | Evidencia autorizada |
| createdAt/By | audit | Sí | Servidor y usuario |
| updatedAt/By | audit | Sí | Según permiso futuro |

## STOCK_REPUESTO

Propósito: representación de solo lectura sincronizada desde SAP SQL Server.

| Campo | Tipo lógico | Obligatorio | Regla |
|---|---|---:|---|
| id | string | Sí | Compuesto estable o generado |
| code | string | Sí | Código SAP |
| description | string | Sí | Descripción SAP |
| quantity | decimal | Sí | No modificar desde CeroFallas |
| warehouse | string | Sí | Almacén SAP |
| sourceUpdatedAt | timestamp | No | Actualización de origen si existe |
| syncedAt | timestamp | Sí | Momento de sincronización |
| syncBatchId | string | Sí | Lote de extracción |

Clave lógica recomendada: combinación normalizada de `code` y `warehouse`.

## PREDICCIÓN_RIESGO

| Campo | Tipo lógico | Obligatorio | Regla |
|---|---|---:|---|
| id | string | Sí | Generado |
| equipmentId | string | Sí | Referencia |
| equipmentSnapshot | object | Sí | Código y nombre |
| calculatedAt | timestamp | Sí | Servidor |
| horizonDays | integer | Sí | Ventana aprobada |
| riskScore | decimal | Sí | Entre 0 y 1 cuando sea probabilidad |
| riskLevel | enum | Sí | low, medium, high, not_calculable |
| methodType | enum | Sí | rule, model |
| methodVersion | string | Sí | Versión trazable |
| modelName | string | No | Regresión logística, Random Forest u otro aprobado |
| featuresSnapshot | object | Sí | Variables relevantes usadas |
| isDemonstration | boolean | Sí | Verdadero para datos ficticios |
| explanation | string | No | Factores interpretables |
| createdAt | timestamp | Sí | Servidor |

## AUDITORÍA

| Campo | Tipo lógico | Obligatorio | Regla |
|---|---|---:|---|
| id | string | Sí | Generado |
| occurredAt | timestamp | Sí | Servidor |
| actorId | string | Sí | Usuario autenticado |
| action | enum | Sí | create, update, void, disable, role_change, login_event |
| entityType | string | Sí | Colección lógica |
| entityId | string | Sí | Registro afectado |
| reason | string | Condicional | Obligatorio en anulación o cambio sensible |
| before | object | No | Valores previos permitidos |
| after | object | No | Valores posteriores permitidos |
| metadata | object | No | Versión de aplicación y contexto no sensible |

La auditoría no almacenará contraseñas, tokens, cadenas de conexión ni secretos.

## Relaciones principales

- ROL 1 — N USUARIO.
- ÁREA 1 — N EQUIPO.
- EQUIPO 1 — N MANTENIMIENTO_CORRECTIVO.
- EQUIPO 1 — N PLAN_PREVENTIVO.
- PLAN_PREVENTIVO 1 — N EJECUCIÓN_PREVENTIVA.
- EQUIPO 1 — N EJECUCIÓN_PREVENTIVA.
- EQUIPO 1 — N INSPECCIÓN_MONTACARGAS.
- PLANTILLA_CHECKLIST 1 — N INSPECCIÓN_MONTACARGAS.
- INCIDENTE 0..1 — 0..1 MANTENIMIENTO_CORRECTIVO.
- EQUIPO 1 — N PREDICCIÓN_RIESGO.
- USUARIO 1 — N AUDITORÍA.

## Índices y consultas requeridas

La implementación deberá soportar índices para:

- Correctivos por fecha, área, equipo, técnico y estado.
- Ejecuciones preventivas por fecha, equipo, plan y cumplimiento.
- Planes preventivos por estado y próxima fecha.
- Checklist por fecha, equipo, operador y resultado.
- Incidentes por fecha, área, equipo, prioridad y estado.
- Stock por código, descripción normalizada y almacén.
- Predicciones por equipo y fecha de cálculo.
- Auditoría por fecha, actor, entidad y acción.

Los índices físicos se definirán después de escoger la base de datos y crear las consultas reales.

## Datos pendientes

- Catálogo real de equipos.
- Modelos y tipos reales de montacargas.
- Catálogo depurado de fallas y componentes.
- Consulta SQL y esquema de origen de SAP.
- Ventana objetivo y umbrales de riesgo predictivo.
- Políticas de conservación y respaldo institucionales.
