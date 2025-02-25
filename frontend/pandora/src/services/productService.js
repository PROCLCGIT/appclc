// src/services/productService.js
import { BaseService } from './api';

export class ProductService extends BaseService {
  constructor() {
    super('products/');
  }

  async getPriceList(productId) {
    try {
      const response = await this.api.get(`${this.endpoint}${productId}/prices/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

export const productService = new ProductService();