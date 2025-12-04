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
  }, [currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPokemon = async () => {
    setLoading(true);
    try {
      const offset = (currentPage - 1) * itemsPerPage;
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${itemsPerPage}&offset=${offset}`);
      const data = await response.json();
      
      // Obtener detalles de cada Pokémon para tener el ID y más información
      const pokemonDetails = await Promise.all(
        data.results.map(async (poke) => {
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
              abilities: detail.abilities.map(ability => ability.ability.name).slice(0, 2),
              stats: {
                hp: detail.stats[0].base_stat,
                attack: detail.stats[1].base_stat,
                defense: detail.stats[2].base_stat,
                speed: detail.stats[5].base_stat
              }
            };
          } catch (err) {
            console.error(`Error fetching details for ${poke.name}:`, err);
            return {
              id: Math.random(),
              name: poke.name,
              image: '',
              types: ['unknown'],
              height: 0,
              weight: 0,
              abilities: [],
              stats: { hp: 0, attack: 0, defense: 0, speed: 0 }
            };
          }
        })
      );
      
      setPokemon(pokemonDetails);
    } catch (error) {
      console.error('Error fetching Pokémon:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPokemon = pokemon.filter(poke =>
    poke.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const nextPage = () => {
    setCurrentPage(prev => prev + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="App">
        <div className="loading">
          <h2>Cargando Pokémon... ⚡</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>🔴 PokePWA - Tu Pokédex Progresiva</h1>
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
          <div key={poke.id} className="pokemon-card">
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
              {poke.types && poke.types.length > 0 ? (
                poke.types.map((type, index) => (
                  <span key={index} className={`type type-${type}`}>
                    {type}
                  </span>
                ))
              ) : (
                <span className="type type-unknown">unknown</span>
              )}
            </div>

            <div className="pokemon-stats">
              <div className="stat-row">
                <span className="stat-label">Altura:</span>
                <span className="stat-value">{(poke.height / 10).toFixed(1)}m</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Peso:</span>
                <span className="stat-value">{(poke.weight / 10).toFixed(1)}kg</span>
              </div>
            </div>

            {poke.abilities && poke.abilities.length > 0 && (
              <div className="pokemon-abilities">
                <span className="abilities-label">Habilidades:</span>
                <div className="abilities-list">
                  {poke.abilities.map((ability, index) => (
                    <span key={index} className="ability">
                      {ability}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pokemon-base-stats">
              <div className="base-stat">
                <span className="stat-name">HP</span>
                <span className="stat-bar">
                  <span 
                    className="stat-fill" 
                    style={{width: `${Math.min((poke.stats.hp / 200) * 100, 100)}%`}}
                  ></span>
                </span>
                <span className="stat-number">{poke.stats.hp}</span>
              </div>
              <div className="base-stat">
                <span className="stat-name">ATK</span>
                <span className="stat-bar">
                  <span 
                    className="stat-fill" 
                    style={{width: `${Math.min((poke.stats.attack / 200) * 100, 100)}%`}}
                  ></span>
                </span>
                <span className="stat-number">{poke.stats.attack}</span>
              </div>
              <div className="base-stat">
                <span className="stat-name">DEF</span>
                <span className="stat-bar">
                  <span 
                    className="stat-fill" 
                    style={{width: `${Math.min((poke.stats.defense / 200) * 100, 100)}%`}}
                  ></span>
                </span>
                <span className="stat-number">{poke.stats.defense}</span>
              </div>
              <div className="base-stat">
                <span className="stat-name">SPD</span>
                <span className="stat-bar">
                  <span 
                    className="stat-fill" 
                    style={{width: `${Math.min((poke.stats.speed / 200) * 100, 100)}%`}}
                  ></span>
                </span>
                <span className="stat-number">{poke.stats.speed}</span>
              </div>
            </div>
          </div>
        ))}
      </main>

      <div className="pagination">
        <button 
          onClick={prevPage} 
          disabled={currentPage === 1}
          className="page-btn"
        >
          ← Anterior
        </button>
        <span className="page-info">Página {currentPage}</span>
        <button 
          onClick={nextPage}
          className="page-btn"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}

export default App;
