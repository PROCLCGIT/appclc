# API Services

This directory contains service classes for communicating with the backend API.

## Architecture

The service layer follows these design principles:

1. **Inheritance hierarchy** - Specialized services inherit from base services
2. **Composition** - Complex services use composition for additional features
3. **Consistent error handling** - All API errors are handled uniformly
4. **Documentation** - All methods are documented with JSDoc comments
5. **Code reuse** - Common operations are implemented in base classes

## Service Class Hierarchy

```
BaseService
├── FileService (handles file uploads)
├── ExportService (handles file exports)
└── ActionService (handles record actions like approve/reject)
```

## Usage Examples

### Basic CRUD Operations

```javascript
import { clientesService } from '@/services/api';

// Get all clients
const clients = await clientesService.getAll();

// Get a specific client
const client = await clientesService.getById(123);

// Create a new client
const newClient = await clientesService.create({
  nombre: 'Client Name',
  ruc: '12345678901'
});

// Update a client
const updatedClient = await clientesService.update(123, {
  nombre: 'Updated Name'
});

// Delete a client
await clientesService.delete(123);

// Search clients
const searchResults = await clientesService.search('term');
```

### File Uploads

```javascript
import { productosOfertadosService } from '@/services/api';

// Create a product with images
const newProduct = await productosOfertadosService.create({
  nombre: 'Product Name',
  precio: 100,
  imagenes_referencia: [file1, file2] // File objects
});

// Upload additional images to existing product
await productosOfertadosService.uploadImages(productId, [file1, file2]);

// Upload documents with metadata
await productosOfertadosService.uploadDocuments(
  productId,
  [docFile1, docFile2],
  ['Title 1', 'Title 2'],
  ['Type 1', 'Type 2'],
  ['Description 1', 'Description 2']
);
```

### Export Operations

```javascript
import { proformasService } from '@/services/api';

// Export a proforma as PDF (will trigger download)
await proformasService.exportPdf(proformaId);

// Export a proforma as CSV (will trigger download)
await proformasService.exportCsv(proformaId);
```

### Action Operations

```javascript
import { proformasService } from '@/services/api';

// Approve a proforma
await proformasService.approve(proformaId, 'Approval notes');

// Reject a proforma
await proformasService.reject(proformaId, 'Rejection notes');

// Change status with notes
await proformasService.changeStatus(proformaId, 'approved', 'Status change notes');

// Duplicate a proforma
const duplicatedProforma = await proformasService.duplicate(proformaId);
```

## Error Handling

All service methods handle errors consistently:

```javascript
try {
  const clients = await clientesService.getAll();
  // Process successful response
} catch (error) {
  // All errors will have a consistent structure:
  console.error(`Error ${error.status}: ${error.message}`);
  
  // Additional details may be available in error.errors
  console.error('Details:', error.errors);
}
```

## Extending Services

To create a new service that needs custom methods:

```javascript
import { BaseService } from '@/services/classes';

export class CustomService extends BaseService {
  constructor() {
    super('custom/endpoint/');
  }
  
  async customMethod(data) {
    try {
      const response = await this.axiosInstance.post(`${this.endpoint}custom/`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

export const customService = new CustomService();
```