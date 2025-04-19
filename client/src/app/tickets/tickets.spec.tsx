import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Tickets from './tickets';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Mock users
const mockUsers = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];

// Mock ticket data
const mockTickets = [
  { id: 1, description: 'Fix bug A', completed: false, assigneeId: 1 },
  { id: 2, description: 'Implement feature B', completed: true, assigneeId: 2 },
];

// Mock fetch
global.fetch = jest.fn((url, options) => {
  if (url === '/api/tickets' && !options) {
    return Promise.resolve({
      json: () => Promise.resolve(mockTickets),
    });
  }

  if (url === '/api/tickets' && options?.method === 'POST') {
    const body = JSON.parse(options.body);
    return Promise.resolve({
      json: () => Promise.resolve({ id: 3, description: body.description, completed: false, assigneeId: null }),
    });
  }

  return Promise.resolve({
    json: () => Promise.resolve([]),
  });
}) as jest.Mock;

const renderTickets = () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<Tickets users={mockUsers} />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('Tickets Component', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('fetches and displays tickets', async () => {
    renderTickets();

    expect(await screen.findByText('Fix bug A')).toBeInTheDocument();
    expect(await screen.findByText('Implement feature B')).toBeInTheDocument();
  });

  it('can filter completed tickets', async () => {
    renderTickets();

    await screen.findByText('Fix bug A');

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'completed' } });

    await waitFor(() => {
      expect(screen.queryByText('Fix bug A')).not.toBeInTheDocument();
      expect(screen.getByText('Implement feature B')).toBeInTheDocument();
    });
  });

  it('can filter incomplete tickets', async () => {
    renderTickets();

    await screen.findByText('Fix bug A');

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'incomplete' } });

    await waitFor(() => {
      expect(screen.getByText('Fix bug A')).toBeInTheDocument();
      expect(screen.queryByText('Implement feature B')).not.toBeInTheDocument();
    });
  });

  it('can add a new ticket', async () => {
    renderTickets();

    await screen.findByText('Fix bug A');

    fireEvent.change(screen.getByPlaceholderText('Enter ticket description'), {
      target: { value: 'New ticket here' },
    });

    fireEvent.click(screen.getByText('Add'));

    await waitFor(() => {
      expect(screen.getByText('New ticket here')).toBeInTheDocument();
    });
  });

  it('does not submit if description is empty', async () => {
    renderTickets();

    await screen.findByText('Fix bug A');

    fireEvent.click(screen.getByText('Add'));

    // fetch should not be called with POST
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1); // only initial fetch
    });
  });
});
