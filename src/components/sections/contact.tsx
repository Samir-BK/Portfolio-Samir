import { profile } from '@/content/portfolio';
import { ButtonLink } from '@/components/ui/button';
import { Entrance } from '@/components/ui/entrance';
import { Icon } from '@/components/ui/icon';
import { SocialLinks } from '@/components/ui/social-links';

export function Contact() {
  return (
    <section
      className="site-width page-section contact-section"
      id="contact"
      aria-labelledby="contact-title"
      tabIndex={-1}
    >
      <Entrance className="contact-panel">
        <div className="section-heading">
          <h2 id="contact-title">Get in touch</h2>
          <p>
            The address is a sample, and social links open platform homepages.
          </p>
        </div>
        <div className="contact-actions">
          <ButtonLink href={`mailto:${profile.email}`} variant="secondary">
            <Icon name="mail" /> {profile.email}
          </ButtonLink>
          <SocialLinks />
        </div>
      </Entrance>
    </section>
  );
}
