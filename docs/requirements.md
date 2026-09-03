# CeroFallas — Alcance y requerimientos confirmados

Fecha de consolidación: 2026-09-02

Estado del documento: APROBADO POR EL USUARIO EL 2026-09-02

## 1. Objetivo

Construir una aplicación web responsive para registrar, consultar y analizar actividades de mantenimiento industrial de Novafiber. La solución deberá estar publicada en Internet, utilizar servicios en la nube y funcionar sin depender de que la computadora de desarrollo permanezca encendida.

El objetivo acordado es completar el 100 % del alcance definido, aunque la tercera entrega universitaria solicite demostrar al menos un 75 % de funcionamiento.

## 2. Plataforma

- Producto exclusivamente web; no se desarrollará una aplicación Android.
- Uso previsto desde computadora, tablet y teléfono mediante navegador.
- Diseño responsive.
- Publicación mediante una URL con HTTPS.

## 3. Módulos incluidos

1. Autenticación y cierre de sesión.
2. Usuarios, roles y permisos.
3. Catálogo de equipos o activos.
4. Mantenimientos correctivos.
5. Mantenimientos preventivos.
6. Checklist de montacargas.
7. Reporte de incidentes de máquinas.
8. Históricos, filtros y búsquedas.
9. Dashboard operativo y gerencial.
10. Consulta de stock de repuestos procedente de SAP.
11. Integración de información con Power BI.
12. Análisis predictivo de fallas.
13. Auditoría de operaciones sensibles.

## 4. Áreas y jornadas

Áreas iniciales:

- Línea 1.
- Línea 2.
- Línea 3.
- Línea 4.
- Abastecimiento.
- Mantenimiento.
- Servicios Generales.

Jornadas confirmadas:

- Turno 1 operativo: 06:00 a 18:00.
- Turno 2 operativo: 18:00 a 06:00 del día siguiente.
- Turno mixto para jefaturas y Gerencia: 08:00 a 18:00, de lunes a viernes.

El sistema deberá calcular correctamente tiempos que atraviesen medianoche.

## 5. Roles y permisos preliminares

### Administrador de la aplicación

- El usuario propietario del proyecto ocupará inicialmente este rol.
- Administrar usuarios, permisos, catálogos y configuraciones.
- Modificar, anular o desactivar registros.
- Consultar todos los módulos autorizados.

### Técnico de soporte

- Modificar, anular o desactivar registros.
- Usuario responsable pendiente de definir.

### Técnicos de Mantenimiento

- Registrar tiempos de mantenimientos preventivos.
- Registrar tiempos de mantenimientos correctivos.
- Visualizar stock de repuestos.

### Montacarguistas

- Registrar el checklist de montacargas.

### Jefe de Mantenimiento

- Visualizar dashboard.
- Registrar mantenimientos preventivos y correctivos.

### Operadores de Airlay y digitadores

- Reportar incidentes de máquinas.

### Supervisores, encargados de línea y jefes de Producción

- Registrar mantenimientos preventivos.
- Registrar mantenimientos correctivos.
- Visualizar dashboard.
- Visualizar stock de repuestos.

### Gerencia

- Visualizar dashboard general.

Los permisos deberán aplicarse en backend o reglas de base de datos, no únicamente ocultando elementos de la interfaz.

## 6. Mantenimientos correctivos y preventivos

El formulario inicial se diseñará tomando como referencia la imagen proporcionada del documento denominado "Reporte de tiempos", utilizado para ambos tipos de mantenimiento.

Campos preliminares pendientes de aprobación durante el diseño del modelo de datos:

- Identificador.
- Tipo de mantenimiento.
- Fecha.
- Línea o área.
- Equipo.
- Hora de inicio.
- Hora de finalización.
- Duración calculada.
- Técnico responsable.
- Descripción de la falla o actividad.
- Trabajo realizado.
- Repuestos utilizados.
- Observaciones.
- Estado.
- Usuario creador.
- Timestamp del servidor.

Las frecuencias preventivas serán configurables por equipo o actividad. Podrán expresarse por calendario, cantidad de días, horómetro o condición. Los valores iniciales estimados deberán identificarse como provisionales.

## 7. Ejemplos iniciales de intervenciones y fallas

- Cadena de pulsunadora.
- Cilindro no enciende.
- Limpieza general.
- Habilitar cargadora 3.
- Presencia de agua en mangueras.
- Abrir sensores del Airlay.
- Cambio de cuchilla transversal.
- Falla en mezcladora.
- Cuchilla gira lento.

Estos valores todavía deben clasificarse como síntoma, tipo de falla, causa, componente o trabajo realizado. No se utilizarán directamente como catálogo definitivo.

## 8. Checklist de montacargas

No existe un formulario institucional previo. Se autoriza diseñar uno nuevo que contemple, según aplique al tipo de montacargas:

- Identificación del equipo, operador, fecha, turno y horómetro.
- Llantas, ruedas, horquillas, mástil, cadenas, pasadores y seguros.
- Mangueras, conexiones, cilindros y fugas.
- Aceite, líquido de frenos, refrigerante, combustible o batería.
- Frenos, dirección, elevación, descenso e inclinación.
- Claxon, luces, alarma de retroceso, tablero y controles.
- Cinturón, asiento, espejos, techo protector y elementos de seguridad.
- Observaciones, evidencia opcional y resultado de aptitud.

Estados preliminares por punto: Bueno, Requiere atención, Fuera de servicio y No aplica.

La versión definitiva deberá ajustarse al tipo, modelo y manual de cada montacargas, además de las reglas de seguridad aplicables.

## 9. Incidentes

Los digitadores y operadores de Airlay podrán ingresar un reporte rápido de incidentes. La información se presentará principalmente como parte del reporte o dashboard para Gerencia y podrá relacionarse posteriormente con un mantenimiento correctivo.

## 10. Equipos

Las fotografías entregadas muestran maquinaria industrial, pero no permiten establecer de manera confiable sus nombres internos, códigos, modelos, líneas o si representan activos independientes.

La información definitiva será obtenida posteriormente en planta. Hasta entonces no se creará un catálogo institucional inventado.

## 11. Stock y SAP

- Motor de base de datos: SQL Server.
- El usuario cuenta con autorización y credenciales propias.
- Ya existe una consulta SQL que obtiene el stock.
- Campos requeridos: código, descripción, cantidad y almacén.
- Se deberá registrar también la fecha y hora de actualización de los datos.
- La integración deberá ser de solo lectura.
- Las credenciales y la cadena de conexión no deberán exponerse en el navegador, código público ni repositorio.

La forma técnica de conexión o sincronización se decidirá durante la fase de arquitectura.

## 12. Power BI

- Existe una licencia para publicar reportes.
- La propuesta actual consiste en conectar Power BI a la base autorizada, construir el reporte, publicarlo y obtener un enlace.
- Se deberá definir si el acceso será privado, organizacional o público antes de publicar información institucional.
- Power BI podrá utilizar información de SAP y de CeroFallas, pero la aplicación deberá operar aunque Power BI no esté disponible.

## 13. Análisis predictivo

Actualmente no existe histórico disponible para entrenar un modelo real confiable.

- Modelo base propuesto por el Prompt Maestro: regresión logística.
- Segundo modelo preliminar por evaluar: Random Forest.
- Alternativa interpretable adicional: árbol de decisión.
- La selección definitiva dependerá del volumen, balance y calidad de los datos acumulados.
- Los datos ficticios podrán utilizarse para demostrar la tubería técnica, pero no para afirmar efectividad predictiva real.
- Podrá utilizarse inicialmente una puntuación de riesgo basada en reglas, claramente identificada como tal.
- Una posible variable objetivo será la ocurrencia de una falla dentro de una ventana futura definida y aprobada.

## 14. Seguridad y auditoría

- No guardar contraseñas en texto plano.
- No publicar credenciales ni cadenas de conexión.
- Utilizar HTTPS.
- Aplicar permisos en backend o base de datos.
- Evitar eliminación física de históricos.
- Toda modificación, anulación o desactivación deberá registrar usuario, fecha, motivo y valores afectados.
- Utilizar datos ficticios o anonimizados cuando una exposición pública no esté autorizada.

El usuario indica contar con autorización de Gerencia para acceder a la información necesaria del proyecto. Esto no elimina la obligación de proteger credenciales y datos sensibles.

## 15. Pendientes de confirmación

- Nombres, códigos, modelos, líneas y placas de los equipos fotografiados.
- Identificación y asignación del futuro técnico de soporte.
- Revisión de la consulta SQL de stock cuando corresponda, sin exponer credenciales.
- Método seguro para conectar o sincronizar SAP con CeroFallas.
- Modalidad exacta de publicación y acceso al reporte de Power BI.
- Rúbrica universitaria, si posteriormente se obtiene.

## 16. Límite del paso actual

Este documento consolida el alcance inicial. No representa aprobación del modelo de datos, arquitectura, tecnologías definitivas, diseño visual ni implementación. Cada decisión se trabajará y validará en su fase correspondiente.
