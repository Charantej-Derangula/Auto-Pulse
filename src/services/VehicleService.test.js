import { describe, it, expect } from 'vitest';
import { 
  getVehicleImage, 
  resolveVehicleImage, 
  buildVehicleObject, 
  VERIFIED_VEHICLE_IMAGES,
  NEUTRAL_VEHICLE_FALLBACK 
} from './VehicleService';

describe('VehicleService - Exact Vehicle Name & Image Matching Engine', () => {
  const REQUIRED_MODELS = [
    { make: 'Hyundai', model: 'Creta', expectedKey: 'hyundai_creta' },
    { make: 'Hyundai', model: 'Venue', expectedKey: 'hyundai_venue' },
    { make: 'Tata', model: 'Nexon', expectedKey: 'tata_nexon' },
    { make: 'Mahindra', model: 'XUV700', expectedKey: 'mahindra_xuv700' },
    { make: 'Toyota', model: 'Fortuner', expectedKey: 'toyota_fortuner' },
    { make: 'Honda', model: 'City', expectedKey: 'honda_city' },
    { make: 'Toyota', model: 'Innova HyCross', expectedKey: 'toyota_innova hycross' }
  ];

  it('resolves exact matching verified image for all 7 required vehicles via getVehicleImage(make, model)', () => {
    REQUIRED_MODELS.forEach(({ make, model, expectedKey }) => {
      const img = getVehicleImage(make, model);
      expect(img).toBe(VERIFIED_VEHICLE_IMAGES[expectedKey]);
      expect(img).toBeTruthy();
      expect(img).not.toBe(NEUTRAL_VEHICLE_FALLBACK);
    });
  });

  it('resolves exact matching verified image for vehicle objects via getVehicleImage(vehicle)', () => {
    REQUIRED_MODELS.forEach(({ make, model, expectedKey }) => {
      const vehicleObj = { manufacturer: make, model };
      const img = getVehicleImage(vehicleObj);
      expect(img).toBe(VERIFIED_VEHICLE_IMAGES[expectedKey]);
    });
  });

  it('returns neutral fallback for unknown or unlisted vehicles without showing a misleading car', () => {
    const unknownImg = getVehicleImage('Pagani', 'Zonda Unknown Edition');
    expect(unknownImg).toBe(NEUTRAL_VEHICLE_FALLBACK);

    const emptyImg = getVehicleImage('', '');
    expect(emptyImg).toBe(NEUTRAL_VEHICLE_FALLBACK);
  });

  it('buildVehicleObject guarantees displayName is always make + model and retains vehicleId', () => {
    const input = {
      id: 'custom-vehicle-1',
      manufacturer: 'Hyundai',
      model: 'Venue',
      year: '2023'
    };

    const built = buildVehicleObject(input);
    expect(built.displayName).toBe('Hyundai Venue');
    expect(built.manufacturer).toBe('Hyundai');
    expect(built.model).toBe('Venue');
    expect(built.id).toBe('custom-vehicle-1');
    expect(built.vehicleId).toBe('custom-vehicle-1');
    expect(built.image).toBe(VERIFIED_VEHICLE_IMAGES['hyundai_venue']);
  });

  it('switching vehicle updates image and name synchronously without retaining old image', async () => {
    const creta = buildVehicleObject({ manufacturer: 'Hyundai', model: 'Creta' });
    expect(creta.displayName).toBe('Hyundai Creta');
    expect(creta.image).toBe(VERIFIED_VEHICLE_IMAGES['hyundai_creta']);

    // Switch to Hyundai Venue
    const venue = buildVehicleObject({ manufacturer: 'Hyundai', model: 'Venue' });
    expect(venue.displayName).toBe('Hyundai Venue');
    expect(venue.image).toBe(VERIFIED_VEHICLE_IMAGES['hyundai_venue']);
    expect(venue.image).not.toBe(creta.image);
  });
});
