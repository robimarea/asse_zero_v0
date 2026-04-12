import { Helmet } from 'react-helmet-async';
import About          from '@sections/About';

export default function AboutPage() {

  return (
    <>
      <Helmet>
        <title>ASSE ZERO | Chi Siamo</title>
        <meta
          name="description"
          content="ASSE ZERO – Chi siamo: Gerardo Romani, director e sound designer. Il processo creativo, dall'idea al master."
        />
      </Helmet>
      <About />
    </>
  );
}
