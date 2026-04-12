import { Helmet } from 'react-helmet-async';
import Services from '@sections/Services';
import Contact  from '@sections/Contact';

export default function Servizi() {

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
