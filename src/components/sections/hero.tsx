import { assistantMode } from '@/server/chat/config';
import { PortfolioChat } from './portfolio-chat';
import { profile } from '@/content/portfolio';
import { ButtonLink } from '@/components/ui/button';
import { Entrance } from '@/components/ui/entrance';
import { Icon } from '@/components/ui/icon';
import { SocialLinks } from '@/components/ui/social-links';

function AssistantUnavailable() {
  return (
    <section className="terminal-panel" aria-labelledby="terminal-title">
      <div className="terminal-header">
        <span className="terminal-mark" aria-hidden="true">
          &gt;_
        </span>
        <h2 id="terminal-title">~/portfolio-assistant</h2>
        <p className="terminal-status">Offline</p>
      </div>
      <div className="terminal-body">
        <p className="terminal-intro">
          The AI assistant is currently unavailable. You can still explore my
          projects and experience.
        </p>
        <ButtonLink
          href="/projects"
          variant="secondary"
          className="justify-self-start"
        >
          Explore projects <Icon name="arrow" />
        </ButtonLink>
      </div>
    </section>
  );
}

export function Hero() {
  const mode = assistantMode();
  return (
    <section
      className="site-width hero"
      id="home"
      aria-labelledby="hero-title"
      tabIndex={-1}
    >
      <div className="hero-copy">
        <p className="availability-label">
          <span className="status-dot" aria-hidden="true" />
          {profile.location}
        </p>
        <h1 id="hero-title">
          <span className="hero-greeting">
            <span aria-hidden="true">&gt; </span>Hello, I&apos;m
          </span>
          <strong>{profile.name}.</strong>
        </h1>
        <p className="hero-role">{profile.role}</p>
        <p className="hero-description">{profile.description}</p>
        <div className="hero-actions">
          <ButtonLink href="#contact">
            Get in touch <Icon name="arrow" />
          </ButtonLink>
          <ButtonLink href="#projects" variant="secondary">
            <span className="path-prefix" aria-hidden="true">
              ~/
            </span>
            projects
          </ButtonLink>
        </div>
        <SocialLinks compact />
      </div>
      <Entrance hero className="hero-terminal">
        {mode === 'disabled' ? (
          <AssistantUnavailable />
        ) : (
          <PortfolioChat testMode={mode === 'fake'} />
        )}
      </Entrance>
    </section>
  );
}
