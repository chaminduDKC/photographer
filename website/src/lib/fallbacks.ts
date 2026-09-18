import type { BusinessInfo } from './api';

export const FALLBACK_BUSINESS: BusinessInfo = {
  id: 'fallback',
  phone1: '+94 77 123 4567',
  phone2: null,
  whatsapp: '+94771234567',
  address: '123 Main Street',
  city: 'Colombo',
  province: 'Western',
};

export const FALLBACK_SLIDER_IMAGES = [
  { id: 'fb-1', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80', albumId: '' },
  { id: 'fb-2', url: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1200&q=80', albumId: '' },
  { id: 'fb-3', url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=1200&q=80', albumId: '' },
  { id: 'fb-4', url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&q=80', albumId: '' },
  { id: 'fb-5', url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=80', albumId: '' },
];

export const SITE_NAME = 'Studio Portfolio';
export const SITE_DESCRIPTION = 'Capturing life\'s most beautiful moments - weddings, portraits, and everything in between.';
