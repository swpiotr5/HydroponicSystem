// File: containers/Dashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Collapse } from 'react-bootstrap';
import logo from '../assets/logo.png';
import mutantImg from '../assets/420420.png';
import { Line } from 'react-chartjs-2';
import RippleEffect from '../components/RippleEffect';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

const LOADING_MESSAGES = [
  "🌱 Sprawdzam wzrost roślin...",
  "💧 Mierzę poziom wody...",
  "🌡️ Kontroluję temperaturę...",
  "⚗️ Analizuję pH...",
  "🔍 Sprawdzam stan systemu...",
  "📊 Przetwarzam dane...",
  "🧪 Badam jakość wody...",
  "🌿 Monitoruję stan upraw..."
];

const SPECIAL_COMMANDS = {
  'thuglife': () => document.body.classList.add('thug-life'),
  'matrix': () => document.body.classList.add('matrix-mode'),
  'disco': () => document.body.classList.add('disco-mode'),
  'barrel': () => document.body.classList.add('barrel-roll'),
  '420420': () => document.body.classList.add('plant-time'),
};

const Dashboard = ({ darkMode }) => {
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [showMutant, setShowMutant] = useState(false);
  const [openEditId, setOpenEditId] = useState(null);
  const [konamiSequence, setKonamiSequence] = useState([]);
  const [partyMode, setPartyMode] = useState(false);
  const [thugMode, setThugMode] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [matrixMode, setMatrixMode] = useState(false);
  const [coffeeCount, setCoffeeCount] = useState(0);
  const [duckMode, setDuckMode] = useState(false);
  const [asciiArt, setAsciiArt] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const [inputBuffer, setInputBuffer] = useState('');
  const [hoveredSystem, setHoveredSystem] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const token = localStorage.getItem('token');
  const api = axios.create({
    baseURL: 'http://localhost:8000',
    headers: { Authorization: `Bearer ${token}` },
  });

  const fetchSystems = async () => {
    setLoading(true);
    try {
      const res = await api.get('/systems/');
      setSystems(res.data.results || res.data);
      setError('');
    } catch (err) {
      setError('Błąd pobierania systemów. Sprawdź połączenie lub spróbuj ponownie.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSystems();
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      const newSequence = [...konamiSequence, e.key];
      if (newSequence.length > KONAMI_CODE.length) {
        newSequence.shift();
      }
      setKonamiSequence(newSequence);

      if (newSequence.join('') === KONAMI_CODE.join('')) {
        setPartyMode(true);
        document.body.classList.add('party-mode');
        setTimeout(() => {
          setPartyMode(false);
          document.body.classList.remove('party-mode');
        }, 10000);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [konamiSequence]);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingMessage(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  useEffect(() => {
    const handleTyping = (e) => {
      if (e.key === 'Enter') {
        const command = inputBuffer.toLowerCase().trim();
        if (SPECIAL_COMMANDS[command]) {
          SPECIAL_COMMANDS[command]();
          setTimeout(() => {
            document.body.classList.remove('thug-life', 'matrix-mode', 'disco-mode', 'barrel-roll', 'plant-time');
          }, 5000);
        }
        setInputBuffer('');
      } else if (e.key.length === 1) {
        setInputBuffer(prev => (prev + e.key).slice(-10));
      }
    };

    window.addEventListener('keydown', handleTyping);
    return () => window.removeEventListener('keydown', handleTyping);
  }, [inputBuffer]);

  const secretCommands = {
    'do a barrel roll': () => {
      document.body.style.transition = 'transform 1s';
      document.body.style.transform = 'rotate(360deg)';
      setTimeout(() => {
        document.body.style.transform = '';
        document.body.style.transition = '';
      }, 1000);
    },
    'matrix': () => setMatrixMode(true),
    'sudo make me a coffee': () => {
      setCoffeeCount(prev => {
        if (prev === 2) {
          setError("I'm a hydroponics system, not a coffee machine! ☕");
          return 0;
        }
        return prev + 1;
      });
    },
    'quack': () => setDuckMode(true),
    'ascii': () => setAsciiArt(true),
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    
    const command = name.toLowerCase();
    if (secretCommands[command]) {
      secretCommands[command]();
      setName('');
      return;
    }

    if (name === '420420') {
      setShowMutant(true);
      return;
    }
    if (name.toLowerCase() === 'thug life') {
      setThugMode(true);
      return;
    }
    if (name === '666') {
      document.documentElement.style.filter = 'invert(1)';
      setTimeout(() => document.documentElement.style.filter = '', 1000);
    }
    try {
      await api.post('/systems/', { name, location });
      setName('');
      setLocation('');
      fetchSystems();
    } catch (err) {
      setError('Nie udało się dodać systemu. Może rośliny strajkują? 🌱✊');
    }
  };

  const fetchMeasurements = async (systemId) => {
    try {
      const response = await fetch(`http://localhost:8000/systems/${systemId}/measurements/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setMeasurements(data.results);
      updateChartData(data.results);
    } catch (error) {
      setError('Nie udało się pobrać pomiarów');
    }
  };

  const updateChartData = (measurements) => {
    const chartData = {
      labels: measurements.map(m => new Date(m.timestamp).toLocaleTimeString()),
      datasets: [
        {
          label: 'pH',
          data: measurements.map(m => m.ph),
          borderColor: darkMode ? 'rgba(255, 99, 132, 1)' : 'rgba(75, 192, 192, 1)',
          tension: 0.4
        },
        {
          label: 'Temperatura (°C)',
          data: measurements.map(m => m.temperature),
          borderColor: darkMode ? 'rgba(54, 162, 235, 1)' : 'rgba(255, 159, 64, 1)',
          tension: 0.4
        },
        {
          label: 'TDS (ppm)',
          data: measurements.map(m => m.tds),
          borderColor: darkMode ? 'rgba(75, 192, 192, 1)' : 'rgba(153, 102, 255, 1)',
          tension: 0.4
        }
      ]
    };
    setChartData(chartData);
  };

    const handleEdit = (system) => {
    if (openEditId === system.id) {
        setOpenEditId(null);
        setSelectedSystem(null);
    } else {
        setOpenEditId(system.id);
        setEditId(system.id); 
        setEditName(system.name);
        setEditLocation(system.location);
        setSelectedSystem(system);
        fetchMeasurements(system.id);
    }
    };

const handleUpdate = async (e) => {
  e.preventDefault();
  try {
    await api.put(`/systems/${editId}/`, { name: editName, location: editLocation });
    setEditId(null);
    setEditName('');
    setEditLocation('');
    setOpenEditId(null);
    fetchSystems();
  } catch (err) {
    // Dodaj logowanie szczegółów błędu:
    if (err.response) {
      setError(`Błąd edycji systemu: ${err.response.status} ${JSON.stringify(err.response.data)}`);
    } else {
      setError('Błąd edycji systemu.');
    }
    console.error('Błąd edycji systemu:', err);
  }
};

  const handleDelete = async (id) => {
    if (!window.confirm('Na pewno usunąć system?')) return;
    try {
      await api.delete(`/systems/${id}/`);
      fetchSystems();
    } catch (err) {
      setError('Nie udało się usunąć systemu.');
    }
  };

  const handleLogoClick = () => {
    setClickCount(prev => {
      if (prev + 1 === 5) {
        document.body.style.fontFamily = 'Comic Sans MS';
        setTimeout(() => document.body.style.fontFamily = '', 3000);
        return 0;
      }
      return prev + 1;
    });
  };

  const getRandomEmoji = () => {
    const emojis = ['🌱', '🌿', '🍀', '🌵', '🎋', '🌳', '🌴', '🌸', '🍃'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

  const handleMouseEnter = (system, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left,
      y: rect.bottom + window.scrollY
    });
    setHoveredSystem(system);
  };

  const handleMouseLeave = () => {
    setHoveredSystem(null);
  };

  return (
    <>
      {showMutant && (
        <div className="modal fade show" style={{display:'block',background:'rgba(0,0,0,0.9)', zIndex:1050}} tabIndex="-1" role="dialog" onClick={()=>setShowMutant(false)}>
          <div className="modal-dialog modal-dialog-centered modal-lg" role="document" onClick={e=>e.stopPropagation()}>
            <div className="modal-content bg-black text-neon-green border border-success rounded-4 shadow-lg animate__animated animate__pulse animate__slower">
              <div className="modal-header border-0 d-flex justify-content-between align-items-center">
                <h5 className="modal-title fw-bold text-success">
                  👽 Mutant 420420 został aktywowany
                </h5>
                <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={()=>setShowMutant(false)}></button>
              </div>
              <div className="modal-body text-center">
                <img src={mutantImg} alt="mutant 420420" className="img-fluid rounded shadow" style={{ maxHeight: '400px' }} />
                <p className="mt-4 text-success-emphasis">"Nie pytaj ile pH... powiedz czego pragniesz."</p>
              </div>
              <div className="modal-footer border-0 d-flex justify-content-between">
                <small className="text-muted">🔬 Eksperyment BETA – Gen Z Grow Test Facility</small>
                <button className="btn btn-outline-light" onClick={()=>setShowMutant(false)}>Zamknij wizję 👁️</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className={`container-fluid container-lg py-5${darkMode ? ' bg-dark text-light' : ''}`}> 
        <RippleEffect darkMode={darkMode} />
        {matrixMode && (
          <div className="position-fixed top-0 start-0 w-100 h-100" style={{
            background: 'black',
            opacity: 0.1,
            zIndex: -1,
            overflow: 'hidden',
            fontSize: '10px',
            color: '#0F0',
          }}>
            {'Matrix digital rain...'}
          </div>
        )}

        <div className="text-center mb-5" onClick={handleLogoClick}>
          <h1 className="fw-bold text-success">
            {thugMode ? "🔥 Thug Hydroponics 4 Life 🔥" : "🌱 Panel zarządzania systemami hydroponicznymi"}
          </h1>
          <p className="text-muted">{thugMode ? "Straight Outta Growbox" : "Zarządzaj, monitoruj i rozwijaj swoje inteligentne ogrody wodne"}</p>
          {partyMode && <div className="position-fixed top-0 start-0 w-100 h-100" style={{background: 'linear-gradient(45deg, #ff0000, #00ff00, #0000ff, #ff0000)', opacity: 0.1, zIndex: -1, animation: 'gradient 5s ease infinite'}}></div>}
          {duckMode && <p className="mt-3">🦆 Quack quack! 🦆</p>}
          {asciiArt && (
            <pre className="text-success" style={{fontSize: '8px', lineHeight: '8px'}}>
              {`
                    .---.
                   /     \\
                   \\.@-@./
                   /\`\\_/\`\\
                  //  _  \\\\
                 | \\     )|_
                /\`\\_\`>  <_/ \\
                \\__/'---'\\__/
              `}
            </pre>
          )}
        </div>

        <div className={`card shadow border-0 mb-5${darkMode ? ' bg-secondary text-light' : ''}`}> 
          <div className="card-body">
            <h5 className="card-title fw-semibold">Dodaj nowy system</h5>
            <form className="row g-3 mt-2" onSubmit={handleAdd}>
              <div className="col-12 col-sm-5">
                <input type="text" className={`form-control${darkMode ? ' bg-dark text-light border-light' : ''}`} placeholder="Nazwa systemu" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="col-12 col-sm-5">
                <input type="text" className={`form-control${darkMode ? ' bg-dark text-light border-light' : ''}`} placeholder="Lokalizacja (np. Szklarnia A)" value={location} onChange={e => setLocation(e.target.value)} />
              </div>
              <div className="col-12 col-sm-2 d-grid">
                <button type="submit" className="btn btn-success">➕ Dodaj</button>
              </div>
            </form>
          </div>
        </div>

        {error && (
          <div className={`alert alert-danger alert-dismissible fade show${darkMode ? ' bg-dark text-light border-light' : ''}`} role="alert">
            {error}
            <button type="button" className="btn-close" aria-label="Close" onClick={()=>setError('')}></button>
          </div>
        )}
        {loading ? (
          <div className="text-center py-5">
            <div className={`spinner-border${darkMode ? ' text-light' : ' text-success'}`} role="status"></div>
            <p className="mt-3 loading-message">{loadingMessage}</p>
          </div>
        ) : (
          <div className={`card shadow border-0${darkMode ? ' bg-secondary text-light' : ''}`}> 
            <div className="card-body">
              <h5 className="card-title mb-4 fw-semibold">Lista systemów</h5>
              <div className="table-responsive">
                <table className={`table table-hover align-middle${darkMode ? ' table-dark' : ''}`}>
                  <thead className={darkMode ? '' : 'table-light'}>
                    <tr>
                      <th scope="col" style={{ width: '35%' }}>🌿 Nazwa</th>
                      <th scope="col" style={{ width: '35%' }}>📍 Lokalizacja</th>
                      <th scope="col" style={{ width: '30%' }} className="text-end">Akcje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {systems.map(system => (
                      <React.Fragment key={system.id}>
                        <tr
                          onMouseEnter={(e) => handleMouseEnter(system, e)}
                          onMouseLeave={handleMouseLeave}
                          style={{ position: 'relative' }}
                        >
                          <td className="fw-semibold text-break">{system.name}</td>
                          <td className="text-muted text-break">{system.location}</td>
                          <td>
                            <div className="d-flex gap-2 justify-content-end flex-wrap">
                              <button 
                                className="btn btn-outline-warning btn-sm px-2" 
                                onClick={() => handleEdit(system)} 
                                aria-expanded={openEditId === system.id} 
                                aria-controls={`edit-collapse-${system.id}`}
                                style={{ minWidth: '40px' }}
                              >
                                ✏️
                              </button>
                              <button 
                                className="btn btn-outline-danger btn-sm px-2" 
                                onClick={() => handleDelete(system.id)}
                                style={{ minWidth: '40px' }}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={3} className="p-0 border-0">
                            <Collapse in={openEditId === system.id}>
                              <div id={`edit-collapse-${system.id}`} className="p-3 bg-light border-top">
                                <form className="row g-2" onSubmit={handleUpdate}>
                                  <div className="col-12 col-sm-5 mb-2">
                                    <input 
                                      value={editName} 
                                      onChange={e => setEditName(e.target.value)} 
                                      className="form-control"
                                      placeholder="Nazwa systemu"
                                    />
                                  </div>
                                  <div className="col-12 col-sm-5 mb-2">
                                    <input 
                                      value={editLocation} 
                                      onChange={e => setEditLocation(e.target.value)} 
                                      className="form-control"
                                      placeholder="Lokalizacja"
                                    />
                                  </div>
                                  <div className="col-12 col-sm-2">
                                    <div className="d-grid gap-2">
                                      <button className="btn btn-primary btn-sm" type="submit">💾 Zapisz</button>
                                      <button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => setOpenEditId(null)}>Anuluj</button>
                                    </div>
                                  </div>
                                </form>
                                {selectedSystem && chartData && (
                                  <div className="mt-4">
                                    <h6 className="fw-semibold mb-3">Wykres pomiarów dla systemu: {selectedSystem.name}</h6>
                                    <div className="chart-container" style={{ position: 'relative', height: '300px', minHeight: '250px' }}>
                                      <Line
                                        data={chartData}
                                        options={{
                                          responsive: true,
                                          maintainAspectRatio: false,
                                          plugins: {
                                            legend: {
                                              position: 'top',
                                              labels: {
                                                color: darkMode ? '#fff' : '#666',
                                                boxWidth: 40,
                                                padding: 20
                                              }
                                            }
                                          },
                                          scales: {
                                            y: {
                                              grid: {
                                                color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                                              },
                                              ticks: {
                                                color: darkMode ? '#fff' : '#666'
                                              }
                                            },
                                            x: {
                                              grid: {
                                                color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                                              },
                                              ticks: {
                                                color: darkMode ? '#fff' : '#666',
                                                maxRotation: 45,
                                                minRotation: 45
                                              }
                                            }
                                          }
                                        }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </Collapse>
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {hoveredSystem && (
          <div 
            className={`system-tooltip ${darkMode ? 'tooltip-dark' : ''}`}
            style={{
              position: 'absolute',
              left: tooltipPosition.x + 'px',
              top: tooltipPosition.y + 'px',
              zIndex: 1000,
              transform: 'translateY(10px)'
            }}
          >
            <div className="tooltip-content">
              <h6 className="mb-2">📊 Informacje o systemie</h6>
              <p className="mb-1"><strong>ID:</strong> {hoveredSystem.id}</p>
              <p className="mb-1"><strong>Nazwa:</strong> {hoveredSystem.name}</p>
              <p className="mb-1"><strong>Lokalizacja:</strong> {hoveredSystem.location}</p>
              <p className="mb-0"><strong>Utworzono:</strong> {new Date(hoveredSystem.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        )}

        <style jsx>{`
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .thug-mode {
            font-family: 'Impact', sans-serif;
            text-transform: uppercase;
          }
          .thug-mode .btn {
            transform: skew(-10deg);
          }
          .matrix-mode {
            font-family: 'Courier New', monospace;
            text-shadow: 0 0 5px #0F0;
          }
          .duck-mode .btn {
            transition: transform 0.2s;
          }
          .duck-mode .btn:hover {
            transform: rotate(-5deg) scale(1.05);
          }
          .ascii-mode {
            font-family: monospace;
          }
          .ascii-mode .card {
            border: 2px solid ${darkMode ? '#fff' : '#000'};
            border-radius: 0;
          }
          .system-tooltip {
            background: ${darkMode ? '#2c3e50' : '#ffffff'};
            border: 1px solid ${darkMode ? '#34495e' : '#e2e8f0'};
            border-radius: 8px;
            padding: 1rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            max-width: 300px;
            animation: tooltipFadeIn 0.2s ease-in-out;
          }

          .tooltip-dark {
            color: #ffffff;
          }

          .tooltip-content {
            font-size: 0.9rem;
          }

          .tooltip-content h6 {
            color: ${darkMode ? '#2ecc71' : '#27ae60'};
            border-bottom: 1px solid ${darkMode ? '#34495e' : '#e2e8f0'};
            padding-bottom: 0.5rem;
          }

          @keyframes tooltipFadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(10px);
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default Dashboard;
