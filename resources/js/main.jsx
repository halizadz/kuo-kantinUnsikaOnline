import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './App.css';  // Gunakan path relatif sederhana

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);