export default function Cargando({ texto = 'Cargando…' }: { texto?: string }) {
  return (
    <div className="estado-carga d-flex justify-content-center align-items-center gap-2" role="status">
      <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
      {texto}
    </div>
  );
}
