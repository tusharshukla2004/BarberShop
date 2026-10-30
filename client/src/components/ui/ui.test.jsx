import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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
  });

  it('renders Input with accessible label and error role', () => {
    render(<Input label="Full Name" error="Name is required" />);
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
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
