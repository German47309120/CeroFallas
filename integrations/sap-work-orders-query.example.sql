SELECT DISTINCT
  UPPER(LTRIM(RTRIM(CONVERT(nvarchar(80), docEntryBaseSap)))) AS workOrder
FROM MEGA_ENTRY
WHERE active = 1
  AND docEntryBaseSap IS NOT NULL
ORDER BY workOrder ASC;
