# CeroFallas — Registro de riesgos

Fecha de actualización: 2026-09-22

| ID | Riesgo | Probabilidad | Impacto | Mitigación inicial | Estado |
|---|---|---:|---:|---|---|
| R-001 | No contar a tiempo con códigos, modelos y líneas de los equipos | Alta | Alta | Utilizar catálogo provisional claramente marcado y recopilar placas en planta | Abierto |
| R-002 | No existe histórico para entrenar un modelo predictivo real | Alta | Alta | Diseñar captura correcta; demostrar tubería con datos ficticios; no afirmar validez industrial | Abierto |
| R-003 | Exposición de credenciales de SAP o Firebase | Media | Crítico | `.gitignore`, variables seguras, backend y conexión de solo lectura | Controlado parcialmente |
| R-004 | La base SQL Server de SAP no es accesible desde la nube | Media | Alta | Evaluar servicio interno o sincronización periódica de stock | Abierto |
| R-005 | Publicar datos institucionales mediante un enlace público de Power BI | Media | Alto | Confirmar modalidad de acceso y licencia antes de publicar | Abierto |
| R-006 | Roles ambiguos o permisos excesivos | Media | Alto | Matriz de permisos y pruebas de autorización | En mitigación |
| R-007 | Frecuencias preventivas estimadas no coinciden con operación real | Alta | Medio | Hacerlas configurables y marcarlas como provisionales | En mitigación |
| R-008 | Aumento del alcance por stock, incidentes y predictivo | Alta | Alto | Prioridad por núcleo operativo y criterios de aceptación por módulo | En mitigación |
| R-009 | Cálculos incorrectos en turnos que atraviesan medianoche | Baja | Alto | Hora oficial del servidor, turno validado por reglas, recálculo al guardar y pruebas de límites/medianoche | Controlado técnicamente; falta aceptación en planta |
| R-010 | Costos cloud inesperados | Baja inicialmente | Alto | Empezar con cuotas gratuitas, monitorear consumo y pedir autorización antes de facturación | En mitigación |
