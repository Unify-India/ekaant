import { IAmenities } from '../library.interface';

export const AMENITIES_DATA: { [key: string]: IAmenities } = {
  highSpeedWifi: {
    amenityName: 'High-Speed Wi-Fi',
    icon: 'wifi-outline',
    isAvailable: true,
  },
  airConditioning: {
    amenityName: 'Air Conditioning',
    icon: 'snow-outline',
    isAvailable: true,
  },
  powerOutlets: {
    amenityName: 'Power Outlets',
    icon: 'flash-outline',
    isAvailable: true,
  },
  coffeeMachine: {
    amenityName: 'Coffee Machine',
    icon: 'cafe-outline',
    isAvailable: true,
  },
  waterCooler: {
    amenityName: 'Water Cooler',
    icon: 'water-outline',
    isAvailable: true,
  },
  parkingAvailable: {
    amenityName: 'Parking Available',
    icon: 'car-outline',
    isAvailable: true,
  },
  security247: {
    amenityName: '24/7 Security',
    icon: 'shield-checkmark-outline',
    isAvailable: true,
  },
  cctvSurveillance: {
    amenityName: 'CCTV Surveillance',
    icon: 'videocam-outline',
    isAvailable: true,
  },
  lockers: {
    amenityName: 'Lockers',
    icon: 'lock-closed-outline',
    isAvailable: true,
  },
  printingServices: {
    amenityName: 'Printing Services',
    icon: 'print-outline',
    isAvailable: true,
  },
  quietZones: {
    amenityName: 'Quiet Zones',
    icon: 'volume-mute-outline',
    isAvailable: true,
  },
  discussionRooms: {
    amenityName: 'Discussion Rooms',
    icon: 'people-circle-outline',
    isAvailable: true,
  },
};
