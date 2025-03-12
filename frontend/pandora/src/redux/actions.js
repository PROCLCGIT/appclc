// src/redux/actions.js

// Action Types
export const FETCH_PRODUCTS_SUCCESS = 'FETCH_PRODUCTS_SUCCESS';
export const FETCH_INVENTORY_SUCCESS = 'FETCH_INVENTORY_SUCCESS';
export const FETCH_OFFERED_PRODUCTS_SUCCESS = 'FETCH_OFFERED_PRODUCTS_SUCCESS';

// Action Creators - usando la sintaxis de redux-thunk v3
export const fetchProducts = () => async (dispatch) => {
  // Mock data - replace with actual API call
  const products = [
    { code: "P001", description: "Producto 1", price: 100 },
    { code: "P002", description: "Producto 2", price: 200 },
    { code: "P003", description: "Producto 3", price: 300 }
  ];
  
  dispatch({
    type: FETCH_PRODUCTS_SUCCESS,
    payload: products
  });
};

export const fetchInventory = () => async (dispatch) => {
  // Mock data - replace with actual API call
  const inventory = [
    { code: "P001", stock: 10 },
    { code: "P002", stock: 5 },
    { code: "P003", stock: 15 }
  ];
  
  dispatch({
    type: FETCH_INVENTORY_SUCCESS,
    payload: inventory
  });
};

export const fetchOfferedProducts = () => async (dispatch) => {
  // Mock data - replace with actual API call
  const offeredProducts = [
    { code: "P001", discount: 10 },
    { code: "P002", discount: 5 },
    { code: "P003", discount: 0 }
  ];
  
  dispatch({
    type: FETCH_OFFERED_PRODUCTS_SUCCESS,
    payload: offeredProducts
  });
};