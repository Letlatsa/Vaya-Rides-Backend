import prisma from "../../config/prisma";
import { estimateTrip } from "./distance.service";
import { calculateFare, getPricingConfig } from "../pricing/pricing.service";
import { canTransition } from "./ride.stateMachine";

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