-- 007_create_readonly_user.sql
-- Erstellt einen Read-Only User für Reporting/Debugging Zwecke

DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'shopmarkets_reader') THEN

      CREATE ROLE shopmarkets_reader WITH LOGIN PASSWORD 'Reader_2025_Secure!';
   END IF;
END
$do$;

-- Rechte vergeben
GRANT CONNECT ON DATABASE postgres TO shopmarkets_reader;
GRANT USAGE ON SCHEMA public TO shopmarkets_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO shopmarkets_reader;

-- Wichtig: Auch für zukünftige Tabellen Rechte automatisch setzen:
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO shopmarkets_reader;
