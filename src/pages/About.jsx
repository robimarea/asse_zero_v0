import { Helmet } from 'react-helmet-async';
import About          from '../components/About';
import useScrollReveal from '../hooks/useScrollReveal';

export default function AboutPage() {
  useScrollReveal('section');

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
