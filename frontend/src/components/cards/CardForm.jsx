import React from 'react';

export default function CardForm({ cardData, setCardData, handleSave, handleCancel }) {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let formattedValue = value;

    // Heurística de Prevención de Errores: Auto-formateo en vivo
    if (name === 'numero') {
      const onlyNums = value.replace(/\D/g, ''); // Remover cualquier carácter que no sea dígito
      formattedValue = onlyNums.replace(/(.{4})/g, '$1 ').trim(); // Agregar espacios
    }
    
    if (name === 'fecha_expiracion') {
      const onlyNums = value.replace(/\D/g, ''); // Remover letras
      if (onlyNums.length >= 3) {
        formattedValue = `${onlyNums.slice(0, 2)}/${onlyNums.slice(2, 4)}`;
      } else {
        formattedValue = onlyNums;
      }
    }

    if (name === 'nombre_en_tarjeta') {
      // Solo letras y espacios (incluye acentos y eñes)
      formattedValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    }

    if (name === 'cupo_maximo') {
      // Remover todo excepto dígitos y un punto decimal
      let cleanValue = value.replace(/[^0-9.]/g, '');
      
      // Asegurar que solo haya un punto decimal
      const parts = cleanValue.split('.');
      if (parts.length > 2) {
        cleanValue = parts[0] + '.' + parts.slice(1).join('').replace(/\./g, '');
      }
      
      // Limitar a máximo 2 decimales
      if (parts.length >= 2 && parts[1].length > 2) {
        cleanValue = parts[0] + '.' + parts[1].slice(0, 2);
      }
      
      // Limitar cifras hasta 100 millones (máx 9 dígitos en parte entera)
      if (parts[0].length > 9) {
        cleanValue = parts[0].slice(0, 9) + (parts.length > 1 ? '.' + parts[1].slice(0, 2) : '');
      }

      formattedValue = cleanValue;
    }

    setCardData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : formattedValue
    }));
  };

  return (
    <div className="card-form-container">
      <h2>Datos de la Tarjeta</h2>
      <form onSubmit={e => e.preventDefault()} autoComplete="off">
        <div className="form-group">
          <label>Número de Tarjeta</label>
          <input 
            type="text" 
            name="numero" 
            className="form-control" 
            placeholder="**** **** **** ****"
            value={cardData.numero} 
            onChange={handleChange} 
            maxLength={19}
            autoComplete="new-password"
            spellCheck="false"
            data-lpignore="true"
          />
        </div>
        
        <div className="form-group">
          <label>Dueño de la Tarjeta</label>
          <input 
            type="text" 
            name="nombre_en_tarjeta" 
            className="form-control" 
            placeholder="PETER PARKER"
            value={cardData.nombre_en_tarjeta} 
            onChange={handleChange}
            autoComplete="new-password"
            spellCheck="false"
            data-lpignore="true"
            style={{ textTransform: 'uppercase' }}
          />
        </div>
        <div className="flex justify-between" style={{ gap: '1.5rem', marginBottom: '1rem' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Tipo de Tarjeta</label>
            <select 
              name="tipo_tarjeta" 
              className="form-control" 
              value={cardData.tipo_tarjeta || ''} 
              onChange={handleChange}
              style={{ backgroundColor: 'var(--bg-secondary, transparent)', color: 'inherit' }}
            >
              <option value="" disabled>Selecciona el tipo</option>
              <option value="Credito" style={{ color: '#000' }}>Crédito</option>
              <option value="Debito" style={{ color: '#000' }}>Débito</option>
              <option value="Prepago" style={{ color: '#000' }}>Prepago</option>
            </select>
          </div>
        </div>

        {cardData.tipo_tarjeta === 'Credito' && (
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Día de Corte</label>
            <input 
              type="number" 
              name="dia_corte" 
              className="form-control" 
              placeholder="Ej. 15"
              min="1"
              max="31"
              value={cardData.dia_corte || ''} 
              onChange={handleChange} 
            />
          </div>
        )}

        <div className="flex justify-between" style={{ gap: '1.5rem' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Fecha de Caducidad</label>
            <input 
              type="text" 
              name="fecha_expiracion" 
              className="form-control" 
              placeholder="MM/YY"
              value={cardData.fecha_expiracion || ''} 
              onChange={handleChange} 
              maxLength={5}
              autoComplete="new-password"
              spellCheck="false"
              data-lpignore="true"
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Cupo Máximo ($)</label>
            <input 
              type="text" 
              name="cupo_maximo" 
              className="form-control" 
              placeholder="Ej. 5000"
              value={cardData.cupo_maximo || ''} 
              onChange={handleChange} 
              autoComplete="new-password"
              spellCheck="false"
              data-lpignore="true"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Alias de la Tarjeta</label>
          <input 
            type="text" 
            name="alias" 
            className="form-control" 
            placeholder="Ej. Compras Diarias"
            value={cardData.alias} 
            onChange={handleChange} 
          />
        </div>

        <div className="form-group checkbox-group flex items-center" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
          <input 
            type="checkbox" 
            id="permite_diferir" 
            name="permite_diferir" 
            checked={cardData.permite_diferir || false} 
            onChange={handleChange} 
          />
          <label htmlFor="permite_diferir" style={{ margin: 0, marginLeft: '8px', cursor: 'pointer', color: 'var(--text-color)' }}>
            Permitir pagos diferidos con esta tarjeta
          </label>
        </div>

        <div className="action-buttons flex" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
          <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancelar</button>
          <button type="button" className="btn btn-primary" onClick={() => { handleSave(); setCardData({}); }}>Guardar Tarjeta</button>
        </div>
      </form>
    </div>
  );
}
