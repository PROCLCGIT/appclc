import React from 'react';

export function TableHeader() {
  return (
    <thead style={{
      backgroundColor: '#f8fafc',
      borderBottom: '1px solid #e2e8f0',
    }}>
      <tr>
        <th className="w-16 text-center" style={{
          padding: '12px 16px',
          textAlign: 'center',
          fontSize: '12px',
          fontWeight: '600',
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          borderTopLeftRadius: '6px'
        }}>ID</th>
        <th className="w-36" style={{
          padding: '12px 16px',
          textAlign: 'left',
          fontSize: '12px',
          fontWeight: '600',
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>CÓDIGO</th>
        <th style={{
          padding: '12px 16px',
          textAlign: 'left',
          fontSize: '12px',
          fontWeight: '600',
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>PRODUCTO</th>
        <th className="w-36" style={{
          padding: '12px 16px',
          textAlign: 'left',
          fontSize: '12px',
          fontWeight: '600',
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>UNIDAD</th>
        <th className="w-36" style={{
          padding: '12px 16px',
          textAlign: 'left',
          fontSize: '12px',
          fontWeight: '600',
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>CANTIDAD</th>
        <th className="w-20 text-center" style={{
          padding: '12px 16px',
          textAlign: 'center',
          fontSize: '12px',
          fontWeight: '600',
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          borderTopRightRadius: '6px'
        }}>ACCIONES</th>
      </tr>
    </thead>
  );
}