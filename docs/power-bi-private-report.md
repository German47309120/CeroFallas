# Power BI privado para CeroFallas

Estado: diseño preparado; creación del archivo PBIX y conexión interactiva pendientes en Power BI Desktop.

## Decisión de seguridad

No se reutiliza el enlace `Publicar en la web`. El reporte nuevo debe publicarse en un área de trabajo privada y abrirse mediante identidad Microsoft autorizada. CeroFallas solamente recibirá el enlace autenticado cuando el reporte esté validado.

## Primera fuente: stock SAP

Usar la consulta de solo lectura disponible en `integrations/sap-stock-query.example.sql`. El contrato contiene únicamente:

- `codigo`: código de repuesto con prefijo REP.
- `descripcion`: nombre del artículo.
- `cantidad`: existencia del almacén.
- `almacen`: código de almacén SAP.

La consulta excluye existencias en cero. Las credenciales SQL no se guardan en Git, Firebase ni en el navegador.

## Construcción en Power BI Desktop

1. Abrir Power BI Desktop y elegir **Obtener datos > SQL Server**.
2. Ingresar el servidor y la base de datos autorizados.
3. Abrir **Opciones avanzadas** y pegar la consulta SQL del repositorio.
4. Elegir **Importar** para aislar la consulta del uso interactivo del reporte.
5. Nombrar la tabla `StockSAP` y comprobar los tipos: texto, texto, decimal y texto.
6. Crear segmentadores por almacén y búsqueda por código o descripción.
7. Agregar una tabla con código, descripción, cantidad y almacén.
8. Agregar tarjetas con las medidas propuestas.

## Medidas iniciales

```DAX
Unidades disponibles = SUM(StockSAP[cantidad])

Codigos con existencia = DISTINCTCOUNT(StockSAP[codigo])

Almacenes con existencia = DISTINCTCOUNT(StockSAP[almacen])
```

## Publicación segura

1. Publicar en un área de trabajo privada de Power BI, nunca con **Publicar en la web**.
2. Autorizar únicamente cuentas o grupos institucionales.
3. Si Power BI Service no alcanza SQL Server, instalar y registrar un gateway local en una computadora autorizada que tenga acceso por WireGuard o red de planta.
4. Configurar actualización programada y mostrar en el reporte la hora de la última actualización.
5. Probar que un usuario sin autorización no pueda abrir el reporte.
6. Cuando la validación termine, configurar en CeroFallas el enlace oficial `https://app.powerbi.com/reportEmbed?...`.

## Alcance por etapas

La primera página del reporte será **Inventario de repuestos**, porque la consulta SAP solamente contiene stock. Los indicadores de correctivos, preventivos, incidentes e IA requieren un segundo dataset exportado desde CeroFallas; no deben inferirse desde la tabla de inventario.

Antes de presentar, comprobar: conexión, fecha de actualización, filtros, permisos, ausencia de datos confidenciales y comportamiento cuando el gateway esté desconectado.
