# CeroFallas — Plan de datos y modelos predictivos

Fecha: 2026-09-05
Estado: laboratorio sintético reproducible; validación real pendiente

## Objetivo controlado

Estimar la probabilidad de que un equipo presente al menos una falla durante los 30 días posteriores a una fecha de corte. La salida será apoyo para priorizar revisión; nunca cancelará, programará o aprobará mantenimiento automáticamente.

## Unidad de análisis

Cada fila representa el estado conocido de un equipo en una fecha de corte. Las variables se calculan usando únicamente eventos ocurridos hasta esa fecha. La etiqueta `failure_next_30d` observa los 30 días posteriores y vale 1 si existe una falla válida, 0 en caso contrario.

Esta separación impide fuga de información: una descripción, repuesto o tiempo registrado después de la falla futura no puede utilizarse para predecirla.

## Campos mínimos

| Campo | Tipo | Origen futuro | Regla |
|---|---|---|---|
| record_id | texto | proceso de dataset | Único e inmutable. |
| equipment_id | texto | CeroFallas/catálogo | Identificador técnico; no nombre libre. |
| cutoff_date | fecha | proceso de dataset | Fecha ISO, anterior a la ventana objetivo. |
| data_origin | categoría | proceso de dataset | `real_authorized` o `synthetic_demo`. |
| equipment_type | categoría | catálogo | Tipo normalizado. |
| area_id | categoría | catálogo | Área vigente en el corte. |
| shift_id | categoría | operación | Turno asociado al período observado. |
| age_years | decimal | catálogo | Antigüedad no negativa. |
| operating_hours_30d | decimal | horómetro/SAP si existe | Horas acumuladas previas al corte. |
| preventive_overdue_days | entero | planes | Máximo atraso vigente, no negativo. |
| corrective_count_30d | entero | correctivos | Conteo previo al corte. |
| incident_count_30d | entero | incidentes | Conteo previo al corte. |
| avg_corrective_minutes_90d | decimal | correctivos | Promedio de duraciones válidas previas. |
| days_since_last_preventive | entero | ejecuciones | Días completos previos al corte. |
| last_inspection_failures | entero | checklist | Fallas de la última inspección disponible. |
| failure_next_30d | 0/1 | correctivos futuros | Etiqueta; nunca entra como característica. |

## Calidad requerida antes de entrenar con planta

- Equipos con código estable y sin duplicados.
- Fechas y zonas horarias consistentes; corte documentado.
- Estados anulados excluidos y definición oficial de “falla” acordada.
- Duraciones positivas y eventos sin cierre tratados explícitamente.
- Períodos sin datos distinguidos de valores cero.
- Historial suficiente para que entrenamiento y prueba contengan fallas y no fallas.
- Revisión de desbalance por equipo, área, turno y período.
- Trazabilidad del lote, consulta, fecha de extracción y responsable.
- Permiso gerencial para los campos utilizados y dataset fuera del frontend.

No se fija todavía un número universal de filas. La viabilidad se decidirá principalmente por cantidad de eventos positivos, cobertura temporal y representatividad por familia de equipos, no por volumen bruto.

## Modelos seleccionados

### Regresión logística — línea base

Permite explicar dirección y peso de variables después del procesamiento. Sirve como referencia simple y ayuda a detectar si un modelo complejo aporta valor real.

### Random Forest — segundo candidato

Captura relaciones no lineales e interacciones, tolera escalas diferentes y ofrece importancia de variables. Puede sobreajustar, por lo que se limita profundidad indirectamente mediante tamaño mínimo de hoja y se valida en fechas posteriores.

Random Forest fue elegido como segundo modelo porque los datos esperados mezclan conteos, tiempos, antigüedad y categorías, y porque ofrece un contraste razonable frente a la línea base. La selección final no queda decidida por el laboratorio sintético.

## Evaluación

- División temporal: 80 % antiguo para entrenamiento y 20 % reciente para prueba.
- PR-AUC como criterio principal cuando las fallas sean minoritarias.
- ROC-AUC como vista complementaria, no única.
- Precisión, recall, F1 y matriz de confusión al umbral 0.5.
- Evaluación posterior de calibración y selección del umbral según costo de falsas alarmas versus fallas no detectadas.
- Comparación contra una regla simple, por ejemplo priorizar equipos con correctivos recientes, antes de afirmar mejora.

## Resultado del laboratorio sintético

- 1,200 filas marcadas `synthetic_demo`; 380 positivas (31.67 %).
- División temporal: 960 entrenamiento y 240 prueba.
- PR-AUC: regresión logística 0.4737; Random Forest 0.4802.
- Recall al umbral 0.5: regresión 0.6133; Random Forest 0.5067.
- Random Forest fue el mejor candidato demo por PR-AUC, con diferencia pequeña.
- Dos ejecuciones consecutivas produjeron el mismo SHA-256, confirmando reproducibilidad.

Estas métricas no representan Novafiber, no justifican una decisión operativa y no deben incluirse como “exactitud del sistema”. Solo demuestran que el pipeline puede validar, dividir, entrenar, comparar y reportar.

## Camino a integración

1. Acordar definición de falla y ventana con Mantenimiento/Gerencia.
2. Obtener catálogo real y muestra histórica autorizada.
3. Ejecutar validación de calidad y documentar exclusiones.
4. Construir variables con corte temporal y pruebas contra fuga.
5. Entrenar ambos modelos y una regla base; repetir por períodos.
6. Revisar métricas y errores con responsables técnicos.
7. Versionar dataset, código, parámetros y reporte aprobado.
8. Publicar solo riesgos versionados en una colección separada.
9. Mostrar fecha, versión, nivel de riesgo y explicación; nunca una orden automática.
10. Programar cada 24 horas únicamente después de aprobar fuente, infraestructura, costos, monitoreo y reversión.

## Ejecución local

```powershell
npm run predictive:test
npm run predictive:demo
```

Las salidas `.local/predictive-demo.csv` y `.local/predictive-results.json` están ignoradas por Git. No se genera un archivo de modelo sintético para evitar confundirlo con un artefacto productivo.
