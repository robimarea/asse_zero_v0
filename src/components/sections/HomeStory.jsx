import { useNavigate } from 'react-router-dom';
import { usePageTransition } from '@context/TransitionContext';

import Manifesto       from './story/Manifesto';
import ServicesPreview from './story/ServicesPreview';
import Diptych         from './story/Diptych';

import styles from './HomeStory.module.css';

export default function HomeStory() {
  const navigate = useNavigate();
  const transit  = usePageTransition();

  const handleNavigate = (path) => transit(() => navigate(path));

  return (
    <div id="story" className={styles.story}>
      <Manifesto />
      <ServicesPreview onNavigate={handleNavigate} />
      <Diptych onNavigate={handleNavigate} />
    </div>
  );
}
