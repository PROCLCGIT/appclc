import React, { createContext, useContext, useReducer, useState } from "react";
import { createEmptyProforma } from "../utils/proformaUtils";

// Definición del estado inicial
const initialState = {
  proformas: [],
  activeProformaId: null,
  loading: false,
  client: null,
  items: [],
  config: {
    showLogo: true,
    logoPosition: "right",
    dateFormat: "DD/MM/YYYY",
    vatRate: 0.12,
    currency: "USD",
    showVat: true,
    showDiscount: true,
  },
  previewMode: false,
  searchState: {
    searchTerm: "",
    searchSource: "database",
    searchResults: [],
    showSearchResults: false,
    loadingProducts: false,
    viewType: "grid",
  },
};

// Tipos de acciones
const ActionTypes = {
  SET_PROFORMAS: "SET_PROFORMAS",
  SET_ACTIVE_PROFORMA: "SET_ACTIVE_PROFORMA",
  UPDATE_PROFORMA: "UPDATE_PROFORMA",
  ADD_NEW_PROFORMA: "ADD_NEW_PROFORMA",
  CLOSE_PROFORMA: "CLOSE_PROFORMA",
  SET_LOADING: "SET_LOADING",
  SET_CLIENT: "SET_CLIENT",
  SET_ITEMS: "SET_ITEMS",
  ADD_ITEM: "ADD_ITEM",
  UPDATE_ITEM: "UPDATE_ITEM",
  REMOVE_ITEM: "REMOVE_ITEM",
  SET_CONFIG: "SET_CONFIG",
  SET_PREVIEW_MODE: "SET_PREVIEW_MODE",
  SET_SEARCH_STATE: "SET_SEARCH_STATE",
  UPDATE_SEARCH_STATE: "UPDATE_SEARCH_STATE",
};

// Reducer para manejar todas las acciones
function proformaReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_PROFORMAS:
      return {
        ...state,
        proformas: action.payload,
      };

    case ActionTypes.SET_ACTIVE_PROFORMA:
      return {
        ...state,
        activeProformaId: action.payload,
        // Actualizar client e items basados en la proforma activa
        ...(action.payload
          ? {
              client:
                state.proformas.find((p) => p.id === action.payload)?.client ||
                null,
              items:
                state.proformas.find((p) => p.id === action.payload)?.items ||
                [],
            }
          : {}),
      };

    case ActionTypes.UPDATE_PROFORMA: {
      const { proformaId, updates } = action.payload;
      const updatedProformas = state.proformas.map((proforma) =>
        proforma.id === proformaId ? { ...proforma, ...updates } : proforma,
      );

      // Si estamos actualizando la proforma activa, también actualizamos client e items
      if (proformaId === state.activeProformaId) {
        return {
          ...state,
          proformas: updatedProformas,
          client: updates.client || state.client,
          items: updates.items || state.items,
        };
      }

      return {
        ...state,
        proformas: updatedProformas,
      };
    }

    case ActionTypes.ADD_NEW_PROFORMA: {
      const newProforma = action.payload;
      // Check that the proforma exists and has an id before using it
      if (!newProforma || !newProforma.id) {
        console.error("Invalid proforma provided to ADD_NEW_PROFORMA:", newProforma);
        return state;
      }
      
      // Verificar si ya tenemos una proforma con el mismo ID
      const existingProforma = state.proformas.find(p => p.id === newProforma.id);
      if (existingProforma) {
        console.log(`Proforma con ID ${newProforma.id} ya existe, no se duplicará`);
        return {
          ...state,
          activeProformaId: newProforma.id,
          client: newProforma.client || null,
          items: newProforma.items || [],
        };
      }
      
      // Caso normal: añadir nueva proforma
      return {
        ...state,
        proformas: [...state.proformas, newProforma],
        activeProformaId: newProforma.id,
        client: newProforma.client || null,
        items: newProforma.items || [],
      };
    }

    case ActionTypes.CLOSE_PROFORMA: {
      const proformaId = action.payload;
      const updatedProformas = state.proformas.filter(
        (p) => p.id !== proformaId,
      );

      // Si estamos cerrando la proforma activa, actualizamos el activeProformaId
      // y seleccionamos la primera proforma disponible o ninguna
      if (proformaId === state.activeProformaId) {
        const newActiveId =
          updatedProformas.length > 0 ? updatedProformas[0].id : null;
        return {
          ...state,
          proformas: updatedProformas,
          activeProformaId: newActiveId,
          client: newActiveId ? updatedProformas[0].client : null,
          items: newActiveId ? updatedProformas[0].items : [],
        };
      }

      return {
        ...state,
        proformas: updatedProformas,
      };
    }

    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case ActionTypes.SET_CLIENT:
      // Actualizar client en el estado global y en la proforma activa
      if (state.activeProformaId) {
        return {
          ...state,
          client: action.payload,
          proformas: state.proformas.map((proforma) =>
            proforma.id === state.activeProformaId
              ? { ...proforma, client: action.payload }
              : proforma,
          ),
        };
      }
      return {
        ...state,
        client: action.payload,
      };

    case ActionTypes.SET_ITEMS:
      // Actualizar items en el estado global y en la proforma activa
      if (state.activeProformaId) {
        return {
          ...state,
          items: action.payload,
          proformas: state.proformas.map((proforma) =>
            proforma.id === state.activeProformaId
              ? { ...proforma, items: action.payload }
              : proforma,
          ),
        };
      }
      return {
        ...state,
        items: action.payload,
      };

    case ActionTypes.ADD_ITEM: {
      const newItem = action.payload;
      const updatedItems = [...state.items, newItem];

      // Actualizar items en el estado global y en la proforma activa
      if (state.activeProformaId) {
        return {
          ...state,
          items: updatedItems,
          proformas: state.proformas.map((proforma) =>
            proforma.id === state.activeProformaId
              ? { ...proforma, items: updatedItems }
              : proforma,
          ),
        };
      }
      return {
        ...state,
        items: updatedItems,
      };
    }

    case ActionTypes.UPDATE_ITEM: {
      const { itemId, updates } = action.payload;
      const updatedItems = state.items.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item,
      );

      // Actualizar items en el estado global y en la proforma activa
      if (state.activeProformaId) {
        return {
          ...state,
          items: updatedItems,
          proformas: state.proformas.map((proforma) =>
            proforma.id === state.activeProformaId
              ? { ...proforma, items: updatedItems }
              : proforma,
          ),
        };
      }
      return {
        ...state,
        items: updatedItems,
      };
    }

    case ActionTypes.REMOVE_ITEM: {
      const itemId = action.payload;
      const updatedItems = state.items.filter((item) => item.id !== itemId);

      // Actualizar items en el estado global y en la proforma activa
      if (state.activeProformaId) {
        return {
          ...state,
          items: updatedItems,
          proformas: state.proformas.map((proforma) =>
            proforma.id === state.activeProformaId
              ? { ...proforma, items: updatedItems }
              : proforma,
          ),
        };
      }
      return {
        ...state,
        items: updatedItems,
      };
    }

    case ActionTypes.SET_CONFIG:
      return {
        ...state,
        config: action.payload,
      };

    case ActionTypes.SET_PREVIEW_MODE:
      return {
        ...state,
        previewMode: action.payload,
      };

    case ActionTypes.SET_SEARCH_STATE:
      return {
        ...state,
        searchState: action.payload,
      };

    case ActionTypes.UPDATE_SEARCH_STATE:
      return {
        ...state,
        searchState: {
          ...state.searchState,
          ...action.payload,
        },
      };

    default:
      return state;
  }
}

// Crear el contexto
const ProformaContext = createContext();

// Proveedor del contexto
export const ProformaProvider = ({ children }) => {
  const [state, dispatch] = useReducer(proformaReducer, initialState);

  // Memoize actions to avoid recreating them on every render
  const actions = React.useMemo(() => ({
    setProformas: (proformas) =>
      dispatch({ type: ActionTypes.SET_PROFORMAS, payload: proformas }),

    setActiveProformaId: (proformaId) =>
      dispatch({ type: ActionTypes.SET_ACTIVE_PROFORMA, payload: proformaId }),

    updateProforma: (proformaId, updates) =>
      dispatch({
        type: ActionTypes.UPDATE_PROFORMA,
        payload: { proformaId, updates },
      }),

    addNewProforma: (proforma) => {
      // Si no se proporciona una proforma, crear una nueva
      if (!proforma) {
        const newProforma = createEmptyProforma();
        newProforma.items = [];
        console.log("Creando nueva proforma en addNewProforma:", newProforma);
        dispatch({ type: ActionTypes.ADD_NEW_PROFORMA, payload: newProforma });
        return;
      }
      
      // Si se proporciona una proforma, verificar que sea válida
      if (proforma.id) {
        dispatch({ type: ActionTypes.ADD_NEW_PROFORMA, payload: proforma });
      } else {
        console.error("Invalid proforma in addNewProforma:", proforma);
      }
    },

    closeProforma: (proformaId) =>
      dispatch({ type: ActionTypes.CLOSE_PROFORMA, payload: proformaId }),

    setLoading: (loading) =>
      dispatch({ type: ActionTypes.SET_LOADING, payload: loading }),

    setClient: (client) =>
      dispatch({ type: ActionTypes.SET_CLIENT, payload: client }),

    setItems: (items) =>
      dispatch({ type: ActionTypes.SET_ITEMS, payload: items }),

    addItem: (item) => dispatch({ type: ActionTypes.ADD_ITEM, payload: item }),

    updateItem: (itemId, updates) =>
      dispatch({ type: ActionTypes.UPDATE_ITEM, payload: { itemId, updates } }),

    removeItem: (itemId) =>
      dispatch({ type: ActionTypes.REMOVE_ITEM, payload: itemId }),

    setConfig: (config) =>
      dispatch({ type: ActionTypes.SET_CONFIG, payload: config }),

    setPreviewMode: (previewMode) =>
      dispatch({ type: ActionTypes.SET_PREVIEW_MODE, payload: previewMode }),

    setSearchState: (searchState) =>
      dispatch({ type: ActionTypes.SET_SEARCH_STATE, payload: searchState }),

    updateSearchState: (updates) =>
      dispatch({ type: ActionTypes.UPDATE_SEARCH_STATE, payload: updates }),
  }), [dispatch]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = React.useMemo(() => ({ 
    state, 
    actions 
  }), [state, actions]);

  return (
    <ProformaContext.Provider value={value}>
      {children}
    </ProformaContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useProformaContext = () => {
  const context = useContext(ProformaContext);
  if (!context) {
    throw new Error(
      "useProformaContext debe usarse dentro de ProformaProvider",
    );
  }
  return context;
};

export default useProformaContext;
