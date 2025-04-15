import React, { useEffect } from 'react';

export function ItemList({ items, onRemove }) {
  // Definimos estilos para la animación directamente en el componente
  const fadeInKeyframes = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;

  // Inyectamos los estilos en el documento
  useEffect(() => {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(fadeInKeyframes));
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return (
    <>
      {items.map((item, index) => {
        // Asegurarse de que unidad siempre tenga un valor y sea "UND" por defecto
        const displayUnit = item.unidad && item.unidad.trim() !== '' ? item.unidad : 'UND';
        
        return (
          <tr 
            key={item.id || index} 
            style={{
              animationDelay: `${index * 40}ms`,
              transition: 'background-color 0.2s ease',
              backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb',
              animation: 'fadeIn 0.4s ease forwards'
            }}
          >
            <td className="text-center" style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
              <span 
                className="quantity-badge"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '26px',
                  height: '26px',
                  backgroundColor: '#ebf4ff',
                  borderRadius: '9999px',
                  color: '#4876fb',
                  fontSize: '12px',
                  fontWeight: '600',
                  lineHeight: '1'
                }}
              >
                {index + 1}
              </span>
            </td>
            <td className="font-medium" style={{ 
              color: '#1a202c',
              padding: '12px 16px',
              verticalAlign: 'middle',
              fontSize: '14px',
              fontWeight: '500',
              borderBottom: '1px solid #e2e8f0'
            }}>{item.codigo}</td>
            <td style={{ 
              color: '#1a202c',
              padding: '12px 16px',
              verticalAlign: 'middle',
              fontSize: '14px',
              borderBottom: '1px solid #e2e8f0'
            }}>{item.producto}</td>
            <td style={{ 
              padding: '12px 16px',
              verticalAlign: 'middle',
              fontSize: '14px',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <span 
                className="category-badge"
                style={{
                  display: 'inline-block',
                  padding: '4px 10px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#4a5568',
                  fontWeight: '500',
                  lineHeight: '1'
                }}
              >
                {displayUnit}
              </span>
            </td>
            <td style={{ 
              padding: '12px 16px',
              verticalAlign: 'middle',
              fontSize: '14px',
              borderBottom: '1px solid #e2e8f0',
              textAlign: 'center'
            }}>
              <span 
                className="quantity-value"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1a202c',
                  lineHeight: '1'
                }}
              >
                {item.cantidad}
              </span>
            </td>
            <td style={{ 
              padding: '12px 16px',
              verticalAlign: 'middle',
              fontSize: '14px',
              borderBottom: '1px solid #e2e8f0',
              textAlign: 'center'
            }}>
              {onRemove && (
                <button 
                  className="trash-button" 
                  onClick={() => onRemove(item.id)}
                  title="Eliminar este item"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    borderRadius: '9999px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#e53e3e',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <svg 
                    className="trash-icon" 
                    style={{
                      width: '16px',
                      height: '16px',
                      strokeWidth: '2'
                    }}
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              )}
            </td>
          </tr>
        );
      })}
      {items.length === 0 && (
        <tr>
          <td colSpan="6" style={{
            textAlign: 'center',
            padding: '32px 16px',
            color: '#6b7280',
            fontWeight: '500',
            fontSize: '14px',
            borderBottom: '1px solid #e2e8f0'
          }}>
            No hay items registrados aún
          </td>
        </tr>
      )}
    </>
  );
}