import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  getVehicleImage, 
  resolveVehicleImage, 
  buildVehicleObject, 
  VERIFIED_VEHICLE_IMAGES,
  NEUTRAL_VEHICLE_FALLBACK 
} from './VehicleService';

describe('VehicleService - External API Integration & Exact Vehicle Matching Engine', () => {
  const REQUIRED_MODELS = [
    { make: 'Honda', model: 'City', expectedKey: 'honda_city' },
    { make: 'Hyundai', model: 'Creta', expectedKey: 'hyundai_creta' },
    { make: 'Hyundai', model: 'Venue', expectedKey: 'hyundai_venue' },
    { make: 'Tata', model: 'Nexon', expectedKey: 'tata_nexon' },
    { make: 'Mahindra', model: 'XUV700', expectedKey: 'mahindra_xuv700' },
    { make: 'Toyota', model: 'Fortuner', expectedKey: 'toyota_fortuner' },
    { make: 'Toyota', model: 'Innova HyCross', expectedKey: 'toyota_innova hycross' },
    { make: 'Tesla', model: 'Model 3', expectedKey: 'tesla_model 3' },
    { make: 'Tata', model: 'Nexon EV', expectedKey: 'tata_nexon ev' }
  ];

  it('resolves exact matching verified image for all 9 required vehicles via getVehicleImage(make, model)', () => {
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

  it('resolveVehicleImage resolves asynchronously with caching support', async () => {
    const cretaImg = await resolveVehicleImage('Hyundai', 'Creta');
    expect(cretaImg).toBe(VERIFIED_VEHICLE_IMAGES['hyundai_creta']);

    // Second call should return from local cache
    const cachedCreta = await resolveVehicleImage('Hyundai', 'Creta');
    expect(cachedCreta).toBe(cretaImg);
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
      vehicleId: 'custom-vehicle-1',
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

  it('ensures all 9 required vehicles have 100% distinct, unique image URLs', () => {
    const images = REQUIRED_MODELS.map(({ make, model }) => getVehicleImage(make, model));
    const uniqueImages = new Set(images);
    expect(uniqueImages.size).toBe(REQUIRED_MODELS.length);
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
