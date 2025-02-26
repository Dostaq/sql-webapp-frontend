import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaMoon } from 'react-icons/fa';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/sql/sql';
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
      const res = await axios.post('http://localhost:5014/login', { username, password });
      alert(res.data.message);
      setLoggedIn(true);
    } catch (error) {
      alert('Login failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const executeQuery = async () => {
    if (!loggedIn) return alert('Please log in first');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5014/query', { query });
      setResult(res.data);
      setHistory([...history, query].slice(-5));
    } catch (error) {
      alert('Query failed: ' + error.message);
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

  return (
    <div className="container">
      <FaMoon size={15} onClick={() => setDarkMode(!darkMode)} className='dark-mode-icon' style={{ position: 'absolute', top: '10px', right: '10px' }}/>
        {!loggedIn ? (
          <div className="login-container">
          <input type='text' placeholder='Username' value={username} onChange={(e) => setUsername(e.target.value)} />
          <input type='password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={login} className='btn btn-login'>Login</button>
        </div>
      ) : (
        <div className="query-container">
          <CodeMirror
            value={query}
            extensions={[sql()]}
            theme={darkMode ? vscodeDark : 'light'}
            onChange={(value) => setQuery(value)}
            className='query-editor'
          />
          <button onClick={executeQuery} className='btn btn-run'>Run Query</button>
          <button onClick={exportCSV} className='btn btn-export'>Export CSV</button>
        </div>
      )}
      
      <h3>Query History</h3>
      <ul className="history-list">
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