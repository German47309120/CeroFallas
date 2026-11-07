# Integración de órdenes de trabajo SAP

Fecha: 2026-11-06

## Objetivo

El formulario de correctivos no acepta una OT escrita manualmente. El desplegable consulta únicamente órdenes publicadas desde `MEGA_ENTRY` que cumplen `ACTIVE = 1`, fueron creadas después del 1 de enero de 2026 y tienen un `docEntryBaseSap` comprendido entre `11000` y `11900`.

El navegador nunca se conecta directamente a SQL Server. Un sincronizador de solo lectura se ejecuta desde una computadora con acceso por WireGuard, publica el catálogo mínimo en `workOrders` y marca como inactivas las órdenes que ya no aparecen en la siguiente sincronización.

## Consulta base

La consulta editable está en `integrations/sap-work-orders-query.example.sql` y devuelve únicamente el alias `workOrder`:

```sql
SELECT docEntryBaseSap
FROM MEGA_ENTRY
WHERE ACTIVE = 1
  AND created_at > '2026-01-01'
  AND docEntryBaseSap BETWEEN '11000' AND '11900';
```

## Operación segura

1. Mantener servidor, base, usuario y contraseña únicamente en `.local/sap-stock.env`.
2. Validar la configuración sin abrir conexión: `npm run sap:ot:check`.
3. Con WireGuard activo, ejecutar la prueba de solo lectura: `npm run sap:ot:dry-run`.
4. Confirmar que el conteo de OT activas es razonable.
5. Publicar: `npm run sap:ot:publish -- --confirm-project=cerofallas-pg2-german-2026 --use-firebase-cli-credentials`.
6. Desplegar reglas, índices y aplicación solamente después de publicar al menos una OT real.

El sincronizador no imprime host, base, usuario, contraseña, consulta ni códigos individuales. Una consulta vacía bloquea la publicación para evitar reemplazar el catálogo por una lista vacía debido a una configuración incorrecta.

## Controles de seguridad

- Firestore permite leer `workOrders` únicamente a perfiles que pueden crear o administrar correctivos.
- Toda escritura desde el navegador está bloqueada.
- Al iniciar un correctivo, las reglas comprueban que la OT seleccionada exista, permanezca activa y coincida con la clave almacenada.
- La OT queda inmutable al finalizar, editar o anular el correctivo.
- Los correctivos históricos anteriores a esta integración pueden finalizarse o anularse sin alterar su OT original.

## Estado de la conexión

La implementación y las pruebas locales están completas. La última prueba de conexión terminó con `ESOCKET`: SQL Server no respondió por la ruta/puerto configurados. Antes de publicar se debe activar WireGuard y confirmar el puerto TCP de la sesión funcional de SQL Server Management Studio.
