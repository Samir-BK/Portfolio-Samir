import { Entrance } from '@/components/ui/entrance';
import { readFacet, type QueryValue } from '@/lib/content';
import { ContentHeading, ContentPage } from '@/components/content/content-page';
import { EmptyResults, Filters } from '@/components/content/filters';
import { ProjectCard } from '@/components/content/project-card';
import { projectGallery } from '@/server/content';
import { pageMetadata } from '@/server/metadata';

export const dynamic = 'force-dynamic';

const summary = 'Explore project case studies by technology and category.';
export const metadata = pageMetadata({
  title: 'Projects',
  description: summary,
  path: '/projects',
});

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, QueryValue>>;
}) {
  const query = await searchParams;
  const technology = readFacet(query.technology);
  const category = readFacet(query.category);
  const { technologies, categories, projects } = await projectGallery({
    technology,
    category,
  });

  return (
    <ContentPage area="projects">
      <ContentHeading path="~/projects" title="Projects" summary={summary} />
      <Filters
        action="/projects"
        fields={[
          {
            name: 'technology',
            label: 'Technology',
            selected: technology,
            options: technologies,
          },
          {
            name: 'category',
            label: 'Category',
            selected: category,
            options: categories,
          },
        ]}
      />
      <section aria-labelledby="project-results">
        <h2 id="project-results" className="result-count">
          {projects.length} {projects.length === 1 ? 'project' : 'projects'}
        </h2>
        {projects.length ? (
          <Entrance className="project-grid" stagger>
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </Entrance>
        ) : (
          <EmptyResults
            href="/projects"
            message="No projects match these filters."
          />
        )}
      </section>
    </ContentPage>
  );
}
