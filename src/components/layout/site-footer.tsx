import { profile } from '@/content/portfolio';
import { Icon } from '@/components/ui/icon';
import { SocialLinks } from '@/components/ui/social-links';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-width footer-inner">
        <a className="back-to-top" href="#home">
          Back to top <Icon name="up" />
        </a>
        <nav aria-label="Footer navigation">
          <a href="#projects">Projects</a>
          <a href="#contact">Contact</a>
          <a href={profile.resume} download>
            Résumé sample <Icon name="download" />
          </a>
        </nav>
        <SocialLinks />
      </div>
    </footer>
  );
}
