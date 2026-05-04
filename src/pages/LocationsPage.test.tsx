import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import LocationsPage from './LocationsPage';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity },
    },
  });
}

function renderPage() {
  const queryClient = createTestQueryClient();
  queryClient.setQueryData(['locations'], []);
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <LocationsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('LocationsPage', () => {
  it('renders header and add button', () => {
    renderPage();
    expect(screen.getByText('Кабинеты')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /добавить/i })).toBeInTheDocument();
  });
});
