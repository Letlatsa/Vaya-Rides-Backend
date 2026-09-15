CREATE EXTENSION IF NOT EXISTS postgis;

ALTER TABLE "DriverLocation" ADD COLUMN geog geography(Point, 4326);
CREATE INDEX driver_location_geog_idx ON "DriverLocation" USING GIST (geog);