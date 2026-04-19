import Services from '@sections/Services';
import Contact from '@sections/Contact';
import PageSeo from '@components/seo/PageSeo';
import { SEO } from '@data/seoData';

export default function Servizi() {
  return (
    <>
      <PageSeo {...SEO.servizi} />
      <Services />
      <Contact />
    </>
  );
}
