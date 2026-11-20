import { profile, profileDescription } from '@/content/portfolio';
import { hasPublishedArticles } from '@/server/content';
import { pageMetadata } from '@/server/metadata';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { Contact } from '@/components/sections/contact';
import { FeaturedProjects } from '@/components/sections/featured-projects';
import { Hero } from '@/components/sections/hero';
import { About, Journey, Skills } from '@/components/sections/profile-sections';

export const dynamic = 'force-dynamic';

export const metadata = pageMetadata({
  title: `${profile.name} | ${profile.role}`,
  description: profileDescription,
  path: '/',
});

export default async function HomePage() {
  const showBlog = await hasPublishedArticles().catch(() => false);
  return (
    <>
      <SiteHeader showBlog={showBlog} />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <FeaturedProjects />
        <About />
        <Skills />
        <Journey />
        <Contact />
      </main>
      <SiteFooter showBlog={showBlog} />
    </>
  );
}
