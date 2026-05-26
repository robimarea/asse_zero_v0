import { useMediaQuery } from '@hooks/useMediaQuery';
import { useWorkMedia } from '@context/WorkMediaContext';
import PhotosDesktop from './PhotosDesktop';
import PhotosMobile from './PhotosMobile';

export default function Photos() {
  const isMobile = useMediaQuery('(max-width: 900px)');
  const { photos } = useWorkMedia();

  if (isMobile) {
    return <PhotosMobile photos={photos} />;
  }

  return <PhotosDesktop photos={photos} />;
}
