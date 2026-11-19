import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { Contact } from '@/components/sections/contact';
import { FeaturedProjects } from '@/components/sections/featured-projects';
import { Hero } from '@/components/sections/hero';
import { About, Journey, Skills } from '@/components/sections/profile-sections';

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <FeaturedProjects />
        <About />
        <Skills />
        <Journey />
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}
