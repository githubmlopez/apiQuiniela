CREATE OR ALTER PROCEDURE [dbo].[spGenScriptTabla] 
    @TableName NVARCHAR(256),   -- Ejemplo: 'usuarios' o 'dbo.usuarios'
    @HasTriggers BIT            -- 1 = tiene triggers, 0 = no tiene triggers
AS 
BEGIN 
    SET NOCOUNT ON; 
 
    -- 1. Resolver la tabla
    DECLARE @ObjectId INT = OBJECT_ID(LTRIM(RTRIM(@TableName)), 'U'); 
 
    IF @ObjectId IS NULL 
    BEGIN 
        RAISERROR('La tabla "%s" no existe.', 16, 1, @TableName); 
        RETURN; 
    END 
 
    -- 2. Construcción del objeto JSON de la tabla
    SELECT  
        t.name AS [table_name], 
        SCHEMA_NAME(t.schema_id) AS [schema],

        -- INDICA SI LA TABLA TIENE TRIGGERS
        @HasTriggers AS [hasTriggers],
 
        -- COLUMNAS 
        ( 
            SELECT  
                c.name AS [name], 
                TYPE_NAME(c.user_type_id) +  
                    CASE  
                        WHEN TYPE_NAME(c.user_type_id) IN 
                            ('varchar', 'nvarchar', 'char', 'nchar', 
                             'binary', 'varbinary')  
                            THEN '(' + 
                                CASE 
                                    WHEN c.max_length = -1 THEN 'max' 
                                    ELSE CAST(c.max_length AS VARCHAR(10)) 
                                END + ')' 
                        WHEN TYPE_NAME(c.user_type_id) IN ('decimal', 'numeric')  
                            THEN '(' + 
                                CAST(c.precision AS VARCHAR(10)) + ',' + 
                                CAST(c.scale AS VARCHAR(10)) + ')' 
                        ELSE '' 
                    END AS [data_type], 
                CAST(c.is_nullable AS BIT) AS [is_nullable], 
                OBJECT_DEFINITION(c.default_object_id) AS [default_value] 
            FROM sys.columns c 
            WHERE c.object_id = t.object_id 
            ORDER BY c.column_id 
            FOR JSON PATH 
        ) AS [columns], 
 
        -- LLAVES FORÁNEAS
        ( 
            SELECT  
                fk.name AS [constraint_name], 
                col_parent.name AS [column], 
                OBJECT_NAME(fk.referenced_object_id) AS [referenced_table], 
                col_ref.name AS [referenced_column] 
            FROM sys.foreign_keys fk 
            INNER JOIN sys.foreign_key_columns fkc  
                ON fk.object_id = fkc.constraint_object_id 
            INNER JOIN sys.columns col_parent  
                ON fkc.parent_object_id = col_parent.object_id 
                AND fkc.parent_column_id = col_parent.column_id 
            INNER JOIN sys.columns col_ref  
                ON fkc.referenced_object_id = col_ref.object_id 
                AND fkc.referenced_column_id = col_ref.column_id 
            WHERE fk.parent_object_id = t.object_id 
            FOR JSON PATH 
        ) AS [foreign_keys], 
 
        -- ÍNDICES
        ( 
            SELECT  
                i.name AS [index_name], 
                CAST(i.is_unique AS BIT) AS [is_unique], 
                CAST(i.is_primary_key AS BIT) AS [is_primary_key], 
                JSON_QUERY(( 
                    SELECT col.name AS [value] 
                    FROM sys.index_columns ic 
                    INNER JOIN sys.columns col  
                        ON ic.object_id = col.object_id 
                        AND ic.column_id = col.column_id 
                    WHERE ic.object_id = i.object_id 
                      AND ic.index_id = i.index_id 
                    ORDER BY ic.key_ordinal 
                    FOR JSON PATH 
                )) AS [columns] 
            FROM sys.indexes i 
            WHERE i.object_id = t.object_id  
              AND i.type > 0       -- Excluye Heap 
              AND i.is_hypothetical = 0 
            FOR JSON PATH 
        ) AS [indexes] 
 
    FROM sys.tables t 
    WHERE t.object_id = @ObjectId 
    FOR JSON PATH, WITHOUT_ARRAY_WRAPPER, INCLUDE_NULL_VALUES; 
END;
