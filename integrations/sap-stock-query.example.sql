-- Sustituir dbo.VISTA_STOCK_SAP por la fuente autorizada o adaptar la consulta existente.
-- El resultado debe producir exactamente estos conceptos; se aceptan alias en español o inglés.
SELECT
  Codigo      AS codigo,
  Descripcion AS descripcion,
  Cantidad    AS cantidad,
  Almacen     AS almacen
FROM dbo.VISTA_STOCK_SAP;
