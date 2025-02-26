// Frontend (React + Basic CSS)
import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

export default function App() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const executeQuery = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5014/query', { query });
      setResult(res.data);
      setHistory([...history, query].slice(-5)); // Keep last 5 queries
    } catch (error) {
      alert('Query failed: ' + error.message);
    }
    setLoading(false);
  };

  const executeBackup = async () => {
    await axios.post('http://localhost:5014/backup');
    alert('Backup started');
  };

  const executeCheckDB = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5014/checkdb');
      setResult(res.data);
    } catch (error) {
      alert('CHECKDB failed: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className='container'>
      <textarea value={query} onChange={(e) => setQuery(e.target.value)} className='query-box'></textarea>
      <button onClick={executeQuery} className='btn btn-run'>Run Query</button>
      <button onClick={executeBackup} className='btn btn-backup'>Backup Database</button>
      <button onClick={executeCheckDB} className='btn btn-checkdb'>Run CHECKDB</button>
      
      <h3>Query History</h3>
      <ul>
        {history.map((q, index) => (
          <li key={index} onClick={() => setQuery(q)} className='query-history'>{q}</li>
        ))}
      </ul>
      
      {loading && <p>Loading...</p>}
      
      {result && (
        <table className='result-table'>
          <thead>
            <tr>
              {Object.keys(result[0] || {}).map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {Object.values(row).map((value, colIndex) => (
                  <td key={colIndex}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}