import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import NeonBadge from '../NeonBadge';

describe('NeonBadge', () => {
  it('renders correctly with default props', () => {
    render(<NeonBadge>Premium</NeonBadge>);
    const badge = screen.getByText('Premium');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('text-emerald-400');
  });

  it('applies custom variant classes', () => {
    render(<NeonBadge variant="amber">VIP</NeonBadge>);
    const badge = screen.getByText('VIP');
    expect(badge).toHaveClass('text-amber-400');
  });
});
