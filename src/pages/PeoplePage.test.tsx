import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import PeoplePage from './PeoplePage';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity },
    },
  });
}

function renderPage() {
  const queryClient = createTestQueryClient();
  queryClient.setQueryData(['people'], []);
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <PeoplePage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('PeoplePage', () => {
  it('renders header and add button', () => {
    renderPage();
    expect(screen.getByText('Ответственные')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /добавить/i })).toBeInTheDocument();
  });
});
