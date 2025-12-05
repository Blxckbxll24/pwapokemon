import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [pokemons, setPokemons] = useState([])
  const [loading, setLoading] = useState(true)
  const [notificationPermission, setNotificationPermission] = useState('default')

  useEffect(() => {
    fetchPokemons()
    checkNotificationPermission()
  }, [])

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
    }
  }

  const fetchPokemons = async () => {
    try {
      const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=30')
      const data = await response.json()
      
      const pokemonDetails = await Promise.all(
        data.results.map(async (pokemon) => {
          const detailResponse = await fetch(pokemon.url)
          const detail = await detailResponse.json()
          return {
            id: detail.id,
            name: detail.name,
            image: detail.sprites.other['official-artwork'].front_default || detail.sprites.front_default
          }
        })
      )
      
      setPokemons(pokemonDetails)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching pokemons:', error)
      setLoading(false)
    }
  }

  const handlePokemonClick = async (pokemon) => {
    if (!('Notification' in window)) {
      console.log('Este navegador no soporta notificaciones')
      return
    }

    if (Notification.permission === 'granted') {
      showNotification(pokemon.name)
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
      if (permission === 'granted') {
        showNotification(pokemon.name)
      }
    }
  }

  const showNotification = (pokemonName) => {
    new Notification(`Has seleccionado a ${pokemonName}`, {
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png'
    })
  }

  if (loading) {
    return <div className="loading">Cargando Pokémon...</div>
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎮 PokePWA</h1>
        <p>Progressive Web App con {pokemons.length} Pokémon</p>
      </header>
      
      <div className="pokemon-grid">
        {pokemons.map((pokemon) => (
          <div 
            key={pokemon.id} 
            className="pokemon-card"
            onClick={() => handlePokemonClick(pokemon)}
          >
            <img src={pokemon.image} alt={pokemon.name} />
            <h3>{pokemon.name}</h3>
            <span className="pokemon-id">#{pokemon.id}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
