import React from 'react';

export default function CardPreview({ cardData }) {
  const num = cardData.numero || '**** **** **** ****';
  const name = cardData.nombre_en_tarjeta || 'NOMBRE COMPLETO';
  const exp = cardData.fecha_expiracion || 'MM/YY';

  return (
    <div className="card-preview-container">
      <div className="credit-card-visual">
        <div className="card-top flex justify-between items-center">
          <div className="chip-icon"></div>
          <div className="brand">{cardData.franquicia || 'VISA'}</div>
        </div>
        
        <div className="card-middle">
          <div className="card-number">{num}</div>
        </div>
        
        <div className="card-bottom flex justify-between items-center">
          <div className="card-holder flex-col">
            <span className="label">Titular</span>
            <span className="value">{name}</span>
          </div>
          <div className="card-expires flex-col">
            <span className="label">Expira</span>
            <span className="value">{exp}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
