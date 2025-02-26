import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaMoon, FaCopy } from 'react-icons/fa';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import './App.css';

export default function App() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [selectedQuery, setSelectedQuery] = useState('');
  
  const commonQueries = [
    "SELECT * FROM users;",
    "SELECT COUNT(*) FROM orders;",
    "SELECT name, age FROM customers WHERE age > 30;"
  ];

  useEffect(() => {
    const root = document.querySelector('.container');
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  const login = async () => {
    try {
      console.log(username, password);
      const res = await axios.post('http://localhost:5014/login', { username, password });
      alert(res.data.message);
      setLoggedIn(true);
      setError('');
    } catch (error) {
      setError('Login failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const executeQuery = async () => {
    if (!loggedIn) return alert('Please log in first');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5014/query', { query });
      setResult(res.data);
      setHistory([...history, query].slice(-5));
      setError('');
    } catch (error) {
      setError('Query failed: ' + error.message);
    }
    setLoading(false);
  };

  const exportCSV = () => {
    if (!result) return;
    const csvContent = 'data:text/csv;charset=utf-8,' +
      Object.keys(result[0]).join(',') + '\n' +
      result.map(row => Object.values(row).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'query_results.csv');
    document.body.appendChild(link);
    link.click();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(query);
    alert('Query copied to clipboard');
  };

  return (
    <div className="container">
      <FaMoon 
        size={20} 
        onClick={() => setDarkMode(!darkMode)} 
        className='dark-mode-icon' 
        style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer' }}
      />
      {!loggedIn ? (
        <div className="login-container">
          <input type='text' placeholder='Username' value={username} onChange={(e) => setUsername(e.target.value)} />
          <input type='password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={login} className='btn btn-login'>Login</button>
          {error && <p className='error-message'>{error}</p>}
        </div>
      ) : (
        <div className="query-container">
          <div className="query-header">
            <h3>SQL Query</h3>
            <FaCopy 
              size={18} 
              onClick={copyToClipboard} 
              style={{ cursor: 'pointer', marginLeft: '10px' }} 
            />
          </div>
          <select onChange={(e) => setSelectedQuery(e.target.value)} value={selectedQuery} className='query-dropdown'>
            <option value="">Select a common query</option>
            {commonQueries.map((q, index) => (
              <option key={index} value={q}>{q}</option>
            ))}
          </select>
          <CodeMirror
            value={selectedQuery || query}
            extensions={[sql()]}
            theme={darkMode ? vscodeDark : 'light'}
            onChange={(value) => setQuery(value)}
            className='query-editor'
            style={{ height: '300px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '5px', padding: '5px' }}
          />
          <button onClick={executeQuery} className='btn btn-run'>Run Query</button>
          <button onClick={exportCSV} className='btn btn-export'>Export CSV</button>
          <button onClick={() => axios.post('http://localhost:5014/backup')} className='btn btn-backup'>Run Backup</button>
          <button onClick={() => axios.post('http://localhost:5014/checkdb')} className='btn btn-checkdb'>Run CHECKDB</button>
        </div>
      )}
      
      <h3>Query History</h3>
      <ul className="history-list">
        {history.map((q, index) => (
          <li key={index} onClick={() => setQuery(q)} className='query-history'>{q}</li>
        ))}
      </ul>
      
      {loading && <p className='loading-message'>Executing query...</p>}
      {error && <p className='error-message'>{error}</p>}
      
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