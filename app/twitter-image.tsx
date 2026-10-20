import { ShareImage, size, contentType } from '@/lib/share-image';

export const alt = 'EARTH SP NDA - Practice Tests & Notes';
export { size, contentType };

export default function Image() {
  return ShareImage({
    title: 'EARTH SP NDA',
    subtitle: 'Practice tests, free notes and study plans for NDA, CDS and AFCAT aspirants.',
  });
}