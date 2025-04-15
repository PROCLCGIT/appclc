import React from 'react';
import { PlusCircle } from 'lucide-react';

export function ItemForm({ formData, refs, handleChange, handleKeyDown, handleSubmit }) {
  return (
    <tr className="input-row" style={{ backgroundColor: '#ebf5ff', borderBottom: '1px solid #bfdbfe' }}>
      <td className="px-4 py-3 w-16 text-center text-sm font-medium text-blue-600">
        <span className="bg-blue-100 px-2 py-1 rounded-full text-xs">Auto</span>
      </td>
      <td className="px-4 py-3 w-36">
        <input
          ref={refs.codigoRef}
          type="text"
          id="codigo"
          name="codigo"
          value={formData.codigo}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="form-input py-1 pl-3"
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            backgroundColor: 'white',
            fontSize: '14px',
            width: '100%'
          }}
          placeholder="Código"
          required
        />
      </td>
      <td className="px-4 py-3">
        <input
          ref={refs.productoRef}
          type="text"
          id="producto"
          name="producto"
          value={formData.producto}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="form-input py-1 pl-3"
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            backgroundColor: 'white',
            fontSize: '14px',
            width: '100%'
          }}
          placeholder="Producto"
          required
        />
      </td>
      <td className="px-4 py-3 w-36">
        <select
          ref={refs.unidadRef}
          id="unidad"
          name="unidad"
          value={formData.unidad}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="form-select py-1 pl-3"
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            backgroundColor: 'white',
            fontSize: '14px',
            width: '100%',
            appearance: 'none'
          }}
          required
        >
          <option value="UND">UND</option>
          <option value="KG">KG</option>
          <option value="LT">LT</option>
          <option value="MT">MT</option>
        </select>
      </td>
      <td className="px-4 py-3 w-36">
        <div className="relative">
          <input
            ref={refs.cantidadRef}
            type="number"
            id="cantidad"
            name="cantidad"
            value={formData.cantidad}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            min="0"
            step="0.01"
            className="form-input py-1 pl-3"
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              backgroundColor: 'white',
              fontSize: '14px',
              width: '100%'
            }}
            placeholder="0.00"
            required
          />
        </div>
      </td>
      <td className="px-4 py-3 w-20">
        <button
          onClick={handleSubmit}
          className="add-inventory-button px-3.5 py-2 h-9 w-full"
          style={{
            backgroundColor: '#4876fb',
            color: 'white',
            borderRadius: '6px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          <PlusCircle className="h-5 w-5" />
        </button>
      </td>
    </tr>
  );
}