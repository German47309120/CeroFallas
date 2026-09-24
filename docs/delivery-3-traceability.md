# CeroFallas — trazabilidad para la tercera entrega

## Propósito

Esta matriz relaciona la propuesta conceptual de la segunda entrega con la implementación demostrable de CeroFallas. Su objetivo es probar, con rutas, datos y verificaciones repetibles, que al menos el 90 % de lo diseñado está representado y que al menos el 90 % de las funciones de la aplicación puede ejecutarse.

La línea base documental está formada por `deliverables/segunda_entrega/CeroFallas_Segunda_Entrega.docx` y por el capítulo corregido del modelo de datos `deliverables/segunda_entrega/2do Entregable PG2 Ajustado.docx`.

## Criterio de medición

- **Completo — 1 punto:** existe implementación demostrable y evidencia técnica.
- **Parcial — 0.5 puntos:** existe una base funcional, pero falta una integración, despliegue o validación externa.
- **Pendiente — 0 puntos:** no existe una implementación demostrable.

Los porcentajes no sustituyen la demostración. Cada elemento debe enseñarse en la URL publicada o mediante una prueba reproducible.

## Resumen de cobertura documental

| Bloque de la segunda entrega | Unidades | Completas | Parciales | Puntaje | Cobertura |
|---|---:|---:|---:|---:|---:|
| Modelo lógico y entidades | 14 | 14 | 0 | 14.0 | 100.0 % |
| Procesos | 6 | 5 | 1 | 5.5 | 91.7 % |
| Casos de uso | 26 | 22 | 4 | 24.0 | 92.3 % |
| Componentes de arquitectura | 10 | 7 | 3 | 8.5 | 85.0 % |
| Mockups representados por vistas reales | 15 | 15 | 0 | 15.0 | 100.0 % |
| **Total** | **71** | **63** | **8** | **67.0** | **94.4 %** |

La cobertura documental estimada es **94.4 %**. El indicador más conservador para el funcionamiento de la aplicación es la cobertura de casos de uso: **24 de 26, equivalente a 92.3 %**.

## Modelo lógico y entidades

| Entidad diseñada | Representación implementada | Estado | Evidencia principal |
|---|---|---|---|
| Rol | Catálogo versionado de once roles y permisos derivados | Completo | `src/config/roles.js` |
| Usuario | Firebase Authentication y perfiles `users` | Completo | Inicio de sesión de once cuentas y perfil visible |
| Área | Catálogo institucional y snapshots en registros | Completo | Filtros y formularios de equipos, mantenimientos e incidentes |
| Turno | Cálculo oficial en zona `America/Guatemala` | Completo | Barra superior y checklist con turno validado al guardar |
| Equipo | Colección `equipment` | Completo | Alta, edición, estado, criticidad y consulta |
| Mantenimiento correctivo | Colección `correctives` | Completo | Inicio, finalización, historial y anulación auditada |
| Plan preventivo | Colección `preventivePlans` | Completo | Planificación, edición, Gantt y próxima fecha |
| Ejecución preventiva | Colección `preventiveExecutions` | Completo | Inicio, finalización, cumplimiento y anulación |
| Plantilla checklist | Plantilla versionada de 25 puntos | Completo | Formulario de inspección y copia de respuestas |
| Inspección de montacargas | Colección `forkliftInspections` | Completo | Evaluación, resultado, historial y anulación |
| Incidente | Colección `incidents` | Completo | Reporte, seguimiento, estado y vínculo con correctivo |
| Stock de repuesto | Colección `stock` de solo lectura y estado de integración | Completo como modelo | Vista publicada y agente local de sincronización |
| Predicción de riesgo | Colección `riskPredictions` de solo lectura | Completo como simulación | 32 resultados demostrativos fechados |
| Auditoría | Colección inmutable `audit` | Completo | Eventos vinculados a las operaciones sensibles |

## Procesos

| Proceso documentado | Estado | Funcionamiento demostrable | Brecha |
|---|---|---|---|
| Proceso general | Completo | Acceso, perfil, menú por permisos, operación y consulta | Aceptación institucional final |
| Mantenimiento correctivo | Completo | Crear, iniciar, finalizar, consultar, editar y anular | Datos reales de planta |
| Mantenimiento preventivo | Completo | Crear plan, ejecutar, medir cumplimiento, reprogramar y anular | Frecuencias reales de planta |
| Checklist de montacargas | Completo | 25 verificaciones, resultado operativo, hora y turno oficiales | Aprobación formal de la plantilla |
| Gestión de incidentes | Completo | Reportar, dar seguimiento y vincular correctivo | Uso institucional sostenido |
| SAP, Power BI y predictivo | Parcial | Consulta preparada, exportación analítica y simulación predictiva | Conectividad SAP, PBIX privado y automatización real |

## Casos de uso

| ID | Caso de uso | Estado | Evidencia o condición pendiente |
|---|---|---|---|
| CU-001 | Autenticarse y cerrar sesión | Completo | `/login`, sesión exclusiva y salida |
| CU-002 | Resolver perfil y navegación por permisos | Completo | Menú y rutas protegidas para once roles |
| CU-010 | Crear equipo | Completo | `/equipos/nuevo` y auditoría |
| CU-011 | Editar o desactivar equipo | Completo | `/equipos/:id/editar` |
| CU-012 | Consultar equipo e histórico consolidado | Completo | Ficha por equipo con correctivos, preventivos, checklist, incidentes y riesgo según permisos |
| CU-020 | Registrar correctivo | Completo | Inicio y finalización con tiempo oficial |
| CU-021 | Filtrar histórico correctivo | Completo | Estado, área, equipo y período |
| CU-022 | Editar o anular correctivo | Completo | Operación protegida y auditada |
| CU-030 | Crear plan preventivo | Completo | `/preventivos/nuevo` |
| CU-031 | Registrar ejecución preventiva | Completo | Inicio, finalización y reprogramación |
| CU-032 | Consultar cumplimiento | Completo | Preventivos y dashboard |
| CU-033 | Editar o anular plan | Completo | Edición del plan y control de ejecuciones |
| CU-040 | Completar checklist | Completo | `/montacargas/nuevo` |
| CU-041 | Consultar inspecciones | Completo | Histórico paginado |
| CU-042 | Anular inspección | Completo | Anulación privilegiada y auditoría |
| CU-050 | Reportar incidente | Completo | `/incidentes/nuevo` |
| CU-051 | Gestionar estado y vincular correctivo | Completo | Seguimiento validado |
| CU-060 | Consultar stock | Completo | Tabla, búsqueda por código/descripción y almacén |
| CU-061 | Sincronizar snapshot de SAP | Parcial | Agente y consulta listos; el puerto SQL Server aún no es accesible |
| CU-070 | Consultar dashboard operativo | Completo | Indicadores, tendencias, agenda y navegación al detalle |
| CU-071 | Consultar dashboard gerencial | Completo | Reporte interno, filtros y exportación |
| CU-080 | Crear, editar o desactivar perfil | Parcial | Código y emulador listos; Functions administrativas requieren Blaze |
| CU-081 | Consultar auditoría | Completo | `/admin/auditoria` |
| CU-090 | Preparar dataset y exportar a Power BI | Parcial | CSV seguro disponible; falta PBIX privado publicado |
| CU-091 | Entrenar y evaluar modelos | Parcial | Laboratorio reproducible con datos sintéticos; falta histórico real |
| CU-092 | Consultar riesgo por equipo | Completo como simulación | `/riesgo`, filtros, trazabilidad y advertencia permanente |

## Arquitectura

| Componente prometido | Estado | Evidencia |
|---|---|---|
| Aplicación web responsive | Completo | React y Vite publicados en HTTPS |
| Autenticación | Completo | Firebase Authentication |
| Base operacional | Completo | Cloud Firestore con 325 documentos demostrativos |
| Autorización por roles | Completo | Reglas, once perfiles y 161 verificaciones cloud |
| Hosting | Completo | Firebase Hosting |
| Auditoría | Completo | Escrituras atómicas y bitácora inmutable |
| Seguridad de sesión | Completo | Una sesión activa por usuario y liberación administrativa |
| Integración SAP | Parcial | Agente local y consulta segura; falta conectividad efectiva |
| Analítica Power BI | Parcial | Dataset exportable; falta PBIX privado y actualización programada |
| Predictivo | Parcial | Modelos comparados y resultados sintéticos publicados; falta operación con histórico real cada 24 horas |

## Correspondencia de mockups

Los quince mockups tienen una vista real equivalente: acceso, dashboard, equipos, correctivo, plan preventivo, ejecución preventiva, checklist, incidentes, stock, usuarios, auditoría, predictivo y las tres composiciones móviles. La demostración debe enseñar la aplicación real y utilizar los mockups únicamente para explicar la evolución del diseño.

## Evidencia técnica vigente

- URL publicada: `https://cerofallas-pg2-german-2026.web.app`.
- 222 de 222 pruebas web y reglas aprobadas.
- 3 de 3 pruebas predictivas aprobadas.
- 11 cuentas, 14 rutas y 161 verificaciones cloud aprobadas.
- 4 escrituras operativas y 4 auditorías idempotentes ya existentes.
- 4 intentos de escritura fuera de rol rechazados.
- 325 documentos demostrativos presentes y legibles.
- Build de producción y lint aprobados.

## Guion mínimo de demostración del 90 por ciento

1. Iniciar sesión como Administrador y enseñar perfil, permisos, equipos, auditoría y sesiones exclusivas.
2. Ingresar como Técnico de Mantenimiento, iniciar y finalizar un correctivo y una ejecución preventiva.
3. Ingresar como Montacarguista y completar el checklist, señalando hora y turno oficiales.
4. Ingresar como Digitador u Operador de Airlay y reportar un incidente.
5. Ingresar como una jefatura, actualizar el incidente, vincularlo con un correctivo y consultar stock.
6. Ingresar como Gerencia y recorrer dashboard, detalles, exportación y riesgo predictivo.
7. Mostrar una operación prohibida y explicar que la interfaz y Firestore aplican la misma matriz de permisos.
8. Relacionar cada recorrido con su caso de uso, entidad del modelo y proceso documentado.

## Brechas prioritarias para aumentar el margen

1. Resolver el puerto TCP de SQL Server y ejecutar primero una sincronización seca de SAP.
2. Crear y publicar el PBIX privado con el dataset exportable de CeroFallas.
3. Decidir si se habilita Blaze para desplegar la administración privilegiada de usuarios.
4. Sustituir el laboratorio predictivo sintético por un histórico validado cuando la planta lo entregue.

## Regla para la exposición

No afirmar que SAP, Power BI privado o el predictivo real están terminados mientras dependan de conectividad, licencia o histórico. La defensa debe presentar esas funciones como integraciones parciales, y demostrar que el núcleo web supera el mínimo mediante los casos de uso completos, la seguridad por roles y la evidencia automatizada.
