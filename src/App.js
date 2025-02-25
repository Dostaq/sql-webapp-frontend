import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

export default function App() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);

  const executeQuery = async () => {
    const res = await axios.post('http://localhost:5014/query', { query });
    setResult(res.data);
  };

  const executeBackup = async () => {
    await axios.post('http://localhost:5014/backup');
    alert('Backup started');
  };

  const executeCheckDB = async () => {
    const res = await axios.post('http://localhost:5014/checkdb');
    setResult(res.data);
  };

  return (
    <div className='container'>
      <textarea value={query} onChange={(e) => setQuery(e.target.value)} className='query-box'></textarea>
      <button onClick={executeQuery} className='btn btn-run'>Run Query</button>
      <button onClick={executeBackup} className='btn btn-backup'>Backup Database</button>
      <button onClick={executeCheckDB} className='btn btn-checkdb'>Run CHECKDB</button>
      <pre className='result'>{JSON.stringify(result, null, 2)}</pre>
    </div>
  );
}