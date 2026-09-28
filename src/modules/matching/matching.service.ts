import prisma from "../../config/prisma";
import { haversineDistanceKm } from "../../common/utils/geo";

interface EligibleDriver {
  id: string;
  distanceKm: number;
}

export async function findNearbyDrivers(
  pickupLat: number,
  pickupLng: number,
  radiusKm: number
): Promise<EligibleDriver[]> {
  const drivers = await prisma.driver.findMany({
    where: {
      approvalStatus: "APPROVED",
      isOnline: true,
      isAvailable: true,
      location: { isNot: null },
    },
    include: { location: true },
  });

  const withinRadius = drivers
    .map((d) => ({
      id: d.id,
      distanceKm: haversineDistanceKm(
        pickupLat,
        pickupLng,
        d.location!.latitude,
        d.location!.longitude
      ),
    }))
    .filter((d) => d.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm); // nearest first

  return withinRadius;
}
export async function assignDriverToRide(rideId: string, driverId: string) {
  return prisma.$transaction(async (tx) => {
    const ride = await tx.ride.findUnique({ where: { id: rideId } });
    if (!ride) throw new Error("RIDE_NOT_FOUND");
    if (ride.status !== "SEARCHING") throw new Error("RIDE_ALREADY_ASSIGNED");

    const driver = await tx.driver.findUnique({ where: { id: driverId } });
    if (!driver || !driver.isAvailable) throw new Error("DRIVER_NOT_AVAILABLE");

    const updatedRide = await tx.ride.update({
      where: { id: rideId },
      data: { driverId, status: "DRIVER_ASSIGNED" },
    });

    await tx.driver.update({
      where: { id: driverId },
      data: { isAvailable: false },
    });

    return updatedRide;
  });
}