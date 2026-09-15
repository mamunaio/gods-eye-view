import * as Cesium from 'cesium';
import { viewportBias, placesNearViewRecovery } from './annotations/annotationResolver.js';

/**
 * Points of Interest per city.
 * Each city has 5 POIs; the first is the default fly-to landmark.
 *
 * Field reference:
 *   alt     — RANGE (distance from target in meters), NOT absolute altitude
 *   heading — optimal camera heading in degrees (0=N, 90=E, 180=S, 270=W)
 *   pitch   — camera tilt in degrees (negative = looking down)
 *   buildingHeight — estimated height of landmark center above ground (meters)
 */
export const CITY_POIS = {
  austin: {
    name: 'Austin',
    groundElevation: 150, // meters above WGS84 ellipsoid
    viewBounds: { southwest: { lat: 30.10, lng: -97.95 }, northeast: { lat: 30.52, lng: -97.55 } },
    pois: [
      { name: 'Texas State Capitol', lat: 30.2747, lon: -97.7403, alt: 550, pitch: -28, heading: 180, buildingHeight: 35 },
      { name: 'Frost Bank Tower', lat: 30.2674, lon: -97.7434, alt: 550, pitch: -22, heading: 30, buildingHeight: 80 },
      { name: 'Pennybacker Bridge', lat: 30.3451, lon: -97.7951, alt: 500, pitch: -25, heading: 90, buildingHeight: 40 },
      { name: 'The Jenga Tower', lat: 30.2642, lon: -97.7500, alt: 500, pitch: -18, heading: 45, buildingHeight: 60 },
      { name: 'UT Tower', lat: 30.2862, lon: -97.7394, alt: 500, pitch: -22, heading: 180, buildingHeight: 50 },
    ],
  },
  sf: {
    name: 'San Francisco',
    groundElevation: 15,
    viewBounds: { southwest: { lat: 37.70, lng: -122.53 }, northeast: { lat: 37.84, lng: -122.35 } },
    pois: [
      { name: 'Golden Gate Bridge', lat: 37.8199, lon: -122.4783, alt: 1400, pitch: -20, heading: 45, buildingHeight: 100 },
      { name: 'Transamerica Pyramid', lat: 37.7952, lon: -122.4028, alt: 500, pitch: -25, heading: 30, buildingHeight: 85 },
      { name: 'Salesforce Tower', lat: 37.7897, lon: -122.3972, alt: 680, pitch: -25, heading: 330, buildingHeight: 100 },
      { name: 'Alcatraz Island', lat: 37.8267, lon: -122.4230, alt: 800, pitch: -30, heading: 0, buildingHeight: 20 },
      { name: 'Coit Tower', lat: 37.8024, lon: -122.4058, alt: 420, pitch: -30, heading: 45, buildingHeight: 30 },
    ],
  },
  nyc: {
    name: 'New York',
    groundElevation: 10,
    viewBounds: { southwest: { lat: 40.477, lng: -74.259 }, northeast: { lat: 40.918, lng: -73.700 } },
    pois: [
      { name: 'Statue of Liberty', lat: 40.6892, lon: -74.0445, alt: 450, pitch: -25, heading: 315, buildingHeight: 45 },
      {
        name: 'Empire State Building',
        lat: 40.7484,
        lon: -73.9857,
        alt: 850,
        pitch: -12,
        heading: 30,
        buildingHeight: 130,
        buildingBounds: { height: 443, width: 130, depth: 75 },
      },
      { name: 'One World Trade Center', lat: 40.7127, lon: -74.0134, alt: 850, pitch: -25, heading: 0, buildingHeight: 170 },
      { name: 'Brooklyn Bridge', lat: 40.7061, lon: -73.9969, alt: 850, pitch: -25, heading: 45, buildingHeight: 40 },
      { name: 'Chrysler Building', lat: 40.7516, lon: -73.9755, alt: 700, pitch: -20, heading: 225, buildingHeight: 100 },
    ],
  },
  tokyo: {
    name: 'Tokyo',
    groundElevation: 40,
    viewBounds: { southwest: { lat: 35.52, lng: 139.55 }, northeast: { lat: 35.90, lng: 139.92 } },
    pois: [
      { name: 'Tokyo Tower', lat: 35.6586, lon: 139.7454, alt: 850, pitch: -25, heading: 0, buildingHeight: 110 },
      { name: 'Tokyo Skytree', lat: 35.7101, lon: 139.8107, alt: 900, pitch: -25, heading: 30, buildingHeight: 200 },
      { name: 'Imperial Palace', lat: 35.6852, lon: 139.7528, alt: 900, pitch: -35, heading: 0, buildingHeight: 20 },
      { name: 'Senso-ji Temple', lat: 35.7148, lon: 139.7967, alt: 400, pitch: -30, heading: 180, buildingHeight: 25 },
      { name: 'Mode Gakuen Cocoon Tower', lat: 35.6929, lon: 139.6925, alt: 350, pitch: -20, heading: 30, buildingHeight: 70 },
    ],
  },
  london: {
    name: 'London',
    groundElevation: 15,
    viewBounds: { southwest: { lat: 51.28, lng: -0.51 }, northeast: { lat: 51.70, lng: 0.33 } },
    pois: [
      { name: 'Tower Bridge', lat: 51.5055, lon: -0.0754, alt: 400, pitch: -25, heading: 270, buildingHeight: 65 },
      { name: 'The Shard', lat: 51.5045, lon: -0.0865, alt: 850, pitch: -20, heading: 0, buildingHeight: 100 },
      { name: 'Big Ben / Parliament', lat: 51.5007, lon: -0.1246, alt: 600, pitch: -25, heading: 180, buildingHeight: 50 },
      { name: "St. Paul's Cathedral", lat: 51.5138, lon: -0.0984, alt: 400, pitch: -30, heading: 270, buildingHeight: 55 },
      { name: 'The Gherkin', lat: 51.5145, lon: -0.0803, alt: 350, pitch: -20, heading: 30, buildingHeight: 60 },
    ],
  },
  bangladesh: {
    name: 'Bangladesh',
    groundElevation: 8,
    viewBounds: { southwest: { lat: 20.60, lng: 88.00 }, northeast: { lat: 26.90, lng: 92.90 } },
    pois: [
      { name: 'Dhaka', lat: 23.8103, lon: 90.4125, alt: 700, pitch: -26, heading: 180, buildingHeight: 35 },
      { name: 'Chattogram', lat: 22.3569, lon: 91.7832, alt: 650, pitch: -24, heading: 120, buildingHeight: 30 },
      { name: 'Khulna', lat: 22.8456, lon: 89.5403, alt: 600, pitch: -28, heading: 90, buildingHeight: 25 },
      { name: 'Rajshahi', lat: 24.3745, lon: 88.6042, alt: 600, pitch: -27, heading: 150, buildingHeight: 20 },
      { name: 'Sylhet', lat: 24.8949, lon: 91.8687, alt: 560, pitch: -30, heading: 210, buildingHeight: 22 },
    ],
  },
  dhaka: {
    name: 'Dhaka',
    groundElevation: 8,
    viewBounds: { southwest: { lat: 23.62, lng: 90.30 }, northeast: { lat: 23.95, lng: 90.60 } },
    pois: [
      { name: 'Jatiya Sangsad Bhaban', lat: 23.7616, lon: 90.3776, alt: 550, pitch: -28, heading: 180, buildingHeight: 35 },
      { name: 'Bangladesh National Parliament', lat: 23.7603, lon: 90.3780, alt: 620, pitch: -25, heading: 0, buildingHeight: 45 },
      { name: 'Hatirjheel Lake', lat: 23.7668, lon: 90.4032, alt: 500, pitch: -30, heading: 120, buildingHeight: 20 },
      { name: 'Shaheed Minar', lat: 23.7395, lon: 90.3951, alt: 420, pitch: -30, heading: 210, buildingHeight: 25 },
      { name: 'Baitul Mukarram', lat: 23.7592, lon: 90.3932, alt: 480, pitch: -24, heading: 45, buildingHeight: 28 },
    ],
  },
  chattogram: {
    name: 'Chattogram',
    groundElevation: 14,
    viewBounds: { southwest: { lat: 22.20, lng: 91.64 }, northeast: { lat: 22.48, lng: 91.92 } },
    pois: [
      { name: 'Chattogram Port', lat: 22.3340, lon: 91.8017, alt: 620, pitch: -28, heading: 120, buildingHeight: 28 },
      { name: 'Foy’s Lake', lat: 22.3480, lon: 91.7850, alt: 500, pitch: -30, heading: 90, buildingHeight: 18 },
      { name: 'Patenga Beach', lat: 22.2350, lon: 91.7900, alt: 550, pitch: -35, heading: 110, buildingHeight: 10 },
      { name: 'Chandgaon', lat: 22.3819, lon: 91.8458, alt: 500, pitch: -28, heading: 150, buildingHeight: 20 },
      { name: 'City Center', lat: 22.3524, lon: 91.8175, alt: 520, pitch: -24, heading: 40, buildingHeight: 26 },
    ],
  },
  gazipur: {
    name: 'Gazipur',
    groundElevation: 9,
    viewBounds: { southwest: { lat: 23.86, lng: 90.31 }, northeast: { lat: 24.10, lng: 90.56 } },
    pois: [
      { name: 'Gazipur City', lat: 23.9997, lon: 90.4201, alt: 520, pitch: -26, heading: 210, buildingHeight: 18 },
      { name: 'Joydebpur', lat: 23.9980, lon: 90.4160, alt: 500, pitch: -28, heading: 180, buildingHeight: 16 },
      { name: 'Gazipur Industrial Area', lat: 24.0044, lon: 90.4076, alt: 580, pitch: -22, heading: 120, buildingHeight: 22 },
      { name: 'Shahjalal University of Science and Technology', lat: 24.9032, lon: 91.8315, alt: 500, pitch: -24, heading: 90, buildingHeight: 18 },
      { name: 'Gazipur Ring Road', lat: 23.9796, lon: 90.4200, alt: 550, pitch: -24, heading: 140, buildingHeight: 12 },
    ],
  },
  narayanganj: {
    name: 'Narayanganj',
    groundElevation: 7,
    viewBounds: { southwest: { lat: 23.57, lng: 90.45 }, northeast: { lat: 23.74, lng: 90.64 } },
    pois: [
      { name: 'Narayanganj Launch Terminal', lat: 23.6216, lon: 90.5007, alt: 460, pitch: -30, heading: 200, buildingHeight: 12 },
      { name: 'Shitalakshya River', lat: 23.6248, lon: 90.5182, alt: 420, pitch: -30, heading: 120, buildingHeight: 10 },
      { name: 'Narayanganj City Center', lat: 23.6322, lon: 90.5039, alt: 480, pitch: -26, heading: 150, buildingHeight: 20 },
      { name: 'Sadarghat', lat: 23.6343, lon: 90.5103, alt: 440, pitch: -28, heading: 180, buildingHeight: 16 },
      { name: 'Narayanganj Industrial Belt', lat: 23.6468, lon: 90.5441, alt: 520, pitch: -22, heading: 110, buildingHeight: 18 },
    ],
  },
  khulna: {
    name: 'Khulna',
    groundElevation: 8,
    viewBounds: { southwest: { lat: 22.75, lng: 89.44 }, northeast: { lat: 22.93, lng: 89.62 } },
    pois: [
      { name: 'Khulna City', lat: 22.8456, lon: 89.5403, alt: 500, pitch: -26, heading: 120, buildingHeight: 25 },
      { name: 'Mongla Access Road', lat: 22.4919, lon: 89.6088, alt: 520, pitch: -32, heading: 150, buildingHeight: 12 },
      { name: 'Khulna Riverfront', lat: 22.8393, lon: 89.5625, alt: 460, pitch: -28, heading: 180, buildingHeight: 18 },
      { name: 'Khalishpur', lat: 22.8578, lon: 89.5018, alt: 500, pitch: -24, heading: 80, buildingHeight: 17 },
      { name: 'Khulna Port', lat: 22.8253, lon: 89.5635, alt: 550, pitch: -26, heading: 90, buildingHeight: 16 },
    ],
  },
  rajshahi: {
    name: 'Rajshahi',
    groundElevation: 18,
    viewBounds: { southwest: { lat: 24.33, lng: 88.52 }, northeast: { lat: 24.47, lng: 88.72 } },
    pois: [
      { name: 'Rajshahi University', lat: 24.3714, lon: 88.6373, alt: 520, pitch: -26, heading: 140, buildingHeight: 18 },
      { name: 'Rajshahi City Center', lat: 24.3636, lon: 88.6241, alt: 540, pitch: -22, heading: 170, buildingHeight: 22 },
      { name: 'Padma River', lat: 24.3841, lon: 88.5985, alt: 480, pitch: -30, heading: 210, buildingHeight: 10 },
      { name: 'Rajshahi Rail Junction', lat: 24.3722, lon: 88.6400, alt: 500, pitch: -25, heading: 90, buildingHeight: 15 },
      { name: 'Chapai Nawabganj Road', lat: 24.3596, lon: 88.6090, alt: 520, pitch: -24, heading: 50, buildingHeight: 16 },
    ],
  },
  sylhet: {
    name: 'Sylhet',
    groundElevation: 24,
    viewBounds: { southwest: { lat: 24.84, lng: 91.78 }, northeast: { lat: 25.03, lng: 92.00 } },
    pois: [
      { name: 'Sylhet City', lat: 24.8949, lon: 91.8687, alt: 520, pitch: -25, heading: 180, buildingHeight: 22 },
      { name: 'Keane Bridge', lat: 24.9030, lon: 91.8700, alt: 520, pitch: -26, heading: 110, buildingHeight: 16 },
      { name: 'Sylhet Museum', lat: 24.8990, lon: 91.8692, alt: 500, pitch: -28, heading: 200, buildingHeight: 17 },
      { name: 'Lakkatura', lat: 24.8935, lon: 91.8648, alt: 490, pitch: -30, heading: 130, buildingHeight: 12 },
      { name: 'Jalalabad', lat: 24.8964, lon: 91.8751, alt: 550, pitch: -26, heading: 80, buildingHeight: 18 },
    ],
  },
  mymensingh: {
    name: 'Mymensingh',
    groundElevation: 18,
    viewBounds: { southwest: { lat: 24.68, lng: 90.29 }, northeast: { lat: 24.90, lng: 90.52 } },
    pois: [
      { name: 'Mymensingh Town Hall', lat: 24.7556, lon: 90.4029, alt: 480, pitch: -26, heading: 160, buildingHeight: 18 },
      { name: 'Mymensingh Medical College', lat: 24.7595, lon: 90.3965, alt: 470, pitch: -24, heading: 210, buildingHeight: 16 },
      { name: 'Mymensingh Riverfront', lat: 24.7642, lon: 90.4257, alt: 440, pitch: -30, heading: 120, buildingHeight: 10 },
      { name: 'Srihatta University Area', lat: 24.7513, lon: 90.4076, alt: 520, pitch: -28, heading: 100, buildingHeight: 12 },
      { name: 'Mymensingh Central Business District', lat: 24.7478, lon: 90.4027, alt: 500, pitch: -22, heading: 40, buildingHeight: 18 },
    ],
  },
  rangpur: {
    name: 'Rangpur',
    groundElevation: 30,
    viewBounds: { southwest: { lat: 25.66, lng: 88.48 }, northeast: { lat: 25.85, lng: 88.67 } },
    pois: [
      { name: 'Rangpur City', lat: 25.7460, lon: 89.2500, alt: 500, pitch: -26, heading: 120, buildingHeight: 18 },
      { name: 'Rangpur Railway Junction', lat: 25.7603, lon: 89.2474, alt: 500, pitch: -24, heading: 150, buildingHeight: 16 },
      { name: 'Modern College Road', lat: 25.7517, lon: 89.2595, alt: 480, pitch: -28, heading: 80, buildingHeight: 12 },
      { name: 'Rangpur Stadium Area', lat: 25.7399, lon: 89.2448, alt: 520, pitch: -26, heading: 40, buildingHeight: 18 },
      { name: 'Rangpur River Road', lat: 25.7486, lon: 89.2530, alt: 490, pitch: -30, heading: 200, buildingHeight: 10 },
    ],
  },
  cumilla: {
    name: 'Cumilla',
    groundElevation: 15,
    viewBounds: { southwest: { lat: 23.42, lng: 91.09 }, northeast: { lat: 23.52, lng: 91.30 } },
    pois: [
      { name: 'Cumilla City', lat: 23.4607, lon: 91.1809, alt: 500, pitch: -24, heading: 180, buildingHeight: 18 },
      { name: 'Cumilla Cantonment', lat: 23.4478, lon: 91.1954, alt: 520, pitch: -25, heading: 150, buildingHeight: 20 },
      { name: 'Comilla Main Road', lat: 23.4651, lon: 91.1888, alt: 490, pitch: -28, heading: 90, buildingHeight: 12 },
      { name: 'Cumilla Stadium Circle', lat: 23.4552, lon: 91.1836, alt: 510, pitch: -26, heading: 120, buildingHeight: 18 },
      { name: 'Brahmanbaria Road', lat: 23.4638, lon: 91.1762, alt: 500, pitch: -22, heading: 60, buildingHeight: 14 },
    ],
  },
  barishal: {
    name: 'Barishal',
    groundElevation: 4,
    viewBounds: { southwest: { lat: 22.66, lng: 90.29 }, northeast: { lat: 22.80, lng: 90.48 } },
    pois: [
      { name: 'Barishal City', lat: 22.7010, lon: 90.3535, alt: 500, pitch: -26, heading: 170, buildingHeight: 18 },
      { name: 'Barishal Riverfront', lat: 22.7057, lon: 90.3701, alt: 440, pitch: -30, heading: 110, buildingHeight: 10 },
      { name: 'Amtali Road', lat: 22.6961, lon: 90.3558, alt: 470, pitch: -28, heading: 180, buildingHeight: 12 },
      { name: 'Barishal Port', lat: 22.6944, lon: 90.3635, alt: 500, pitch: -24, heading: 90, buildingHeight: 16 },
      { name: 'Durga Sagar Area', lat: 22.7151, lon: 90.3551, alt: 520, pitch: -26, heading: 120, buildingHeight: 18 },
    ],
  },
  bogura: {
    name: 'Bogura',
    groundElevation: 20,
    viewBounds: { southwest: { lat: 24.76, lng: 89.28 }, northeast: { lat: 24.94, lng: 89.46 } },
    pois: [
      { name: 'Bogura City', lat: 24.8466, lon: 89.3707, alt: 520, pitch: -26, heading: 150, buildingHeight: 22 },
      { name: 'Bogura Town Center', lat: 24.8425, lon: 89.3731, alt: 500, pitch: -22, heading: 190, buildingHeight: 18 },
      { name: 'Bogura Bus Terminal', lat: 24.8511, lon: 89.3660, alt: 480, pitch: -28, heading: 80, buildingHeight: 12 },
      { name: 'Bogura College Road', lat: 24.8420, lon: 89.3568, alt: 500, pitch: -26, heading: 120, buildingHeight: 14 },
      { name: 'Bogura River Road', lat: 24.8585, lon: 89.3534, alt: 490, pitch: -28, heading: 210, buildingHeight: 10 },
    ],
  },
  savar: {
    name: 'Savar',
    groundElevation: 9,
    viewBounds: { southwest: { lat: 23.80, lng: 90.18 }, northeast: { lat: 23.94, lng: 90.34 } },
    pois: [
      { name: 'Savar Industrial Zone', lat: 23.8580, lon: 90.2530, alt: 500, pitch: -22, heading: 180, buildingHeight: 16 },
      { name: 'Savar Bazar', lat: 23.8570, lon: 90.2607, alt: 490, pitch: -30, heading: 150, buildingHeight: 14 },
      { name: 'Savar Road Junction', lat: 23.8502, lon: 90.2618, alt: 500, pitch: -24, heading: 100, buildingHeight: 12 },
      { name: 'Ashulia Link Road', lat: 23.8747, lon: 90.3284, alt: 520, pitch: -24, heading: 70, buildingHeight: 16 },
      { name: 'Savar River Crossing', lat: 23.8649, lon: 90.2449, alt: 480, pitch: -28, heading: 220, buildingHeight: 10 },
    ],
  },
  coxs_bazar: {
    name: 'Cox\'s Bazar',
    groundElevation: 4,
    viewBounds: { southwest: { lat: 21.37, lng: 91.91 }, northeast: { lat: 21.65, lng: 92.11 } },
    pois: [
      { name: 'Cox\'s Bazar Sea Beach', lat: 21.4272, lon: 92.0058, alt: 620, pitch: -30, heading: 110, buildingHeight: 10 },
      { name: 'Laboni Point', lat: 21.4457, lon: 91.9679, alt: 600, pitch: -33, heading: 130, buildingHeight: 10 },
      { name: 'Cox\'s Bazar Town', lat: 21.4399, lon: 92.0148, alt: 540, pitch: -28, heading: 180, buildingHeight: 18 },
      { name: 'Cox\'s Bazar Airport Road', lat: 21.4515, lon: 91.9642, alt: 520, pitch: -24, heading: 80, buildingHeight: 12 },
      { name: 'Inani Beach', lat: 21.3578, lon: 92.0385, alt: 640, pitch: -32, heading: 160, buildingHeight: 10 },
    ],
  },
  jessore: {
    name: 'Jessore',
    groundElevation: 10,
    viewBounds: { southwest: { lat: 23.07, lng: 89.05 }, northeast: { lat: 23.22, lng: 89.29 } },
    pois: [
      { name: 'Jessore City', lat: 23.1697, lon: 89.2137, alt: 500, pitch: -26, heading: 130, buildingHeight: 20 },
      { name: 'Jessore Station Road', lat: 23.1771, lon: 89.2138, alt: 490, pitch: -25, heading: 180, buildingHeight: 12 },
      { name: 'Jessore Bus Terminal', lat: 23.1676, lon: 89.2085, alt: 480, pitch: -28, heading: 95, buildingHeight: 12 },
      { name: 'Jessore Airport Road', lat: 23.1807, lon: 89.2180, alt: 500, pitch: -24, heading: 50, buildingHeight: 14 },
      { name: 'Jessore River Crossing', lat: 23.1701, lon: 89.2011, alt: 500, pitch: -26, heading: 220, buildingHeight: 10 },
    ],
  },
  saidpur: {
    name: 'Saidpur',
    groundElevation: 32,
    viewBounds: { southwest: { lat: 25.75, lng: 88.90 }, northeast: { lat: 25.88, lng: 89.08 } },
    pois: [
      { name: 'Saidpur City', lat: 25.7745, lon: 88.8927, alt: 500, pitch: -25, heading: 130, buildingHeight: 18 },
      { name: 'Saidpur Airport', lat: 25.7706, lon: 88.9191, alt: 560, pitch: -26, heading: 90, buildingHeight: 16 },
      { name: 'Saidpur Main Road', lat: 25.7730, lon: 88.9005, alt: 490, pitch: -28, heading: 150, buildingHeight: 12 },
      { name: 'Saidpur Town Center', lat: 25.7778, lon: 88.9035, alt: 500, pitch: -24, heading: 180, buildingHeight: 16 },
      { name: 'Saidpur Railway', lat: 25.7772, lon: 88.9064, alt: 510, pitch: -26, heading: 210, buildingHeight: 15 },
    ],
  },
  tangail: {
    name: 'Tangail',
    groundElevation: 16,
    viewBounds: { southwest: { lat: 24.22, lng: 89.85 }, northeast: { lat: 24.42, lng: 90.08 } },
    pois: [
      { name: 'Tangail City', lat: 24.2513, lon: 89.9167, alt: 500, pitch: -24, heading: 160, buildingHeight: 18 },
      { name: 'Tangail Town Center', lat: 24.2595, lon: 89.9221, alt: 490, pitch: -22, heading: 180, buildingHeight: 16 },
      { name: 'Tangail Bus Station', lat: 24.2527, lon: 89.9162, alt: 480, pitch: -28, heading: 120, buildingHeight: 12 },
      { name: 'Tangail River Crossing', lat: 24.2609, lon: 89.9287, alt: 500, pitch: -26, heading: 80, buildingHeight: 10 },
      { name: 'Tangail Market Road', lat: 24.2503, lon: 89.9217, alt: 490, pitch: -30, heading: 215, buildingHeight: 12 },
    ],
  },
  brahmanbaria: {
    name: 'Brahmanbaria',
    groundElevation: 12,
    viewBounds: { southwest: { lat: 23.90, lng: 90.95 }, northeast: { lat: 24.15, lng: 91.20 } },
    pois: [
      { name: 'Brahmanbaria City', lat: 23.9571, lon: 91.1111, alt: 500, pitch: -26, heading: 150, buildingHeight: 18 },
      { name: 'Brahmanbaria Main Road', lat: 23.9554, lon: 91.1101, alt: 490, pitch: -24, heading: 110, buildingHeight: 12 },
      { name: 'Brahmanbaria Market', lat: 23.9618, lon: 91.1185, alt: 470, pitch: -28, heading: 190, buildingHeight: 14 },
      { name: 'Brahmanbaria Station', lat: 23.9652, lon: 91.1095, alt: 500, pitch: -24, heading: 70, buildingHeight: 15 },
      { name: 'Brahmanbaria Road Junction', lat: 23.9527, lon: 91.1040, alt: 500, pitch: -27, heading: 210, buildingHeight: 12 },
    ],
  },
  dinajpur: {
    name: 'Dinajpur',
    groundElevation: 34,
    viewBounds: { southwest: { lat: 25.56, lng: 88.49 }, northeast: { lat: 25.76, lng: 88.72 } },
    pois: [
      { name: 'Dinajpur City', lat: 25.6279, lon: 88.6333, alt: 520, pitch: -26, heading: 140, buildingHeight: 18 },
      { name: 'Dinajpur Main Road', lat: 25.6340, lon: 88.6385, alt: 500, pitch: -24, heading: 180, buildingHeight: 12 },
      { name: 'Dinajpur Bus Stand', lat: 25.6215, lon: 88.6315, alt: 490, pitch: -28, heading: 90, buildingHeight: 12 },
      { name: 'Dinajpur Railway', lat: 25.6328, lon: 88.6450, alt: 510, pitch: -24, heading: 120, buildingHeight: 15 },
      { name: 'Dinajpur Town Circle', lat: 25.6282, lon: 88.6339, alt: 500, pitch: -27, heading: 40, buildingHeight: 18 },
    ],
  },
  pabna: {
    name: 'Pabna',
    groundElevation: 16,
    viewBounds: { southwest: { lat: 24.00, lng: 89.15 }, northeast: { lat: 24.15, lng: 89.35 } },
    pois: [
      { name: 'Pabna City', lat: 24.0118, lon: 89.2368, alt: 500, pitch: -26, heading: 150, buildingHeight: 18 },
      { name: 'Pabna Bus Stand', lat: 24.0064, lon: 89.2357, alt: 490, pitch: -22, heading: 180, buildingHeight: 12 },
      { name: 'Pabna Main Road', lat: 24.0168, lon: 89.2407, alt: 500, pitch: -26, heading: 90, buildingHeight: 14 },
      { name: 'Pabna Railway', lat: 24.0085, lon: 89.2459, alt: 510, pitch: -24, heading: 120, buildingHeight: 15 },
      { name: 'Pabna Town Center', lat: 24.0162, lon: 89.2328, alt: 500, pitch: -28, heading: 210, buildingHeight: 10 },
    ],
  },
  hanoi: {
    name: 'Hanoi',
    groundElevation: 12,
    viewBounds: { southwest: { lat: 20.95, lng: 105.78 }, northeast: { lat: 21.12, lng: 106.05 } },
    pois: [
      { name: 'Hoan Kiem Lake', lat: 21.0285, lon: 105.8521, alt: 450, pitch: -30, heading: 90, buildingHeight: 15 },
      { name: 'Hanoi Opera House', lat: 21.0245, lon: 105.8521, alt: 550, pitch: -20, heading: 20, buildingHeight: 42 },
      { name: 'Long Bien Bridge', lat: 21.0480, lon: 105.8688, alt: 680, pitch: -22, heading: 180, buildingHeight: 25 },
      { name: 'Ba Dinh Square', lat: 21.0369, lon: 105.8342, alt: 600, pitch: -24, heading: 270, buildingHeight: 28 },
      { name: 'Vietnam Museum of Revolution', lat: 21.0357, lon: 105.8328, alt: 500, pitch: -26, heading: 130, buildingHeight: 32 },
    ],
  },
  ho_chi_minh: {
    name: 'Ho Chi Minh City',
    groundElevation: 10,
    viewBounds: { southwest: { lat: 10.75, lng: 106.60 }, northeast: { lat: 10.90, lng: 106.82 } },
    pois: [
      { name: 'Bitexco Financial Tower', lat: 10.7718, lon: 106.7040, alt: 600, pitch: -26, heading: 300, buildingHeight: 120 },
      { name: 'Landmark 81', lat: 10.7942, lon: 106.7219, alt: 700, pitch: -18, heading: 330, buildingHeight: 180 },
      { name: 'Saigon Notre-Dame Cathedral', lat: 10.7796, lon: 106.6980, alt: 420, pitch: -28, heading: 45, buildingHeight: 35 },
      { name: 'Ben Thanh Market', lat: 10.7725, lon: 106.6981, alt: 460, pitch: -28, heading: 210, buildingHeight: 20 },
      { name: 'Thu Thiem Bridge', lat: 10.7832, lon: 106.7057, alt: 520, pitch: -24, heading: 100, buildingHeight: 30 },
    ],
  },
  paris: {
    name: 'Paris',
    groundElevation: 35,
    viewBounds: { southwest: { lat: 48.815, lng: 2.224 }, northeast: { lat: 48.902, lng: 2.470 } },
    pois: [
      { name: 'Eiffel Tower', lat: 48.8584, lon: 2.2945, alt: 750, pitch: -25, heading: 315, buildingHeight: 150 },
      { name: 'Arc de Triomphe', lat: 48.8738, lon: 2.2950, alt: 400, pitch: -28, heading: 45, buildingHeight: 25 },
      { name: 'Notre-Dame', lat: 48.8530, lon: 2.3499, alt: 400, pitch: -25, heading: 225, buildingHeight: 35 },
      { name: 'Sacré-Cœur', lat: 48.8867, lon: 2.3431, alt: 400, pitch: -30, heading: 180, buildingHeight: 40 },
      { name: 'Louvre Pyramid', lat: 48.8606, lon: 2.3376, alt: 500, pitch: -35, heading: 0, buildingHeight: 10 },
    ],
  },
  dubai: {
    name: 'Dubai',
    groundElevation: 5,
    viewBounds: { southwest: { lat: 24.95, lng: 54.90 }, northeast: { lat: 25.35, lng: 55.55 } },
    pois: [
      { name: 'Burj Khalifa', lat: 25.1972, lon: 55.2744, alt: 600, pitch: -20, heading: 200, buildingHeight: 270 },
      { name: 'Burj Al Arab', lat: 25.1412, lon: 55.1853, alt: 500, pitch: -25, heading: 90, buildingHeight: 100 },
      { name: 'Palm Jumeirah', lat: 25.1124, lon: 55.1390, alt: 1200, pitch: -40, heading: 0, buildingHeight: 20 },
      { name: 'Dubai Frame', lat: 25.2350, lon: 55.3003, alt: 400, pitch: -25, heading: 270, buildingHeight: 75 },
      { name: 'Museum of the Future', lat: 25.2197, lon: 55.2806, alt: 350, pitch: -20, heading: 30, buildingHeight: 35 },
    ],
  },
  dc: {
    name: 'Washington DC',
    groundElevation: 10,
    viewBounds: { southwest: { lat: 38.79, lng: -77.12 }, northeast: { lat: 38.995, lng: -76.91 } },
    pois: [
      { name: 'US Capitol', lat: 38.8897, lon: -77.0091, alt: 550, pitch: -25, heading: 270, buildingHeight: 45 },
      { name: 'Washington Monument', lat: 38.8895, lon: -77.0353, alt: 500, pitch: -30, heading: 0, buildingHeight: 85 },
      { name: 'Lincoln Memorial', lat: 38.8893, lon: -77.0502, alt: 400, pitch: -25, heading: 90, buildingHeight: 20 },
      { name: 'Pentagon', lat: 38.8711, lon: -77.0559, alt: 800, pitch: -40, heading: 0, buildingHeight: 20 },
      { name: 'Jefferson Memorial', lat: 38.8814, lon: -77.0365, alt: 400, pitch: -30, heading: 0, buildingHeight: 25 },
    ],
  },
};

/**
 * Absolute full-earth camera preset for the zoom_to_globe voice tool. The height
 * must stay inside the app's 'global' view-scale band (>12,000 km — classifyViewScale
 * in gevActions.js) so downstream context/screenshot policy treats it as a globe view,
 * and under the fly_to_location rangeM ceiling (20,000 km).
 */
export const GLOBE_VIEW = Object.freeze({
  heightM: 18000000,
  pitchDeg: -90,
  durationS: 2.8,
});

/**
 * Fly straight out to the full-earth globe view, keeping the current sub-camera
 * point centered so the user's continent stays in front of them.
 * @param {Cesium.Viewer} viewer
 * @param {{duration?: number, onComplete?: Function, onCancel?: Function}} options
 * @returns {{latitude: number, longitude: number, heightM: number}}
 */
export function flyToGlobeView(viewer, options = {}) {
  const carto = viewer.camera.positionCartographic;
  const longitude = Cesium.Math.toDegrees(carto.longitude);
  const latitude = Cesium.Math.toDegrees(carto.latitude);
  viewer.camera.cancelFlight();
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, GLOBE_VIEW.heightM),
    orientation: {
      heading: 0,
      pitch: Cesium.Math.toRadians(GLOBE_VIEW.pitchDeg),
      roll: 0,
    },
    duration: finitePositive(options.duration) || GLOBE_VIEW.durationS,
    endTransform: Cesium.Matrix4.IDENTITY,
    // Cesium's Camera.flyTo reads `complete`/`cancel`. `onComplete`/`onCancel`
    // are this module's OWN option names and are silently ignored by Cesium —
    // spelling them through to flyTo meant the reset never resolved on the
    // flight's own events and every caller fell back to its watchdog timeout.
    complete: options.onComplete,
    cancel: options.onCancel,
  });
  return { latitude, longitude, heightM: GLOBE_VIEW.heightM };
}

/**
 * Flat list of locations for backward compatibility.
 */
export const LOCATIONS = Object.entries(CITY_POIS).map(([id, city]) => ({
  id,
  name: city.name,
  lat: city.pois[0].lat,
  lon: city.pois[0].lon,
}));

/**
 * Fly the camera to a landmark using lookAt-based targeting.
 * Guarantees the target is centered in viewport via flyToBoundingSphere + lookAt.
 *
 * @param {Cesium.Viewer} viewer
 * @param {number} lat - Latitude in degrees
 * @param {number} lon - Longitude in degrees
 * @param {object} options
 * @param {number} options.range - Distance from target in meters (default 500)
 * @param {number} options.pitch - Camera tilt in degrees, negative = down (default -30)
 * @param {number} options.heading - Camera heading in degrees (default 0)
 * @param {number} options.buildingHeight - Estimated landmark center height above ground (default 30)
 * @param {number} options.groundElevation - Fallback ground elevation when terrain isn't loaded (default 0)
 * @param {number} options.duration - Flight duration in seconds (default 3.0)
 * @returns {{ targetPosition: Cesium.Cartesian3 }} The computed target for orbit use
 */
export function flyToLandmark(viewer, lat, lon, options = {}) {
  const {
    range = 500,
    pitch = -30,
    heading = 0,
    buildingHeight = 30,
    groundElevation = 0,
    duration = 3.0,
    onStart = null,
    onComplete = null,
    onCancel = null,
    buildingBounds = null,
  } = options;

  // Sample terrain height (sync — uses loaded tiles; 0 if globe/terrain not ready)
  const targetCartographic = Cesium.Cartographic.fromDegrees(lon, lat);
  const sampledHeight = viewer.scene.globe?.getHeight(targetCartographic);

  // Use sampled height if available, otherwise fall back to pre-baked city ground elevation.
  // Google 3D Tiles don't populate globe terrain, so first fly-to always gets the fallback.
  const terrainHeight = (sampledHeight != null && sampledHeight > 0) ? sampledHeight : groundElevation;

  const bounds = normalizeBuildingBounds(buildingBounds);
  const targetHeight = bounds ? terrainHeight + bounds.height / 2 : terrainHeight + buildingHeight;
  const targetPosition = Cesium.Cartesian3.fromDegrees(lon, lat, targetHeight);
  const boundingRadius = bounds ? buildingBoundingRadius(bounds) : 0;
  const framingRange = bounds
    ? Math.max(rangeForBoundingSphere(viewer, boundingRadius), boundingRadius * 1.35)
    : range;

  const hpr = new Cesium.HeadingPitchRange(
    Cesium.Math.toRadians(heading),
    Cesium.Math.toRadians(pitch),
    framingRange
  );

  if (typeof onStart === 'function') {
    try { onStart(); } catch { /* no-op */ }
  }

  // Fly to target, then lock with lookAt for guaranteed centering
  viewer.camera.flyToBoundingSphere(
    new Cesium.BoundingSphere(targetPosition, boundingRadius),
    {
      offset: hpr,
      duration,
      complete: () => {
        viewer.camera.lookAt(targetPosition, hpr);
        viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
        if (typeof onComplete === 'function') {
          try { onComplete(); } catch { /* no-op */ }
        }
      },
      cancel: () => {
        if (typeof onCancel === 'function') {
          try { onCancel(); } catch { /* no-op */ }
        }
      },
    }
  );

  return {
    targetPosition,
    boundingRadius,
    range: framingRange,
    buildingBounds: bounds,
  };
}

/**
 * Fly to a preset location by ID (uses the first POI as default).
 * Returns target position for orbit controller.
 */
export function flyToPresetLocation(viewer, locationId, options = {}) {
  const city = CITY_POIS[locationId];
  if (!city) return null;
  if (options.viewMode === 'overview' && !finitePositive(options.range) && city.viewBounds) {
    return flyToViewportBounds(viewer, city.viewBounds, {
      duration: options.duration,
      onStart: options.onStart,
      onComplete: options.onComplete,
      onCancel: options.onCancel,
      navigationMode: 'city-overview',
    });
  }
  const poi = city.pois[0];
  return flyToLandmark(viewer, poi.lat, poi.lon, {
    range: poi.alt,
    pitch: poi.pitch,
    heading: poi.heading || 0,
    buildingHeight: poi.buildingHeight || 30,
    buildingBounds: poi.buildingBounds || null,
    groundElevation: city.groundElevation || 0,
    ...options,
  });
}

/**
 * Fly to a specific POI within a city.
 * Returns target position for orbit controller.
 */
export function flyToPOI(viewer, cityId, poiIndex, options = {}) {
  const city = CITY_POIS[cityId];
  if (!city || !city.pois[poiIndex]) return null;
  const poi = city.pois[poiIndex];
  return flyToLandmark(viewer, poi.lat, poi.lon, {
    range: poi.alt,
    pitch: poi.pitch,
    heading: poi.heading || 0,
    buildingHeight: poi.buildingHeight || 30,
    buildingBounds: poi.buildingBounds || null,
    groundElevation: city.groundElevation || 0,
    ...options,
  });
}

const POI_STOPWORDS = new Set(['the', 'a', 'an', 'at', 'of', 'in', 'on', 'to']);
/** Significant lowercased word set of a name (punctuation stripped, stopwords dropped). */
function poiNameTokens(s) {
  return new Set(
    String(s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/)
      .filter((w) => w && !POI_STOPWORDS.has(w)),
  );
}

/**
 * Find a curated preset POI whose name the query fully names, so a voice "fly to the Texas State
 * Capitol" reuses its hand-tuned camera pose (same framing as the LOCATIONS-panel button) instead
 * of generic geocode framing. Match is order-free word-set CONTAINMENT (the POI name's words must
 * all appear in the query — so "Frost Bank Tower" matches "frost tower bank", and extra words like
 * a trailing city are fine), and the POI name must be ≥2 words so a single shared token ("Texas",
 * "Tower") can't grab the wrong landmark. Returns { cityId, index } or null.
 * @param {string} query
 * @returns {{cityId: string, index: number} | null}
 */
export function findPoiByName(query) {
  const q = poiNameTokens(query);
  if (q.size === 0) return null;
  let best = null;
  for (const [cityId, city] of Object.entries(CITY_POIS)) {
    city.pois.forEach((poi, index) => {
      const name = poiNameTokens(poi.name);
      if (name.size < 2) return; // single-word POI names are too ambiguous to match loosely
      const fullyNamed = [...name].every((w) => q.has(w));
      if (fullyNamed && (!best || name.size > best.size)) best = { cityId, index, size: name.size };
    });
  }
  return best ? { cityId: best.cityId, index: best.index } : null;
}

/** Distinguishes an authority veto from a genuine not-found result. */
export const CANCELLED_SEARCH = Object.freeze({ cancelled: true });

/**
 * Geocode a place name using Google Geocoding API, then fly there at a scale
 * appropriate to the request. Countries and cities use their viewport by
 * default; precise landmarks/buildings use close landmark framing.
 */
export async function searchAndFlyTo(viewer, query, options = {}) {
  const apiKey = window.__GOOGLE_MAPS_API_KEY__ || import.meta.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error('No Google Maps API key available for geocoding');

  const beforeFly = typeof options.beforeFly === 'function' ? options.beforeFly : null;
  const mayFly = () => beforeFly === null || beforeFly() !== false;

  // Viewport-biased geocode — the same bias annotationResolver's geocodePlace uses:
  // "Sixth Street" spoken over Austin must prefer the Sixth Street on screen, not a
  // same-named road in another city (or the wrong end of town — the W 6th vs E 6th bug).
  let url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`;
  const bias = viewportBias(viewer);
  if (bias) url += `&bounds=${bias}`;
  const response = await fetch(url);
  const data = await response.json();

  const result = (data.status === 'OK' && data.results?.length) ? data.results[0] : null;
  let lat = result?.geometry.location.lat;
  let lng = result?.geometry.location.lng;
  let label = result ? result.formatted_address : null;
  let types = result?.types || [];
  let viewport = result ? (result.geometry.bounds || result.geometry.viewport) : null;

  // Places-near-view recovery (annotationResolver's twin): a missed geocode, or one
  // that landed implausibly far from the view centre, snaps back to a view-biased
  // Places hit within the trust bound — "the Capitol" means the one on screen.
  const recovered = await placesNearViewRecovery(viewer, query, result ? { lat, lon: lng } : null);
  if (recovered) {
    lat = recovered.lat;
    lng = recovered.lon;
    label = recovered.label || label || query;
    types = recovered.types || [];
    viewport = placesViewportToBounds(recovered.viewport) || viewport;
  } else if (!result) {
    return null;
  }

  const requestedRange = finitePositive(options.range);
  const duration = finitePositive(options.duration) || 3.0;
  const navigationMode = geocodeNavigationMode(types);

  const explicitOverview = options.viewMode === 'overview';

  // Frame the geocode viewport for area-like modes — and for an EXPLICIT overview ask
  // ("give me an overview of X"), which previously fell through to building range.
  if (!requestedRange && !options.forceClose
      && (shouldFrameGeocodeViewport(navigationMode) || explicitOverview)) {
    // Natural regions (mountain ranges, deserts, seas) geocode as area-overview with
    // enormous viewports — fitting the whole box flies the camera to space (owner field
    // test 2026-07-23, "Rocky Mountains"). Frame a capped oblique swath over the center
    // instead. Countries/states (region-overview) intentionally keep whole-place framing.
    const swath = navigationMode === 'area-overview' ? regionFramingPlan(viewport) : null;
    if (swath?.mode === 'swath') {
      if (!mayFly()) return CANCELLED_SEARCH;
      flyToLandmark(viewer, swath.centerLat, swath.centerLng, {
        range: swath.rangeM,
        pitch: swath.pitchDeg,
        heading: swath.headingDeg,
        buildingHeight: 0,
        duration,
        onStart: options.onStart,
        onComplete: options.onComplete,
        onCancel: options.onCancel,
      });
      return {
        label,
        navigationMode: 'natural-region-swath',
        rangeM: swath.rangeM,
      };
    }
    // An administrative geocode can carry a viewport far larger than the place
    // anyone means — "Tokyo" is the PREFECTURE, which owns islands ~1,000 km out,
    // and framing that whole box landed the camera in the open Pacific at 2,885 km.
    // A box that is both bigger than any city and not centred on its own geocoded
    // location falls back to a metro box on that location. Everything else — every
    // city, every state, every country, parks and streets — frames untouched.
    //
    // EXCEPT when the caller asked for an overview outright ("show me an overview
    // of Hawaii", voice `viewMode: 'overview'` — gevActions.js). That is an explicit
    // request for the whole administrative area, so the sanity gate stands down:
    // it exists to guess what an ambiguous place name meant, and there is nothing
    // left to guess once the user has said.
    const gateFraming = !explicitOverview
      && (navigationMode === 'city-overview' || navigationMode === 'region-overview');
    const framedViewport = gateFraming
      ? placeFramingViewport(viewport, lat, lng, types)
      : viewport;
    const flight = flyToViewportBounds(viewer, framedViewport, {
      duration,
      navigationMode,
      beforeFly: mayFly,
      onStart: options.onStart,
      onComplete: options.onComplete,
      onCancel: options.onCancel,
    });
    if (flight === CANCELLED_SEARCH) return CANCELLED_SEARCH;
    if (flight) {
      return {
        label,
        navigationMode,
        rangeM: null,
      };
    }
  }

  const shouldResolveBuilding = navigationMode === 'precise-place';
  const buildingBounds = shouldResolveBuilding
    ? await resolveBuildingBounds(lat, lng, query)
    : null;
  const range = requestedRange || defaultRangeForNavigationMode(navigationMode);
  if (!mayFly()) return CANCELLED_SEARCH;
  const flight = flyToLandmark(viewer, buildingBounds?.lat ?? lat, buildingBounds?.lon ?? lng, {
    range,
    pitch: buildingPitch(buildingBounds),
    heading: 30,
    buildingHeight: 30,
    buildingBounds,
    duration,
    onStart: options.onStart,
    onComplete: options.onComplete,
    onCancel: options.onCancel,
  });
  return {
    label,
    navigationMode: requestedRange
      ? 'explicit-range'
      : (options.forceClose ? navigationMode.replace('-overview', '-close') : navigationMode),
    rangeM: Math.round(flight.range),
  };
}

/** Places {low,high} viewport → the geocode {southwest,northeast} bounds shape
 *  flyToViewportBounds consumes (used when the Places recovery replaces a geocode). */
function placesViewportToBounds(vp) {
  const low = vp?.low;
  const high = vp?.high;
  if (![low?.latitude, low?.longitude, high?.latitude, high?.longitude].every(Number.isFinite)) return null;
  return {
    southwest: { lat: low.latitude, lng: low.longitude },
    northeast: { lat: high.latitude, lng: high.longitude },
  };
}

/**
 * Map a geocode result's `types` to a camera-framing mode. Exported for tests.
 * Parks/campuses/lakes and streets are NOT precise POIs: flying to "Zilker Park" at
 * building range lands on a random rooftop, and a `route` result framed at 250 m looks
 * like the camera picked one arbitrary building on the street (field test 8 / rootcause
 * doc §3) — both frame their geocode viewport instead.
 */
export function geocodeNavigationMode(types) {
  const values = new Set(types);
  if (
    values.has('country')
    || values.has('administrative_area_level_1')
    || values.has('administrative_area_level_2')
  ) {
    return 'region-overview';
  }
  if (values.has('locality') || values.has('postal_town')) return 'city-overview';
  if (
    values.has('sublocality')
    || values.has('sublocality_level_1')
    || values.has('neighborhood')
    || values.has('postal_code')
  ) {
    return 'neighborhood-close';
  }
  if (values.has('route') || values.has('intersection')) return 'street-corridor';
  if (
    values.has('park')
    || values.has('natural_feature')
    || values.has('campus')
    || values.has('university')
    || values.has('airport')
    || values.has('stadium')
    || values.has('amusement_park')
    || values.has('zoo')
    || values.has('cemetery')
    || values.has('shopping_mall')
  ) {
    return 'area-overview';
  }
  return 'precise-place';
}

/**
 * Region-scale span (bbox diagonal, km) above which a geocode viewport is a natural
 * REGION (mountain range, desert, sea) rather than a place: framing the whole box
 * would fly the camera to space, so we frame a representative swath instead.
 * Sized so real parks/lakes (Tahoe ~50 km) keep full framing while ranges
 * (Rockies ~2,700 km, Alps ~880 km) go swath.
 */
export const REGION_SWATH_SPAN_KM = 400;

/** Capped camera range for the representative swath (regional scale, not space). */
const REGION_SWATH_RANGE_M = 280000;

/** Oblique cinematic tilt for the swath — matches the annotation-assist angle. */
const REGION_SWATH_PITCH_DEG = -35;

/** Mean km per degree of latitude (WGS84), the basis for every span estimate here. */
const KM_PER_DEGREE = 111.32;

/**
 * Measure a geocode {southwest,northeast} box. Pure; shared by the region-swath
 * and locality-sanity heuristics so both read the antimeridian the same way.
 * @param {{southwest:{lat:number,lng:number}, northeast:{lat:number,lng:number}}|null} viewport
 * @returns {null | {latSpanDeg:number, lonSpanDeg:number, latSpanKm:number,
 *   lonSpanKm:number, spanKm:number, centerLat:number, centerLng:number}}
 */
export function viewportMetrics(viewport) {
  const southwest = viewport?.southwest;
  const northeast = viewport?.northeast;
  if (
    !Number.isFinite(southwest?.lat)
    || !Number.isFinite(southwest?.lng)
    || !Number.isFinite(northeast?.lat)
    || !Number.isFinite(northeast?.lng)
  ) {
    return null;
  }

  const latSpanDeg = northeast.lat - southwest.lat;
  // Longitude span measured the short way round so an antimeridian-crossing box
  // (Pacific features) doesn't read as ~340° wide.
  const lonSpanDeg = ((northeast.lng - southwest.lng) % 360 + 360) % 360;
  const centerLat = (southwest.lat + northeast.lat) / 2;
  let centerLng = southwest.lng + lonSpanDeg / 2;
  if (centerLng > 180) centerLng -= 360;

  const latSpanKm = Math.abs(latSpanDeg) * KM_PER_DEGREE;
  const lonSpanKm = lonSpanDeg * KM_PER_DEGREE * Math.cos(Cesium.Math.toRadians(centerLat));
  return {
    latSpanDeg,
    lonSpanDeg,
    latSpanKm,
    lonSpanKm,
    spanKm: Math.hypot(latSpanKm, lonSpanKm),
    centerLat,
    centerLng,
  };
}

/** Wrap a longitude in degrees into [-180, 180). */
function wrapLongitude(lng) {
  return ((lng + 180) % 360 + 360) % 360 - 180;
}

/**
 * Diagonal span (km) above which a geocode viewport is bigger than any city, so
 * the off-centre test below is worth applying. Every locality Google returns is
 * far under this (the widest measured is Anchorage at ~135 km), so a city can
 * never be gated on span alone.
 */
export const PLACE_VIEWPORT_MAX_SPAN_KM = 300;

/**
 * Fraction of a viewport's diagonal that its own geocoded location may sit away
 * from the box centre before the box is judged NOT to be centred on the place.
 *
 * The 2026-08-20 QA hunt defect: "Tokyo" flew the camera ~977 km from Tokyo, out
 * over the open Pacific at 2,885 km altitude. Tokyo geocodes as
 * `administrative_area_level_1` (the prefecture), and Tokyo Metropolis owns the
 * Izu and Ogasawara chains ~1,000 km out to sea, so its bounding box is mostly
 * ocean and its centroid is nowhere near the city.
 *
 * Neither span nor offset alone separates that from a legitimately huge region;
 * the ratio does. Measured against the live Geocoding API (2026-08-20):
 *
 *   gated    Tokyo      2,462 km box, anchor  977 km off  → ratio 0.397
 *            Hawaii     2,642 km box, anchor 1,204 km off → ratio 0.456
 *   not      Nunavut    4,394 km box, anchor   426 km off → ratio 0.097
 *            Alaska     3,820 km box, anchor   337 km off → ratio 0.088
 *            Japan      4,047 km box, anchor   357 km off → ratio 0.088
 *            Newfoundl. 1,834 km box, anchor   132 km off → ratio 0.072
 *            Texas      1,725 km box, anchor    90 km off → ratio 0.052
 *            California 1,398 km box, anchor    56 km off → ratio 0.040
 *
 * 0.15 sits in the 2.2x gap between the two groups. States and provinces keep
 * whole-place framing — "California" must still frame California.
 */
export const PLACE_ANCHOR_OFFSET_RATIO = 0.15;

/**
 * Half-extent of the box synthesized when the gate trips — a 40 x 40 km square,
 * matching the hand-tuned city pills (Tokyo's own pill is 42 x 34 km). Framing a
 * box rather than picking a range keeps the flight on the same tested code path
 * the pills use, so a gated search and its pill land at the same scale.
 */
const PLACE_FALLBACK_HALF_SPAN_KM = 20;

/** Great-circle distance in km (small enough here that the spherical model is fine). */
function greatCircleKm(lat1, lng1, lat2, lng2) {
  const dLat = Cesium.Math.toRadians(lat2 - lat1);
  const dLng = Cesium.Math.toRadians(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(Cesium.Math.toRadians(lat1)) * Math.cos(Cesium.Math.toRadians(lat2))
      * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(a)));
}

/**
 * Sanity-gate a geocode viewport before framing it. Pure — exported for unit tests.
 *
 * Returns the viewport unchanged unless the box is BOTH bigger than any city AND
 * not actually centred on its own geocoded location; in that case it returns a
 * metro box around `geometry.location` (Tokyo proper) instead of the box centroid
 * (a point in the open Pacific).
 *
 * `country` results are deliberately EXEMPT. Several countries have the identical
 * pathology from overseas territories — France 12,262 km / ratio 0.387, Portugal
 * 0.378, Ecuador 0.303, Chile 0.256, Spain 0.216 — but country framing is shipped,
 * demoed behavior that no one has reviewed a change to, and reframing a country to
 * a 40 km box is a much bigger call than fixing a prefecture. Left as-is on purpose;
 * flagged for the owner rather than changed silently.
 *
 * @param {{southwest:{lat:number,lng:number}, northeast:{lat:number,lng:number}}|null} viewport
 * @param {number} anchorLat Geocode result latitude (`geometry.location`).
 * @param {number} anchorLng Geocode result longitude.
 * @param {string[]} [types] Raw geocode result types, used only for the country exemption.
 * @returns {{southwest:{lat:number,lng:number}, northeast:{lat:number,lng:number}}|null}
 */
export function placeFramingViewport(viewport, anchorLat, anchorLng, types = []) {
  if (Array.isArray(types) && types.includes('country')) return viewport;
  const metrics = viewportMetrics(viewport);
  if (!metrics || metrics.spanKm <= PLACE_VIEWPORT_MAX_SPAN_KM) return viewport;
  if (!Number.isFinite(anchorLat) || !Number.isFinite(anchorLng)) return viewport;

  const offsetKm = greatCircleKm(anchorLat, anchorLng, metrics.centerLat, metrics.centerLng);
  if (offsetKm <= metrics.spanKm * PLACE_ANCHOR_OFFSET_RATIO) return viewport;

  const latHalfDeg = PLACE_FALLBACK_HALF_SPAN_KM / KM_PER_DEGREE;
  // Guard the cosine so a near-polar anchor cannot blow the longitude half-extent up.
  const cosLat = Math.max(0.05, Math.cos(Cesium.Math.toRadians(anchorLat)));
  const lngHalfDeg = PLACE_FALLBACK_HALF_SPAN_KM / (KM_PER_DEGREE * cosLat);
  const wrapLng = (lng) => ((lng + 180) % 360 + 360) % 360 - 180;
  return {
    southwest: {
      lat: Math.max(-89.9, anchorLat - latHalfDeg),
      lng: wrapLng(anchorLng - lngHalfDeg),
    },
    northeast: {
      lat: Math.min(89.9, anchorLat + latHalfDeg),
      lng: wrapLng(anchorLng + lngHalfDeg),
    },
  };
}

/**
 * Natural-region framing heuristic (owner field test 2026-07-23). Pure — exported
 * for unit tests. Given geocode {southwest,northeast} bounds, decide whether to
 * frame the full viewport or a capped oblique swath over the feature's center,
 * looking along the feature's long axis.
 *
 * @param {{southwest:{lat:number,lng:number}, northeast:{lat:number,lng:number}}|null} viewport
 * @returns {null
 *   | {mode:'full', spanKm:number}
 *   | {mode:'swath', spanKm:number, centerLat:number, centerLng:number,
 *      rangeM:number, pitchDeg:number, headingDeg:number}}
 */
export function regionFramingPlan(viewport) {
  const metrics = viewportMetrics(viewport);
  if (!metrics) return null;
  const { latSpanKm, lonSpanKm, spanKm, centerLat, centerLng } = metrics;

  if (spanKm <= REGION_SWATH_SPAN_KM) return { mode: 'full', spanKm };

  return {
    mode: 'swath',
    spanKm,
    centerLat,
    centerLng,
    rangeM: REGION_SWATH_RANGE_M,
    pitchDeg: REGION_SWATH_PITCH_DEG,
    // Look along the feature's long axis so the swath reads as the range receding
    // toward the horizon (N-S ranges → face north, E-W ranges → face east).
    headingDeg: latSpanKm >= lonSpanKm ? 0 : 90,
  };
}

function defaultRangeForNavigationMode(mode) {
  // Fallback ranges when the geocode has no usable viewport to frame.
  if (mode === 'area-overview') return 1400;
  if (mode === 'street-corridor') return 900;
  return 250;
}

function shouldFrameGeocodeViewport(mode) {
  return mode === 'region-overview' || mode === 'city-overview'
    || mode === 'area-overview' || mode === 'street-corridor';
}

function flyToViewportBounds(viewer, viewport, options = {}) {
  const {
    duration = 3.0,
    beforeFly = null,
    onStart = null,
    onComplete = null,
    onCancel = null,
    navigationMode = 'overview',
  } = options;
  const southwest = viewport?.southwest;
  const northeast = viewport?.northeast;
  if (
    !Number.isFinite(southwest?.lat)
    || !Number.isFinite(southwest?.lng)
    || !Number.isFinite(northeast?.lat)
    || !Number.isFinite(northeast?.lng)
  ) {
    return false;
  }

  // Pad from the SHORT-way-round longitude span. Raw subtraction breaks any box
  // that crosses the antimeridian: Alaska (sw 172.3E, ne -130.0) subtracts to
  // -302, and a 0.4-degree metro box straddling the dateline subtracts to -359.6,
  // whose 12% padding alone is 43 degrees — that box framed 86.7 degrees of ocean
  // instead of a city. Cesium's Rectangle does NOT normalize past +/-180, so the
  // padded edges are wrapped here into a proper east<west crossing rectangle.
  const metrics = viewportMetrics(viewport);
  const latitudePadding = Math.max(0.05, Math.abs(metrics.latSpanDeg) * 0.12);
  const longitudePadding = Math.max(0.05, metrics.lonSpanDeg * 0.12);
  const paddedLonSpan = metrics.lonSpanDeg + longitudePadding * 2;
  const south = Math.max(-89.9, southwest.lat - latitudePadding);
  const north = Math.min(89.9, northeast.lat + latitudePadding);
  const rectangle = paddedLonSpan >= 360
    ? Cesium.Rectangle.fromDegrees(-180, south, 180, north)
    : Cesium.Rectangle.fromDegrees(
      wrapLongitude(southwest.lng - longitudePadding),
      south,
      wrapLongitude(southwest.lng + metrics.lonSpanDeg + longitudePadding),
      north,
    );
  if (typeof beforeFly === 'function' && beforeFly() === false) return CANCELLED_SEARCH;
  if (typeof onStart === 'function') {
    try { onStart(); } catch { /* no-op */ }
  }
  viewer.camera.flyTo({
    destination: rectangle,
    duration,
    endTransform: Cesium.Matrix4.IDENTITY,
    complete: () => {
      if (typeof onComplete === 'function') {
        try { onComplete(); } catch { /* no-op */ }
      }
    },
    cancel: () => {
      if (typeof onCancel === 'function') {
        try { onCancel(); } catch { /* no-op */ }
      }
    },
  });
  // Same short-way-round rule for the reported centre: averaging raw longitudes
  // puts a dateline-crossing box's centre on the opposite side of the planet.
  return {
    targetPosition: Cesium.Cartesian3.fromDegrees(metrics.centerLng, metrics.centerLat, 0),
    boundingRadius: 0,
    range: null,
    viewBounds: viewport,
    navigationMode,
  };
}

function normalizeBuildingBounds(bounds) {
  if (!bounds) return null;
  const height = finitePositive(bounds.height);
  const width = finitePositive(bounds.width);
  const depth = finitePositive(bounds.depth);
  if (!height || !width || !depth) return null;
  return { ...bounds, height, width, depth };
}

function buildingBoundingRadius(bounds) {
  const halfHeight = bounds.height / 2;
  const halfWidth = bounds.width / 2;
  const halfDepth = bounds.depth / 2;
  return Math.hypot(halfHeight, halfWidth, halfDepth) * 1.18;
}

function rangeForBoundingSphere(viewer, radius) {
  const frustum = viewer.camera.frustum;
  const verticalFov = Number(frustum?.fov) || Cesium.Math.toRadians(60);
  const aspectRatio = Math.max(0.5, Number(frustum?.aspectRatio) || 1);
  const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * aspectRatio);
  const limitingFov = Math.min(verticalFov, horizontalFov);
  // Target 57% sphere occupancy so perspective still leaves at least 40%
  // measured roof-to-base breathing room in ordinary oblique building views.
  const occupiedViewportFraction = 0.57;
  const desiredAngularRadius = limitingFov * occupiedViewportFraction / 2;
  return radius / Math.sin(desiredAngularRadius) * 1.05;
}

function buildingPitch(bounds) {
  if (!bounds) return -25;
  const footprint = Math.max(bounds.width, bounds.depth);
  const ratio = bounds.height / Math.max(footprint, 1);
  if (ratio >= 2.5) return -12;
  if (ratio >= 1.2) return -22;
  if (ratio <= 0.35) return -45;
  return -32;
}

async function resolveBuildingBounds(lat, lon, query) {
  const overpassQuery = `
    [out:json][timeout:10];
    (
      way(around:180,${lat},${lon})["building"];
      relation(around:180,${lat},${lon})["building"];
      way(around:180,${lat},${lon})["man_made"];
      relation(around:180,${lat},${lon})["man_made"];
      way(around:180,${lat},${lon})["tourism"="attraction"];
      relation(around:180,${lat},${lon})["tourism"="attraction"];
    );
    out tags center geom;
  `;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 6000);
  try {
    const response = await fetch('/api/overpass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(overpassQuery)}`,
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const data = await response.json();
    return selectBuildingBounds(data?.elements || [], lat, lon, query);
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeout);
  }
}

function selectBuildingBounds(elements, targetLat, targetLon, query) {
  const queryWords = normalizedWords(query);
  const candidates = [];
  for (const element of elements) {
    const coordinates = elementCoordinates(element);
    if (coordinates.length < 3) continue;
    const bounds = coordinateBounds(coordinates, targetLat);
    if (!bounds || bounds.width < 2 || bounds.depth < 2) continue;
    const tags = element.tags || {};
    const center = element.center || averageCoordinate(coordinates);
    const distanceM = approximateDistanceM(targetLat, targetLon, center.lat, center.lon);
    const nameWords = normalizedWords([
      tags.name,
      tags['name:en'],
      tags.official_name,
      tags.alt_name,
    ].filter(Boolean).join(' '));
    const nameScore = wordOverlap(queryWords, nameWords);
    const containsTarget = pointInPolygon(targetLon, targetLat, coordinates);
    const height = buildingHeightFromTags(tags, bounds);
    candidates.push({
      lat: center.lat,
      lon: center.lon,
      height,
      width: bounds.width,
      depth: bounds.depth,
      osmName: tags.name || tags['name:en'] || null,
      osmType: element.type,
      osmId: element.id,
      score: nameScore * 1000 + (containsTarget ? 500 : 0) - distanceM,
    });
  }
  if (!candidates.length) return null;
  candidates.sort((a, b) => b.score - a.score);
  const { score, ...best } = candidates[0];
  return best;
}

function elementCoordinates(element) {
  if (Array.isArray(element.geometry)) {
    return element.geometry.filter((point) => Number.isFinite(point?.lat) && Number.isFinite(point?.lon));
  }
  if (!Array.isArray(element.members)) return [];
  return element.members.flatMap((member) => (
    Array.isArray(member.geometry)
      ? member.geometry.filter((point) => Number.isFinite(point?.lat) && Number.isFinite(point?.lon))
      : []
  ));
}

function coordinateBounds(coordinates, latitude) {
  const latitudes = coordinates.map((point) => point.lat);
  const longitudes = coordinates.map((point) => point.lon);
  const south = Math.min(...latitudes);
  const north = Math.max(...latitudes);
  const west = Math.min(...longitudes);
  const east = Math.max(...longitudes);
  return {
    width: approximateDistanceM(latitude, west, latitude, east),
    depth: approximateDistanceM(south, west, north, west),
  };
}

function buildingHeightFromTags(tags, bounds) {
  const explicitHeight = parseMeters(tags.height || tags['building:height']);
  if (explicitHeight) return explicitHeight;
  const levels = Number.parseFloat(tags['building:levels']);
  const roofHeight = parseMeters(tags['roof:height']) || 0;
  if (Number.isFinite(levels) && levels > 0) return levels * 3.3 + roofHeight;
  return Math.max(12, Math.min(80, Math.max(bounds.width, bounds.depth) * 0.8));
}

function parseMeters(value) {
  if (value == null) return 0;
  const number = Number.parseFloat(String(value).replace(',', '.'));
  if (!Number.isFinite(number) || number <= 0) return 0;
  return /\b(ft|feet|foot)\b/i.test(String(value)) ? number * 0.3048 : number;
}

function averageCoordinate(coordinates) {
  const total = coordinates.reduce((sum, point) => ({
    lat: sum.lat + point.lat,
    lon: sum.lon + point.lon,
  }), { lat: 0, lon: 0 });
  return {
    lat: total.lat / coordinates.length,
    lon: total.lon / coordinates.length,
  };
}

function normalizedWords(value) {
  return new Set(String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 2));
}

function wordOverlap(left, right) {
  let matches = 0;
  for (const word of left) {
    if (right.has(word)) matches++;
  }
  return matches;
}

function pointInPolygon(lon, lat, coordinates) {
  let inside = false;
  for (let index = 0, previous = coordinates.length - 1; index < coordinates.length; previous = index++) {
    const a = coordinates[index];
    const b = coordinates[previous];
    const intersects = ((a.lat > lat) !== (b.lat > lat)) &&
      (lon < (b.lon - a.lon) * (lat - a.lat) / ((b.lat - a.lat) || Number.EPSILON) + a.lon);
    if (intersects) inside = !inside;
  }
  return inside;
}

function approximateDistanceM(latA, lonA, latB, lonB) {
  const latitudeScale = 111320;
  const longitudeScale = latitudeScale * Math.cos(Cesium.Math.toRadians((latA + latB) / 2));
  return Math.hypot(
    (latB - latA) * latitudeScale,
    (lonB - lonA) * longitudeScale
  );
}

function finitePositive(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
}
