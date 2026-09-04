# CEROFALLAS — ESTADO ACTUAL

## Avance vigente — 2026-09-03

Fase 12: incidentes implementados técnicamente; avance adicional en consultas administrativas y dashboard.

- Reporte de incidentes con validación, prioridad, área y equipo opcional.
- Seguimiento exclusivo de administrador/soporte con motivo y auditoría atómica obligatoria.
- Vínculo a correctivo existente, con validación de área y equipo; sin conversión automática todavía.
- Inicio con conteos agregados reales de correctivos, ejecuciones preventivas, planes activos e incidentes abiertos.
- Consultas de perfiles/usuarios, auditoría y stock; Mi perfil funcional.
- Navegación filtrada por permisos; nuevas reglas de Firestore y 14 pruebas adicionales.
- Administrador existente del emulador actualizado con permisos de las nuevas consultas; no se cambiaron otros roles ni se crearon cuentas.

Verificación: 43/43 pruebas automatizadas y build de producción aprobados. Revisión de navegador limitada a la pantalla de acceso; el nuevo flujo autenticado requiere validación manual del usuario. Advertencia no bloqueante de bundle de aproximadamente 875 kB; queda pendiente dividir carga por rutas.

Siguiente trabajo: validar recorrido manual documentado en `docs/guia-avance-incidentes.md`, paginación de históricos, alta y administración privilegiada de usuarios, agregados gerenciales con mínimo privilegio, integración segura de stock y preparación de Power BI/predictivo.

Pendiente externo: consulta/esquema SQL autorizado, conectividad de planta, equipos reales, histórico, modalidad Power BI y autorización de cualquier costo cloud. Stock no contiene existencias inventadas. El entregable académico se conserva como versión histórica.

## Registro anterior — Fase 11

Fecha: 2026-09-03

Fase: Fase 11 — Checklist de montacargas

Paso: 11.1 — Plantilla versionada, inspección y resultado operativo

Estado: COMPLETADO TÉCNICAMENTE

Objetivo alcanzado:

Crear un checklist diario integral debido a que la planta no posee un formulario oficial suministrado para el proyecto.

Último resultado confirmado:

- Plantilla `forklift-daily-v1`, versión 1, con 25 puntos en cuatro secciones.
- Revisa llantas, horquillas, mástil/cadenas, mangueras, cilindros, fugas, aceite, refrigerante, batería, frenos, dirección, elevación, inclinación, bocina, luces y elementos de seguridad.
- Cada punto admite Bueno, Requiere atención, Fuera de servicio o No aplica.
- Los puntos críticos están identificados y cualquier falla crítica produce `out_of_service`.
- Las condiciones defectuosas exigen observación antes de guardar.
- Se registran montacargas, operador, fecha/hora, turno, horómetro, versión de plantilla, respuestas y resultado calculado.
- El selector muestra únicamente equipos activos identificados como montacargas.
- La inspección y su auditoría se guardan atómicamente; el borrado físico está prohibido.

Pruebas exitosas:

- Suite completa: 29 de 29 pruebas aprobadas.
- P-014: plantilla completa validada en navegador.
- Una falla ficticia en freno de servicio produjo una falla crítica y “Fuera de servicio — no operar”.
- `npm run build`: aprobado después de la corrección del estado incompleto.

Pendientes externos:

- Códigos y modelos reales de montacargas.
- Validación del checklist por el responsable de seguridad o mantenimiento de planta.
- Evidencia fotográfica, condicionada a la decisión futura sobre Firebase Cloud Storage y facturación.
- Identidad del futuro técnico de soporte.

Riesgos vigentes:

- La plantilla es una propuesta técnica y debe aprobarse en planta antes de considerarse institucional.
- No existe histórico real suficiente para validar modelos predictivos.

Siguiente acción exacta:

Iniciar la Fase 12 — incidentes operativos para Digitadores y Operadores de Airlay, orientados al reporte gerencial y posible conversión a correctivo.
