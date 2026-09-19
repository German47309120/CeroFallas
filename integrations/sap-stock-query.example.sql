-- Consulta autorizada de inventario para CeroFallas y Power BI.
-- Mantener las credenciales y la ubicación del servidor fuera del archivo PBIX compartido.
SELECT
  W.ItemCode AS codigo,
  I.ItemName AS descripcion,
  W.OnHand   AS cantidad,
  W.WhsCode  AS almacen
FROM OITW AS W
INNER JOIN OITM AS I ON I.ItemCode = W.ItemCode
WHERE W.OnHand <> 0
  AND W.ItemCode LIKE 'REP%'
ORDER BY W.ItemCode ASC;
