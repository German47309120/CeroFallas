# CeroFallas — Requisitos funcionales y no funcionales

Fecha: 2026-09-02

Estado: LÍNEA BASE INICIAL

## Requisitos funcionales

### Acceso y usuarios

- RF-001: El sistema deberá permitir iniciar sesión a usuarios habilitados.
- RF-002: El sistema deberá permitir cerrar sesión.
- RF-003: El sistema deberá impedir acceso protegido a usuarios no autenticados.
- RF-004: El administrador deberá poder crear, consultar, actualizar y desactivar perfiles de usuario.
- RF-005: El sistema deberá resolver permisos según el rol activo del usuario.
- RF-006: El sistema deberá registrar el usuario responsable de operaciones sensibles.

### Equipos

- RF-010: El administrador deberá poder registrar equipos con código, nombre, tipo, área o línea y estado.
- RF-011: El administrador deberá poder actualizar y desactivar equipos.
- RF-012: El sistema deberá impedir que la desactivación de un equipo elimine su historial.
- RF-013: Los usuarios autorizados deberán poder consultar el detalle y el historial de un equipo.

### Correctivos

- RF-020: Los roles autorizados deberán poder registrar mantenimientos correctivos.
- RF-021: Cada correctivo deberá identificar fecha, ubicación, equipo, responsable, descripción y horas de inicio y finalización.
- RF-022: El sistema deberá calcular la duración con timestamps completos y soportar trabajos que atraviesen medianoche.
- RF-023: El sistema deberá registrar timestamp del servidor y usuario creador.
- RF-024: Los usuarios autorizados deberán poder consultar y filtrar históricos de correctivos.
- RF-025: Solo administrador o soporte podrán modificar o anular un correctivo.

### Preventivos

- RF-030: Los roles autorizados deberán poder programar mantenimientos preventivos.
- RF-031: Los roles autorizados deberán poder registrar la ejecución de un preventivo.
- RF-032: El sistema deberá distinguir programado, ejecutado, pendiente, vencido y anulado.
- RF-033: La frecuencia deberá ser configurable por calendario, intervalo de días, horómetro o condición.
- RF-034: El sistema deberá calcular cumplimiento con base en actividades programadas válidas.
- RF-035: Los usuarios autorizados deberán poder consultar y filtrar históricos de preventivos.
- RF-036: Solo administrador o soporte podrán modificar o anular un preventivo protegido.

### Checklist de montacargas

- RF-040: Los montacarguistas autorizados deberán poder registrar una inspección.
- RF-041: El checklist deberá registrar montacargas, operador, fecha, turno y horómetro.
- RF-042: Cada punto deberá permitir Bueno, Requiere atención, Fuera de servicio o No aplica.
- RF-043: Los puntos deberán organizarse por identificación, inspección visual, niveles, operación y seguridad.
- RF-044: Una condición crítica deberá permitir marcar el montacargas como no apto.
- RF-045: Los usuarios autorizados deberán poder consultar el historial de inspecciones.

### Incidentes

- RF-050: Digitadores y operadores de Airlay deberán poder reportar incidentes de máquinas.
- RF-051: Un incidente deberá registrar fecha, ubicación, equipo, descripción, reportante, prioridad y estado.
- RF-052: Un incidente podrá relacionarse con un mantenimiento correctivo.
- RF-053: Los incidentes deberán alimentar el reporte o dashboard gerencial.

### Históricos, filtros y dashboard

- RF-060: Los históricos deberán permitir filtros por rango de fechas, área o línea, equipo, técnico y tipo cuando el dato exista.
- RF-061: Las consultas deberán utilizar paginación o límites para evitar descargas innecesarias.
- RF-062: El dashboard deberá mostrar indicadores calculados con información real.
- RF-063: El sistema no deberá mostrar KPIs cuya información de origen sea insuficiente.
- RF-064: El dashboard deberá adaptar su contenido a los permisos del usuario.

### Stock y SAP

- RF-070: Los roles autorizados deberán poder consultar stock de repuestos.
- RF-071: El stock deberá mostrar código, descripción, cantidad, almacén y fecha de actualización.
- RF-072: La extracción desde SQL Server deberá utilizar acceso de solo lectura.
- RF-073: Una falla de SAP no deberá impedir el registro de mantenimientos.

### Power BI

- RF-080: El sistema deberá preparar datos estructurados para Power BI.
- RF-081: La integración deberá documentar fuente, transformación y actualización.
- RF-082: CeroFallas deberá continuar operando cuando Power BI no esté disponible.

### Predictivo

- RF-090: El sistema deberá permitir construir un dataset reproducible a partir de información autorizada.
- RF-091: El proceso deberá documentar limpieza, faltantes, transformaciones y variable objetivo.
- RF-092: La regresión logística deberá funcionar como línea base cuando existan datos suficientes.
- RF-093: Se deberá evaluar un segundo modelo seleccionado técnicamente.
- RF-094: Se deberán calcular como mínimo precision, recall y matriz de confusión.
- RF-095: El resultado deberá poder asociar un nivel de riesgo con un equipo y una fecha de cálculo.
- RF-096: La ejecución periódica deberá ser configurable y no depender del equipo de desarrollo.

### Auditoría

- RF-100: Toda modificación, anulación o desactivación protegida deberá registrar actor, fecha, motivo y referencia al registro afectado.
- RF-101: La interfaz normal no deberá eliminar físicamente mantenimientos, checklist ni incidentes históricos.

## Requisitos no funcionales

- RNF-001 Seguridad: Todo tráfico publicado deberá utilizar HTTPS.
- RNF-002 Seguridad: No se almacenarán contraseñas en texto plano.
- RNF-003 Seguridad: Ningún secreto se incluirá en Git ni en código entregado al navegador.
- RNF-004 Seguridad: Las reglas de backend o base de datos validarán autenticación y autorización.
- RNF-005 Privacidad: Los datos públicos de demostración serán ficticios o anonimizados.
- RNF-010 Usabilidad: Los formularios mostrarán validaciones y errores comprensibles.
- RNF-011 Usabilidad: La interfaz será responsive desde 360 px de ancho en adelante.
- RNF-012 Accesibilidad: Controles principales tendrán etiquetas, foco visible y navegación por teclado razonable.
- RNF-020 Rendimiento: Los listados no descargarán el histórico completo sin límites.
- RNF-021 Rendimiento: Las consultas frecuentes utilizarán índices adecuados.
- RNF-030 Disponibilidad: La aplicación publicada no dependerá de la computadora de desarrollo.
- RNF-031 Resiliencia: Una integración externa no disponible no bloqueará los módulos operativos independientes.
- RNF-040 Mantenibilidad: El código se organizará por módulos y responsabilidades.
- RNF-041 Mantenibilidad: Versiones, decisiones, pruebas y cambios quedarán documentados.
- RNF-050 Compatibilidad: Se probará al menos en un navegador Chromium de escritorio y en vista móvil.
- RNF-060 Trazabilidad: Cada requisito funcional importante deberá relacionarse con una prueba.

## Reglas de negocio iniciales

- RN-001: Solo administrador y soporte modifican, anulan o desactivan registros protegidos.
- RN-002: Una anulación conserva el registro original y exige motivo.
- RN-003: Turno 1 abarca 06:00–18:00; Turno 2 abarca 18:00–06:00 del día siguiente.
- RN-004: El turno mixto abarca 08:00–18:00 de lunes a viernes.
- RN-005: Las frecuencias estimadas deben identificarse como provisionales.
- RN-006: Un KPI solo se publica si todos sus datos mínimos existen.
- RN-007: Un dato predictivo generado con información ficticia se etiqueta como demostrativo.
- RN-008: La consulta de SAP es de solo lectura y no expone credenciales al cliente web.
