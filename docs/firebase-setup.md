# CeroFallas — Preparación de Firebase

Fecha: 2026-09-03

Estado: CONFIGURACIÓN LOCAL PREPARADA; PROYECTO CLOUD PENDIENTE

## Versiones

- Firebase JavaScript SDK: 12.18.0.
- Firebase CLI: 15.29.0, instalada localmente como dependencia de desarrollo.

## Archivos

- `firebase.json`: Hosting, Firestore y puertos de emuladores.
- `firestore.rules`: perfiles, permisos, equipos y auditoría habilitados; demás colecciones denegadas.
- `firestore.indexes.json`: índices vacíos hasta implementar consultas.
- `.env.example`: plantilla sin valores reales.
- `src/services/firebase/config.js`: inicialización modular condicionada.

## Estado seguro inicial

- No existe `.firebaserc` porque todavía no se ha elegido ni vinculado un proyecto real.
- No existen credenciales Firebase dentro del repositorio.
- Firestore deniega por defecto y sólo habilita las operaciones cubiertas por reglas probadas.
- La aplicación continúa en modo demostración si faltan variables.
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

Firestore Emulator se ejecuta con Eclipse Temurin JDK 21.

### Preparar un administrador ficticio local

Con Authentication y Firestore Emulator activos, definir `CEROFALLAS_TEST_EMAIL` y `CEROFALLAS_TEST_PASSWORD` únicamente en la terminal y ejecutar:

```powershell
npm run seed:emulator
```

El script crea una cuenta y un perfil administrador sólo en memoria local. No usar credenciales reales ni versionarlas.

### Probar reglas de Firestore

Con Java 21 disponible:

```powershell
npx firebase emulators:exec --project demo-cerofallas-rules-test --only firestore "npm test"
```

Las pruebas usan un proyecto `demo-` aislado y limpian Firestore entre casos.

## Seguridad de dependencias

`npm audit --omit=dev` reporta cero vulnerabilidades de producción.

Firebase CLI 15.29.0 conserva ocho vulnerabilidades moderadas en dependencias transitivas de desarrollo. La corrección forzada propone degradar a Firebase CLI 14.23.0 y no se aplicará. El CLI se utilizará solo como herramienta local, se mantendrá actualizado y no formará parte del bundle publicado.
