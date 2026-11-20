import PropTypes from 'prop-types';
import Container from '@/components/ui/Container';

export default function PageBanner({ eyebrow, title, description, children }) {
  return (
    <section className="relative overflow-hidden bg-ink pt-24 pb-16 md:py-24 text-white border-b border-border-dark">
      {/* Subtle luxury ambient glow */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
        aria-hidden="true"
      />

      <Container className="relative z-10 text-center">
        {eyebrow && (
          <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-3">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl tracking-wider text-white uppercase leading-tight">
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-on-dark-muted font-normal leading-relaxed">
            {description}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </Container>
    </section>
  );
}

PageBanner.propTypes = {
  eyebrow: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  children: PropTypes.node,
};
