import prisma from "../../config/prisma";
import { estimateTrip } from "./distance.service";
import { calculateFare, getPricingConfig } from "../pricing/pricing.service";
import { canTransition } from "./ride.stateMachine";
import { findNearbyDrivers, assignDriverToRide } from "../matching/matching.service";

export async function searchForDriver(rideId: string) {
  const ride = await prisma.ride.findUnique({ where: { id: rideId } });
  if (!ride) throw new Error("RIDE_NOT_FOUND");
  if (ride.status !== "REQUESTED") throw new Error(`CANNOT_SEARCH_FROM_${ride.status}`);

  // Move to SEARCHING first
  await transitionRideStatus(rideId, "SEARCHING");

  let radius = 5;
  const maxRadius = 15;
  const step = 2;

  while (radius <= maxRadius) {
    const candidates = await findNearbyDrivers(ride.pickupLat, ride.pickupLng, radius);

    for (const candidate of candidates) {
      try {
        // First driver found within radius gets assigned — MVP1 simplification.
        // Full spec: send request, wait 30s for accept/reject before trying next driver.
        return await assignDriverToRide(rideId, candidate.id);
      } catch (err: any) {
        if (err.message === "RIDE_ALREADY_ASSIGNED") throw err; // no point continuing
        // otherwise try next candidate
        continue;
      }
    }

    radius += step;
  }

  throw new Error("NO_DRIVER_FOUND");
}

export async function createRide(passengerId: string, data: {
  pickupLat: number; pickupLng: number; destLat: number; destLng: number;
}) {
  const { distanceKm, durationMin } = await estimateTrip(
    data.pickupLat, data.pickupLng, data.destLat, data.destLng
  );

  const config = await getPricingConfig();
  const estimatedFare = calculateFare(distanceKm, durationMin, config);

  const ride = await prisma.ride.create({
    data: {
      passengerId,
      pickupLat: data.pickupLat,
      pickupLng: data.pickupLng,
      destLat: data.destLat,
      destLng: data.destLng,
      status: "REQUESTED",
      estimatedFare,
    },
  });

  return ride;
}

export async function transitionRideStatus(rideId: string, toStatus: any) {
  const ride = await prisma.ride.findUnique({ where: { id: rideId } });
  if (!ride) throw new Error("RIDE_NOT_FOUND");

  if (!canTransition(ride.status as any, toStatus)) {
    throw new Error(`INVALID_TRANSITION_${ride.status}_TO_${toStatus}`);
  }

  return prisma.ride.update({
    where: { id: rideId },
    data: { status: toStatus },
  });
}