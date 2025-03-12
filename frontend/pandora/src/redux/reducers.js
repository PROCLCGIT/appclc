// src/redux/reducers.js
import { combineReducers } from 'redux';
import {
  FETCH_PRODUCTS_SUCCESS,
  FETCH_INVENTORY_SUCCESS,
  FETCH_OFFERED_PRODUCTS_SUCCESS
} from './actions';

const productsReducer = (state = [], action) => {
  switch (action.type) {
    case FETCH_PRODUCTS_SUCCESS:
      return action.payload;
    default:
      return state;
  }
};

const inventoryReducer = (state = [], action) => {
  switch (action.type) {
    case FETCH_INVENTORY_SUCCESS:
      return action.payload;
    default:
      return state;
  }
};

const offeredProductsReducer = (state = [], action) => {
  switch (action.type) {
    case FETCH_OFFERED_PRODUCTS_SUCCESS:
      return action.payload;
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  products: productsReducer,
  inventory: inventoryReducer,
  offeredProducts: offeredProductsReducer
});

export default rootReducer;