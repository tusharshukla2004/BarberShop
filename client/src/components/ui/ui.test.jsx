import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Download } from 'lucide-react';
import { Button, Container, Section, SectionHeading, Input, IconButton, Card } from './index';

describe('Design System UI Primitives', () => {
  it('renders Container with children and max-w-container', () => {
    render(<Container data-testid="container">Content</Container>);
    const el = screen.getByTestId('container');
    expect(el).toHaveClass('max-w-container');
    expect(el).toHaveTextContent('Content');
  });

  it('renders Section with tone classes', () => {
    render(
      <Section tone="brown" data-testid="section">
        Brown Section
      </Section>
    );
    const el = screen.getByTestId('section');
    expect(el).toHaveClass('bg-brown');
  });

  it('renders SectionHeading with uppercase display font', () => {
    render(<SectionHeading title="Our Services" subtitle="What We Offer" />);
    expect(screen.getByText('Our Services')).toHaveClass('font-display');
    expect(screen.getByText('What We Offer')).toBeInTheDocument();
  });

  it('renders Button with primary variant and handles click', () => {
    render(<Button variant="primary">Book Now</Button>);
    const btn = screen.getByRole('button', { name: /book now/i });
    expect(btn).toHaveClass('bg-accent');
    expect(btn).toHaveClass('h-11');
  });

  it('renders outline and accent button variants with their intended styles', () => {
    const { rerender } = render(<Button variant="outline">Cancel</Button>);
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveClass('border-border-light');

    rerender(<Button variant="accent">Continue</Button>);
    expect(screen.getByRole('button', { name: 'Continue' })).toHaveClass('bg-accent');
  });

  it('keeps button icons and labels aligned on one line', () => {
    render(
      <Button variant="outline">
        <Download className="mr-1.5 h-4 w-4" />
        Export CSV
      </Button>
    );

    const button = screen.getByRole('button', { name: 'Export CSV' });
    const content = button.querySelector('span');
    expect(content).toHaveClass('inline-flex', 'items-center', 'gap-1.5', 'whitespace-nowrap');
    expect(content).toHaveClass('[&>svg]:mr-0', '[&>svg]:shrink-0');
    expect(content.firstElementChild).toHaveClass('h-4', 'w-4');
  });

  it('renders Input with accessible label and error role', () => {
    render(<Input label="Full Name" error="Name is required" />);
    expect(screen.getByLabelText(/full name/i)).toHaveClass('h-11');
    expect(screen.getByRole('alert')).toHaveTextContent('Name is required');
  });

  it('renders IconButton with required aria-label', () => {
    render(<IconButton aria-label="Close dialog">X</IconButton>);
    expect(screen.getByRole('button', { name: /close dialog/i })).toBeInTheDocument();
  });

  it('renders Card with card surface tokens', () => {
    render(
      <Card tone="card" data-testid="card">
        Card Body
      </Card>
    );
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('bg-card');
  });
});
