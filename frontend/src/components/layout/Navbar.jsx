import React from 'react';
import './Layout.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="container flex items-center justify-between">
        <div className="logo">
          <h1>THE DAILY BUGLE</h1>
          <span className="subtitle">BANKING EDITION</span>
        </div>
        <div className="menu">
          <button className="btn btn-secondary">Opciones</button>
        </div>
      </div>
    </nav>
  );
}
