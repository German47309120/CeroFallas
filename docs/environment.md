# CeroFallas — Entorno de desarrollo

Fecha de verificación: 2026-09-02

## Sistema

- Sistema operativo: Windows.
- Shell: PowerShell 7.6.4.
- Carpeta del proyecto: `C:\PG2_CeroFallas`.

## Herramientas detectadas

- Git: 2.53.0.windows.3.
- Node.js: 22.20.0.
- npm: 10.9.3.
- Python: 3.12.3.
- Firebase CLI: no instalado.

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

## Reglas del entorno

- Verificar compatibilidad antes de instalar dependencias.
- Registrar aquí las versiones realmente utilizadas.
- No almacenar secretos en archivos versionados.
- Mantener un archivo `.env.example` únicamente cuando existan variables locales documentables.
- Utilizar datos ficticios o anonimizados durante las pruebas públicas.
