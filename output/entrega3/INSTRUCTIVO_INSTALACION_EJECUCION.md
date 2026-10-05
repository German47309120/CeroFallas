# CeroFallas - Instructivo de instalacion y ejecucion

## 1. Descripcion

CeroFallas es una aplicacion web responsive para gestionar equipos, mantenimientos correctivos y preventivos, inspecciones de montacargas, incidentes, repuestos, usuarios, auditoria y analitica de riesgo.

Aplicacion publicada: https://cerofallas-pg2-german-2026.web.app

El paquete de codigo no incluye contrasenas, archivos `.env.local`, cuentas de servicio, exportaciones locales de Firebase, datos de SAP ni otras credenciales.

## 2. Requisitos

- Windows 10 u 11.
- Node.js 22 LTS o compatible.
- npm 10 o superior.
- Java JDK 21, requerido por Firebase Emulator Suite.
- Git, opcional para control de versiones.
- Python 3.12, opcional para el laboratorio predictivo.

Para confirmar las herramientas:

```powershell
node --version
npm --version
java -version
python --version
```

## 3. Preparacion del proyecto

1. Descomprimir el archivo de codigo fuente.
2. Abrir PowerShell dentro de la carpeta `CeroFallas_Codigo_Fuente_Entrega3`.
3. Instalar las dependencias principales:

```powershell
npm install
```

4. Instalar las dependencias de las funciones locales:

```powershell
npm install --prefix functions
```

5. Crear la configuracion local a partir de la plantilla:

```powershell
Copy-Item .env.example .env.local
```

No colocar cuentas de servicio, contrasenas ni credenciales SAP en `.env.local`.

## 4. Ejecucion local con Firebase Emulator

Este modo permite revisar el proyecto sin utilizar un proyecto Firebase real.

### 4.1 Configurar `.env.local`

Mantener vacias las variables `VITE_FIREBASE_*` y establecer:

```dotenv
VITE_DEMO_MODE=true
VITE_USE_FIREBASE_EMULATORS=true
VITE_ADMIN_FUNCTIONS_ENABLED=false
VITE_POWER_BI_REPORT_URL=
VITE_RECAPTCHA_ENTERPRISE_SITE_KEY=
```

### 4.2 Iniciar los emuladores

En la primera terminal:

```powershell
npm run emulators:fresh
```

Puertos utilizados:

- Authentication: `9099`.
- Firestore: `8080`.
- Functions: `5001`.
- Firebase Emulator UI: `4000`.

### 4.3 Cargar informacion demostrativa

Sin cerrar los emuladores, abrir una segunda terminal en la carpeta del proyecto y ejecutar:

```powershell
npm run seed:demo
npm run seed:demo-user
```

El segundo comando crea una cuenta administrativa ficticia y guarda el acceso solamente en:

```text
.local/demo-login.txt
```

La carpeta `.local` esta excluida de Git. No publicar ese archivo ni reutilizar la contrasena fuera del emulador.

### 4.4 Iniciar la aplicacion

En la segunda terminal:

```powershell
npm run dev
```

Abrir:

```text
http://127.0.0.1:5173/login
```

## 5. Ejecucion con un proyecto Firebase autorizado

Para trabajar contra Firebase Cloud se necesita registrar previamente una aplicacion web y habilitar Authentication y Firestore.

Completar en `.env.local`:

```dotenv
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_DEMO_MODE=false
VITE_USE_FIREBASE_EMULATORS=false
VITE_ADMIN_FUNCTIONS_ENABLED=false
VITE_POWER_BI_REPORT_URL=
VITE_RECAPTCHA_ENTERPRISE_SITE_KEY=
```

Despues ejecutar:

```powershell
npm run dev
```

Las funciones administrativas deben permanecer deshabilitadas mientras no hayan sido desplegadas y autorizadas en el proyecto cloud.

## 6. Compilacion de produccion

Generar la aplicacion optimizada:

```powershell
npm run build
```

El resultado se crea en `dist/`.

Probar el resultado localmente:

```powershell
npm run preview
```

Abrir:

```text
http://127.0.0.1:4173
```

## 7. Pruebas y controles de calidad

Comprobaciones principales:

```powershell
npm run lint
npm test
npm run predictive:test
npm run build
```

Ejecucion agrupada:

```powershell
npm run verify
```

`npm test` inicia un Firestore Emulator aislado y necesita Java 21 disponible en `PATH`.

## 8. Laboratorio predictivo opcional

Instalar las dependencias de Python:

```powershell
python -m pip install pandas scikit-learn
```

Ejecutar la demostracion reproducible:

```powershell
npm run predictive:demo
```

Los resultados se guardan en `.local/` y son exclusivamente demostrativos. No representan predicciones validadas con datos reales de planta.

## 9. Acceso desde un telefono en la misma red

1. Conectar la computadora y el telefono a la misma red local.
2. Consultar la direccion IPv4 de la computadora:

```powershell
ipconfig
```

3. Iniciar Vite permitiendo conexiones de la red:

```powershell
npm run dev -- --host 0.0.0.0
```

4. Desde el telefono abrir `http://DIRECCION_IPV4:5173`.

Puede ser necesario permitir temporalmente Node.js en el firewall para redes privadas. No habilitar el acceso en redes publicas.

## 10. Solucion de problemas

### El puerto esta ocupado

Cerrar la instancia anterior o identificar el proceso:

```powershell
netstat -ano | findstr :5173
netstat -ano | findstr :8080
```

### Firebase Emulator no inicia

- Confirmar `java -version`.
- Utilizar JDK 21.
- Revisar que los puertos 4000, 5001, 8080 y 9099 esten libres.

### La aplicacion muestra que falta configuracion

- Para emuladores, confirmar `VITE_USE_FIREBASE_EMULATORS=true`.
- Para Firebase Cloud, completar las variables `VITE_FIREBASE_*`.
- Reiniciar Vite despues de modificar `.env.local`.

### No se puede iniciar sesion localmente

- Confirmar que Authentication Emulator y Firestore Emulator estan activos.
- Ejecutar `npm run seed:demo-user` una sola vez en el emulador limpio.
- Consultar la cuenta creada en `.local/demo-login.txt`.

## 11. Seguridad

- No versionar `.env.local`, `.local/`, cuentas de servicio ni archivos de claves.
- No copiar credenciales SAP al frontend.
- Utilizar datos ficticios o autorizados durante demostraciones.
- Cambiar o invalidar cualquier credencial temporal antes de un uso productivo.
- Revisar reglas, indices, costos y App Check antes de publicar cambios en Firebase.

## 12. Comandos de referencia

| Comando | Proposito |
|---|---|
| `npm run dev` | Iniciar desarrollo en el puerto 5173. |
| `npm run build` | Crear el paquete de produccion. |
| `npm run preview` | Probar el build en el puerto 4173. |
| `npm run emulators:fresh` | Iniciar emuladores sin importar datos anteriores. |
| `npm run seed:demo` | Crear registros demostrativos locales. |
| `npm run seed:demo-user` | Crear un administrador ficticio local. |
| `npm run lint` | Revisar calidad estatica. |
| `npm test` | Ejecutar pruebas web y reglas. |
| `npm run predictive:test` | Ejecutar pruebas del esquema predictivo. |
| `npm run verify` | Ejecutar lint, pruebas y build. |

---

Proyecto academico CeroFallas - Proyecto de Graduacion II.
