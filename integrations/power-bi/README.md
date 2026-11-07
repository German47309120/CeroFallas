# Power BI de CeroFallas

Este directorio contiene los recursos versionables del reporte gerencial. El archivo `.pbix` se guarda en `deliverables/power_bi/` y los CSV de trabajo se generan localmente en `.local/power-bi/` para no publicar datos operativos en Git.

## Actualizar los datos

1. Autenticar Firebase CLI con la cuenta propietaria del proyecto.
2. Ejecutar `npm run powerbi:export-cloud`.
3. En Power BI Desktop, seleccionar **Actualizar**.

La exportación incluye mantenimiento, equipos, repuestos y resultados predictivos. No incluye usuarios, correos, sesiones ni credenciales.

## Páginas del reporte

- **Resumen ejecutivo:** órdenes, incidentes, cumplimiento y evolución mensual.
- **Mantenimiento:** distribución por tipo, estado, área, equipo y duración.
- **Repuestos:** existencias por almacén, búsqueda por código y niveles bajos.
- **IA predictiva:** riesgo por equipo, nivel y fecha de cálculo; los resultados demostrativos se identifican explícitamente.

## Publicación segura

No usar **Publicar en la Web** con información interna. La publicación institucional debe realizarse en un área de trabajo de Power BI y el acceso integrado en CeroFallas debe conservar la autenticación de la organización o utilizar el modelo *app-owns-data* con un backend que genere tokens de inserción.
