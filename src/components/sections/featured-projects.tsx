import { projects, type Project } from '@/content/portfolio';
import { Entrance } from '@/components/ui/entrance';
import { Icon } from '@/components/ui/icon';

function ProjectArtwork({ visual }: { visual: Project['visual'] }) {
  return (
    <div className={`project-art art-${visual}`} aria-hidden="true">
      {visual === 'queue' && (
        <div className="mock-ui mock-queue">
          <div className="mock-bar">
            <span>Inbox</span>
            <span>Queue</span>
          </div>
          <div className="mock-content">
            <div className="mock-rail">
              <i />
              <i />
              <i />
            </div>
            <div className="queue-rows">
              <div>
                <i /> Password reset <span>Open</span>
              </div>
              <div>
                <i /> Billing question <span>Review</span>
              </div>
              <div>
                <i /> Feature request <span>Filed</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {visual === 'trace' && (
        <div className="mock-ui mock-trace">
          <div className="mock-bar">
            <span>Request trace</span>
            <span>Waterfall</span>
          </div>
          <div className="trace-rows">
            <div>
              <span>gateway</span>
              <i />
            </div>
            <div>
              <span>service</span>
              <i />
            </div>
            <div>
              <span>database</span>
              <i />
            </div>
          </div>
        </div>
      )}
      {visual === 'notes' && (
        <div className="mock-ui mock-notes">
          <div className="mock-bar">
            <span>Notebook</span>
            <span>Search</span>
          </div>
          <div className="mock-content">
            <div className="notes-list">
              <span>Design notes</span>
              <span>API checklist</span>
              <span>Reading list</span>
            </div>
            <div className="note-sheet">
              <strong>Design notes</strong>
              <i />
              <i />
              <i />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function FeaturedProjects() {
  return (
    <section
      className="site-width page-section projects-section"
      id="projects"
      aria-labelledby="projects-title"
      tabIndex={-1}
    >
      <Entrance>
        <div className="section-heading">
          <h2 id="projects-title">Featured projects</h2>
          <p>
            Three sample concepts that show how this portfolio can present
            technical work.
          </p>
        </div>
        <div className="project-grid">
          {projects.map((project) => (
            <article
              key={project.id}
              className="project-card"
              aria-labelledby={project.id}
            >
              <ProjectArtwork visual={project.visual} />
              <div className="project-content">
                <p className="meta-label">{project.category}</p>
                <h3 id={project.id}>{project.title}</h3>
                <p className="project-description">{project.description}</p>
                <ul className="badge-list" aria-label="Concept technologies">
                  {project.technologies.map((technology) => (
                    <li key={technology}>{technology}</li>
                  ))}
                </ul>
                <a
                  href={project.href}
                  className="project-link"
                  aria-label={`${project.title} project link (placeholder)`}
                >
                  Project link <span>(placeholder)</span>{' '}
                  <Icon name="external" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </Entrance>
    </section>
  );
}
