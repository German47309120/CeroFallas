# CeroFallas — Errores y limitaciones relevantes

## ERROR 001 — Propietario diferente para Git

Fecha: 2026-09-02

Fase: Preparación del entorno.

Síntoma: Git rechazó el repositorio por `dubious ownership` al ejecutarse con la cuenta aislada.

Causa: La carpeta pertenece al usuario de Windows y las herramientas automatizadas utilizan otra identidad aislada.

Solución: El usuario autorizó agregar únicamente `C:/PG2_CeroFallas` como `safe.directory` global.

Archivos afectados: Ninguno.

Commit: `54ffbc7` como referencia del entorno preparado.

## ERROR 002 — Editor aislado y metadatos Git

Fecha: 2026-09-02

Fase: Preparación y documentación.

Síntoma: El editor de parches no puede refrescar el espacio mientras `.git` está presente.

Causa: Limitación del aislamiento de Windows en esta sesión.

Solución temporal: Mover `.git` a `.git-codex-paused` dentro del mismo proyecto durante cada lote de edición y restaurarlo inmediatamente antes de verificaciones y commits.

Archivos afectados: Metadatos Git movidos temporalmente, sin alteración de su contenido.

Estado: Activo y controlado.

## ERROR 003 — Java no disponible

Fecha: 2026-09-03

Fase: Configuración de Firebase.

Síntoma: El comando `java` no existe.

Causa: Java no está instalado o no se encuentra en PATH.

Impacto: El emulador local de Firestore no puede ejecutarse.

Solución propuesta: Instalar una versión de Java compatible después de verificar la documentación vigente, o realizar temporalmente pruebas de reglas en un entorno autorizado alternativo.

Estado: BLOQUEO PARCIAL; no afecta build ni Hosting local.

## ERROR 004 — Vulnerabilidades transitivas en Firebase CLI

Fecha: 2026-09-03

Fase: Configuración de Firebase.

Síntoma: `npm audit` reporta ocho vulnerabilidades moderadas en dependencias de desarrollo.

Causa: Dependencias transitivas de Firebase CLI 15.29.0.

Acción realizada: `npm audit fix` sin `--force`; vulnerabilidades de producción verificadas en cero.

Acción descartada: `npm audit fix --force`, porque propone una degradación disruptiva a Firebase CLI 14.23.0.

Mitigación: Uso exclusivamente local del CLI, actualización periódica y exclusión del bundle de producción.

Estado: Abierto, aceptado temporalmente.
