import { Helmet } from 'react-helmet-async';
import Photos from '../components/Photos';
import Videos from '../components/Videos';
import useScrollReveal from '../hooks/useScrollReveal';

export default function Work() {
  useScrollReveal('section');

  return (
    <>
      <Helmet>
        <title>ASSE ZERO | Work</title>
        <meta name="description" content="Portfolio di ASSE ZERO – foto e video dei nostri progetti: pubblicità, cortometraggi, videoclip musicali." />
      </Helmet>

      <Photos />
      <Videos />
    </>
  );
}
