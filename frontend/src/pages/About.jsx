import About from '@sections/About';
import PageSeo from '@components/seo/PageSeo';
import { SEO } from '@data/seoData';

export default function AboutPage() {
  return (
    <>
      <PageSeo {...SEO.about} />
      <h1 className="srOnly">{SEO.about.heading}</h1>
      <About />
    </>
  );
}
