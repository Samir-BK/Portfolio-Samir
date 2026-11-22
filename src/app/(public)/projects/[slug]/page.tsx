import { Entrance } from '@/components/ui/entrance';
import Image from 'next/image';
import Link from 'next/link';
import { ContentHeading, ContentPage } from '@/components/content/content-page';
import {
  ProjectArtwork,
  ProjectCard,
  ProjectLinks,
} from '@/components/content/project-card';
import { relatedProjects } from '@/server/content';
import { pageMetadata } from '@/server/metadata';
import { requireProject } from '@/server/published-route';

type RouteProps = { params: Promise<{ slug: string }> };

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: RouteProps) {
  const project = await requireProject((await params).slug);
  return pageMetadata({
    title: project.isDemo
      ? `${project.title} (synthetic concept)`
      : project.title,
    description: project.summary,
    path: `/projects/${project.slug}`,
  });
}

export default async function ProjectPage({ params }: RouteProps) {
  const project = await requireProject((await params).slug);
  const related = await relatedProjects(project);
  const sections = [
    ['Project overview', project.overview],
    ['Problem statement', project.problem],
    ['Implementation approach', project.approach],
    ['Technical decisions', project.decisions],
    ['Challenges and solutions', project.challenges],
    ['Results and lessons', project.lessons],
  ].filter(([, text]) => text.trim());

  return (
    <ContentPage area="projects">
      <Link
        className="project-link content-back"
        href="/projects"
        prefetch={false}
      >
        ← Project gallery
      </Link>
      <article>
        <ContentHeading
          path={project.isDemo ? 'Synthetic case study' : 'Case study'}
          title={project.title}
          summary={project.summary}
        >
          <ul className="badge-list" aria-label="Technologies used">
            {project.technologies.map((technology) => (
              <li key={technology}>{technology}</li>
            ))}
          </ul>
          <ProjectLinks project={project} />
        </ContentHeading>
        {project.media?.length ? (
          <div className="case-media">
            {project.media.map((media) => (
              <Image
                key={media.src}
                src={media.src}
                width={media.width}
                height={media.height}
                alt={media.alt}
                sizes="(min-width: 76rem) 68rem, 100vw"
              />
            ))}
          </div>
        ) : (
          <figure className="case-visual">
            <ProjectArtwork project={project} />
            <figcaption>
              {project.isDemo
                ? 'Illustrative interface concept'
                : 'Project illustration'}
            </figcaption>
          </figure>
        )}
        <div className="article-prose">
          {sections.map(([title, text]) => (
            <section key={title}>
              <h2>{title}</h2>
              <p>{text}</p>
            </section>
          ))}
        </div>
      </article>
      {related.length > 0 && (
        <section className="content-related" aria-labelledby="related-projects">
          <h2 id="related-projects">Related projects</h2>
          <Entrance className="project-grid" stagger>
            {related.map((entry) => (
              <ProjectCard
                key={entry.slug}
                project={entry}
                showFeatured={false}
              />
            ))}
          </Entrance>
        </section>
      )}
    </ContentPage>
  );
}
