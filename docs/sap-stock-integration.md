# Integración controlada de stock SAP / SQL Server

Estado: agente preparado; conexión y primera publicación pendientes de datos locales del usuario.

## Arquitectura

El navegador nunca se conecta a SQL Server. `scripts/sap-stock-sync.mjs` se ejecuta en una computadora autorizada dentro de la red de Novafiber, realiza una consulta de solo lectura, valida el contrato y publica únicamente `código`, `descripción`, `cantidad` y `almacén` en la colección de consulta del sistema.

La consulta y credenciales se guardan en `.local/`, ignorado por Git. El agente no imprime servidor, base, usuario, contraseña, consulta ni descripciones de inventario. La interfaz continúa disponible si SAP no responde.

## Preparación local

1. Copiar `.env.sap.example` como `.local/sap-stock.env`.
2. Copiar `integrations/sap-stock-query.example.sql` como `.local/sap-stock-query.sql` y sustituirla por la consulta autorizada.
3. Ejecutar `npm run sap:stock:check` para validar configuración sin abrir conexión.
4. Ejecutar `npm run sap:stock:dry-run` para consultar y validar sin publicar.
5. Revisar el número de filas y almacenes.
6. Configurar credencial administrativa local y ejecutar `npm run sap:stock:publish -- --confirm-project=cerofallas-pg2-german-2026`.

## Controles implementados

- Una sola sentencia iniciada por `SELECT` o `WITH`.
- Bloqueo de instrucciones de escritura, DDL, ejecución y `SELECT INTO`.
- Límite de 50,000 filas por corrida.
- Código, descripción, cantidad y almacén obligatorios; se aceptan alias comunes en español, inglés y SAP Business One.
- Identificador estable por código y almacén; duplicados rechazados.
- Publicación protegida con confirmación exacta de proyecto.
- Registros ausentes en la siguiente extracción se marcan inactivos y con cantidad cero; no se borran.
- Estado de última sincronización separado del catálogo visible.

## Información pendiente del usuario

- Servidor o instancia y puerto TCP de SQL Server.
- Nombre de base de datos.
- Tipo de autenticación: usuario SQL o Windows integrada.
- Consulta existente guardada localmente con alias compatibles.
- Confirmar que la computadora ejecutora tiene acceso de red al servidor.
- Elegir credencial administrativa local para publicar sin almacenarla en el repositorio.
