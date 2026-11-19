import { profile } from '@/content/portfolio';
import { Icon } from './icon';

export function SocialLinks({ compact = false }: { compact?: boolean }) {
  return (
    <ul
      className={
        compact ? 'social-links social-links--compact' : 'social-links'
      }
      aria-label={
        compact ? 'Contact links (placeholders)' : 'Social placeholders'
      }
    >
      {profile.socials.map(({ label, href, icon }) => (
        <li key={label}>
          <a
            href={href}
            aria-label={`${label} homepage (placeholder)`}
            title={`${label} (placeholder)`}
          >
            <Icon name={icon} />
            {!compact && (
              <>
                <span>{label}</span>
                <Icon name="external" className="social-arrow" />
              </>
            )}
          </a>
        </li>
      ))}
      {compact && (
        <li>
          <a
            href={`mailto:${profile.email}`}
            aria-label="Email (placeholder address)"
            title="Email (placeholder)"
          >
            <Icon name="mail" />
          </a>
        </li>
      )}
    </ul>
  );
}
