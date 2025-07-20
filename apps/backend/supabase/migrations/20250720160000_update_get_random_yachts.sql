CREATE OR REPLACE FUNCTION get_random_yachts(
    limit_count integer,
    min_len integer DEFAULT NULL,
    max_len integer DEFAULT NULL
)
RETURNS SETOF yachts AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM yachts
  WHERE
    yacht_picture IS NOT NULL AND yacht_picture <> '' AND
    name IS NOT NULL AND name <> '' AND
    (min_len IS NULL OR length_m >= min_len) AND
    (max_len IS NULL OR length_m <= max_len)
  ORDER BY random()
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;