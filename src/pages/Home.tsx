import { useEffect, useState } from "react";
import { axiosAdmin } from "../api/axiosClient";

export default function Home() {
  const [vehicles, setVehicles] = useState<{ id: number; [key: string]: unknown }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    axiosAdmin.get("/vehicles?anunci-actiu=true", {
      params: { page }
    })
    .then(res => {
      console.log("Respuesta axiosAdmin:", res.data);
      setVehicles(res.data.items || []);
    })
    .catch(() => {
      setError("Error al cargar vehículos");
    })
    .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <h1>Listado de Vehículos</h1>
      {loading && <div>Cargando...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      <ul>
        {vehicles.map((v) => (
          <li key={v.id}>{String(v["titol-anunci"] || v["marques-cotxe"] || "")}</li>
        ))}
      </ul>
      <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Anterior</button>
      <button onClick={() => setPage((p) => p + 1)}>Siguiente</button>
    </div>
  );
}