import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DocumentList from '../components/documents/DocumentList';

// Mock necesario para react-virtual
jest.mock('react-virtual', () => ({
  useVirtual: () => ({
    virtualItems: [
      { index: 0, start: 0, size: 60, measureRef: jest.fn() },
      { index: 1, start: 60, size: 60, measureRef: jest.fn() }
    ],
    totalSize: 120
  })
}));

// Mock necesario para DocumentRow
jest.mock('../components/documents/DocumentRow', () => {
  return {
    __esModule: true,
    default: ({ document, onToggleFavorite, onDownload, onDelete, onView, onManageTags, selectionMode, isSelected, onToggleSelection }) => (
      <>
        {selectionMode && (
          <td data-testid={`selection-checkbox-${document.id}`}>
            <input 
              type="checkbox" 
              checked={isSelected}
              onChange={(e) => onToggleSelection(document.id, e.target.checked)}
              data-testid={`checkbox-${document.id}`}
            />
          </td>
        )}
        <td data-testid={`document-title-${document.id}`}>{document.title}</td>
        <td>{document.category_name}</td>
        <td>{document.updated_at}</td>
        <td>{document.file_size}</td>
        <td>
          <div className="flex items-center">
            <button 
              onClick={() => onToggleFavorite(document.id)}
              data-testid={`favorite-${document.id}`}
            >
              Favorito
            </button>
            <button 
              onClick={() => onView(document)}
              data-testid={`view-${document.id}`}
            >
              Ver
            </button>
            <button 
              onClick={() => onDownload(document)}
              data-testid={`download-${document.id}`}
            >
              Descargar
            </button>
            <button 
              onClick={() => onManageTags(document)}
              data-testid={`tags-${document.id}`}
            >
              Etiquetas
            </button>
            <button 
              onClick={() => onDelete(document.id)}
              data-testid={`delete-${document.id}`}
            >
              Eliminar
            </button>
          </div>
        </td>
      </>
    )
  };
});

describe('DocumentList Component', () => {
  // Datos de prueba
  const mockDocuments = [
    {
      id: 1,
      title: 'Documento 1',
      description: 'Descripción del documento 1',
      category_name: 'Categoría 1',
      updated_at: '2023-01-01',
      file_size: 1024,
      is_favorite: false,
      tags: []
    },
    {
      id: 2,
      title: 'Documento 2',
      description: 'Descripción del documento 2',
      category_name: 'Categoría 2',
      updated_at: '2023-01-02',
      file_size: 2048,
      is_favorite: true,
      tags: []
    }
  ];

  // Funciones mock
  const mockFunctions = {
    onToggleFavorite: jest.fn(),
    onDownload: jest.fn(),
    onDelete: jest.fn(),
    onView: jest.fn(),
    onManageTags: jest.fn(),
    onToggleSelection: jest.fn(),
    onToggleSelectionMode: jest.fn(),
    onShareSelected: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renderiza la tabla correctamente', () => {
    render(
      <DocumentList 
        documents={mockDocuments}
        {...mockFunctions}
      />
    );

    // Verificar elementos básicos de la tabla
    expect(screen.getByText('Documento')).toBeInTheDocument();
    expect(screen.getByText('Categoría')).toBeInTheDocument();
    expect(screen.getByText('Actualizado')).toBeInTheDocument();
    expect(screen.getByText('Tamaño')).toBeInTheDocument();
    expect(screen.getByText('Acciones')).toBeInTheDocument();
  });

  test('muestra un mensaje cuando no hay documentos', () => {
    render(
      <DocumentList 
        documents={[]}
        {...mockFunctions}
      />
    );

    expect(screen.getByText('No hay documentos que mostrar.')).toBeInTheDocument();
  });

  test('permite activar el modo de selección', () => {
    render(
      <DocumentList 
        documents={mockDocuments}
        {...mockFunctions}
      />
    );

    // Verificar que existe el botón de activar selección
    const selectButton = screen.getByText('Seleccionar');
    expect(selectButton).toBeInTheDocument();
    
    // Activar el modo de selección
    fireEvent.click(selectButton);
    
    // Verificar que se llamó a la función
    expect(mockFunctions.onToggleSelectionMode).toHaveBeenCalledWith(true);
  });

  test('muestra checkboxes y panel de selección en modo selección', () => {
    render(
      <DocumentList 
        documents={mockDocuments}
        selectionMode={true}
        selectedDocuments={[]}
        {...mockFunctions}
      />
    );

    // Verificar que existe el panel de selección
    expect(screen.getByText('0 documentos seleccionados')).toBeInTheDocument();
    expect(screen.getByText('Compartir seleccionados')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });

  test('muestra el número correcto de documentos seleccionados', () => {
    render(
      <DocumentList 
        documents={mockDocuments}
        selectionMode={true}
        selectedDocuments={[1]}
        {...mockFunctions}
      />
    );

    // Verificar que muestra 1 documento seleccionado
    expect(screen.getByText('1 documento seleccionado')).toBeInTheDocument();
  });

  test('permite cancelar el modo de selección', () => {
    render(
      <DocumentList 
        documents={mockDocuments}
        selectionMode={true}
        selectedDocuments={[]}
        {...mockFunctions}
      />
    );

    // Hacer clic en el botón Cancelar
    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);
    
    // Verificar que se llamó a la función
    expect(mockFunctions.onToggleSelectionMode).toHaveBeenCalledWith(false);
  });

  test('dispara el evento compartir cuando hay documentos seleccionados', () => {
    render(
      <DocumentList 
        documents={mockDocuments}
        selectionMode={true}
        selectedDocuments={[1, 2]}
        {...mockFunctions}
      />
    );

    // Verificar que muestra "2 documentos seleccionados"
    expect(screen.getByText('2 documentos seleccionados')).toBeInTheDocument();
    
    // Hacer clic en el botón Compartir
    const shareButton = screen.getByText('Compartir seleccionados');
    fireEvent.click(shareButton);
    
    // Verificar que se llamó a la función
    expect(mockFunctions.onShareSelected).toHaveBeenCalled();
  });

  test('permite seleccionar todos los documentos', () => {
    render(
      <DocumentList 
        documents={mockDocuments}
        selectionMode={true}
        selectedDocuments={[]}
        {...mockFunctions}
      />
    );

    // Obtener el checkbox "Seleccionar todos"
    const selectAllCheckbox = document.querySelector('input[type="checkbox"][aria-label="Seleccionar todos"]');
    expect(selectAllCheckbox).toBeInTheDocument();
    
    // Seleccionar todos
    fireEvent.click(selectAllCheckbox);
    
    // Verificar que se llamó a la función con todos los IDs
    expect(mockFunctions.onToggleSelection).toHaveBeenCalledWith(
      [1, 2], // IDs de los documentos
      true    // isSelected = true
    );
  });

  test('muestra checkboxes marcados para documentos seleccionados', () => {
    render(
      <DocumentList 
        documents={mockDocuments}
        selectionMode={true}
        selectedDocuments={[1]}
        {...mockFunctions}
      />
    );

    // Verificar que el checkbox del primer documento está marcado
    const checkbox1 = document.querySelector('[data-testid="checkbox-1"]');
    expect(checkbox1).toBeChecked();
    
    // Verificar que el checkbox del segundo documento no está marcado
    const checkbox2 = document.querySelector('[data-testid="checkbox-2"]');
    expect(checkbox2).not.toBeChecked();
  });
});