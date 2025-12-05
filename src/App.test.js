// src/App.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders without crashing', () => {
  render(<App />);
  expect(document.body).toBeInTheDocument();
});

// Opcional: uno más visible
test('Pokédex is alive', () => {
  render(<App />);
  expect(screen.getByText(/POKÉDEX DIGITAL/i)).toBeInTheDocument();
});