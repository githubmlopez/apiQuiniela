DECLARE @TableName NVARCHAR(256) = 'CI_CUENTA_X_PAGAR'; -- o 'dbo.CI_CUENTA_X_PAGAR'

SELECT 
    c.column_id AS [posicion],
    c.name AS [columna],
    TYPE_NAME(c.user_type_id) + 
        CASE 
            WHEN TYPE_NAME(c.user_type_id) IN ('varchar', 'char', 'binary', 'varbinary') 
                THEN '(' + CASE WHEN c.max_length = -1 THEN 'max' ELSE CAST(c.max_length AS VARCHAR(10)) END + ')'
            WHEN TYPE_NAME(c.user_type_id) IN ('nvarchar', 'nchar') 
                THEN '(' + CASE WHEN c.max_length = -1 THEN 'max' ELSE CAST(c.max_length / 2 AS VARCHAR(10)) END + ')'
            WHEN TYPE_NAME(c.user_type_id) IN ('decimal', 'numeric') 
                THEN '(' + CAST(c.precision AS VARCHAR(10)) + ',' + CAST(c.scale AS VARCHAR(10)) + ')'
            ELSE ''
        END AS [tipo_dato],
    c.is_nullable AS [permite_nulos],
    c.is_identity AS [es_identity],
    OBJECT_DEFINITION(c.default_object_id) AS [valor_default]
FROM sys.columns c
WHERE c.object_id = OBJECT_ID(@TableName, 'U')
ORDER BY c.column_id;