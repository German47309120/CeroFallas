# CeroFallas — Diseño de interfaz

Fecha: 2026-09-02

Estado: DISEÑO BASE

## Objetivos de experiencia

- Permitir registros rápidos en planta con pocos pasos.
- Priorizar legibilidad, estados claros y botones grandes en tablet y teléfono.
- Evitar que un usuario vea acciones que su rol no puede ejecutar, sin depender de esto como medida de seguridad.
- Mantener filtros visibles en escritorio y compactos en móvil.
- Mostrar siempre la fecha de actualización en datos provenientes de SAP o procesos predictivos.

## Identidad visual provisional

La identidad es provisional hasta recibir lineamientos oficiales de Novafiber. No se utilizará un logotipo extraído de fotografías.

Paleta propuesta:

| Token | Valor | Uso |
|---|---|---|
| Fondo general | `#F4F7F8` | Superficie de aplicación |
| Superficie | `#FFFFFF` | Tarjetas y formularios |
| Texto principal | `#152329` | Títulos y contenido |
| Texto secundario | `#52636B` | Ayudas y metadatos |
| Marca | `#126B72` | Navegación y acción principal |
| Marca oscura | `#0B4C52` | Hover y contraste |
| Acento | `#E9A23B` | Alertas operativas y elementos destacados |
| Éxito | `#237A57` | Completado o apto |
| Advertencia | `#B86912` | Requiere atención |
| Peligro | `#B63832` | Crítico, anulado o fuera de servicio |
| Borde | `#D6E0E3` | Separación de controles |

Tipografía: pila de sistema `Inter, Segoe UI, Roboto, Arial, sans-serif`; no requiere descargar fuentes externas.

## Reglas responsive

- Mobile-first desde 360 px.
- Contenido con ancho máximo aproximado de 1440 px.
- Navegación inferior o menú compacto en móvil.
- Sidebar persistente desde 1024 px.
- Formularios de una columna en móvil y hasta dos columnas en escritorio.
- Tablas se transforman en tarjetas o permiten desplazamiento horizontal controlado.
- Objetivos táctiles mínimos aproximados de 44 × 44 px.

## Mapa de navegación

```text
Login
  |
  +-- Inicio / Dashboard
  |     +-- Actividad reciente
  |     +-- Indicadores
  |     +-- Alertas e incidentes
  |
  +-- Correctivos
  |     +-- Nuevo correctivo
  |     +-- Historial
  |     +-- Detalle
  |
  +-- Preventivos
  |     +-- Programa
  |     +-- Registrar ejecución
  |     +-- Historial
  |
  +-- Montacargas
  |     +-- Nuevo checklist
  |     +-- Historial
  |     +-- Detalle
  |
  +-- Incidentes
  |     +-- Nuevo reporte
  |     +-- Seguimiento autorizado
  |
  +-- Equipos
  |     +-- Catálogo
  |     +-- Detalle e historial
  |
  +-- Repuestos
  |     +-- Consulta de stock
  |
  +-- Riesgo
  |     +-- Riesgo por equipo
  |     +-- Información del modelo
  |
  +-- Administración
        +-- Usuarios
        +-- Catálogos
        +-- Auditoría
```

## Rutas propuestas

| Ruta | Pantalla | Permiso conceptual |
|---|---|---|
| `/login` | Inicio de sesión | Público sin sesión |
| `/` | Dashboard autorizado | `dashboard.read` |
| `/correctivos` | Histórico de correctivos | `corrective.read` |
| `/correctivos/nuevo` | Nuevo correctivo | `corrective.create` |
| `/correctivos/:id` | Detalle | `corrective.read` |
| `/preventivos` | Programa e histórico | `preventive.read` |
| `/preventivos/nuevo` | Programar preventivo | `preventive.schedule` |
| `/preventivos/ejecutar/:id?` | Registrar ejecución | `preventive.execute` |
| `/montacargas` | Historial de checklist | `checklist.read` |
| `/montacargas/nuevo` | Nuevo checklist | `checklist.create` |
| `/incidentes` | Incidentes | `incident.read` |
| `/incidentes/nuevo` | Reportar incidente | `incident.create` |
| `/equipos` | Catálogo | `equipment.read` |
| `/equipos/:id` | Detalle del equipo | `equipment.read` |
| `/repuestos` | Stock SAP | `inventory.read` |
| `/riesgo` | Riesgo predictivo | `prediction.read` |
| `/admin/usuarios` | Usuarios | `user.manage` |
| `/admin/auditoria` | Auditoría | `audit.read` |
| `/perfil` | Perfil y cierre de sesión | Usuario autenticado |

## Estructura general de pantalla

```text
+-------------------------------------------------------------+
| Sidebar / menú | Encabezado: página, turno, usuario          |
|                +--------------------------------------------+
| Inicio         | Migas / contexto             Acción primaria|
| Correctivos    +--------------------------------------------+
| Preventivos    |                                             |
| Montacargas    | Contenido principal                          |
| Incidentes     | Tarjetas, filtros, formularios o tablas     |
| Equipos        |                                             |
| Repuestos      |                                             |
| Riesgo         |                                             |
| Admin          +--------------------------------------------+
|                | Estado de sincronización / versión          |
+-------------------------------------------------------------+
```

En móvil, el sidebar se reemplaza por encabezado compacto y navegación accesible mediante menú.

## Wireframe — Login

```text
+-----------------------------------+
| CeroFallas                        |
| Gestión de mantenimiento          |
|                                   |
| Correo                            |
| [____________________________]    |
| Contraseña                        |
| [____________________________]    |
|                                   |
| [ Iniciar sesión ]                |
|                                   |
| Mensaje de error / ayuda          |
+-----------------------------------+
```

## Wireframe — Dashboard

```text
+------------------+ +------------------+
| Correctivos      | | Preventivos      |
| 12 este mes      | | 84 % cumplimiento|
+------------------+ +------------------+
+------------------+ +------------------+
| Pendientes       | | Equipos atención |
| 5                | | 3                |
+------------------+ +------------------+

[ Filtros por fechas y área ]

+-------------------------+ +-------------------------+
| Actividad reciente      | | Incidentes / alertas    |
| ...                     | | ...                     |
+-------------------------+ +-------------------------+
```

## Wireframe — Formulario operacional

```text
Nuevo correctivo                         [Guardar]

Fecha *             Área / línea *
[__________]        [Seleccionar      v]

Equipo *            Técnico(s) *
[Seleccionar      v][Seleccionar      v]

Inicio *            Final *            Duración
[fecha y hora]      [fecha y hora]      42 min

Síntoma reportado *
[_______________________________________]

Trabajo realizado *
[_______________________________________]

Repuestos / observaciones
[_______________________________________]

[Cancelar]                          [Guardar correctivo]
```

## Wireframe — Checklist

```text
Montacargas [Seleccionar]   Horómetro [______]
Turno [Automático/selección]

Inspección visual
Llantas             ( ) Bueno ( ) Atención ( ) Fuera ( ) N/A
Mangueras            ( ) Bueno ( ) Atención ( ) Fuera ( ) N/A
Cilindros            ( ) Bueno ( ) Atención ( ) Fuera ( ) N/A

Operación
Frenos               ( ) Bueno ( ) Atención ( ) Fuera ( ) N/A
Dirección            ( ) Bueno ( ) Atención ( ) Fuera ( ) N/A

[!] Condición crítica detectada: equipo no apto

Observaciones [_______________________________]
[Guardar inspección]
```

## Componentes reutilizables

- `AppShell`: navegación, encabezado y contenido.
- `ProtectedRoute`: sesión y permisos.
- `PageHeader`: título, descripción y acción primaria.
- `StatCard`: indicador con estado y tendencia opcional.
- `StatusBadge`: etiqueta semántica, nunca solo color.
- `DataTable`: listado, vacío, carga, error y paginación.
- `FilterBar`: filtros aplicables y botón limpiar.
- `FormField`: etiqueta, ayuda y error accesible.
- `ConfirmDialog`: confirmación de anulación o acción sensible.
- `EmptyState`: orientación cuando no existen registros.
- `SyncStatus`: fecha y error del snapshot SAP.
- `RiskBadge`: riesgo con texto, color y explicación.

## Estados obligatorios

Cada vista de datos tendrá:

- Cargando.
- Contenido disponible.
- Sin resultados.
- Error recuperable.
- Sin permiso.
- Datos desactualizados, cuando provengan de una integración.

Los formularios tendrán:

- Inicial.
- Validando.
- Guardando.
- Guardado correctamente.
- Error de validación.
- Error de red o servidor.
- Prevención de doble envío.

## Mensajes base

- Éxito: “El registro se guardó correctamente.”
- Validación: “Revisa los campos marcados antes de continuar.”
- Sin permiso: “Tu usuario no tiene permiso para realizar esta acción.”
- Conexión: “No fue posible completar la operación. Inténtalo nuevamente.”
- Stock antiguo: “Mostrando la última actualización disponible del [fecha y hora].”
- Riesgo no calculable: “Todavía no existen datos suficientes para calcular el riesgo.”

## Accesibilidad mínima

- Etiquetas visibles para todos los campos.
- Errores asociados al control correspondiente.
- No comunicar estados únicamente mediante color.
- Foco visible.
- Orden lógico de teclado.
- Contraste revisado durante implementación.
- Iconos acompañados por texto o nombre accesible.

## Pendientes visuales

- Logotipo institucional autorizado.
- Colores oficiales, si existen.
- Fotografías y nombres definitivos de los equipos.
- Validación práctica en tablet o teléfono utilizado en planta.
