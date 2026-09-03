# CeroFallas — Casos de uso principales

Fecha: 2026-09-02

## CU-001 — Autenticarse

Actor: Usuario registrado.

Precondición: Cuenta habilitada.

Flujo principal:

1. El usuario ingresa sus credenciales.
2. El sistema valida la identidad.
3. El sistema obtiene perfil y rol.
4. El sistema abre la página inicial autorizada.

Alternativas: credenciales incorrectas, cuenta inexistente o cuenta desactivada producen un mensaje sin revelar información sensible.

Resultado: Sesión autenticada y permisos cargados.

## CU-010 — Registrar mantenimiento correctivo

Actor: Rol autorizado.

Precondición: Sesión iniciada y equipo seleccionable.

Flujo principal:

1. Seleccionar área o línea y equipo.
2. Registrar fecha, inicio, final, descripción y trabajo realizado.
3. Agregar técnico, observaciones y repuestos cuando corresponda.
4. Validar campos y calcular duración.
5. Guardar con usuario creador y timestamp del servidor.

Alternativas: datos incompletos, intervalo inválido o equipo desactivado impiden guardar y muestran el problema.

Resultado: Correctivo disponible en histórico y dashboard.

## CU-020 — Programar y ejecutar preventivo

Actor: Rol autorizado.

Precondición: Equipo activo.

Flujo principal:

1. Definir actividad y frecuencia.
2. Registrar fecha programada.
3. Guardar como programado.
4. Al realizarse, registrar ejecución, responsable, tiempo y observaciones.
5. Actualizar estado y siguiente fecha cuando corresponda.

Resultado: Trazabilidad de programación, ejecución y cumplimiento.

## CU-030 — Completar checklist de montacargas

Actor: Montacarguista.

Precondición: Sesión iniciada y montacargas activo.

Flujo principal:

1. Seleccionar montacargas y registrar horómetro.
2. Evaluar cada punto aplicable.
3. Agregar observaciones o evidencia.
4. El sistema identifica condiciones críticas.
5. Guardar resultado de aptitud.

Alternativa: un punto obligatorio sin respuesta impide guardar.

Resultado: Inspección histórica disponible y equipo marcado apto o no apto.

## CU-040 — Reportar incidente

Actor: Digitador u operador de Airlay.

Precondición: Sesión iniciada.

Flujo principal:

1. Seleccionar ubicación y equipo si se conoce.
2. Describir el incidente y prioridad percibida.
3. Adjuntar evidencia opcional.
4. Guardar el reporte.

Resultado: Incidente visible para responsables y dashboard gerencial.

## CU-050 — Consultar stock

Actor: Técnico, supervisor, encargado o jefe autorizado.

Precondición: Sesión iniciada.

Flujo principal:

1. Buscar por código o descripción.
2. Aplicar filtro de almacén.
3. Visualizar cantidad y fecha de actualización.

Alternativa: si SAP o la sincronización no están disponibles, mostrar el último estado válido y su fecha sin bloquear mantenimientos.

Resultado: Consulta de solo lectura.

## CU-060 — Anular registro

Actor: Administrador o técnico de soporte.

Precondición: Registro existente y sesión con privilegio.

Flujo principal:

1. Seleccionar el registro.
2. Solicitar anulación.
3. Ingresar motivo obligatorio.
4. Confirmar la acción.
5. Guardar estado anulado y evento de auditoría.

Resultado: El registro permanece histórico, pero deja de participar en cálculos aplicables.

## CU-070 — Consultar dashboard

Actor: Jefe, supervisor, encargado o Gerencia.

Precondición: Sesión iniciada y permiso de lectura.

Flujo principal:

1. Abrir dashboard.
2. Aplicar filtros autorizados.
3. Consultar indicadores y actividad reciente.
4. Acceder al detalle permitido.

Resultado: Indicadores basados en información disponible y real.

## CU-080 — Calcular riesgo de equipo

Actor: Proceso programado o administrador durante pruebas.

Precondición: Dataset válido o datos de demostración identificados.

Flujo principal:

1. Extraer datos autorizados.
2. Validar y preparar variables.
3. Ejecutar modelo o regla versionada.
4. Guardar fecha, resultado y versión.
5. Publicar el resultado para consulta y Power BI.

Alternativa: datos insuficientes producen estado no calculable, no una predicción inventada.

Resultado: Riesgo versionado y trazable por equipo.
