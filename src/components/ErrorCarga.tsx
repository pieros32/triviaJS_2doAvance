interface Props {
  titulo: string;
  mensaje: string;
}

// Aviso de error reutilizable (alert de Bootstrap). El padre lo muestra solo cuando hay error.
export default function ErrorCarga({ titulo, mensaje }: Props) {
  return (
    <div className="alert alert-danger d-flex align-items-center gap-3 mb-0" role="alert">
      <svg fill="none" height="24" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="24" className="flex-shrink-0">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" x2="12" y1="8" y2="12"></line>
        <line x1="12" x2="12.01" y1="16" y2="16"></line>
      </svg>
      <div>
        <strong>{titulo}</strong> {mensaje}
      </div>
    </div>
  );
}
