import { renderHook, act } from '@testing-library/react-hooks';
import useDocuments from '../hooks/useDocuments';
import { documentService } from '@/services/classes';

// Mock del servicio de documentos
jest.mock('@/services/classes', () => ({
  documentService: {
    getDocuments: jest.fn(),
    getCategories: jest.fn(),
    getTags: jest.fn(),
    createDocument: jest.fn(),
    downloadDocument: jest.fn(),
    deleteDocument: jest.fn(),
    toggleFavorite: jest.fn(),
    createCategory: jest.fn(),
    createTag: jest.fn(),
  }
}));

// Mock del servicio de toast
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}));

describe('useDocuments Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configurar mocks por defecto
    documentService.getDocuments.mockResolvedValue({
      results: [],
      count: 0,
      next: null,
      previous: null,
      current_page: 1,
      total_pages: 1
    });
    
    documentService.getCategories.mockResolvedValue({
      results: []
    });
    
    documentService.getTags.mockResolvedValue({
      results: []
    });
  });

  test('debe cargar documentos, categorías y etiquetas inicialmente', async () => {
    // Configurar mocks con datos de prueba
    const mockDocuments = [
      { id: 1, title: 'Documento 1', category: { id: 1, name: 'Categoría 1' } },
      { id: 2, title: 'Documento 2', category: { id: 2, name: 'Categoría 2' } }
    ];
    
    const mockCategories = [
      { id: 1, name: 'Categoría 1' },
      { id: 2, name: 'Categoría 2' }
    ];
    
    const mockTags = [
      { id: 1, name: 'Etiqueta 1', color_code: '#ff0000' },
      { id: 2, name: 'Etiqueta 2', color_code: '#00ff00' }
    ];
    
    documentService.getDocuments.mockResolvedValue({
      results: mockDocuments,
      count: 2,
      next: null,
      previous: null,
      current_page: 1,
      total_pages: 1
    });
    
    documentService.getCategories.mockResolvedValue({
      results: mockCategories
    });
    
    documentService.getTags.mockResolvedValue({
      results: mockTags
    });
    
    // Renderizar el hook
    const { result, waitForNextUpdate } = renderHook(() => useDocuments());
    
    // Inicialmente debería estar cargando
    expect(result.current.isLoading).toBe(true);
    
    // Esperar a que terminen las cargas
    await waitForNextUpdate();
    
    // Verificar que los datos se hayan cargado correctamente
    expect(result.current.documents).toEqual(expect.arrayContaining(mockDocuments));
    expect(result.current.categories).toEqual(expect.arrayContaining(mockCategories));
    expect(result.current.tags).toEqual(expect.arrayContaining(mockTags));
    expect(result.current.isLoading).toBe(false);
    
    // Verificar que se llamaron los métodos del servicio
    expect(documentService.getDocuments).toHaveBeenCalledTimes(1);
    expect(documentService.getCategories).toHaveBeenCalledTimes(1);
    expect(documentService.getTags).toHaveBeenCalledTimes(1);
  });

  test('debe cambiar de página correctamente', async () => {
    // Configurar mock para la primera carga
    documentService.getDocuments.mockResolvedValueOnce({
      results: [{ id: 1, title: 'Documento 1' }],
      count: 20,
      next: 'page=2',
      previous: null,
      current_page: 1,
      total_pages: 2
    });
    
    // Configurar mock para la segunda página
    documentService.getDocuments.mockResolvedValueOnce({
      results: [{ id: 2, title: 'Documento 2' }],
      count: 20,
      next: null,
      previous: 'page=1',
      current_page: 2,
      total_pages: 2
    });
    
    // Renderizar el hook
    const { result, waitForNextUpdate } = renderHook(() => useDocuments());
    
    // Esperar a que termine la carga inicial
    await waitForNextUpdate();
    
    // Verificar que la paginación se haya configurado correctamente
    expect(result.current.pagination.current).toBe(1);
    expect(result.current.pagination.total_pages).toBe(2);
    
    // Cambiar a la página 2
    await act(async () => {
      result.current.goToPage(2);
    });
    
    // Esperar a que termine la carga de la segunda página
    await waitForNextUpdate();
    
    // Verificar que se cambió de página
    expect(result.current.pagination.current).toBe(2);
    expect(result.current.documents[0].id).toBe(2);
    
    // Verificar que se llamó al servicio con la página correcta
    expect(documentService.getDocuments).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2
      })
    );
  });

  test('debe buscar documentos correctamente', async () => {
    // Configurar mock para búsqueda
    documentService.getDocuments.mockResolvedValueOnce({
      results: [
        { id: 1, title: 'Informe de Ventas' }
      ],
      count: 1,
      next: null,
      previous: null,
      current_page: 1,
      total_pages: 1
    });
    
    // Renderizar el hook
    const { result, waitForNextUpdate } = renderHook(() => useDocuments());
    
    // Esperar a que termine la carga inicial
    await waitForNextUpdate();
    
    // Realizar búsqueda
    await act(async () => {
      await result.current.handleSearch('ventas');
    });
    
    // Verificar que se llamó al servicio con los parámetros correctos
    expect(documentService.getDocuments).toHaveBeenCalledWith(
      expect.objectContaining({
        search: 'ventas',
        page: 1
      })
    );
    
    // Verificar que se actualizaron los documentos
    expect(result.current.documents[0].title).toBe('Informe de Ventas');
  });

  test('debe manejar la subida de documentos correctamente', async () => {
    // Configurar mock para creación de documento
    documentService.createDocument.mockResolvedValue({
      id: 3,
      title: 'Nuevo Documento',
      file_name: 'nuevo.pdf'
    });
    
    // Mock para la recarga después de subir
    documentService.getDocuments.mockResolvedValue({
      results: [
        { id: 3, title: 'Nuevo Documento', file_name: 'nuevo.pdf' }
      ],
      count: 1,
      next: null,
      previous: null,
      current_page: 1,
      total_pages: 1
    });
    
    // Renderizar el hook
    const { result, waitForNextUpdate } = renderHook(() => useDocuments());
    
    // Esperar a que termine la carga inicial
    await waitForNextUpdate();
    
    // Crear formulario de prueba
    const mockFile = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
    const formData = new FormData();
    formData.append('file', mockFile);
    formData.append('title', 'Nuevo Documento');
    
    // Subir documento
    let response;
    await act(async () => {
      response = await result.current.handleUpload(formData);
    });
    
    // Verificar que se llamó al servicio correctamente
    expect(documentService.createDocument).toHaveBeenCalledWith(formData);
    
    // Verificar respuesta
    expect(response).toEqual({
      id: 3,
      title: 'Nuevo Documento',
      file_name: 'nuevo.pdf'
    });
  });

  test('debe eliminar documentos correctamente', async () => {
    // Configurar mocks
    documentService.getDocuments.mockResolvedValue({
      results: [
        { id: 1, title: 'Documento 1' },
        { id: 2, title: 'Documento 2' }
      ],
      count: 2,
      next: null,
      previous: null,
      current_page: 1,
      total_pages: 1
    });
    
    documentService.deleteDocument.mockResolvedValue({ success: true });
    
    // Mock para window.confirm
    window.confirm = jest.fn().mockReturnValue(true);
    
    // Renderizar el hook
    const { result, waitForNextUpdate } = renderHook(() => useDocuments());
    
    // Esperar a que termine la carga inicial
    await waitForNextUpdate();
    
    // Eliminar documento
    let success;
    await act(async () => {
      success = await result.current.handleDelete(1);
    });
    
    // Verificar que se llamó al servicio correctamente
    expect(documentService.deleteDocument).toHaveBeenCalledWith(1);
    expect(success).toBe(true);
  });

  test('debe cambiar el estado de favorito correctamente', async () => {
    // Configurar mocks
    documentService.getDocuments.mockResolvedValue({
      results: [
        { id: 1, title: 'Documento 1', is_favorite: false }
      ],
      count: 1,
      next: null,
      previous: null,
      current_page: 1,
      total_pages: 1
    });
    
    documentService.toggleFavorite.mockResolvedValue({ is_favorite: true });
    
    // Renderizar el hook
    const { result, waitForNextUpdate } = renderHook(() => useDocuments());
    
    // Esperar a que termine la carga inicial
    await waitForNextUpdate();
    
    // Marcar como favorito
    await act(async () => {
      await result.current.handleToggleFavorite(1);
    });
    
    // Verificar que se llamó al servicio correctamente
    expect(documentService.toggleFavorite).toHaveBeenCalledWith(1);
    
    // Verificar que se actualizó el documento
    expect(result.current.documents[0].is_favorite).toBe(true);
  });
});