// src/App.test.js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

// Mock de fetch para que la carga sea instantánea
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ results: [], count: 0 }),
  })
);

test('renders without crashing', () => {
  render(<App />);
  expect(document.body).toBeInTheDocument();
});

test('Pokédex is alive - shows title after loading', async () => {
  render(<App />);

  // Opción 1: Espera a que aparezca el título real
  await waitFor(() => {
    expect(screen.getByText(/POKÉDEX DIGITAL/i)).toBeInTheDocument();
  });

  // Opcional: también puedes verificar que ya no está loading
  expect(screen.queryByText(/CAPTURANDO POKÉMON/i)).not.toBeInTheDocument();
});