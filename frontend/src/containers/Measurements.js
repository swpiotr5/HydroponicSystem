// File: components/Measurements.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';

const Measurements = ({ darkMode }) => {
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [systems, setSystems] = useState([]);
  const [selectedSystem, setSelectedSystem] = useState('');
  const [chartData, setChartData] = useState(null);
  const [newMeasurement, setNewMeasurement] = useState({ ph: '', temperature: '', tds: '' });
  const [filters, setFilters] = useState({
    ph_min: '',
    ph_max: '',
    temperature_min: '',
    temperature_max: '',
    tds_min: '',
    tds_max: '',
    timestamp_after: null,
    timestamp_before: null
  });

  const token = localStorage.getItem('token');
  const api = axios.create({
    baseURL: 'http://localhost:8000',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  });

  const formatDate = (date) => {
    if (!date) return '';
    if (typeof date === 'string') return date.split('T')[0];
    return date.toISOString().split('T')[0];
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value ? new Date(value) : null
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNewMeasurementChange = (e) => {
    const { name, value } = e.target;
    setNewMeasurement(prev => ({ ...prev, [name]: value }));
  };

  const handleAddMeasurement = async (e) => {
    e.preventDefault();
    const ph = parseFloat(newMeasurement.ph);
    const temperature = parseFloat(newMeasurement.temperature);
    const tds = parseInt(newMeasurement.tds);
    if (
      isNaN(ph) || ph < 0 || ph > 14 ||
      isNaN(temperature) || temperature < -10 || temperature > 50 ||
      isNaN(tds) || tds < 0
    ) {
      setError('Wprowadź poprawne wartości: pH 0-14, temperatura -10 do 50°C, TDS >= 0');
      return;
    }
    try {
      await api.post(`/systems/${parseInt(selectedSystem)}/measurements/`, {
        ph,
        temperature,
        tds
      });
      setNewMeasurement({ ph: '', temperature: '', tds: '' });
      await fetchMeasurements();
    } catch (err) {
      if (err.response) {
        setError(`Nie udało się dodać pomiaru: ${err.response.status} ${JSON.stringify(err.response.data)}`);
      } else {
        setError('Nie udało się dodać pomiaru.');
      }
      console.error('Błąd dodawania pomiaru:', err);
    }
  };

  const fetchSystems = async () => {
    try {
      const response = await api.get('/systems/');
      setSystems(response.data.results || response.data);
      if (response.data.results?.length > 0) {
        setSelectedSystem(response.data.results[0].id);
      }
    } catch (err) {
      setError('Nie udało się pobrać listy systemów');
    }
  };

  const fetchMeasurements = async () => {
    if (!selectedSystem) return;

    setLoading(true);
    try {
      let url = `/systems/${selectedSystem}/measurements/?`;
      Object.entries(filters).forEach(([key, value]) => {
        if (value && key.includes('timestamp')) {
          url += `${key}=${value.toISOString().split('T')[0]}&`;
        } else if (value) {
          url += `${key}=${value}&`;
        }
      });

      const response = await api.get(url);
      setMeasurements(response.data.results);
      updateChartData(response.data.results);
      setError('');
    } catch (err) {
      setError('Nie udało się pobrać pomiarów');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSystems();
  }, []);

  useEffect(() => {
    fetchMeasurements();
  }, [selectedSystem, filters]);

  const updateChartData = (measurements) => {
    if (!measurements?.length) return;

    setChartData({
      labels: measurements.map(m => new Date(m.timestamp).toLocaleString()),
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
    });
  };

  return (
    <div className={`container py-5${darkMode ? ' text-light' : ''}`}>
      <h2 className="mb-4">📊 Pomiary systemów</h2>

      {/* Formularz dodawania nowego pomiaru */}
      <div className={`card shadow-sm mb-4${darkMode ? ' bg-secondary text-light' : ''}`}>
        <div className="card-body">
          <h5 className="card-title">Dodaj nowy pomiar</h5>
          <form className="row g-3" onSubmit={handleAddMeasurement}>
            <div className="col-md-3">
              <select
                className={`form-select${darkMode ? ' bg-dark text-light' : ''}`}
                value={selectedSystem}
                onChange={e => setSelectedSystem(e.target.value)}
                required
              >
                <option value="">Wybierz system</option>
                {systems.map(system => (
                  <option key={system.id} value={system.id}>
                    {system.name} ({system.location})
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <input type="number" step="0.1" name="ph" placeholder="pH (0-14)" min="0" max="14" className={`form-control${darkMode ? ' bg-dark text-light' : ''}`} value={newMeasurement.ph} onChange={handleNewMeasurementChange} required />
              <small className="text-muted">Zakres: 0 - 14</small>
            </div>
            <div className="col-md-3">
              <input type="number" step="0.1" name="temperature" placeholder="Temperatura (°C)" min="-10" max="50" className={`form-control${darkMode ? ' bg-dark text-light' : ''}`} value={newMeasurement.temperature} onChange={handleNewMeasurementChange} required />
              <small className="text-muted">Zakres: -10°C do 50°C</small>
            </div>
            <div className="col-md-3">
              <input type="number" name="tds" placeholder="TDS (ppm)" min="0" className={`form-control${darkMode ? ' bg-dark text-light' : ''}`} value={newMeasurement.tds} onChange={handleNewMeasurementChange} required />
              <small className="text-muted">TDS &ge; 0</small>
            </div>
            <div className="col-md-12 d-grid">
              <button type="submit" className="btn btn-success">➕ Dodaj pomiar</button>
            </div>
          </form>
        </div>
      </div>

      {/* Filtry */}
      <div className={`card shadow-sm mb-4${darkMode ? ' bg-secondary text-light' : ''}`}>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">System</label>
              <select className={`form-select${darkMode ? ' bg-dark text-light' : ''}`} value={selectedSystem} onChange={e => setSelectedSystem(e.target.value)}>
                {systems.map(system => (
                  <option key={system.id} value={system.id}>
                    {system.name} ({system.location})
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">pH (min-max)</label>
              <div className="input-group">
                <input type="number" step="0.1" name="ph_min" placeholder="Min" className={`form-control${darkMode ? ' bg-dark text-light' : ''}`} value={filters.ph_min} onChange={handleFilterChange} />
                <input type="number" step="0.1" name="ph_max" placeholder="Max" className={`form-control${darkMode ? ' bg-dark text-light' : ''}`} value={filters.ph_max} onChange={handleFilterChange} />
              </div>
            </div>
            <div className="col-md-4">
              <label className="form-label">Temperatura (min-max)</label>
              <div className="input-group">
                <input type="number" step="0.1" name="temperature_min" placeholder="Min" className={`form-control${darkMode ? ' bg-dark text-light' : ''}`} value={filters.temperature_min} onChange={handleFilterChange} />
                <input type="number" step="0.1" name="temperature_max" placeholder="Max" className={`form-control${darkMode ? ' bg-dark text-light' : ''}`} value={filters.temperature_max} onChange={handleFilterChange} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Wykres */}
      {chartData && (
        <div className={`card shadow-sm mb-4${darkMode ? ' bg-secondary text-light' : ''}`}>
          <div className="card-body">
            <div style={{ height: '400px' }}>
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      labels: {
                        color: darkMode ? '#fff' : '#333'
                      }
                    },
                    title: {
                      display: true,
                      text: 'Historia pomiarów',
                      color: darkMode ? '#fff' : '#333'
                    }
                  },
                  scales: {
                    x: {
                      ticks: { color: darkMode ? '#fff' : '#333' },
                      grid: { color: darkMode ? 'rgba(255,255,255,0.1)' : '#eee' }
                    },
                    y: {
                      ticks: { color: darkMode ? '#fff' : '#333' },
                      grid: { color: darkMode ? 'rgba(255,255,255,0.1)' : '#eee' }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className={`card shadow-sm${darkMode ? ' bg-secondary text-light' : ''}`}>
        <div className="card-body">
          <h5 className="card-title mb-4">Szczegółowe pomiary</h5>
          <div className="table-responsive">
            <table className={`table${darkMode ? ' table-dark' : ''}`}>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>pH</th>
                  <th>Temperatura</th>
                  <th>TDS</th>
                </tr>
              </thead>
              <tbody>
                {measurements.map(m => (
                  <tr key={m.id}>
                    <td>{new Date(m.timestamp).toLocaleString()}</td>
                    <td>{m.ph}</td>
                    <td>{m.temperature}°C</td>
                    <td>{m.tds} ppm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Measurements;
