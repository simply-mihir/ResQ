const { Client } = require('pg');
require('dotenv').config({ path: __dirname + '/.env' });

async function setupPostGIS() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL + '?sslmode=require',
  });

  try {
    await client.connect();
    console.log('Connected to database');

    const sql = `
      -- Enable PostGIS extension
      CREATE EXTENSION IF NOT EXISTS postgis;

      -- Add geography columns (for efficient spatial queries)
      -- NOTE: We use IF NOT EXISTS logic implicitly by checking if column exists to avoid errors on rerun
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hospitals' AND column_name='geom') THEN
          PERFORM AddGeometryColumn('hospitals', 'geom', 4326, 'POINT', 2);
          CREATE INDEX idx_hospitals_geom ON hospitals USING GIST (geom);
        END IF;
      END
      $$;

      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ambulances' AND column_name='geom') THEN
          PERFORM AddGeometryColumn('ambulances', 'geom', 4326, 'POINT', 2);
          CREATE INDEX idx_ambulances_geom ON ambulances USING GIST (geom);
        END IF;
      END
      $$;

      -- Trigger to auto-update geom from lat/lng for hospitals
      CREATE OR REPLACE FUNCTION update_hospital_geom()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.geom = ST_SetSRID(ST_MakePoint(NEW.location_lng, NEW.location_lat), 4326);
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS hospital_geom_trigger ON hospitals;
      CREATE TRIGGER hospital_geom_trigger
        BEFORE INSERT OR UPDATE OF location_lat, location_lng ON hospitals
        FOR EACH ROW EXECUTE FUNCTION update_hospital_geom();

      -- Trigger to auto-update geom from lat/lng for ambulances
      CREATE OR REPLACE FUNCTION update_ambulance_geom()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.current_lng IS NOT NULL AND NEW.current_lat IS NOT NULL THEN
          NEW.geom = ST_SetSRID(ST_MakePoint(NEW.current_lng, NEW.current_lat), 4326);
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS ambulance_geom_trigger ON ambulances;
      CREATE TRIGGER ambulance_geom_trigger
        BEFORE INSERT OR UPDATE OF current_lat, current_lng ON ambulances
        FOR EACH ROW EXECUTE FUNCTION update_ambulance_geom();
    `;

    console.log('Executing PostGIS setup script...');
    await client.query(sql);
    console.log('PostGIS setup completed successfully.');

  } catch (error) {
    console.error('Error setting up PostGIS:', error);
  } finally {
    await client.end();
  }
}

setupPostGIS();
