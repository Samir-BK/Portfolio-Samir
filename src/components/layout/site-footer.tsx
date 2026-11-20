import Link from 'next/link';
import { profile } from '@/content/portfolio';
import { Icon } from '@/components/ui/icon';
import { SocialLinks } from '@/components/ui/social-links';

export function SiteFooter({
  home = true,
  showBlog,
}: {
  home?: boolean;
  showBlog: boolean;
}) {
  return (
    <footer className="site-footer">
      <div className="site-width footer-inner">
        <a className="back-to-top" href={home ? '#home' : '#main-content'}>
          Back to top <Icon name="up" />
        </a>
        <nav aria-label="Footer navigation">
          <Link href="/projects" prefetch={false}>
            Projects
          </Link>
          {showBlog && (
            <Link href="/blog" prefetch={false}>
              Blog
            </Link>
          )}
          <Link href={home ? '#contact' : '/#contact'}>Contact</Link>
          {profile.resume && (
            <a href={profile.resume} download>
              Résumé <Icon name="download" />
            </a>
          )}
        </nav>
        <SocialLinks />
      </div>
    </footer>
  );
}
