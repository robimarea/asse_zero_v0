import { useMediaQuery } from '@hooks/useMediaQuery';
import VideosDesktop from './VideosDesktop';
import VideosMobile from './VideosMobile';

export default function Videos() {
  const isMobile = useMediaQuery('(max-width: 900px)');

  if (isMobile) {
    return <VideosMobile />;
  }

  return <VideosDesktop />;
}
