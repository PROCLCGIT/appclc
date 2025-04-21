import { useState, useEffect } from 'react';

/**
 * Hook que devuelve `true` si `flag` lleva `delay` ms en true.
 * Resetea inmediatamente a false cuando `flag` pasa a false.
 * Evita "flashes" de UI para operaciones rápidas.
 * 
 * @param {boolean} flag - Bandera de activación (ej: isLoading)
 * @param {number} delay - Tiempo en ms antes de mostrar el estado de carga
 * @returns {boolean} - Flag retrasado que evita mostrar estados transitorios
 */
export function useDelayedFlag(flag, delay = 200) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let timer;
    
    if (flag) {
      // Solo mostramos el loading tras el delay
      timer = setTimeout(() => setShow(true), delay);
    } else {
      // Cuando deja de cargar, ocultamos inmediatamente
      setShow(false);
    }
    
    // Limpiar el timer si el componente se desmonta o flag cambia
    return () => clearTimeout(timer);
  }, [flag, delay]);

  return show;
}

export default useDelayedFlag;
