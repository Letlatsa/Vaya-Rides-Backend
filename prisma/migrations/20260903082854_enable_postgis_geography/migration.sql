/*
  Warnings:

  - You are about to drop the column `geog` on the `DriverLocation` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "driver_location_geog_idx";

-- AlterTable
ALTER TABLE "DriverLocation" DROP COLUMN "geog";
