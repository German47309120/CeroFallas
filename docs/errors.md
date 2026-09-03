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

Solución temporal anterior: mover `.git` a `.git-codex-paused` durante cada lote de edición.

Incidente del 2026-09-03: Windows bloqueó parcialmente un nuevo movimiento y dividió contenido entre ambas rutas. Se recombinó el contenido, se verificó `HEAD` y `git status`, y se eliminó únicamente la copia temporal validada.

Regla operativa actual: no volver a mover `.git`; aplicar parches directamente, ya que el editor volvió a funcionar con el repositorio presente.

Archivos afectados: Metadatos Git movidos temporalmente, sin alteración de su contenido.

Estado: Controlado; repositorio verificado.

## ERROR 003 — Java no disponible (RESUELTO)

Fecha: 2026-09-03

Fase: Configuración de Firebase.

Síntoma: El comando `java` no existe.

Causa: Java no está instalado o no se encuentra en PATH.

Impacto: El emulador local de Firestore no puede ejecutarse.

Solución aplicada: instalación de Eclipse Temurin JDK 21.0.12.1 LTS mediante Windows Package Manager. Firestore Emulator inició correctamente y ejecutó la suite de reglas.

Estado: RESUELTO el 2026-09-03.

## ERROR 004 — Vulnerabilidades transitivas en Firebase CLI

Fecha: 2026-09-03

Fase: Configuración de Firebase.

Síntoma: `npm audit` reporta ocho vulnerabilidades moderadas en dependencias de desarrollo.

Causa: Dependencias transitivas de Firebase CLI 15.29.0.

Acción realizada: `npm audit fix` sin `--force`; vulnerabilidades de producción verificadas en cero.

Acción descartada: `npm audit fix --force`, porque propone una degradación disruptiva a Firebase CLI 14.23.0.

Mitigación: Uso exclusivamente local del CLI, actualización periódica y exclusión del bundle de producción.

Estado: Abierto, aceptado temporalmente.
