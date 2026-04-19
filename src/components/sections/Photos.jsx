import { useMediaQuery } from '@hooks/useMediaQuery';
import PhotosDesktop from './PhotosDesktop';
import PhotosMobile from './PhotosMobile';

export default function Photos() {
  const isMobile = useMediaQuery('(max-width: 900px)');

  if (isMobile) {
    return <PhotosMobile />;
  }

  return <PhotosDesktop />;
}
