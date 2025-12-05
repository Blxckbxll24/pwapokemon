// src/App.test.jsx  (o .js, da igual el nombre)
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

// Mock del API de notificaciones (importantísimo en CI)
Object.defineProperty(window, 'Notification', {
  value: { permission: 'default', requestPermission: jest.fn() },
  writable: true,
});

// Mock de fetch para que siempre devuelva sólo Bulbasaur
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({
      results: [{ name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' }]
    }),
  })
).mockImplementationOnce(() =>
  Promise.resolve({
    json: () => Promise.resolve({
    name: 'bulbasaur',
    sprites: { other: { 'official-artwork': { front_default: 'https://...' } } },
    types: [{ type: { name: 'grass' } }],
    height: 7,
    weight: 69,
    abilities: [{ ability: { name: 'overgrow' } }],
    stats: [
      { base_stat: 45, stat: { name: 'hp' } },
      { base_stat: 49, stat: { name: 'attack' } },
      // ... puedes poner más o menos
    ]
  }))
);

describe('Pokédex PWA', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders title', () => {
    render(<App />);
    expect(screen.getByText(/POKÉDEX DIGITAL/i)).toBeInTheDocument();
  });

  it('loads and displays at least one Pokémon', async () => {
    render(<App />);
    expect(await screen.findByText('bulbasaur')).toBeInTheDocument();
  });

  it('filters Pokémon by search', async () => {
    render(<App />);
    await screen.findByText('bulbasaur');

    const input = screen.getByPlaceholderText(/Busca tu Pokémon favorito/i);
    fireEvent.change(input, { target: { value: 'bulb' } });

    expect(screen.getByText('bulbasaur')).toBeInTheDocument();
    expect(screen.queryByText('ivysaur')).not.toBeInTheDocument();
  });

  it('shows Pokémon details when clicked', async () => {
    render(<App />);
    const card = await screen.findByText('bulbasaur');
    fireEvent.click(card.parentElement);

    expect(screen.getByText('overgrow')).toBeInTheDocument();
  });
});