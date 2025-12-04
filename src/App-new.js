import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [pokemon, setPokemon] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchPokemon();
  }, []); // Solo cargar una vez

  const fetchPokemon = async () => {
    setLoading(true);
    try {
      console.log('Cargando los primeros 1000 Pokémon...');
      
      // Verificar si hay datos en cache
      const cachedPokemon = localStorage.getItem('pokemonCache');
      const cacheTimestamp = localStorage.getItem('pokemonCacheTimestamp');
      const oneDay = 24 * 60 * 60 * 1000; // 24 horas en ms
      
      if (cachedPokemon && cacheTimestamp && (Date.now() - parseInt(cacheTimestamp)) < oneDay) {
        console.log('Cargando desde cache local...');
        setPokemon(JSON.parse(cachedPokemon));
        setLoading(false);
        return;
      }

      const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
      const data = await response.json();
      
      // Cargar Pokémon en lotes para mejorar rendimiento
      const batchSize = 50;
      const allPokemon = [];
      
      for (let i = 0; i < data.results.length; i += batchSize) {
        const batch = data.results.slice(i, i + batchSize);
        console.log(`Cargando lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(data.results.length/batchSize)}...`);
        
        const batchDetails = await Promise.all(
          batch.map(async (poke) => {
            try {
              const detailResponse = await fetch(poke.url);
              const detail = await detailResponse.json();
              
              return {
                id: detail.id,
                name: detail.name,
                image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${detail.id}.png`,
                types: detail.types.map(type => type.type.name),
                height: detail.height,
                weight: detail.weight,
                abilities: detail.abilities.map(ability => ability.ability.name),
                stats: detail.stats.map(stat => ({
                  name: stat.stat.name,
                  value: stat.base_stat
                })),
                baseExperience: detail.base_experience || 0
              };
            } catch (error) {
              console.error(`Error cargando Pokémon ${poke.name}:`, error);
              return null;
            }
          })
        );
        
        // Filtrar Pokémon válidos y agregarlos al array principal
        const validBatch = batchDetails.filter(p => p !== null);
        allPokemon.push(...validBatch);
        
        // Actualizar estado parcialmente para mostrar progreso
        setPokemon([...allPokemon]);
      }
      
      // Guardar en cache
      localStorage.setItem('pokemonCache', JSON.stringify(allPokemon));
      localStorage.setItem('pokemonCacheTimestamp', Date.now().toString());
      
      console.log(`¡Cargados ${allPokemon.length} Pokémon exitosamente!`);
    } catch (error) {
      console.error('Error fetching Pokémon:', error);
      // Intentar cargar desde cache si hay error de red
      const cachedPokemon = localStorage.getItem('pokemonCache');
      if (cachedPokemon) {
        setPokemon(JSON.parse(cachedPokemon));
        console.log('Cargado desde cache local debido a error de red');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePokemonClick = async (pokemonData) => {
    setSelectedPokemon(pokemonData);
  };

  const closePokemonDetails = () => {
    setSelectedPokemon(null);
  };

  const filteredPokemon = pokemon.filter(poke =>
    poke.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="App">
        <div className="loading">
          <h2>Cargando Pokémon... ⚡</h2>
          <p>Se están cargando {pokemon.length} Pokémon hasta ahora...</p>
          <div className="loading-bar">
            <div className="loading-progress" style={{width: `${(pokemon.length / 1000) * 100}%`}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>🔴 PokePWA - Tu Pokédex Progresiva</h1>
        <p className="pokemon-count">🎯 {pokemon.length} Pokémon cargados</p>
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar Pokémon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </header>

      <main className="pokemon-container">
        {filteredPokemon.map((poke) => (
          <div 
            key={poke.id} 
            className="pokemon-card"
            onClick={() => handlePokemonClick(poke)}
          >
            <div className="pokemon-number">#{poke.id.toString().padStart(3, '0')}</div>
            <img 
              src={poke.image} 
              alt={poke.name}
              className="pokemon-image"
              onError={(e) => {
                e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.id}.png`;
              }}
            />
            <h3 className="pokemon-name">{poke.name}</h3>
            
            <div className="pokemon-types">
              {poke.types.map((type, index) => (
                <span key={index} className={`type type-${type}`}>
                  {type}
                </span>
              ))}
            </div>

            <div className="pokemon-quick-info">
              <span className="quick-stat">⚡ {poke.abilities.length} habilidades</span>
              <span className="quick-stat">🎯 Click para ver más</span>
            </div>
          </div>
        ))}
      </main>

      {/* Modal de detalles del Pokémon */}
      {selectedPokemon && (
        <div className="pokemon-modal-overlay" onClick={closePokemonDetails}>
          <div className="pokemon-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closePokemonDetails}>✕</button>
            
            <div className="modal-header">
              <div className="modal-pokemon-number">#{selectedPokemon.id.toString().padStart(3, '0')}</div>
              <img 
                src={selectedPokemon.image} 
                alt={selectedPokemon.name}
                className="modal-pokemon-image"
              />
              <h2 className="modal-pokemon-name">{selectedPokemon.name}</h2>
              
              <div className="modal-pokemon-types">
                {selectedPokemon.types.map((type, index) => (
                  <span key={index} className={`type type-${type}`}>
                    {type}
                  </span>
                ))}
              </div>
            </div>

            <div className="modal-content">
              <div className="modal-section">
                <h3>📏 Información Física</h3>
                <div className="physical-info">
                  <div className="info-item">
                    <span className="info-label">Altura:</span>
                    <span className="info-value">{(selectedPokemon.height / 10).toFixed(1)}m</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Peso:</span>
                    <span className="info-value">{(selectedPokemon.weight / 10).toFixed(1)}kg</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Exp. Base:</span>
                    <span className="info-value">{selectedPokemon.baseExperience}</span>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h3>🎯 Habilidades</h3>
                <div className="abilities-grid">
                  {selectedPokemon.abilities.map((ability, index) => (
                    <div key={index} className="ability-card">
                      {ability.replace('-', ' ')}
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-section">
                <h3>📊 Estadísticas Base</h3>
                <div className="stats-grid">
                  {selectedPokemon.stats.map((stat, index) => (
                    <div key={index} className="stat-row">
                      <span className="stat-name">{stat.name.replace('-', ' ')}</span>
                      <div className="stat-bar">
                        <div 
                          className="stat-fill" 
                          style={{width: `${Math.min((stat.value / 200) * 100, 100)}%`}}
                        ></div>
                      </div>
                      <span className="stat-value">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="app-footer">
        <p>🔥 Mostrando {filteredPokemon.length} de {pokemon.length} Pokémon</p>
        <p>📱 Funciona sin conexión gracias a PWA</p>
      </footer>
    </div>
  );
}

export default App;
