import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [pokemon, setPokemon] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPokemon, setSelectedPokemon] = useState(null);

  useEffect(() => {
    fetchPokemon();
  }, []); // Solo cargar una vez

  // Función separada para cargar datos de Pokémon
  const fetchPokemonData = async () => {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
    const data = await response.json();
    
    // Cargar Pokémon en lotes para mejor rendimiento
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
      
      const validBatch = batchDetails.filter(p => p !== null);
      allPokemon.push(...validBatch);
    }
    
    return allPokemon;
  };

  const fetchPokemon = async () => {
    setLoading(true);
    try {
      console.log('🚀 Iniciando carga de Pokémon...');
      
      // PRIMERO: Intentar cargar desde localStorage SIEMPRE
      const cachedData = localStorage.getItem('pokepwa-pokemon-cache');
      const cacheTime = localStorage.getItem('pokepwa-cache-time');
      
      if (cachedData) {
        try {
          const parsedPokemon = JSON.parse(cachedData);
          console.log('✅ Cache encontrado:', parsedPokemon.length, 'Pokémon');
          
          // Mostrar datos del cache INMEDIATAMENTE
          setPokemon(parsedPokemon);
          setLoading(false);
          
          // Si no hay conexión, terminar aquí
          if (!navigator.onLine) {
            console.log('📱 MODO OFFLINE - Usando cache guardado');
            return;
          }
          
          // Si hay conexión, continuar cargando en background para actualizar
          console.log('🔄 Actualizando datos en background...');
        } catch (error) {
          console.error('❌ Error parseando cache:', error);
          localStorage.removeItem('pokepwa-pokemon-cache');
          localStorage.removeItem('pokepwa-cache-time');
        }
      }
      
      // SEGUNDO: Si no hay cache O hay conexión, cargar desde API
      if (!navigator.onLine && !cachedData) {
        console.log('❌ Sin conexión y sin cache disponible');
        setPokemon([]);
        setLoading(false);
        return;
      }
      
      if (cachedPokemon && cacheTimestamp) {
        try {
          const parsedPokemon = JSON.parse(cachedPokemon);
          const cacheAge = Date.now() - parseInt(cacheTimestamp);
          
          // Si no hay conexión O el cache es válido, usar cache
          if (!isOnline || cacheAge < thirtyDays) {
            console.log('🎯 Cargando desde cache local...', {
              pokemonCount: parsedPokemon.length,
              cacheAge: Math.round(cacheAge / (1000 * 60 * 60)) + ' horas',
              offline: !isOnline,
              reason: !isOnline ? 'Sin conexión' : 'Cache válido'
            });
            setPokemon(parsedPokemon);
            setLoading(false);
            
            // Si estamos online y el cache es muy viejo, actualizar en background
            if (isOnline && cacheAge > 24 * 60 * 60 * 1000) { // 1 día
              console.log('📡 Actualizando cache en background...');
              fetchPokemonData().then(newData => {
                if (newData && newData.length > 0) {
                  setPokemon(newData);
                }
              }).catch(console.error);
            }
            
            return;
          }
        } catch (error) {
          console.error('Error parseando cache local:', error);
          // Limpiar cache corrupto
          localStorage.removeItem('pokepwa-pokemon-data');
          localStorage.removeItem('pokepwa-pokemon-timestamp');
        }
      }
      
      // Si no hay cache válido y no hay conexión, mostrar error
      if (!isOnline) {
        console.log('❌ Sin conexión y sin cache disponible');
        setLoading(false);
        setPokemon([]);
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
      
      // Guardar en cache GARANTIZADO
      try {
        localStorage.setItem('pokepwa-pokemon-cache', JSON.stringify(allPokemon));
        localStorage.setItem('pokepwa-cache-time', Date.now().toString());
        console.log(`✅ Cache guardado EXITOSAMENTE: ${allPokemon.length} Pokémon`);
      } catch (cacheError) {
        console.error('❌ Error guardando en cache:', cacheError);
        
        // Si falla, limpiar espacio y intentar con datos reducidos
        try {
          // Limpiar caches antiguos
          localStorage.removeItem('pokemonCache');
          localStorage.removeItem('pokemonCacheTimestamp');
          localStorage.removeItem('pokepwa-pokemon-data');
          localStorage.removeItem('pokepwa-pokemon-timestamp');
          
          // Intentar guardar de nuevo
          localStorage.setItem('pokepwa-pokemon-cache', JSON.stringify(allPokemon));
          localStorage.setItem('pokepwa-cache-time', Date.now().toString());
          console.log('✅ Cache guardado después de limpiar espacio');
        } catch (retryError) {
          console.error('❌ Error crítico guardando cache:', retryError);
          
          // Como último recurso, guardar solo los primeros 500
          try {
            const reducedData = allPokemon.slice(0, 500);
            localStorage.setItem('pokepwa-pokemon-cache', JSON.stringify(reducedData));
            localStorage.setItem('pokepwa-cache-time', Date.now().toString());
            console.log(`⚠️ Cache reducido guardado: ${reducedData.length} Pokémon`);
          } catch (finalError) {
            console.error('💥 Error final guardando cache:', finalError);
          }
        }
      }
      
      console.log(`🎉 ¡Cargados ${allPokemon.length} Pokémon exitosamente!`);
    } catch (error) {
      console.error('❌ Error fetching Pokémon:', error);
      // Intentar cargar desde cache si hay error de red
      const cachedPokemon = localStorage.getItem('pokepwa-pokemon-cache');
      if (cachedPokemon) {
        try {
          const parsedPokemon = JSON.parse(cachedPokemon);
          setPokemon(parsedPokemon);
          console.log('📦 Cargado desde cache local debido a error de red:', parsedPokemon.length);
        } catch (parseError) {
          console.error('Error parseando cache:', parseError);
          localStorage.removeItem('pokepwa-pokemon-cache');
          localStorage.removeItem('pokepwa-cache-time');
        }
      } else {
        // Si no hay cache, mostrar mensaje offline
        setPokemon([]);
        console.log('💔 Sin datos y sin conexión');
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
          <h2>🔴 CAPTURANDO POKÉMON ⚡</h2>
          <p>🎯 {pokemon.length} de 1000 Pokémon capturados...</p>
          <div className="loading-bar">
            <div className="loading-progress" style={{width: `${(pokemon.length / 1000) * 100}%`}}></div>
          </div>
          <p style={{fontSize: '1rem', marginTop: '20px', opacity: 0.8}}>
            🌟 ¡Preparando tu Pokédex personalizada!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>⚡ POKÉDEX DIGITAL ⚡</h1>
        <p className="pokemon-count">🎯 {pokemon.length} POKÉMON REGISTRADOS</p>
        <div className="search-container">
          <input
            type="text"
            placeholder="🔍 Busca tu Pokémon favorito..."
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
