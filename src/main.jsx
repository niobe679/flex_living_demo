import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './App.css';
import './index.css';
import { HashRouter as Router, Routes, Route } from "react-router-dom";

createRoot(document.getElementById('root')).render(
  <Router>
    <App />
  </Router>
);
