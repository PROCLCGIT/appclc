import { cn } from "@/lib/utils";

/**
 * Componente de Skeleton para mostrar placeholders durante la carga
 * @param {Object} props - Propiedades del componente
 * @param {string} props.className - Clases adicionales para personalizar el skeleton
 * @param {React.ReactNode} props.children - Contenido opcional dentro del skeleton
 * @returns {JSX.Element} - Componente Skeleton
 */
function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-primary/10", className)}
      {...props}
    />
  );
}

export { Skeleton };
