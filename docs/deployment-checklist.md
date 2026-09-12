# CeroFallas — Checklist controlado de publicación

Fecha de preparación: 2026-09-05
Estado: base HTTPS publicada en Spark; aceptación final e integraciones pendientes

Este checklist separa una compilación local exitosa de una publicación realmente aceptada. No se deben copiar contraseñas, cuentas de servicio, tokens, credenciales SAP ni archivos `.env.local` al repositorio o a documentos académicos.

## 1. Puertas de autorización

- [x] El propietario confirma qué cuenta Google y qué proyecto Firebase se utilizarán.
- [x] Se acuerda si el ambiente será desarrollo, demostración o producción.
- [x] Se confirma región de Firestore antes de crear la base.
- [ ] Se revisan plan, facturación y límites antes de desplegar Functions o habilitar servicios con costo.
- [x] Se define quién tendrá acceso a Firebase Console y quién será responsable de soporte.
- [x] Se confirma que los datos iniciales serán ficticios o autorizados y que no se importará la instantánea local a producción.

## 2. Preparación local obligatoria

Diagnóstico automatizado disponible: ejecutar `npm run preflight` para informar el estado o `npm run preflight:cloud` como puerta estricta antes de cualquier despliegue. El segundo comando debe permanecer bloqueado hasta contar con proyecto y ambiente autorizados.

El diagnóstico también revisa los recursos generados en `dist/assets`: ningún paquete JavaScript puede superar 500 kB sin tratarse como bloqueo. React y Firebase se separan por responsabilidad, preservando el orden de ejecución; después de cualquier cambio de empaquetado debe abrirse el build servido, porque compilar por sí solo no demuestra que la aplicación arranque.

- [ ] `npm ci` finaliza correctamente en la raíz.
- [ ] `npm ci --prefix functions` finaliza correctamente.
- [x] `npm test` aprueba toda la suite.
- [ ] `npm run verify:demo-roles` aprueba la matriz local con los emuladores activos.
- [x] `npm run build` genera `dist/` sin errores.
- [ ] `npm audit --omit=dev` y `npm audit --prefix functions --omit=dev` se revisan; cualquier excepción queda documentada.
- [x] `git diff --check` no reporta errores de espacios.
- [x] El repositorio no contiene `.env.local`, `.local/`, `emulator-data/`, claves privadas o cuentas de servicio.

## 3. Configuración del proyecto Firebase

- [x] Registrar la aplicación web y copiar solo la configuración pública del SDK.
- [x] Crear `.env.local` desde `.env.example`; no modificar `.env.example` con valores reales.
- [x] Configurar `VITE_USE_FIREBASE_EMULATORS=false` para el build cloud.
- [x] Habilitar Authentication por correo y contraseña.
- [x] Crear Firestore en la región aprobada.
- [ ] Revisar dominios autorizados de Authentication.
- [ ] Mantener los encabezados base de Hosting y definir Content-Security-Policy después de conocer los dominios Firebase/Power BI autorizados.
- [ ] Configurar App Check primero en modo de observación; activar cumplimiento solo después de verificar clientes legítimos.
  - El SDK ya está preparado. Falta registrar el dominio, configurar `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY`, publicar, observar métricas y ejecutar aceptación con los once perfiles.
- [x] Confirmar que Cloud Storage permanece deshabilitado mientras adjuntos no formen parte del alcance aprobado.

## 4. Revisión de seguridad previa

- [x] Desplegar reglas e índices inicialmente en un proyecto de desarrollo/demostración, nunca directamente en producción institucional.
- [x] Crear el primer administrador mediante procedimiento controlado; no mediante una escritura libre desde el navegador.
- [ ] Probar cuenta activa, desactivada, sin perfil, administrador, soporte y un rol operativo.
- [ ] Confirmar que Soporte no puede ejecutar la administración de identidades reservada al Administrador.
- [ ] Confirmar que una contraseña temporal no aparece en Firestore, Auditoría, logs o errores.
- [ ] Probar restablecimiento sobre una cuenta desechable y confirmar que el Administrador no puede restablecer su propia contraseña desde el panel.
- [ ] Revisar retención y acceso de logs de Functions.
- [ ] Configurar presupuestos, alertas y límites antes de recibir usuarios reales.

## 5. Orden de despliegue propuesto

Ejecutar cada paso únicamente después de aprobar el anterior:

1. Vincular el alias del proyecto de desarrollo.
2. Desplegar índices y esperar a que terminen de construirse.
3. Desplegar reglas y ejecutar pruebas negativas desde cuentas reales de prueba.
4. Desplegar Functions y probar alta/actualización de un usuario ficticio.
5. Compilar con la configuración del ambiente.
6. Servir `dist/` localmente y recorrer login, dashboard, formularios e históricos.
7. Desplegar Hosting.
8. Repetir el recorrido usando la URL HTTPS publicada y un dispositivo móvil.

Los comandos concretos del proyecto se definirán después de vincular el alias correcto. No se dejarán comandos con un identificador de proyecto inventado.

## 6. Prueba de aceptación publicada

- [x] Login correcto y mensaje genérico ante credenciales inválidas, cuenta inexistente o cuenta desactivada.
- [ ] Navegación distinta para Administrador, Gerencia, rol operativo y reportante.
- [ ] Alta y actualización administrativa dejan auditoría sin información secreta.
- [ ] Correctivo, preventivo, checklist e incidente completan su recorrido principal.
- [ ] Históricos aplican filtros estructurados y explican el alcance de búsqueda textual.
- [ ] Dashboard distingue datos, ausencia real, falta de permiso y error de conexión.
- [x] Recarga directa de rutas como `/correctivos` no produce 404.
- [ ] Diseño usable en escritorio y móvil; no hay desbordamientos o controles inaccesibles.
- [ ] Consola del navegador y logs no muestran errores no explicados.

## 7. Integraciones excluidas de esta publicación inicial

- SAP SQL Server no se conecta desde la SPA y requiere intervención del usuario antes de cualquier acceso.
- Power BI requiere confirmar audiencia, permisos del enlace y método de inserción.
- Predictivo no se presenta como funcional hasta contar con dataset, métricas y modelo versionado.
- Automatización de 24 horas depende de infraestructura, fuente y costos aprobados.

## 8. Reversión y recuperación

- [ ] Conservar el commit o etiqueta exacta desplegada.
- [ ] Registrar fecha, responsable, proyecto, ambiente y resultado del despliegue.
- [ ] Si Hosting falla, volver a la última versión conocida desde el historial de releases.
- [ ] Si Rules bloquea operación, corregir y probar en desarrollo; no abrir permisos globalmente como contingencia.
- [ ] Si Functions falla, deshabilitar la operación administrativa en interfaz y conservar Authentication/Firestore sin modificaciones manuales improvisadas.
- [ ] Documentar el incidente, la decisión de reversión y la evidencia posterior.

## Evidencia requerida para cerrar Fase 16

La fase se considerará completa únicamente cuando existan URL HTTPS, proyecto y ambiente identificados, reglas/índices/functions desplegados, recorridos por rol aprobados, evidencia móvil, revisión de logs y mecanismo de reversión comprobado. Tener `dist/` o Firebase Hosting configurado no equivale a publicación terminada.

## Evidencia local vigente — 2026-09-05

- `vite preview` sirvió el build actual en un puerto temporal.
- Se comprobaron 12 rutas directas: inicio, login, correctivos, preventivos, montacargas, incidentes, equipos, repuestos, riesgo, usuarios, auditoría y perfil.
- Las 12 respondieron HTTP 200 e incluyeron el punto de montaje de React. Esta evidencia no marca la casilla de aceptación publicada: aún debe repetirse sobre Firebase Hosting HTTPS.
- Firebase Hosting Emulator también devolvió HTTP 200 para `/riesgo`, confirmando el rewrite. En este entorno demo sin proyecto vinculado no devolvió los encabezados personalizados; por ello sus valores se validan estructuralmente en preflight y deberán confirmarse otra vez sobre la respuesta HTTPS publicada.

## Evidencia publicada — 2026-09-08

- Once cuentas cloud iniciaron sesión y sus perfiles activos coincidieron con el catálogo de roles.
- Las reglas permitieron o rechazaron correctamente lecturas de nueve colecciones según cada perfil.
- Trece rutas HTTPS respondieron 200 y los cuatro encabezados de seguridad configurados coincidieron con los valores esperados.
- Resultado reproducible: 149 verificaciones aprobadas mediante `npm run verify:published-roles -- --project=cerofallas-pg2-german-2026`; no se realizaron escrituras ni se mostraron contraseñas.
- Cuatro operaciones técnicas publicadas generaron sus auditorías y cuatro intentos sin permiso fueron rechazados. Una segunda ejecución confirmó idempotencia: cero duplicados y ocho documentos de evidencia existentes.

## Evidencia publicada adicional — 2026-09-11

- Se publicó la ruta protegida `/analitica`, preparada para un enlace HTTPS autorizado de Power BI.
- Catorce rutas HTTPS respondieron 200; once cuentas conservaron perfil, rol y permisos correctos.
- Resultado reproducible: 150 verificaciones de solo lectura aprobadas. No se configuró un enlace ficticio, no se realizaron escrituras y no se mostraron contraseñas.
- Falta definir la audiencia del reporte y completar `VITE_POWER_BI_REPORT_URL` antes de considerarlo integrado.
