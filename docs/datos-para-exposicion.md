# Datos de CeroFallas para la exposición

Fecha de preparación: 29 de septiembre de 2026.

## Qué quedó disponible

| Módulo | Documentos | Cómo explicarlo |
|---|---:|---|
| Equipos | 60 | Catálogo que relaciona mantenimientos, incidentes, checklist y riesgo. |
| Planes preventivos | 60 | Programación por equipo, frecuencia, área y próxima fecha. |
| Ejecuciones preventivas | 60 | Historial de cumplimiento, duración y trabajo realizado. |
| Correctivos | 60 | Órdenes con síntoma, intervención, estado y tiempo de atención. |
| Incidentes | 60 | Reportes operativos con prioridad, seguimiento y estado. |
| Checklist de montacargas | 60 | Inspecciones de 25 puntos con resultado calculado. |
| Riesgo predictivo | 60 | Simulación de IA por equipo, fecha, puntuación y explicación. |
| Stock | 1,967 | Carga existente; no se agregaron repuestos ficticios. |
| Usuarios | 11 | Perfiles institucionales; no fueron alterados por esta carga. |

## Cómo reconocer los datos demostrativos

Los documentos agregados para la exposición contienen internamente `dataOrigin = presentation_demo` y `demoVersion = 2`. Esas marcas no aparecen como parte del nombre operativo: los equipos utilizan códigos por familia como `AIRLAY-*`, `PULS-*` o `MONT-*`, y los correctivos usan órdenes `OT-2026-*`. La metadata interna permite separarlos de futuras fuentes reales sin afectar la presentación de la interfaz.

La explicación correcta durante la defensa es: “CeroFallas posee un conjunto controlado de datos sintéticos para demostrar navegación, filtros, indicadores e IA. No se presentan como datos históricos reales de planta. El stock existente se conservó y no fue rellenado artificialmente”.

## Seguridad de la carga

La herramienta [expand-presentation-data-cloud.mjs](../scripts/expand-presentation-data-cloud.mjs) consulta primero los conteos, exige confirmar dos veces el proyecto Firebase, no funciona contra emuladores y solo crea documentos que no existen. Una segunda simulación informó cero pendientes, demostrando que no duplica los datos al ejecutarse nuevamente.

Comando de verificación sin escritura:

```powershell
npm run publish:presentation-data -- --project=cerofallas-pg2-german-2026 --confirm-project=cerofallas-pg2-german-2026 --dry-run
```

No se debe ejecutar la publicación normal durante la exposición: la información ya está cargada.
