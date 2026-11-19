import {
  education,
  experience,
  profile,
  skillGroups,
  type TimelineEntry,
} from '@/content/portfolio';
import { Entrance } from '@/components/ui/entrance';

export function About() {
  return (
    <section
      className="site-width page-section"
      id="about"
      aria-labelledby="about-title"
      tabIndex={-1}
    >
      <Entrance className="about-panel">
        <div className="section-heading">
          <h2 id="about-title">About</h2>
          <p>{profile.about}</p>
        </div>
        <div className="interests">
          <h3>Engineering interests</h3>
          <ul className="interest-list">
            {profile.interests.map((interest) => (
              <li key={interest}>{interest}</li>
            ))}
          </ul>
        </div>
      </Entrance>
    </section>
  );
}

export function Skills() {
  return (
    <section
      className="site-width page-section"
      id="skills"
      aria-labelledby="skills-title"
      tabIndex={-1}
    >
      <Entrance>
        <div className="section-heading">
          <h2 id="skills-title">Skills</h2>
        </div>
        <div className="skill-grid">
          {skillGroups.map(({ title, items }) => (
            <div key={title} className="skill-group">
              <h3>{title}</h3>
              <ul className="badge-list">
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Entrance>
    </section>
  );
}

function Timeline({
  title,
  entries,
}: {
  title: string;
  entries: readonly TimelineEntry[];
}) {
  return (
    <div className="timeline-group">
      <h3>{title}</h3>
      <ol className="timeline">
        {entries.map(({ period, title, description }) => (
          <li key={title}>
            <p className="meta-label">{period}</p>
            <h4>{title}</h4>
            <p>{description}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Journey() {
  return (
    <section
      className="site-width page-section"
      id="journey"
      aria-labelledby="journey-title"
      tabIndex={-1}
    >
      <Entrance>
        <div className="section-heading">
          <h2 id="journey-title">Experience and education</h2>
          <p>Sample entries show the timeline format.</p>
        </div>
        <div className="timeline-grid">
          <Timeline title="Experience" entries={experience} />
          <Timeline title="Education" entries={education} />
        </div>
      </Entrance>
    </section>
  );
}
