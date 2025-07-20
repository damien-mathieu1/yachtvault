CREATE OR REPLACE FUNCTION get_distinct_builders()
RETURNS TABLE(builder TEXT)
LANGUAGE sql
AS $$
    SELECT DISTINCT builder
    FROM yachts
    WHERE builder IS NOT NULL AND builder <> ''
    ORDER BY builder;
$$;
