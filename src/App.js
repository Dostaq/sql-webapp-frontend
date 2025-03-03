import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaMoon, FaCopy, FaPlay } from 'react-icons/fa';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import './App.css';

export default function App() {
  const [query, setQuery] = useState('');
  const [backupHistory, setBackupHistory] = useState([]);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [databases, setDatabases] = useState([]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
      document.documentElement.classList.remove('light-mode');
    } else {
      document.documentElement.classList.add('light-mode');
      document.documentElement.classList.remove('dark-mode');
    }
  }, [darkMode]);

  useEffect(() => {
    if (loggedIn) fetchDatabases();
  }, [loggedIn]);

  const login = async () => {
    try {
      const res = await axios.post('http://localhost:5014/login', { username, password });
      alert(res.data.message);
      setLoggedIn(true);
    } catch (error) {
      alert('Login failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const fetchDatabases = async () => {
    try {
      const res = await axios.get('http://localhost:5014/databases');
      setDatabases(res.data);
    } catch (error) {
      alert('Failed to fetch databases: ' + error.message);
    }
  };

  const backupDatabase = async (dbName) => {
    setLoading(true);
    try {
        const res = await axios.post('http://localhost:5014/backup', { database: dbName });
        alert(`Backup started for ${dbName}`);
    } catch (error) {
        alert('Backup failed: ' + error.message);
    }
    setLoading(false);
};
  const fetchBackupHistory = async () => {
    try {
      const res = await axios.get('http://localhost:5014/backup-history');
      setBackupHistory(res.data);
    } catch (error) {
      alert('Failed to fetch backup history: ' + error.message);
    }
};

  useEffect(() => {
  fetchBackupHistory();
  }, []);

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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(query);
    alert('Query copied to clipboard');
  };

  return (
    <div className={`container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <FaMoon 
        size={20} 
        onClick={() => setDarkMode(!darkMode)} 
        className='dark-mode-icon' 
        style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer' }}
      />
      {!loggedIn ? (
        <div className="login-container">
          <img src="/logo.png" alt="Logo" className="logo" style={{ maxWidth: '150px' }} />
          <h2 className="login-title">SQL Server Dashboard</h2>
          <div className="login-box">
            <div className="input-group">
              <input type='text' placeholder='Username' value={username} onChange={(e) => setUsername(e.target.value)} className='login-input' />
            </div>
            <div className="input-group">
              <input type='password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} className='login-input' />
            </div>
            <button onClick={login} className='btn btn-login'>Login</button>
          </div>
        </div>
      ) : (
        <>
          <div className="database-container">
            <h3>Databases</h3>
            <table className='database-table'>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Size (MB)</th>
                  <th>Created On</th>
                  <th>Last Backup</th>
                  <th>Backup</th>
                </tr>
              </thead>
              <tbody>
                {databases.map((db, index) => (
                  <tr key={index}>
                    <td>{db.name}</td>
                    <td>{db.size}</td>
                    <td>{db.create_date}</td>
                    <td>{db.last_backup}</td>
                    <td>
                      <button className='backup-button' onClick={() => backupDatabase(db.name)}>Backup</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="query-container">
            <div className="query-editor-container" style={{ width: '80%', height: '400px' }}>
              <div className="query-editor-header">
                <h3>SQL Query Editor</h3>
                <div className="query-toolbar">
                  <button className='run-button' onClick={executeQuery} title='Run Query'>
                    <FaPlay size={16} />
                  </button>
                  <button className='copy-button' onClick={copyToClipboard} title='Copy Query'>
                    <FaCopy size={16} />
                  </button>
                </div>
              </div>
              <CodeMirror
                value={query}
                extensions={[sql()]}
                theme={darkMode ? vscodeDark : 'light'}
                onChange={(value) => setQuery(value)}
                className='query-editor bordered-editor'
                style={{ height: '350px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '5px' }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

