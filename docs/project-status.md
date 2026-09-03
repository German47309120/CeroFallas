# CEROFALLAS — ESTADO ACTUAL

Fecha: 2026-09-03

Fase: Fase 8 — Catálogo de equipos

Paso: 8.1 — Persistencia, permisos y gestión del catálogo

Estado: COMPLETADO TÉCNICAMENTE

Objetivo alcanzado:

Implementar el primer módulo operativo persistente con Firestore, autorización por perfil y trazabilidad de cambios.

Último resultado confirmado:

- Firestore Emulator funciona con Java 21.
- El perfil autenticado se obtiene desde `users/{uid}`.
- Los permisos `equipment.read`, `equipment.manage`, `audit.read` y `audit.write` gobiernan backend e interfaz.
- Equipos permite alta, consulta limitada a 50, búsqueda local, filtro por estado, edición y desactivación lógica.
- Cada alta o actualización ejecutada por el repositorio crea auditoría en el mismo lote atómico.
- No existe operación de borrado físico.
- El catálogo inicia vacío para no inventar información de planta.

Pruebas exitosas:

- P-007: 6 pruebas automáticas de reglas aprobadas.
- P-008: flujo integral de alta, persistencia, filtro, edición y desactivación aprobado en navegador.
- `npm run build`: aprobado.
- `npm audit --omit=dev`: 0 vulnerabilidades.

Pendientes externos:

- Nombres, códigos, modelos y líneas reales de las máquinas.
- Identidad del futuro técnico de soporte.
- Consulta y detalles técnicos autorizados de SAP/Power BI para sus fases.

Riesgos vigentes:

- Los datos definitivos de equipos no pueden cerrarse hasta la visita a planta.
- No existe histórico real suficiente para validar modelos predictivos.
- Firebase CLI conserva ocho alertas moderadas sólo en dependencias de desarrollo.

Siguiente acción exacta:

Iniciar la Fase 9 — mantenimientos correctivos: formulario basado en el reporte de tiempos suministrado, cálculo robusto de duración, permisos, Firestore y auditoría.
