# CeroFallas — Modelo entidad–relación

Fecha: 2026-09-06

Estado: MODELO LÓGICO BASADO EN EL DISEÑO VIGENTE

Este diagrama resume las entidades, claves y cardinalidades principales descritas en `data-model.md`. En Cloud Firestore las referencias se almacenan como identificadores y, cuando se necesita preservar el histórico, también como snapshots desnormalizados. Por ello las marcas `FK` representan relaciones lógicas, no restricciones físicas de una base SQL.

Diagrama editable: [CeroFallas — Modelo entidad–relación en FigJam](https://www.figma.com/board/2XJOWJFPRR5MPuotQf4idR)

```mermaid
erDiagram
    direction LR

    role ||--o{ appUser : asigna
    area ||--o{ equipment : contiene
    area ||--o{ correctiveMaintenance : ubica
    area ||--o{ incident : ubica
    equipment ||--o{ correctiveMaintenance : recibe
    equipment ||--o{ preventivePlan : programa
    preventivePlan o|--o{ preventiveExecution : origina
    equipment ||--o{ preventiveExecution : recibe
    equipment ||--o{ forkliftInspection : inspecciona
    checklistTemplate ||--o{ forkliftInspection : define
    workShift ||--o{ forkliftInspection : clasifica
    incident o|..o| correctiveMaintenance : vincula
    equipment ||--o{ riskPrediction : evalua
    appUser ||--o{ auditEvent : ejecuta
    appUser ||--o{ incident : reporta
    appUser ||--o{ forkliftInspection : realiza
    correctiveMaintenance }o..o{ stockPart : consume
    preventiveExecution }o..o{ stockPart : consume

    role["ROL"] {
        string id PK
        string name
        string[] permissions
        string status
        boolean systemRole
    }

    appUser["USUARIO"] {
        string id PK "UID de Authentication"
        string email UK
        string displayName
        string roleId FK
        string[] areaIds
        string status
        timestamp createdAt
    }

    area["AREA"] {
        string id PK
        string code UK
        string name
        string category
        string status
    }

    workShift["TURNO"] {
        string id PK
        string name
        time startTime
        time endTime
        boolean crossesMidnight
        string status
    }

    equipment["EQUIPO"] {
        string id PK
        string code UK
        string name
        string type
        string areaId FK
        string criticality
        string status
    }

    correctiveMaintenance["MANTENIMIENTO CORRECTIVO"] {
        string id PK
        string areaId FK
        string equipmentId FK
        timestamp startedAt
        timestamp endedAt
        integer durationMinutes
        string[] technicianIds
        string status
    }

    preventivePlan["PLAN PREVENTIVO"] {
        string id PK
        string equipmentId FK
        string activityName
        string frequencyType
        number frequencyValue
        timestamp nextDueAt
        string[] assignedUserIds
        string status
    }

    preventiveExecution["EJECUCION PREVENTIVA"] {
        string id PK
        string planId FK "Opcional"
        string equipmentId FK
        timestamp startedAt
        timestamp endedAt
        integer durationMinutes
        string complianceStatus
        string status
    }

    checklistTemplate["PLANTILLA CHECKLIST"] {
        string id PK
        string name
        integer version
        string[] applicableEquipmentTypes
        object[] sections
        string status
    }

    forkliftInspection["INSPECCION MONTACARGAS"] {
        string id PK
        string equipmentId FK
        string templateId FK
        string shiftId FK
        string operatorId FK
        timestamp inspectedAt
        number hourMeter
        string overallResult
    }

    incident["INCIDENTE"] {
        string id PK
        string areaId FK
        string equipmentId FK "Opcional"
        string reporterId FK
        string linkedCorrectiveId FK "Opcional"
        string priority
        string status
        timestamp createdAt
    }

    stockPart["STOCK REPUESTO"] {
        string id PK
        string code
        string description
        decimal quantity
        string warehouse
        timestamp syncedAt
        string syncBatchId
    }

    riskPrediction["PREDICCION RIESGO"] {
        string id PK
        string equipmentId FK
        timestamp calculatedAt
        integer horizonDays
        decimal riskScore
        string riskLevel
        string methodVersion
        boolean isDemonstration
    }

    auditEvent["AUDITORIA"] {
        string id PK
        string actorId FK
        timestamp occurredAt
        string action
        string entityType
        string entityId
        object before
        object after
    }
```

## Alcance y pendientes

- `ROL`, `ÁREA`, `TURNO` y `PLANTILLA_CHECKLIST` son catálogos lógicos; parte de ellos permanece configurada en código mientras se valida su administración futura.
- La relación entre incidentes y correctivos es opcional en ambos sentidos.
- Una ejecución preventiva puede ser extraordinaria y no pertenecer a un plan.
- Los repuestos utilizados se conservan actualmente como snapshots dentro del mantenimiento; la relación con stock es conceptual y no modifica SAP.
- Las predicciones continúan en modo demostrativo hasta recibir histórico autorizado y validar el modelo.
- Permanecen pendientes los catálogos reales de equipos, fallas, componentes, turnos y datos de integración con SAP.
