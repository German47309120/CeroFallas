# CeroFallas — Preparación de Firebase

Fecha de actualización: 2026-09-05

Estado: CONFIGURACIÓN LOCAL PREPARADA; PROYECTO CLOUD PENDIENTE

## Versiones

- Firebase JavaScript SDK: 12.18.0.
- Firebase CLI: 15.29.0, instalada localmente como dependencia de desarrollo.
- Firebase Admin SDK: 14.3.0, aislado en `functions/`.
- Firebase Functions SDK: 7.3.2 para Node 22, aislado en `functions/`.

## Archivos

- `firebase.json`: Hosting, Firestore y puertos de emuladores.
- `firestore.rules`: perfiles, permisos, equipos y auditoría habilitados; demás colecciones denegadas.
- `firestore.indexes.json`: índices compuestos requeridos por históricos y dashboard; despliegue cloud pendiente.
- `.env.example`: plantilla sin valores reales.
- `src/services/firebase/config.js`: inicialización modular condicionada.
- `functions/src/index.js`: operaciones privilegiadas de alta y actualización de usuarios.

## Estado seguro inicial

- No existe `.firebaserc` porque todavía no se ha elegido ni vinculado un proyecto real.
- No existen credenciales Firebase dentro del repositorio.
- Firestore deniega por defecto y sólo habilita las operaciones cubiertas por reglas probadas.
- En desarrollo sin variables, la aplicación usa emuladores locales; en un build de producción sin variables, bloquea el acceso y solicita configuración.
- Un build de producción sin variables muestra un bloqueo de configuración explícito en el login; no intenta inicializar Firebase ni deja una pantalla vacía.
- No se habilitó facturación ni Cloud Storage.

## Próximos pasos que requieren al usuario

Cuando se prepare el ambiente cloud:

1. Iniciar sesión con la cuenta de Google autorizada.
2. Crear o seleccionar el proyecto Firebase.
3. Elegir conscientemente la región de Firestore; esta decisión no debe improvisarse porque no se cambia libremente después.
4. Registrar una aplicación web.
5. Copiar únicamente la configuración web a `.env.local`.
6. Habilitar Authentication por correo y contraseña.
7. Crear la base Cloud Firestore en modo seguro.
8. Vincular el proyecto mediante `.firebaserc` o alias del CLI.

No compartir en el chat contraseñas, archivos de cuenta de servicio ni credenciales de SAP.

## Emuladores

Puertos previstos:

- UI: 4000.
- Hosting: 5000.
- Firestore: 8080.
- Authentication: 9099.
- Functions: 5001.

Firestore Emulator se ejecuta con Eclipse Temurin JDK 21.

### Preparar un administrador ficticio local

Iniciar los emuladores con persistencia:

```powershell
npm run emulators:start
```

El comando importa la copia verificada de `emulator-data/`. Esa carpeta contiene únicamente estado local y está ignorada por Git. Antes de cerrar una sesión donde se crearon usuarios o registros importantes, ejecutar en otra terminal:

```powershell
npm run emulators:save
```

El guardado conserva la copia anterior en `emulator-data-backup-*` y recupera automáticamente la exportación temporal si Windows impide al CLI renombrarla. Después se puede cerrar el emulador con `Ctrl+C`. El parámetro `--export-on-exit` se mantiene como respaldo adicional, pero un cierre forzado no garantiza los últimos cambios.

La exportación vigente contiene 11 cuentas ficticias, una por cada rol institucional, y el conjunto demostrativo de Firestore. Las contraseñas no se registran en Git ni en esta documentación.

### Administración local de usuarios

La ruta Usuarios llama a Functions Emulator para crear y actualizar identidades sin cambiar la sesión del administrador. El servidor vuelve a comprobar que el solicitante tenga un perfil activo con rol `administrator`, deriva los permisos desde el catálogo controlado y registra auditoría sin contraseñas. También evita que el administrador se desactive o retire su propio rol.

Esta capacidad no está desplegada. Antes de llevarla a nube deben revisarse región, costos, App Check, variables por ambiente, observabilidad y las alertas de dependencias.

Para la demostración preparada:

```powershell
npm run seed:demo
npm run seed:demo-user
npm run seed:demo-roles
```

El segundo comando crea una cuenta administrativa solo en Authentication Emulator y escribe una contraseña aleatoria en `.local/demo-login.txt`, también ignorado por Git. Ejecutarlo únicamente en un emulador limpio; después la cuenta se recupera mediante `npm run emulators:start`.

El tercer comando completa los otros perfiles institucionales mediante el backend privilegiado y guarda accesos aleatorios en `.local/demo-role-users.json`. Puede repetirse sin duplicar cuentas. Para verificar perfiles, lecturas y rechazo de operaciones administrativas ejecutar:

```powershell
npm run verify:demo-roles
```

La evidencia del 2026-09-05 fue de 129 comprobaciones en diez cuentas; el Técnico de Mantenimiento fue validado separadamente en navegador.

Como alternativa, para crear un administrador ficticio con credenciales elegidas por quien prueba:

Con Authentication y Firestore Emulator activos, definir `CEROFALLAS_TEST_EMAIL` y `CEROFALLAS_TEST_PASSWORD` únicamente en la terminal y ejecutar:

```powershell
npm run seed:emulator
```

El script crea una cuenta y un perfil administrador local. No usar credenciales reales ni versionarlas.

### Probar reglas de Firestore

Con Java 21 disponible:

```powershell
npx firebase emulators:exec --project demo-cerofallas-rules-test --only firestore "npm test"
```

Las pruebas usan un proyecto `demo-` aislado y limpian Firestore entre casos.

## Seguridad de dependencias

`npm audit --omit=dev` del frontend reporta cero vulnerabilidades de producción.

En `functions/`, `npm audit --omit=dev` reporta siete vulnerabilidades moderadas en dependencias transitivas de Firebase Admin/Functions relacionadas con Storage, HTTP y UUID. La propuesta automática completa degrada Firebase Admin a una versión mayor incompatible, por lo que no se aplicó `npm audit fix --force`. Debe reevaluarse con nuevas versiones oficiales antes del despliegue.

Firebase CLI 15.29.0 conserva ocho vulnerabilidades moderadas en dependencias transitivas de desarrollo. La corrección forzada propone degradar a Firebase CLI 14.23.0 y no se aplicará. El CLI se utilizará solo como herramienta local, se mantendrá actualizado y no formará parte del bundle publicado.
