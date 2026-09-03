# CeroFallas — Entorno de desarrollo

Fecha de verificación: 2026-09-03

## Sistema

- Sistema operativo: Windows.
- Shell: PowerShell 7.6.4.
- Carpeta del proyecto: `C:\PG2_CeroFallas`.

## Herramientas detectadas

- Git: 2.53.0.windows.3.
- Node.js: 22.20.0.
- npm: 10.9.3.
- Python: 3.12.3.
- Firebase CLI: 15.29.0, instalada localmente.
- Java: Eclipse Temurin JDK 21.0.12.1 LTS instalado. Una terminal abierta antes de instalarlo requiere reinicio o ruta explícita para actualizar `PATH`.

## Dependencias frontend instaladas

- React: 19.2.8.
- React DOM: 19.2.8.
- React Router DOM: 7.18.3.
- Vite: 8.2.2.
- Plugin React para Vite: 6.1.1.
- Firebase JavaScript SDK: 12.18.0.
- Vitest: 5.0.0.
- Firebase Rules Unit Testing: instalada como dependencia de desarrollo.

Auditoría de producción (`npm audit --omit=dev`): 0 vulnerabilidades reportadas.

Auditoría completa: 8 vulnerabilidades moderadas en dependencias transitivas de Firebase CLI; registradas en `docs/errors.md`.

## Estado inicial

- Al iniciar el Paso 1.1, la carpeta no era un repositorio Git.
- No existían dependencias de aplicación instaladas.
- No existía configuración de Firebase.
- No se detectaron archivos de credenciales dentro del proyecto.

## Control de versiones

- Repositorio Git inicializado localmente.
- Rama principal: `main`.
- Identidad Git disponible: German Hernández, mediante dirección `noreply` de GitHub.
- `.gitignore` verificado contra `.env`, cuentas de servicio y `node_modules`.
- Los comandos automatizados deben usar una excepción `safe.directory` limitada a este repositorio debido a la diferencia entre el propietario de Windows y la cuenta aislada de ejecución.
- El usuario autorizó registrar `C:/PG2_CeroFallas` como `safe.directory` global para Git el 2026-09-02.

## Compatibilidad verificada

- Firebase CLI requiere Node.js 18 o superior; Node.js 22.20.0 cumple el requisito.
- Firestore Emulator se validó con Java 21 y Firebase CLI 15.29.0.
- Fuente: https://firebase.google.com/docs/cli

## Reglas del entorno

- Verificar compatibilidad antes de instalar dependencias.
- Registrar aquí las versiones realmente utilizadas.
- No almacenar secretos en archivos versionados.
- Mantener un archivo `.env.example` únicamente cuando existan variables locales documentables.
- Utilizar datos ficticios o anonimizados durante las pruebas públicas.
