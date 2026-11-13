import type { GymItem } from '../types';

/**
 * Calculates the great-circle distance between two geographic coordinates in kilometers (Haversine formula).
 */
export function getDistanceInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) return Infinity;
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface NearbyPriceStats {
  dayPass: number;
  monthly: number;
  threeMonth: number;
  count: number;
  label: string;
  isNearby: boolean;
  radiusKm: number;
}

/**
 * Calculates average prices for Day Pass, 1 Month, and 3 Months
 * based on gyms within 3 km (or closest available gyms).
 */
export function calculateNearbyAveragePrices(
  gyms: GymItem[],
  latitude: number | string | null | undefined,
  longitude: number | string | null | undefined,
  targetRadiusKm: number = 3
): NearbyPriceStats | null {
  if (!Array.isArray(gyms) || gyms.length === 0) return null;

  const lat = typeof latitude === 'string' ? parseFloat(latitude) : latitude;
  const lng = typeof longitude === 'string' ? parseFloat(longitude) : longitude;
  const hasValidTarget =
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng);

  // Map gyms with their calculated distance
  const gymsWithDistance: { gym: GymItem; distance: number }[] = [];

  for (const g of gyms) {
    let gLat = g.gpsLocation?.latitude;
    let gLng = g.gpsLocation?.longitude;

    if (gLat === undefined && (g as any).location?.coordinates) {
      gLng = (g as any).location.coordinates[0];
      gLat = (g as any).location.coordinates[1];
    }

    if (
      typeof gLat === 'number' &&
      typeof gLng === 'number' &&
      !isNaN(gLat) &&
      !isNaN(gLng)
    ) {
      const dist = hasValidTarget ? getDistanceInKm(lat, lng, gLat, gLng) : 0;
      gymsWithDistance.push({ gym: g, distance: dist });
    }
  }

  // 1. Gyms within the specified radius (e.g. 3 km)
  const withinRadius = hasValidTarget
    ? gymsWithDistance.filter((item) => item.distance <= targetRadiusKm)
    : [];

  let targetGyms: GymItem[] = [];
  let label = '';
  let isNearby = false;

  if (withinRadius.length > 0) {
    targetGyms = withinRadius.map((item) => item.gym);
    const count = withinRadius.length;
    label = `Based on average of nearest ${count} gym${count > 1 ? 's' : ''} (within 3 km)`;
    isNearby = true;
  } else if (hasValidTarget && gymsWithDistance.length > 0) {
    // If no gyms strictly within 3 km, pick closest gyms
    const sorted = [...gymsWithDistance].sort((a, b) => a.distance - b.distance);
    const closest = sorted.slice(0, 5);
    targetGyms = closest.map((item) => item.gym);
    const minDist = sorted[0].distance;
    label = `Based on average of nearest gyms (${minDist < 10 ? minDist.toFixed(1) + ' km away' : 'nearby'})`;
    isNearby = true;
  } else {
    // Fallback to all available gyms
    targetGyms = gyms;
    label = `Based on average of ${gyms.length} gyms`;
    isNearby = false;
  }

  const dayPasses = targetGyms
    .map((g) => Number(g.dayPassPrice))
    .filter((p) => !isNaN(p) && p > 0);
  const monthlies = targetGyms
    .map((g) => Number(g.monthlyMembershipPrice))
    .filter((p) => !isNaN(p) && p > 0);
  const threeMonths = targetGyms
    .map((g) => Number(g.threeMonthMembershipPrice))
    .filter((p) => !isNaN(p) && p > 0);

  const avgDP =
    dayPasses.length > 0
      ? Math.round(dayPasses.reduce((a, b) => a + b, 0) / dayPasses.length)
      : 150;
  const avgM =
    monthlies.length > 0
      ? Math.round(monthlies.reduce((a, b) => a + b, 0) / monthlies.length)
      : 1499;
  const avgTM =
    threeMonths.length > 0
      ? Math.round(threeMonths.reduce((a, b) => a + b, 0) / threeMonths.length)
      : 3999;

  return {
    dayPass: avgDP,
    monthly: avgM,
    threeMonth: avgTM,
    count: targetGyms.length,
    label,
    isNearby,
    radiusKm: targetRadiusKm,
  };
}

