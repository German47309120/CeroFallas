# CeroFallas — Historias de usuario

Fecha: 2026-09-02

## Acceso

### HU-001 — Iniciar sesión

Como usuario autorizado, quiero iniciar sesión para acceder únicamente a las funciones de mi rol.

Criterios: credenciales correctas permiten el acceso; credenciales inválidas muestran un error; usuarios desactivados no acceden.

### HU-002 — Administrar usuarios

Como administrador, quiero crear, asignar rol y desactivar usuarios para controlar el acceso.

Criterios: solo el administrador accede; cada cambio queda auditado; una desactivación no elimina históricos.

## Mantenimiento

### HU-010 — Registrar correctivo

Como técnico, jefe, supervisor o encargado autorizado, quiero registrar un correctivo para conservar evidencia de la falla y del tiempo utilizado.

Criterios: exige equipo, fecha, descripción e intervalo válido; calcula duración; guarda creador y timestamp.

### HU-011 — Programar preventivo

Como usuario autorizado, quiero programar un preventivo para controlar actividades pendientes y vencidas.

Criterios: identifica equipo, actividad, frecuencia y fecha; permite consultar estado.

### HU-012 — Registrar preventivo ejecutado

Como usuario autorizado, quiero registrar la ejecución de un preventivo para medir cumplimiento.

Criterios: relaciona programación cuando exista; conserva técnico, actividad, tiempo y evidencia.

### HU-013 — Consultar históricos

Como supervisor o jefe, quiero filtrar mantenimientos para analizar actividad por fechas, equipo, línea y técnico.

Criterios: aplica filtros disponibles; limita resultados; no muestra datos sin permiso.

## Montacargas

### HU-020 — Completar checklist

Como montacarguista, quiero inspeccionar el equipo antes de operarlo para registrar su condición.

Criterios: registra horómetro y todos los puntos aplicables; destaca condiciones críticas; calcula resultado de aptitud.

### HU-021 — Revisar historial del montacargas

Como jefe o supervisor autorizado, quiero consultar inspecciones anteriores para identificar problemas repetidos.

Criterios: permite filtrar por equipo y fechas; muestra resultado, observaciones y responsable.

## Incidentes

### HU-030 — Reportar incidente

Como digitador u operador de Airlay, quiero reportar rápidamente un incidente para que Gerencia y Mantenimiento conozcan la situación.

Criterios: formulario breve; registra ubicación, equipo, descripción, prioridad, reportante y timestamp.

### HU-031 — Convertir incidente en correctivo

Como responsable autorizado, quiero relacionar un incidente con un correctivo para mantener trazabilidad de su atención.

Criterios: ambos registros conservan su identidad y referencia cruzada.

## Equipos y stock

### HU-040 — Administrar equipo

Como administrador, quiero registrar y desactivar activos para mantener un catálogo confiable.

Criterios: código único cuando esté disponible; desactivación lógica; historial preservado.

### HU-041 — Consultar stock

Como rol autorizado, quiero consultar existencias de repuestos para apoyar la planificación del mantenimiento.

Criterios: muestra código, descripción, cantidad, almacén y actualización; acceso de solo lectura.

## Dashboard y análisis

### HU-050 — Visualizar dashboard operativo

Como jefe, supervisor o encargado, quiero consultar indicadores de mi operación para tomar decisiones.

Criterios: indicadores reales, filtros aplicables y contenido conforme al rol.

### HU-051 — Visualizar dashboard gerencial

Como Gerencia, quiero ver el panorama general e incidentes para supervisar mantenimiento y producción.

Criterios: resumen consolidado; sin capacidad administrativa salvo permiso adicional explícito.

### HU-052 — Consultar riesgo por equipo

Como responsable autorizado, quiero consultar el nivel de riesgo calculado para priorizar revisiones.

Criterios: muestra fecha, versión del modelo o regla, nivel y explicación disponible; no presenta una demostración como predicción validada.

## Administración y auditoría

### HU-060 — Anular un registro

Como administrador o soporte, quiero anular un registro incorrecto sin eliminarlo para conservar trazabilidad.

Criterios: exige motivo; conserva valores originales, actor y timestamp; excluye el registro de cálculos cuando corresponda.

### HU-061 — Consultar auditoría

Como administrador, quiero consultar operaciones sensibles para investigar cambios.

Criterios: filtro por fecha, usuario, entidad y acción; datos inmutables para usuarios normales.
