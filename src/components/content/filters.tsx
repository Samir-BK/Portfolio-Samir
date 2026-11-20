import Link from 'next/link';

type Facet = {
  name: string;
  label: string;
  selected: string;
  options: readonly { value: string; label: string }[];
};

export function Filters({
  action,
  fields,
}: {
  action: '/projects' | '/blog';
  fields: readonly Facet[];
}) {
  const isFiltered = fields.some(({ selected }) => Boolean(selected));

  return (
    <form
      className="content-filters"
      action={action}
      method="get"
      aria-label="Filter results"
    >
      {fields.map(({ name, label, selected, options }) => (
        <label key={name}>
          {label}
          <select name={name} defaultValue={selected}>
            <option value="">All</option>
            {selected && !options.some(({ value }) => value === selected) && (
              <option value={selected}>Unavailable filter</option>
            )}
            {options.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      ))}
      <button type="submit" className="button button--primary">
        Apply filters
      </button>
      {isFiltered && (
        <Link className="project-link" href={action}>
          Clear filters
        </Link>
      )}
    </form>
  );
}

export function EmptyResults({
  href,
  message,
}: {
  href: '/projects' | '/blog';
  message: string;
}) {
  return (
    <div className="empty-results">
      <p>{message}</p>
      <Link href={href} className="project-link">
        See all results
      </Link>
    </div>
  );
}
