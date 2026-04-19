import Hero from '@sections/Hero';
import HomeStory from '@sections/HomeStory';
import PageSeo from '@components/seo/PageSeo';
import { SEO } from '@data/seoData';

export default function Home() {
  return (
    <>
      <PageSeo {...SEO.home} />
      <h1 className="srOnly">{SEO.home.heading}</h1>
      <Hero />
      <HomeStory />
    </>
  );
}
