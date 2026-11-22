import Link from 'next/link';
import { listProjects } from '@/server/content';
import { ProjectCard } from '@/components/content/project-card';
import { Entrance } from '@/components/ui/entrance';

export async function FeaturedProjects() {
  const projects = await listProjects().catch(() => null);
  const featured =
    projects?.filter(({ featured }) => featured).slice(0, 3) ?? [];
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
          <p>Case studies with implementation details and lessons learned.</p>
        </div>
        {projects === null && (
          <p>Featured projects are temporarily unavailable.</p>
        )}
      </Entrance>
      <Entrance className="project-grid" stagger>
        {featured.map((project) => (
          <ProjectCard
            key={project.slug}
            project={project}
            showFeatured={false}
          />
        ))}
      </Entrance>
      <Link
        className="project-link gallery-link"
        href="/projects"
        prefetch={false}
      >
        View project gallery
      </Link>
    </section>
  );
}
