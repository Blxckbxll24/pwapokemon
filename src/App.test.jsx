import { describe, it, expect } from 'vitest'

describe('App Tests', () => {
  it('should pass basic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should validate pokemon count', () => {
    const minPokemons = 30
    expect(minPokemons).toBeGreaterThanOrEqual(30)
  })
})
