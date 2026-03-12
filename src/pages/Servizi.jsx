import { Helmet } from 'react-helmet-async';
import Services from '../components/Services';
import Contact  from '../components/Contact';
import useScrollReveal from '../hooks/useScrollReveal';

export default function Servizi() {
  useScrollReveal('section');

  return (
    <>
      <Helmet>
        <title>ASSE ZERO | Servizi</title>
        <meta name="description" content="I servizi di ASSE ZERO: Video Production, Photography, Sound Design, Cortometraggi, Videoclip, Pubblicità. Contattaci per il tuo progetto." />
      </Helmet>

      <Services />
      <Contact />
    </>
  );
}
