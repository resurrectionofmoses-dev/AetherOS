import { v4 as uuidv4 } from 'uuid';

export interface Location {
  id: string;
  name: string;
  district: 'Residential North' | 'Downtown Core' | 'Industrial East';
  type: 'residential' | 'commercial' | 'industrial' | 'transit' | 'recreational';
  coordinates: { x: number; y: number }; // In meters from a central point
  description: string;
}

export type TransportationMethod = 'WALKING' | 'BICYCLE' | 'CAR' | 'BUS' | 'TRAIN' | 'TELEPORT';

export interface WeatherCondition {
  state: 'CLEAR' | 'LIGHT_RAIN' | 'HEAVY_RAIN' | 'SNOW' | 'STORM';
  multiplier: number;
}

export interface MovementRoute {
  sourceId: string;
  targetId: string;
  distanceMeters: number;
  baseCostCPH: number; // 1 CPH per 100 meters
}

export class CitySimulation {
  static WEATHER_MULTIPLIERS: Record<string, number> = {
    CLEAR: 1.0,
    LIGHT_RAIN: 1.2,
    HEAVY_RAIN: 1.5,
    SNOW: 1.8,
    STORM: 2.5
  };

  static METHOD_MULTIPLIERS: Record<TransportationMethod, { multiplier: number; baseSpeedKmH: number; flatFare: number }> = {
    WALKING: { multiplier: 1.0, baseSpeedKmH: 5, flatFare: 0 },
    BICYCLE: { multiplier: 0.6, baseSpeedKmH: 12, flatFare: 0 },
    CAR: { multiplier: 0.3, baseSpeedKmH: 30, flatFare: 0 },
    BUS: { multiplier: 0.4, baseSpeedKmH: 21, flatFare: 20 },
    TRAIN: { multiplier: 0.2, baseSpeedKmH: 48, flatFare: 50 },
    TELEPORT: { multiplier: 10.0, baseSpeedKmH: 99999, flatFare: 0 }
  };

  static BUILD_LOCATIONS(): Location[] {
    return [
      // Residential North
      { id: 'loc-home-maple', name: 'Maple Heights (Homes)', district: 'Residential North', type: 'residential', coordinates: { x: -100, y: 1500 }, description: 'Quiet residential neighborhood with family homes' },
      { id: 'loc-apartment-riverside', name: 'Riverside Apartment Complex', district: 'Residential North', type: 'residential', coordinates: { x: 150, y: 1700 }, description: 'High-density 100-unit living hub' },
      
      // Downtown Core
      { id: 'loc-market', name: 'Fresh Market Grocery', district: 'Downtown Core', type: 'commercial', coordinates: { x: 0, y: 500 }, description: 'Primary wholesale food and grocery center' },
      { id: 'loc-coffee', name: 'Java Junction Coffee Shop', district: 'Downtown Core', type: 'commercial', coordinates: { x: -50, y: 400 }, description: 'Social dynamic booster and workspace hub' },
      { id: 'loc-cityhall', name: 'New Alexandria City Hall', district: 'Downtown Core', type: 'transit', coordinates: { x: 100, y: 600 }, description: 'Local municipal ledger and directory control' },
      { id: 'loc-library', name: 'Central Public Library', district: 'Downtown Core', type: 'recreational', coordinates: { x: -200, y: 300 }, description: 'Acquiring curriculum guides and archive study room' },
      { id: 'loc-park', name: 'Central Sovereign Park', district: 'Downtown Core', type: 'recreational', coordinates: { x: 300, y: 400 }, description: 'Spacious serene woodland zone for mental health' },
      { id: 'loc-train-station', name: 'Central Station (Red Line)', district: 'Downtown Core', type: 'transit', coordinates: { x: 0, y: 150 }, description: 'Direct high-speed rail to Industrial East' },
      { id: 'loc-bus-hub', name: 'Downtown Transit Bus Hub', district: 'Downtown Core', type: 'transit', coordinates: { x: -100, y: 250 }, description: 'City loop starting station' },

      // Industrial East
      { id: 'loc-warehouse', name: 'Alpha Logistics Warehouse', district: 'Industrial East', type: 'industrial', coordinates: { x: 3500, y: -200 }, description: 'Automated loading docks, inventory racks, and tooling' },
      { id: 'loc-highway', name: 'Highway 1 Detour Point', district: 'Industrial East', type: 'transit', coordinates: { x: 2200, y: 200 }, description: 'Industrial speedway route' },
      { id: 'loc-rail-connections', name: 'East Rail Intermodal Link', district: 'Industrial East', type: 'transit', coordinates: { x: 3900, y: -400 }, description: 'Sovereign industrial material cargo flow' }
    ];
  }

  static calculateDistance(locA: Location, locB: Location): number {
    const dx = locA.coordinates.x - locB.coordinates.x;
    const dy = locA.coordinates.y - locB.coordinates.y;
    return Math.round(Math.sqrt(dx * dx + dy * dy));
  }

  static calculateTripCPH(
    source: Location,
    target: Location,
    method: TransportationMethod,
    weather: WeatherCondition['state'] = 'CLEAR',
    roadCondition: 'PERFECT' | 'GOOD' | 'POOR' | 'TERRIBLE' = 'PERFECT',
    timeOfDayHour: number = 12
  ): { distanceMeters: number; costCPH: number; durationMinutes: number } {
    const distanceMeters = this.calculateDistance(source, target);
    const baseCPH = distanceMeters / 100; // 1 CPH per 100m

    // Method factors
    const { multiplier: methodMult, baseSpeedKmH, flatFare } = this.METHOD_MULTIPLIERS[method];
    
    // Weather factors
    const weatherMult = this.WEATHER_MULTIPLIERS[weather] || 1.0;

    // Road Condition
    const roadMult = {
      PERFECT: 1.0,
      GOOD: 1.2,
      POOR: 1.5,
      TERRIBLE: 1.8
    }[roadCondition];

    // Congestion based on time of day
    // Rush hours: 6 AM - 9 AM (1.5x), 5 PM - 7 PM (1.6x)
    let congestionMult = 1.0;
    if (timeOfDayHour >= 6 && timeOfDayHour < 9) {
      congestionMult = 1.5;
    } else if (timeOfDayHour >= 17 && timeOfDayHour < 19) {
      congestionMult = 1.6;
    } else if (timeOfDayHour >= 19 || timeOfDayHour < 6) {
      congestionMult = 0.8; // quiet nights
    }

    const calculatedCost = Math.round((baseCPH * methodMult * weatherMult * roadMult * congestionMult) + flatFare);

    // Duration: time = distance / speed
    const speedMetersPerMin = (baseSpeedKmH * 1000) / 60;
    const durationMinutes = speedMetersPerMin > 0 ? Number((distanceMeters / speedMetersPerMin * congestionMult * weatherMult).toFixed(1)) : 0;

    return {
      distanceMeters,
      costCPH: Math.max(1, calculatedCost),
      durationMinutes
    };
  }
}
