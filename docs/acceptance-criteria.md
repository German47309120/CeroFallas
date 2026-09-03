# CeroFallas — Criterios de aceptación

Fecha: 2026-09-02

Estado: APROBACIÓN TÉCNICA INICIAL

## Criterio general

CeroFallas se considerará terminado cuando sus módulos estén implementados, probados, documentados y publicados, sin credenciales expuestas y con trazabilidad suficiente para demostrar su funcionamiento.

## Aplicación y acceso

- La aplicación abre mediante una URL HTTPS sin depender de la computadora de desarrollo.
- La interfaz es utilizable en computadora, tablet y teléfono.
- Un usuario autorizado puede iniciar y cerrar sesión.
- Un usuario no autenticado no puede consultar información protegida.
- Los permisos se aplican en backend o base de datos, no solo en la interfaz.

## Equipos

- Un administrador puede crear, actualizar y desactivar equipos.
- Los equipos conservan código, nombre, modelo, línea o área y estado cuando esa información esté disponible.
- Desactivar un equipo no elimina sus mantenimientos históricos.
- El catálogo definitivo utiliza información obtenida y autorizada en planta.

## Correctivos

- Un rol autorizado puede registrar un correctivo.
- Los campos obligatorios impiden registros incompletos.
- La duración se calcula correctamente, incluso cuando el trabajo atraviesa medianoche.
- El registro conserva usuario creador y timestamp del servidor.
- La consulta histórica permite filtros básicos.

## Preventivos

- Un rol autorizado puede programar y registrar un preventivo ejecutado.
- Se distinguen actividades programadas, realizadas y pendientes.
- Las frecuencias son configurables y los valores estimados se identifican como provisionales.
- El cumplimiento se calcula únicamente con información suficiente.
- Existe consulta histórica con filtros básicos.

## Checklist de montacargas

- Un montacarguista autorizado puede completar el checklist.
- El formulario se adapta a elementos aplicables al tipo de montacargas.
- Cada punto admite Bueno, Requiere atención, Fuera de servicio o No aplica.
- Una condición crítica permite marcar el equipo como no apto.
- Se registran operador, fecha, turno, horómetro, observaciones y timestamp.
- Existe historial por montacargas y rango de fechas.

## Incidentes

- Digitadores y operadores de Airlay pueden reportar incidentes.
- El incidente registra fecha, ubicación, equipo, descripción, reportante y estado.
- El incidente puede relacionarse con un correctivo posterior.
- Gerencia puede visualizar los incidentes en reportes o dashboard.

## Stock de repuestos

- Los roles autorizados pueden consultar código, descripción, cantidad y almacén.
- La información muestra su fecha de actualización.
- La integración con SQL Server es de solo lectura.
- Ninguna credencial o cadena de conexión se entrega al navegador ni se registra en Git.
- Una falla de SAP no impide registrar mantenimientos.

## Dashboard

- Los indicadores utilizan registros reales del sistema.
- Los resultados pueden filtrarse según datos disponibles.
- No se muestra un KPI cuya fórmula no pueda calcularse correctamente.
- Gerencia dispone de una vista general acorde con sus permisos.

## Power BI

- Existe un mecanismo documentado para consumir datos autorizados de CeroFallas y, cuando corresponda, SAP.
- La modalidad de publicación evita exposición accidental de datos institucionales.
- CeroFallas continúa funcionando si Power BI no está disponible.

## Seguridad y auditoría

- No existen secretos versionados ni contraseñas en texto plano.
- Solo administrador o soporte pueden modificar, anular o desactivar registros protegidos.
- Las operaciones sensibles conservan motivo, responsable, fecha y valores relevantes.
- Los históricos no se eliminan físicamente mediante la operación normal de la aplicación.

## Predictivo

- Existe un proceso reproducible para construir el dataset.
- Se documentan fuente, limpieza, variables, faltantes y variable objetivo.
- La regresión logística se utiliza como línea base cuando existan datos suficientes.
- Se evalúa un segundo modelo aprobado técnicamente.
- Se reportan como mínimo precision, recall y matriz de confusión.
- Las pruebas con datos ficticios se identifican como demostración y no como validación industrial.
- El riesgo por equipo puede almacenarse, consultarse y prepararse para Power BI.
- La ejecución periódica es configurable y no depende de la computadora de desarrollo.

## Calidad, publicación y documentación

- Las rutas principales sobreviven una recarga en la URL publicada.
- Los formularios muestran errores comprensibles.
- Las pruebas funcionales y de permisos quedan documentadas.
- Existen manual técnico, manual de usuario y guía de despliegue.
- El repositorio utiliza Git, `.gitignore` y commits pequeños sin secretos.
- La defensa puede demostrar el recorrido completo con datos ficticios o autorizados.

## Dependencias externas aceptadas

Los siguientes puntos pueden implementarse inicialmente con datos controlados mientras se obtiene la dependencia real, pero deberán quedar claramente identificados:

- Catálogo provisional hasta recibir códigos y modelos de planta.
- Datos demostrativos del modelo predictivo hasta acumular histórico real.
- Integración simulada o por snapshot de stock hasta disponer del acceso técnico seguro a SAP.
