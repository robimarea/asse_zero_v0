import { useMediaQuery } from '@hooks/useMediaQuery';
import { useWorkMedia } from '@context/WorkMediaContext';
import VideosDesktop from './VideosDesktop';
import VideosMobile from './VideosMobile';

export default function Videos() {
  const isMobile = useMediaQuery('(max-width: 900px)');
  const { videos } = useWorkMedia();

  if (isMobile) {
    return <VideosMobile videos={videos} />;
  }

  return <VideosDesktop videos={videos} />;
}
