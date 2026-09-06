# CeroFallas — Checklist controlado de publicación

Fecha de preparación: 2026-09-05
Estado: preparado; ningún despliegue ejecutado

Este checklist separa una compilación local exitosa de una publicación realmente aceptada. No se deben copiar contraseñas, cuentas de servicio, tokens, credenciales SAP ni archivos `.env.local` al repositorio o a documentos académicos.

## 1. Puertas de autorización

- [ ] El propietario confirma qué cuenta Google y qué proyecto Firebase se utilizarán.
- [ ] Se acuerda si el ambiente será desarrollo, demostración o producción.
- [ ] Se confirma región de Firestore antes de crear la base.
- [ ] Se revisan plan, facturación y límites antes de desplegar Functions o habilitar servicios con costo.
- [ ] Se define quién tendrá acceso a Firebase Console y quién será responsable de soporte.
- [ ] Se confirma que los datos iniciales serán ficticios o autorizados y que no se importará la instantánea local a producción.

## 2. Preparación local obligatoria

- [ ] `npm ci` finaliza correctamente en la raíz.
- [ ] `npm ci --prefix functions` finaliza correctamente.
- [ ] `npm test` aprueba toda la suite.
- [ ] `npm run verify:demo-roles` aprueba la matriz local con los emuladores activos.
- [ ] `npm run build` genera `dist/` sin errores.
- [ ] `npm audit --omit=dev` y `npm audit --prefix functions --omit=dev` se revisan; cualquier excepción queda documentada.
- [ ] `git diff --check` no reporta errores de espacios.
- [ ] El repositorio no contiene `.env.local`, `.local/`, `emulator-data/`, claves privadas o cuentas de servicio.

## 3. Configuración del proyecto Firebase

- [ ] Registrar la aplicación web y copiar solo la configuración pública del SDK.
- [ ] Crear `.env.local` desde `.env.example`; no modificar `.env.example` con valores reales.
- [ ] Configurar `VITE_USE_FIREBASE_EMULATORS=false` para el build cloud.
- [ ] Habilitar Authentication por correo y contraseña.
- [ ] Crear Firestore en la región aprobada.
- [ ] Revisar dominios autorizados de Authentication.
- [ ] Configurar App Check primero en modo de observación; activar cumplimiento solo después de verificar clientes legítimos.
- [ ] Confirmar que Cloud Storage permanece deshabilitado mientras adjuntos no formen parte del alcance aprobado.

## 4. Revisión de seguridad previa

- [ ] Desplegar reglas e índices inicialmente en un proyecto de desarrollo, nunca directamente en producción.
- [ ] Crear el primer administrador mediante procedimiento controlado; no mediante una escritura libre desde el navegador.
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

- [ ] Login correcto y mensaje comprensible ante credenciales inválidas o cuenta desactivada.
- [ ] Navegación distinta para Administrador, Gerencia, rol operativo y reportante.
- [ ] Alta y actualización administrativa dejan auditoría sin información secreta.
- [ ] Correctivo, preventivo, checklist e incidente completan su recorrido principal.
- [ ] Históricos aplican filtros estructurados y explican el alcance de búsqueda textual.
- [ ] Dashboard distingue datos, ausencia real, falta de permiso y error de conexión.
- [ ] Recarga directa de rutas como `/correctivos` no produce 404.
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
