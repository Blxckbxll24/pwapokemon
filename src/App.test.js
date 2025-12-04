import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock del NotificationManager
jest.mock('./NotificationManager', () => ({
  __esModule: true,
  default: {
    requestPermission: jest.fn().mockResolvedValue(true),
    showNotification: jest.fn(),
    checkMilestones: jest.fn(),
    schedulePeriodicNotifications: jest.fn()
  }
}));

// Mock de fetch para simular la API de Pokémon
global.fetch = jest.fn();

const mockPokemonData = {
  results: [
    { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
    { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
    { name: 'venusaur', url: 'https://pokeapi.co/api/v2/pokemon/3/' }
  ]
};

const mockPokemonDetails = {
  id: 1,
  name: 'bulbasaur',
  sprites: { front_default: 'https://example.com/bulbasaur.png' },
  types: [{ type: { name: 'grass' } }],
  abilities: [{ ability: { name: 'overgrow' } }],
  stats: [
    { base_stat: 45, stat: { name: 'hp' } },
    { base_stat: 49, stat: { name: 'attack' } }
  ],
  height: 7,
  weight: 69
};

describe('Pokédex PWA', () => {
  beforeEach(() => {
    // Reset mocks
    fetch.mockClear();

    // Mock inicial de la lista de Pokémon
    fetch.mockImplementation((url) => {
      if (url.includes('pokemon?limit=1000')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockPokemonData)
        });
      }
      if (url.includes('pokemon/1')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockPokemonDetails)
        });
      }
      return Promise.reject(new Error('URL no mockeada'));
    });
  });

  test('renders Pokédex title', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Pokédex PWA')).toBeInTheDocument();
    });
  });

  test('loads and displays Pokémon list', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('bulbasaur')).toBeInTheDocument();
      expect(screen.getByText('ivysaur')).toBeInTheDocument();
      expect(screen.getByText('venusaur')).toBeInTheDocument();
    });
  });

  test('shows Pokémon details when clicked', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('bulbasaur')).toBeInTheDocument();
    });

    // Hacer clic en el primer Pokémon
    const bulbasaurCard = screen.getByText('bulbasaur').closest('div');
    fireEvent.click(bulbasaurCard);

    await waitFor(() => {
      expect(screen.getByText('Bulbasaur')).toBeInTheDocument();
      expect(screen.getByText('overgrow')).toBeInTheDocument();
    });
  });

  test('filters Pokémon by search', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('bulbasaur')).toBeInTheDocument();
    });

    // Buscar "bulb"
    const searchInput = screen.getByPlaceholderText('Buscar Pokémon...');
    fireEvent.change(searchInput, { target: { value: 'bulb' } });

    await waitFor(() => {
      expect(screen.getByText('bulbasaur')).toBeInTheDocument();
      expect(screen.queryByText('ivysaur')).not.toBeInTheDocument();
    });
  });

  test('shows offline indicator', () => {
    // Simular estado offline
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true });

    render(<App />);

    expect(screen.getByText('📱 OFFLINE')).toBeInTheDocument();
  });

  test('shows online indicator', () => {
    // Simular estado online
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true });

    render(<App />);

    expect(screen.getByText('🌐 ONLINE')).toBeInTheDocument();
  });
});
