# ESTADO DEL PROYECTO — CeroFallas

> **Propósito de este archivo:** bitácora operativa y plan maestro del proyecto de graduación. Debe actualizarse al cerrar cada actividad relevante. En un chat nuevo, leer primero este archivo antes de inspeccionar el resto de la carpeta.

**Última actualización:** 2 de septiembre de 2026  
**Estado general:** segunda entrega conceptual preparada y repositorio consolidado localmente; pendiente configurar remoto para publicación en GitHub.  
**Repositorio:** Git inicializado, rama `master`, sin commits.

## 1. Contexto y objetivo

**CeroFallas** será una solución de gestión de mantenimiento industrial, complementada con un módulo de inteligencia artificial para mantenimiento predictivo. El módulo no sustituirá el proceso actual: calculará un riesgo por equipo y permitirá contrastar sus alertas contra fallas reales y contra el esquema de mantenimiento vigente.

La propuesta académica incorpora:

1. Extracción del histórico de equipos, mantenimientos preventivos y correctivos.
2. Construcción de un conjunto de datos estructurado y variables predictoras.
3. Entrenamiento y comparación de regresión logística (línea base interpretable) y un modelo de mayor capacidad, sujeto a la calidad y volumen de datos disponibles.
4. Validación cruzada y evaluación con precisión, exhaustividad/recall y matriz de confusión; se prioriza detectar fallas reales.
5. Comparación contra el mantenimiento actual.
6. Ejecución automática prevista cada 24 horas y publicación del riesgo para la integración con Power BI.
7. Validación operativa en paralelo al proceso actual.

## 2. Segundo entregable: Propuesta conceptual de la solución de IT

**Fecha indicada en la consigna:** 6 de septiembre.  
**Formato indicado:** PDF, elaborado/presentado mediante Canva y portal UMG.

### Entregables obligatorios

| Componente | Resultado esperado | Estado |
|---|---|---|
| Modelo de BD | Entidades, atributos, relaciones, claves y reglas | Pendiente |
| Diagrama general de procesos | Vista extremo a extremo de CeroFallas + predicción | Pendiente |
| Diagramas específicos | Flujos de equipos, preventivos, correctivos, datos/IA, alertas y tablero | Pendiente |
| Casos de uso | Actores, operaciones permitidas y reglas de acceso | Pendiente |
| Arquitectura de software | Componentes web/API/BD/servicio ML/Power BI/planificador | Pendiente |
| Mockups | Pantallas de los casos de uso principales, incluido riesgo predictivo | Pendiente |
| Documento/PDF final | Narrativa, diagramas y mockups coherentes entre sí | Pendiente |

## 3. Alcance conceptual inicial

### Actores propuestos

- **Administrador:** usuarios, catálogos, equipos, configuración y acceso total.
- **Planificador o jefe de mantenimiento:** programa preventivos, revisa riesgo y decide acciones.
- **Técnico:** consulta órdenes asignadas y registra ejecución/correctivos.
- **Operador:** reporta una anomalía o falla; consulta equipos autorizados.
- **Analista o servicio de IA:** prepara datos, entrena, evalúa y publica predicciones.
- **Power BI:** consume datos consolidados y riesgos actualizados para visualización.

### Módulos propuestos

1. Seguridad y roles.
2. Catálogo y hoja de vida de equipos (línea, ubicación, criticidad, estado).
3. Mantenimiento preventivo (planes, programación, órdenes, ejecución).
4. Mantenimiento correctivo (reporte, diagnóstico, orden, cierre, causa/falla).
5. Inventario de repuestos *(confirmar si será parte del alcance real)*.
6. Analítica y tablero operativo.
7. Inteligencia predictiva: dataset, variables, entrenamiento, evaluación, riesgo y alertas.
8. Integración de datos hacia Power BI.

## 4. Arquitectura conceptual propuesta

```text
Usuarios (Administrador / Jefe / Técnico / Operador)
                       │
                 Aplicación web
                       │
              API de negocio y seguridad
          ┌────────────┼────────────┐
          │            │            │
 Base de datos     Servicio IA   Planificador 24 h
 operacional            │            │
          └──── Dataset / modelo / riesgo ────┘
                       │
                Vista o API de integración
                       │
                   Power BI Dashboard
```

**Decisión pendiente:** seleccionar tecnologías concretas cuando se reciba el código existente o se confirme que el desarrollo inicia desde cero. La arquitectura se mantendrá desacoplada: el servicio de IA no debe modificar directamente las órdenes de mantenimiento; solo produce riesgos y alertas auditables.

## 5. Plan maestro por fases

| Fase | Objetivo | Actividades segmentadas | Evidencia de cierre | Estado |
|---|---|---|---|---|
| 0. Diagnóstico e inicio | Establecer punto de partida | Inventario de carpeta; revisión de tecnologías, BD y datos; definición de alcance | Inventario y riesgos actualizados | **En curso** |
| 1. Descubrimiento | Validar necesidad y reglas | Usuarios/roles; procesos actuales; reglas; indicadores; fuentes de datos | Requisitos y alcance aprobado | Pendiente |
| 2. Diseño conceptual | Completar segunda entrega | Modelo de BD; procesos; casos de uso; arquitectura; mockups; PDF | PDF de propuesta conceptual | Pendiente |
| 3. Diseño técnico | Preparar construcción | Esquema físico; API; seguridad; plan de integración Power BI; contrato de datos ML | Documento técnico y backlog priorizado | Pendiente |
| 4. Base funcional | Construir CeroFallas | Autenticación; equipos; preventivos; correctivos; historial; validaciones | MVP funcional probado | Pendiente |
| 5. Datos predictivos | Convertir historial en datos útiles | Extracción; limpieza; definición de etiqueta; variables 30/60/90 días; partición temporal | Dataset versionado y diccionario de datos | Pendiente |
| 6. Modelado IA | Obtener modelo útil y defendible | Línea base logística; segundo modelo; validación cruzada apropiada; umbral; métricas | Informe de comparación y modelo seleccionado | Pendiente |
| 7. Integración | Llevar predicción a operación | Ejecución 24 h; registro de riesgos; alertas; vista/API para Power BI | Flujo automatizado demostrable | Pendiente |
| 8. Validación y cierre | Demostrar valor y calidad | Pruebas funcionales; validación paralela; comparación con proceso actual; documentación y defensa | Resultados, manuales y presentación final | Pendiente |

## 6. Avance actual y próximos pasos

### Completado

- [x] Se inspeccionó la carpeta de trabajo.
- [x] Se confirmó que no contiene archivos del sistema ni documentos previos; únicamente el directorio `.git` inicial.
- [x] Se formalizó el alcance del complemento de IA y el plan maestro en este archivo.
- [x] Se localizó una carpeta fuente externa en `C:\CeroFallas`, con: `cerofallas-backend`, `cerofallas-frontend`, `CeroFallasAI`, `CeroFallasWeb`, `Gestorcerofallas`, `PruebaGestorcerofallas`, `PruebasCeroFallasWeb` y `1er Entregable PG2.docx`.
- [x] Se identificó como núcleo vigente: Angular (`apps/web`), NestJS (`apps/api`) y el servicio Python de IA (`services/ai`). Las fuentes originales se conservaron sin modificar en `C:\CeroFallas`.
- [x] Se creó el monorepo limpio, excluyendo dependencias, compilados, datasets y pruebas heredadas.
- [x] Se corrigió el riesgo de configuración sensible: Firebase ahora se lee desde variables de entorno y existe `services/ai/.env.example` sin secretos.
- [x] Se generó y verificó visualmente el PDF de la segunda entrega en `docs/entregables/Segunda_Entrega_CeroFallas.pdf` (9 páginas).

### Bloqueos / información necesaria

- [ ] Configurar URL de repositorio remoto (GitHub) y publicar el primer commit.
- [ ] Esquema definitivo de base de datos y/o muestra anonimizada del histórico de equipos, preventivos y correctivos.
- [ ] Confirmación de los procesos reales, roles y campos ya existentes.
- [ ] Definición del período objetivo de predicción (por ejemplo, falla en los próximos 7, 14 o 30 días).
- [ ] Confirmación de si inventario/repuestos forma parte del alcance.

### Siguiente actividad recomendada

1. Copiar o ubicar en esta carpeta el código y documentos existentes de CeroFallas, si existen en otra ubicación.
2. Con esos insumos, elaborar los diagramas y mockups de la fase 2 basados en el sistema real.
3. Si el proyecto inicia desde cero, validar el alcance conceptual de la sección 3 y producir directamente el paquete de la segunda entrega.

## 7. Registro de cambios

| Fecha | Cambio | Responsable |
|---|---|---|
| 2026-09-02 | Archivo creado; diagnóstico inicial, alcance IA y plan maestro establecidos. | Codex + estudiante |
| 2026-09-02 | Se localizó el código/documentación fuente en `C:\CeroFallas`; pendiente reconocer la versión activa. | Codex + estudiante |
| 2026-09-02 | Se consolidó monorepo, se protegió la configuración sensible y se generó/validó el PDF de segunda entrega. | Codex + estudiante |
