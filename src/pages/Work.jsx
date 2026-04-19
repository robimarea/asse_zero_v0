import Photos from '@sections/Photos';
import Videos from '@sections/Videos';
import ChapterSeparator from '@ui/ChapterSeparator';
import PageSeo from '@components/seo/PageSeo';
import { SEO } from '@data/seoData';

export default function Work() {
  return (
    <>
      <PageSeo {...SEO.work} />
      <h1 className="srOnly">{SEO.work.heading}</h1>
      <Photos />
      <ChapterSeparator height="30svh" />
      <Videos />
    </>
  );
}
