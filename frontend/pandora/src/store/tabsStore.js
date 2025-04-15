// src/store/tabsStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Crear store para las pestañas
// Importante: Solo guardamos datos serializables, no componentes React
const useTabsStore = create(
  persist(
    (set) => ({
      tabs: [], // Array de objetos { path, title }
      setTabs: (tabs) => set({ tabs }),
      addTab: (tab) => set((state) => {
        const existingTabIndex = state.tabs.findIndex(t => t.path === tab.path);
        if (existingTabIndex >= 0) {
          // Si la pestaña ya existe, no hacer nada
          return { tabs: state.tabs };
        } else {
          // Agregar la nueva pestaña (asegúrate de que no tenga componentes React)
          const safeTab = {
            path: tab.path,
            title: tab.title,
            // No incluimos íconos directamente, solo referencias
            iconKey: tab.iconKey || tab.path
          };
          return { tabs: [...state.tabs, safeTab] };
        }
      }),
      removeTab: (path) => set((state) => ({
        tabs: state.tabs.filter(tab => tab.path !== path)
      })),
      clearTabs: () => set({ tabs: [] }),
    }),
    {
      name: 'pandora-tabs-storage', // Nombre para localStorage
      storage: createJSONStorage(() => localStorage),
      // Solo guardar datos serializables
      partialize: (state) => ({ 
        tabs: state.tabs.map(tab => ({
          path: tab.path,
          title: tab.title,
          iconKey: tab.iconKey
        })) 
      }),
    }
  )
);

export default useTabsStore;