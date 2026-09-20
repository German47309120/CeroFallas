# CeroFallas — fuente maestra para estudio, podcast y defensa

Actualización: 19 de septiembre de 2026  
Proyecto de graduación: sistema web responsive para gestión de mantenimiento industrial  
Estado global verificable: 82 %  
URL demostrativa: https://cerofallas-pg2-german-2026.web.app

> Este documento no contiene contraseñas, credenciales de Firebase o SAP, direcciones de servidores ni datos confidenciales. Los registros demostrativos deben distinguirse de la información real de planta.

## 1. Explicación breve del proyecto

CeroFallas digitaliza el registro y seguimiento del mantenimiento industrial de Novafiber. Reúne en una aplicación web los correctivos, preventivos, inspecciones de montacargas, incidentes, equipos, repuestos, indicadores gerenciales, auditoría y un laboratorio de mantenimiento predictivo.

La aplicación es web responsive: funciona en computadoras, tabletas y teléfonos mediante un navegador y no requiere una aplicación Android separada. Está publicada mediante HTTPS y cada usuario ve únicamente las funciones permitidas por su rol.

El problema que aborda es la dispersión de información en formatos manuales, reportes separados y consultas difíciles de consolidar. CeroFallas busca mejorar trazabilidad, oportunidad de registro, control de tiempos, planificación preventiva y consulta gerencial.

## 2. Objetivo general

Diseñar e implementar una solución web que permita registrar, consultar y analizar actividades de mantenimiento industrial con control de acceso, timestamps confiables, auditoría e integración desacoplada con SAP, Power BI y análisis predictivo.

### Objetivos específicos

1. Centralizar correctivos, preventivos, inspecciones e incidentes.
2. Evitar que los usuarios manipulen las horas oficiales de inicio y finalización.
3. Aplicar permisos tanto en la interfaz como en la base de datos.
4. Conservar trazabilidad sin borrar físicamente registros operativos.
5. Mostrar indicadores y detalles navegables para Gerencia.
6. Consultar stock proveniente de SAP sin exponer credenciales SQL en el navegador.
7. Preparar datasets para Power BI y mantenimiento predictivo.
8. Funcionar desde Internet sin depender de localhost.

## 3. Alcance y estado actual

El proyecto se encuentra aproximadamente en 82 %. La aplicación principal está cercana al 98 %; lo pendiente depende principalmente de datos y validaciones institucionales.

### Implementado y publicado

- Inicio de sesión con correo y contraseña.
- Once roles institucionales y permisos diferenciados.
- Sesión exclusiva por usuario con liberación administrativa.
- Catálogo de equipos con alta, edición y desactivación lógica.
- Correctivos con inicio, finalización, duración calculada y anulación auditada.
- Planes y ejecuciones preventivas con reprogramación.
- Gantt dinámico de actividades preventivas vencidas y próximas.
- Checklist de montacargas con 25 puntos de inspección.
- Reporte y seguimiento de incidentes.
- Consulta tipo tabla de stock REP con búsqueda.
- Dashboard con filtros, indicadores y navegación hacia detalles.
- Reporte gerencial interno imprimible.
- Exportación CSV autorizada para Power BI.
- Auditoría de operaciones sensibles.
- Laboratorio demostrativo de IA predictiva.
- Firebase Hosting, Authentication, Firestore, reglas e índices.
- Pruebas automatizadas y verificaciones cloud.

### Pendiente para cierre total

- Catálogo real de máquinas: códigos, modelos, series y líneas.
- Validación técnica de frecuencias preventivas y checklist.
- Sincronización definitiva con SQL Server/SAP usando el puerto correcto.
- Construcción y publicación privada del reporte Power BI.
- App Check en modo obligatorio después de observar métricas.
- Histórico real y validación del modelo predictivo.
- Automatización predictiva cada 24 horas.
- Aceptación institucional multidispositivo y ensayo final.

## 4. Arquitectura explicada de forma sencilla

El usuario abre la aplicación publicada en Firebase Hosting. React construye las pantallas y React Router controla las rutas. Firebase Authentication verifica la identidad. Después, CeroFallas obtiene de Firestore el perfil, rol, estado y permisos del usuario.

Cuando el usuario consulta o registra información, las Security Rules de Firestore vuelven a comprobar los permisos. Esto significa que ocultar un botón no es el único control: aunque alguien intente enviar una operación manual, la base de datos puede rechazarla.

Las integraciones externas están desacopladas:

- SAP se consulta mediante un proceso local autorizado, nunca desde el navegador.
- Power BI recibe una consulta SQL de stock y un CSV analítico de CeroFallas.
- El modelo predictivo se entrena en Python fuera de la aplicación.

Si SAP, Power BI o la IA fallan, los formularios operativos continúan funcionando.

### Tecnologías

- React 19: interfaz por componentes.
- Vite: servidor de desarrollo y compilación de producción.
- JavaScript con módulos ES.
- CSS propio con diseño mobile-first.
- React Router: rutas y protección por permisos.
- Firebase Authentication: identidad.
- Cloud Firestore: datos operativos.
- Firebase Security Rules: autorización y validación.
- Firebase Hosting: publicación HTTPS.
- Python: laboratorio predictivo.
- SQL Server / SAP Business One: fuente de stock.
- Power BI: análisis consolidado privado.
- Git y GitHub: control de versiones.

## 5. Roles y permisos

### Administrador de la aplicación

Acceso completo. Puede consultar, registrar, administrar, anular, liberar sesiones, revisar auditoría y exportar datasets. La administración de identidades en producción requiere backend privilegiado; mientras el proyecto siga en Spark se utilizan procedimientos controlados.

### Técnico de soporte

Posee capacidades técnicas equivalentes al administrador para resolver incidencias, pero debe utilizarse solo por personal designado.

### Técnico de mantenimiento

Registra tiempos correctivos y preventivos y consulta stock. No puede anular registros ni administrar usuarios.

### Montacarguista

Consulta y completa el checklist de montacargas. No accede a módulos gerenciales.

### Jefe de mantenimiento

Consulta dashboard, stock e incidentes y registra correctivos y preventivos.

### Operador de Airlay y Digitador

Reportan incidentes. No reciben acceso general al dashboard ni al historial completo si su función no lo requiere.

### Supervisor, Encargado de línea y Jefe de producción

Registran correctivos y preventivos, consultan dashboard y stock.

### Gerencia

Acceso de lectura al dashboard, correctivos, preventivos e incidentes. Puede consultar IA predictiva y exportar el dataset analítico para Power BI, pero no modifica registros operativos.

## 6. Manual de usuario general

### Iniciar sesión

1. Abrir la URL HTTPS de CeroFallas.
2. Ingresar correo y contraseña asignados.
3. Seleccionar Ingresar.
4. La aplicación carga el perfil y muestra el menú permitido.

Por seguridad, una credencial incorrecta muestra un mensaje genérico y no revela si el correo o la contraseña fue el dato equivocado. Si la misma cuenta ya está activa en otro dispositivo, el nuevo acceso informa que existe otra sesión.

### Cerrar sesión

Seleccionar Salir en la barra superior. Esta acción libera la sesión para permitir un nuevo ingreso desde otro dispositivo.

### Perfil

El perfil muestra nombre, rol, estado, entorno y permisos efectivos. Sirve para explicar por qué dos usuarios pueden observar menús diferentes.

## 7. Módulo de correctivos

### Propósito

Registrar una falla no planificada, medir el tiempo real de atención y conservar la solución aplicada.

### Flujo

1. Abrir Correctivos.
2. Seleccionar Nuevo correctivo.
3. Elegir área y equipo.
4. Registrar orden, síntoma, tipo de falla y demás datos disponibles.
5. Iniciar el correctivo. La hora se obtiene del servidor.
6. Al terminar, abrir el registro en curso.
7. Registrar trabajo realizado, observaciones y repuestos utilizados.
8. Finalizar. El servidor establece la hora de cierre y el sistema calcula la duración.

El usuario no escribe la hora oficial. Esto evita crear registros retroactivos arbitrarios. Administrador o Soporte pueden anular un registro indicando un motivo; el registro permanece en el histórico.

## 8. Módulo de preventivos

### Plan preventivo

Un plan relaciona equipo, actividad, descripción, frecuencia, próxima fecha y estado. Las frecuencias actuales son estimadas hasta recibir validación de planta.

### Ejecución

1. Seleccionar Registrar ejecución.
2. Elegir el plan; la fecha programada se carga automáticamente.
3. Iniciar el trabajo con hora del servidor.
4. Finalizar registrando actividad, observaciones, condición, horómetro y repuestos cuando corresponda.
5. El sistema clasifica el cumplimiento como a tiempo, tardío o no programado.
6. Los planes de calendario se reprograman automáticamente según su frecuencia.

### Gantt

La pantalla Preventivos incluye un cronograma Gantt con planes activos vencidos y actividades de las próximas ocho semanas. Como el plan todavía no guarda duración estimada, cada barra representa la fecha programada y no la duración del trabajo. Agregar duración planificada es una mejora posterior.

## 9. Checklist de montacargas

El formulario verifica 25 elementos, incluyendo llantas, mangueras, cilindros, frenos, refrigerante, aceites, luces, alarma, claxon, cinturón, horquillas, cadenas, mástil, dirección, tablero, batería, extintor, fugas y prueba operativa.

Cada punto admite Bueno, Requiere atención, Fuera de servicio o No aplica. Una falla crítica puede marcar el montacargas como no apto. La aplicación registra operador, turno y hora oficial. El historial no se elimina; una anulación privilegiada conserva respuestas, autor, fecha y motivo.

## 10. Incidentes

Digitadores y operadores de Airlay pueden reportar incidentes indicando área, equipo, prioridad y descripción. Supervisión autorizada puede dar seguimiento y relacionar el incidente con un correctivo compatible.

Gerencia observa los incidentes desde indicadores navegables. Al seleccionar una tarjeta del dashboard se abre el listado filtrado correspondiente.

## 11. Equipos y repuestos

### Equipos

El catálogo organiza código, nombre, tipo, área, criticidad, marca, modelo, serie y estado. Los datos demostrativos no deben presentarse como inventario real. Desactivar un equipo no elimina sus mantenimientos históricos.

### Repuestos

La pantalla presenta una tabla semejante a una hoja de cálculo. Permite buscar por fragmentos como `REP` o `SUB`, y muestra código, descripción, cantidad y almacén.

La consulta autorizada utiliza las tablas SAP OITW y OITM, filtra existencias distintas de cero y códigos que empiezan con REP. El navegador no recibe usuario, contraseña ni conexión SQL. Si SAP falla, CeroFallas conserva el último lote válido y muestra su antigüedad.

## 12. Dashboard y reporte gerencial

El dashboard muestra indicadores como incidentes abiertos, preventivos vencidos, próximos en siete días, correctivos completados, promedio de atención y preventivos ejecutados a tiempo.

Los cuadros son interactivos: llevan al detalle correspondiente. Los filtros por período, fecha de corte y área se aplican a agenda, incidentes y tendencias.

El reporte gerencial interno puede imprimirse y continúa disponible aunque Power BI esté desconectado.

### Exportación para Power BI

Gerencia, Administrador y Soporte disponen del botón Exportar para Power BI. Genera un CSV UTF-8 con correctivos, planes, ejecuciones e incidentes. Excluye credenciales, correos y sesiones y neutraliza valores que podrían convertirse en fórmulas de Excel.

El stock SAP se obtiene directamente mediante una consulta SQL autorizada. El reporte Power BI definitivo debe publicarse de forma privada y autenticada, nunca mediante un enlace público con datos institucionales.

## 13. Auditoría y seguridad

CeroFallas aplica los siguientes controles:

- Denegación por defecto en Firestore.
- Perfil activo obligatorio.
- Permisos por operación y colección.
- Rutas protegidas además del menú.
- Hora oficial del servidor para registros críticos.
- Anulación lógica en lugar de borrado físico.
- Motivo obligatorio para operaciones sensibles.
- Auditoría con actor, fecha, acción, entidad y cambios.
- Mensajes de autenticación genéricos.
- Sesión exclusiva por usuario.
- Encabezados HTTPS de seguridad.
- Secretos fuera de Git y del frontend.
- Datos demostrativos identificados.

App Check está preparado en código, pero el modo obligatorio debe activarse después de registrar la clave, observar métricas y validar los dispositivos autorizados.

## 14. Mantenimiento predictivo con IA

El módulo IA predictiva es un laboratorio demostrativo, no una predicción validada de planta.

### Pregunta que busca responder

¿Qué equipos podrían presentar una falla durante los siguientes 30 días?

### Proceso implementado

1. Contrato de datos y reglas de calidad.
2. Generador sintético reproducible de 1,200 registros.
3. Once variables construidas respetando una fecha de corte.
4. División temporal: 80 % entrenamiento y 20 % prueba.
5. Regresión logística como línea base explicable.
6. Random Forest como segundo candidato.
7. Comparación mediante PR-AUC y recall.

En la demostración, Random Forest obtuvo una ventaja pequeña en PR-AUC. Esto no demuestra superioridad con datos reales.

### Datos reales necesarios

- Horas de operación y antigüedad.
- Fallas anteriores.
- Preventivos vencidos.
- Correctivos e incidentes recientes.
- Duración de atención.
- Días desde el último preventivo.
- Resultados de inspecciones.
- Área, criticidad y condiciones de uso.

Antes de usar el resultado se debe acordar con Mantenimiento la definición oficial de falla, el horizonte, el umbral de alerta, el costo de falsos positivos y falsos negativos y un período piloto. La IA nunca debe ordenar automáticamente un mantenimiento sin revisión humana.

## 15. Pruebas y evidencia técnica

La suite vigente contiene 217 pruebas web y reglas más 3 pruebas predictivas. También existen 150 verificaciones publicadas sobre once cuentas, catorce rutas, perfiles, permisos y encabezados HTTPS.

Las pruebas cubren validaciones, rutas, roles, reglas Firestore, históricos, paginación, anulaciones, tiempos, dashboard, Power BI, Gantt, exportación CSV, SAP y laboratorio predictivo.

El repositorio conserva commits pequeños en español y no versiona contraseñas ni configuraciones locales sensibles.

## 16. Recorrido recomendado para la demostración

1. Abrir la URL y explicar que no depende de localhost.
2. Iniciar con Gerencia y mostrar menú de solo lectura.
3. Filtrar el dashboard por área y período.
4. Seleccionar una tarjeta para abrir el detalle.
5. Mostrar reporte gerencial y exportación para Power BI.
6. Abrir IA predictiva y aclarar el alcance demostrativo.
7. Cambiar a un rol operativo previamente preparado.
8. Iniciar y finalizar un correctivo para demostrar timestamps del servidor.
9. Mostrar Preventivos y el Gantt.
10. Mostrar un checklist de montacargas.
11. Abrir Auditoría con Administrador.
12. Cerrar explicando SAP, seguridad y pendientes reales.

## 17. Guion de exposición de diez minutos

### Minuto 0 a 1 — problema

“CeroFallas nace para centralizar información de mantenimiento que puede quedar dispersa en papel o reportes separados. La meta es obtener trazabilidad, tiempos confiables y visibilidad gerencial.”

### Minuto 1 a 2 — solución

“Es una aplicación web responsive publicada en Internet. Cada persona inicia sesión y recibe únicamente los módulos que corresponden a su rol.”

### Minuto 2 a 5 — operación

Mostrar dashboard, correctivos, preventivos, Gantt, checklist e incidentes. Explicar que los tiempos críticos provienen del servidor y que las anulaciones conservan evidencia.

### Minuto 5 a 7 — arquitectura y seguridad

Explicar React, Firebase Authentication, Firestore, Security Rules y Hosting. Destacar que los permisos se vuelven a validar en la base y que SAP nunca se conecta desde el navegador.

### Minuto 7 a 8 — análisis

Mostrar reporte gerencial y explicar la separación entre el dashboard operacional y Power BI privado.

### Minuto 8 a 9 — IA

Explicar la comparación entre regresión logística y Random Forest. Aclarar que es una prueba reproducible con datos sintéticos y que la fase real necesita histórico de planta.

### Minuto 9 a 10 — cierre

“La aplicación principal ya funciona y está publicada. Los pendientes corresponden a integración y validación institucional: catálogo real, puerto SAP, Power BI privado, App Check y entrenamiento con histórico real.”

## 18. Preguntas difíciles y respuestas sugeridas

### ¿Por qué una web y no Android?

Porque una web responsive cubre computadora y teléfono con una sola base de código, reduce mantenimiento y permite publicar mejoras sin instalar una aplicación en cada dispositivo.

### ¿Firebase es seguro solo porque tiene login?

No. El login identifica; las Security Rules autorizan. CeroFallas utiliza ambos controles, además de rutas protegidas, perfiles activos, permisos y auditoría.

### ¿Se pueden alterar las horas?

Las horas oficiales de inicio y finalización se obtienen del servidor. El usuario registra información operativa, pero no define arbitrariamente esos timestamps.

### ¿Por qué no se borran registros?

Porque mantenimiento necesita trazabilidad. Se utiliza anulación lógica con responsable, fecha y motivo.

### ¿La IA ya predice fallas reales?

No. Existe una tubería técnica reproducible y comparación de modelos, pero los resultados actuales son sintéticos. La validación industrial requiere histórico autorizado.

### ¿Por qué no usar el enlace público anterior de Power BI?

Porque Publicar en la web permite acceso anónimo. El diseño definitivo utiliza un reporte privado autenticado y un gateway autorizado.

### ¿Qué pasa si SAP no responde?

La operación de mantenimiento continúa. El stock conserva el último lote válido e informa la fecha de actualización.

### ¿Por qué no están completos los datos de máquinas?

Porque no se inventan códigos, modelos o series. El catálogo definitivo se completará con información validada en planta.

### ¿Cuál es la principal limitación actual?

La falta de histórico industrial real y algunas dependencias externas. No es una falla de la interfaz: es una condición de integración y validación de datos.

### ¿Cómo se comprobó el sistema?

Con 217 pruebas web y reglas, 3 pruebas predictivas y 150 verificaciones sobre el sitio publicado y los once perfiles.

## 19. Glosario

- Correctivo: atención de una falla no planificada.
- Preventivo: actividad programada para reducir probabilidad de falla.
- Incidente: evento reportado que requiere revisión o seguimiento.
- Checklist: inspección estructurada antes de operar un montacargas.
- Timestamp: fecha y hora registrada por el sistema.
- Firestore: base documental operacional.
- Security Rules: reglas que autorizan o rechazan operaciones.
- Snapshot SAP: copia controlada y fechada del stock autorizado.
- Gantt: vista temporal de actividades programadas.
- PR-AUC: métrica útil para comparar modelos cuando la clase positiva no está balanceada.
- Recall: proporción de fallas reales que el modelo logra detectar.
- Falso positivo: alerta de falla que no ocurre.
- Falso negativo: falla que ocurre sin ser alertada.
- Gateway: servicio que permite a Power BI actualizar datos de una fuente interna.

## 20. Orientación para generar un podcast de estudio

El audio debe ser una conversación en español latino, clara y profesional, entre una persona entrevistadora y el estudiante. Duración sugerida: 18 a 25 minutos.

Orden recomendado:

1. Problema y objetivo.
2. Recorrido por los módulos.
3. Roles y seguridad.
4. Arquitectura explicada sin exceso de jerga.
5. SAP y Power BI privado.
6. IA predictiva y sus límites.
7. Evidencia de pruebas.
8. Preguntas difíciles de jurado.
9. Resumen final de cinco ideas memorables.

El podcast debe repetir estas cinco ideas:

1. CeroFallas es web responsive y está publicado.
2. Los timestamps críticos son del servidor.
3. Los permisos se aplican también en Firestore.
4. Las integraciones externas no detienen la operación.
5. La IA actual es demostrativa hasta contar con histórico real.
