import Image from 'next/image';
import Link from 'next/link';
import type { PublishedProject } from '@/content/projects';
import { httpUrl } from '@/lib/urls';
import { Icon } from '@/components/ui/icon';

export function ProjectArtwork({
  visual,
}: {
  visual: PublishedProject['visual'];
}) {
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

export function ProjectLinks({ project }: { project: PublishedProject }) {
  const links = [
    { label: 'GitHub', url: httpUrl(project.repositoryUrl) },
    { label: 'Live demo', url: httpUrl(project.demoUrl) },
  ].filter(({ url }) => url !== undefined);
  if (!links.length) return null;

  return (
    <ul className="content-links" aria-label="External project links">
      {links.map(({ label, url }) => (
        <li key={label}>
          <a className="project-link" href={url?.href}>
            {label} <Icon name="external" />
          </a>
        </li>
      ))}
    </ul>
  );
}

export function ProjectCard({
  project,
  showFeatured = true,
}: {
  project: PublishedProject;
  showFeatured?: boolean;
}) {
  const media = project.media?.[0];

  return (
    <article className="project-card">
      {media ? (
        <Image
          src={media.src}
          width={media.width}
          height={media.height}
          alt={media.alt}
          className="project-thumbnail"
          sizes="(min-width: 52rem) 33vw, 100vw"
        />
      ) : (
        <ProjectArtwork visual={project.visual} />
      )}
      <div className="project-content">
        <div className="project-card-labels">
          <p className="meta-label">{project.category}</p>
          {project.isDemo && (
            <span className="meta-label">Synthetic concept</span>
          )}
          {showFeatured && project.featured && (
            <span className="featured-label">Featured</span>
          )}
        </div>
        <h3>{project.title}</h3>
        <p className="project-description">{project.summary}</p>
        <ul className="badge-list" aria-label="Concept technologies">
          {project.technologies.map((technology) => (
            <li key={technology}>{technology}</li>
          ))}
        </ul>
        <Link
          href={`/projects/${project.slug}`}
          prefetch={false}
          className="project-link"
          aria-label={`View case study: ${project.title}`}
        >
          View case study <Icon name="arrow" />
        </Link>
        <ProjectLinks project={project} />
      </div>
    </article>
  );
}
