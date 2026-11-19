import { Button, ButtonLink } from '@/components/button';

const colors = [
  { label: 'Background', token: '--background', sample: 'bg-background' },
  { label: 'Surface', token: '--surface', sample: 'bg-surface' },
  {
    label: 'Raised surface',
    token: '--surface-raised',
    sample: 'bg-surface-raised',
  },
  { label: 'Primary text', token: '--text-primary', sample: 'bg-primary' },
  {
    label: 'Secondary text',
    token: '--text-secondary',
    sample: 'bg-secondary',
  },
  { label: 'Accent', token: '--accent', sample: 'bg-accent' },
  { label: 'Border', token: '--border', sample: 'bg-border' },
  { label: 'Focus ring', token: '--focus-ring', sample: 'bg-focus' },
];

export default function FoundationPage() {
  return (
    <>
      <header className="foundation-header">
        <h1>Design foundation</h1>
        <p className="intro text-secondary">
          Typography, color, and interaction states for the portfolio. The theme
          follows your system preference.
        </p>
      </header>

      <div className="sample-grid">
        <section
          className="panel"
          id="typography"
          aria-labelledby="typography-title"
          tabIndex={-1}
        >
          <h2 className="panel-title" id="typography-title">
            Typography
          </h2>
          <dl className="type-samples">
            <div>
              <dt className="sample-label">Display</dt>
              <dd className="type-display">Build with intent.</dd>
            </div>
            <div>
              <dt className="sample-label">Heading</dt>
              <dd className="type-heading">Project heading</dd>
            </div>
            <div>
              <dt className="sample-label">Body</dt>
              <dd className="type-body">
                Readable text for case studies and technical writing.
              </dd>
            </div>
            <div>
              <dt className="sample-label">Monospace</dt>
              <dd className="font-mono text-secondary">
                const theme = &apos;system&apos;;
              </dd>
            </div>
          </dl>
        </section>

        <section
          className="panel"
          id="colors"
          aria-labelledby="colors-title"
          tabIndex={-1}
        >
          <h2 className="panel-title" id="colors-title">
            Color tokens
          </h2>
          <ul className="swatch-grid">
            {colors.map(({ label, token, sample }) => (
              <li key={token} className="swatch">
                <span
                  aria-hidden="true"
                  className={`swatch-sample ${sample}`}
                />
                <span>{label}</span>
                <code className="font-mono text-secondary">{token}</code>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel controls" aria-labelledby="controls-title">
          <div>
            <h2 className="panel-title" id="controls-title">
              Buttons and focus
            </h2>
            <p className="text-secondary">
              Press <kbd>Tab</kbd> to see the focus ring. The links jump to
              their samples.
            </p>
          </div>
          <div className="button-row">
            <ButtonLink href="#typography">View typography</ButtonLink>
            <ButtonLink href="#colors" variant="secondary">
              View colors
            </ButtonLink>
            <Button variant="secondary" disabled>
              Disabled
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
