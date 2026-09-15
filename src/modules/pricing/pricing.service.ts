import prisma from "../../config/prisma";

export async function getPricingConfig() {
  const rows = await prisma.pricingConfig.findMany();
  const config: Record<string, number> = {};
  for (const row of rows) {
    config[row.key] = parseFloat(row.value);
  }
  return config;
}

export function calculateFare(
  distanceKm: number,
  durationMin: number,
  config: Record<string, number>
) {
  const fare =
    config.baseFare +
    distanceKm * config.pricePerKm +
    durationMin * config.pricePerMinute;

  const finalFare = Math.max(fare, config.minimumFare);
  return Math.round(finalFare * 100) / 100; // round to 2 decimal places
}