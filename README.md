# CeroFallas

Proyecto de graduación: sistema de gestión de mantenimiento industrial con un módulo de mantenimiento predictivo.

## Estructura

- `apps/web`: aplicación web Angular.
- `apps/api`: API NestJS.
- `services/ai`: extracción, ingeniería de variables, entrenamiento y publicación del riesgo predictivo.
- `docs/entregables`: documentos académicos y diagramas.
- `ESTADO_PROYECTO.md`: plan maestro y bitácora de continuidad.

## Seguridad

No se deben versionar credenciales, datos productivos, modelos entrenados ni reportes generados con datos sensibles. Usar archivos `.env` locales y un `.env.example` sin valores secretos.

