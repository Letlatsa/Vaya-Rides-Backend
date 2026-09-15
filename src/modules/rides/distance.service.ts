import { haversineDistanceKm, estimateDurationMin } from "../../common/utils/geo";

export async function estimateTrip(
  pickupLat: number,
  pickupLng: number,
  destLat: number,
  destLng: number
) {
  // MVP1 placeholder — swap this internal logic for a real routing API later
  const distanceKm = haversineDistanceKm(pickupLat, pickupLng, destLat, destLng);
  const durationMin = estimateDurationMin(distanceKm);
  return { distanceKm, durationMin };
}