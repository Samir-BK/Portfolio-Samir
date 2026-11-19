import { profile } from '@/content/portfolio';
import { ButtonLink } from '@/components/ui/button';
import { Entrance } from '@/components/ui/entrance';
import { Icon } from '@/components/ui/icon';
import { SocialLinks } from '@/components/ui/social-links';

const exampleQuestions = [
  'What tools do you work with?',
  'How did you build Signal Desk?',
  'What are you learning next?',
];

function AssistantPreview() {
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
        <p className="terminal-label">Preview · AI assistant coming soon</p>
        <p className="terminal-intro">
          Hi there. When this terminal is live, you’ll be able to ask about the
          projects, tools, and trade-offs behind the work.
        </p>
        <div className="terminal-examples">
          <p className="terminal-caption">Example questions</p>
          <ul className="terminal-questions" aria-label="Example questions">
            {exampleQuestions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ul>
        </div>
        <p className="terminal-prompt">
          <span aria-hidden="true">&gt;</span>
          Input unavailable in preview
        </p>
      </div>
    </section>
  );
}

export function Hero() {
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
          {profile.availability}
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
        <AssistantPreview />
      </Entrance>
    </section>
  );
}
