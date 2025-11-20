import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
// StrictMode deshabilitado para evitar doble renderizado con Telegram WebApp
root.render(<App />);
