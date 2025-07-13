import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { axiosAdmin } from "../../api/axiosClient";
import { Users, FileText, Database, Settings, Activity, BookOpen } from "lucide-react";

interface Stats {
  totalVehicles: number;
  activeVehicles: number;
  featuredVehicles: number;
  recentSyncs: number;
  vehiclesByType: Record<string, number>;
  lastSync: {
    type: string;
    status: string;
    startedAt: string;
    completedAt: string;
    vehiclesProcessed: number;
  } | null;
  totalBlogPosts?: number;
  publishedPosts?: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await axiosAdmin.get("/admin/stats");
      
      // También cargar estadísticas del blog
      const blogRes = await axiosAdmin.get("/admin/blog-posts", { params: { per_page: 1 } });
      const publishedRes = await axiosAdmin.get("/admin/blog-posts", { 
        params: { per_page: 1, status: 'publish' } 
      });
      
      setStats({
        ...res.data,
        totalBlogPosts: blogRes.data.total,
        publishedPosts: publishedRes.data.total
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando estadísticas...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Vehículos</p>
              <p className="text-2xl font-bold">{stats?.totalVehicles || 0}</p>
            </div>
            <Database className="h-8 w-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Vehículos Activos</p>
              <p className="text-2xl font-bold">{stats?.activeVehicles || 0}</p>
            </div>
            <Activity className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Posts del Blog</p>
              <p className="text-2xl font-bold">{stats?.totalBlogPosts || 0}</p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Posts Publicados</p>
              <p className="text-2xl font-bold">{stats?.publishedPosts || 0}</p>
            </div>
            <FileText className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/admin/vehicles" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Database className="h-5 w-5 text-orange-500" />
            Gestionar Vehículos
          </h3>
          <p className="text-gray-600">Ver y administrar todos los vehículos</p>
        </Link>

        <Link to="/admin/blog" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            Gestionar Blog
          </h3>
          <p className="text-gray-600">Administrar posts del blog</p>
        </Link>

        <Link to="/admin/sync" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500" />
            Sincronización
          </h3>
          <p className="text-gray-600">Ver estado y ejecutar sincronizaciones</p>
        </Link>

        <Link to="/admin/users" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-500" />
            Gestionar Usuarios
          </h3>
          <p className="text-gray-600">Administrar usuarios y profesionales</p>
        </Link>

        <Link to="/admin/config" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-500" />
            Configuración
          </h3>
          <p className="text-gray-600">Ajustes del sistema</p>
        </Link>
      </div>

      {/* Last Sync Info */}
      {stats?.lastSync && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Última Sincronización</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Tipo</p>
              <p className="font-medium">{stats.lastSync.type}</p>
            </div>
            <div>
              <p className="text-gray-600">Estado</p>
              <p className={`font-medium ${
                stats.lastSync.status === 'completed' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stats.lastSync.status}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Vehículos Procesados</p>
              <p className="font-medium">{stats.lastSync.vehiclesProcessed}</p>
            </div>
            <div>
              <p className="text-gray-600">Completado</p>
              <p className="font-medium">
                {new Date(stats.lastSync.completedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}