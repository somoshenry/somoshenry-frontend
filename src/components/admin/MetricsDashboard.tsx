"use client";

import {useEffect, useState} from "react";
import {
  Users,
  FileText,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  Calendar,
  UserPlus,
  Activity,
  GraduationCap,
} from "lucide-react";
import {api} from "@/services/api";
import {getAllCohortes} from "@/services/cohorteService";
import {type LucideIcon} from "lucide-react";

interface UserData {
  id: string;
  email: string;
  name?: string;
  lastName?: string;
  createdAt: string;
}

interface PostData {
  id: string;
  comments?: unknown[];
}

interface MetricsData {
  totalUsers: number;
  newUsersThisMonth: number;
  totalPosts: number;
  totalComments: number;
  totalReports: number;
  totalCohortes: number;
  activeCohortes: number;
  recentUsers: UserData[];
}

export default function MetricsDashboard() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");

  useEffect(() => {
    fetchMetrics();
  }, [timeRange]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);

      // Obtener usuarios
      const usersResponse = await api.get("/users");
      const users = usersResponse.data?.users || usersResponse.data?.data || [];

      // Calcular usuarios nuevos este mes
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const newUsersThisMonth = users.filter((user: UserData) => new Date(user.createdAt) >= firstDayOfMonth).length;

      // Obtener cohortes
      const cohortes = await getAllCohortes();
      const activeCohortes = cohortes.filter((c) => c.status === "ACTIVE").length;

      // Obtener posts y comentarios (usando endpoints existentes)
      let totalPosts = 0;
      let totalComments = 0;
      try {
        const postsResponse = await api.get("/post");
        totalPosts = postsResponse.data?.length || 0;

        // Contar comentarios de todos los posts
        if (postsResponse.data) {
          totalComments = postsResponse.data.reduce((acc: number, post: PostData) => {
            return acc + (post.comments?.length || 0);
          }, 0);
        }
      } catch (error) {
        console.error("Error al obtener posts:", error);
      }

      // Obtener reportes
      let totalReports = 0;
      try {
        const reportsResponse = await api.get("/report");
        totalReports = reportsResponse.data?.length || 0;
      } catch (error) {
        console.error("Error al obtener reportes:", error);
      }

      // Ordenar usuarios recientes
      const recentUsers = users
        .sort((a: UserData, b: UserData) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      setMetrics({
        totalUsers: users.length,
        newUsersThisMonth,
        totalPosts,
        totalComments,
        totalReports,
        totalCohortes: cohortes.length,
        activeCohortes,
        recentUsers,
      });
    } catch (error) {
      console.error("Error al obtener métricas:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">No se pudieron cargar las métricas</p>
      </div>
    );
  }

  const StatCard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    color = "blue",
    trend,
  }: {
    icon: LucideIcon;
    title: string;
    value: number | string;
    subtitle?: string;
    color?: string;
    trend?: string;
  }) => {
    const colorClasses: Record<string, string> = {
      blue: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
      green: "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400",
      purple: "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400",
      orange: "bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400",
      red: "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400",
      yellow: "bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-[#ffff00]",
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon size={24} />
          </div>
          {trend && (
            <span className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
              <TrendingUp size={14} />
              {trend}
            </span>
          )}
        </div>
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Métricas y Crecimiento</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Estadísticas generales de la plataforma</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange("week")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === "week"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setTimeRange("month")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === "month"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Mes
          </button>
          <button
            onClick={() => setTimeRange("year")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === "year"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Año
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Total Usuarios"
          value={metrics.totalUsers}
          subtitle={`${metrics.newUsersThisMonth} nuevos este mes`}
          color="blue"
          trend={metrics.newUsersThisMonth > 0 ? `+${metrics.newUsersThisMonth}` : undefined}
        />
        <StatCard
          icon={FileText}
          title="Total Posts"
          value={metrics.totalPosts}
          subtitle="Publicaciones totales"
          color="purple"
        />
        <StatCard
          icon={MessageSquare}
          title="Total Comentarios"
          value={metrics.totalComments}
          subtitle="Interacciones en posts"
          color="green"
        />
        <StatCard
          icon={AlertTriangle}
          title="Reportes"
          value={metrics.totalReports}
          subtitle="Contenido reportado"
          color="orange"
        />
      </div>

      {/* Cohortes Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          icon={GraduationCap}
          title="Total Cohortes"
          value={metrics.totalCohortes}
          subtitle="Cohortes creadas"
          color="blue"
        />
        <StatCard
          icon={Activity}
          title="Cohortes Activas"
          value={metrics.activeCohortes}
          subtitle="En progreso actualmente"
          color="green"
        />
      </div>

      {/* Usuarios Recientes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <UserPlus className="text-blue-500" size={24} />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Usuarios Recientes</h3>
        </div>
        <div className="space-y-3">
          {metrics.recentUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  {user.name?.[0] || user.email[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {user.name && user.lastName ? `${user.name} ${user.lastName}` : user.email}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Calendar size={16} />
                {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suscripciones - Próximamente */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border-2 border-dashed border-blue-300 dark:border-gray-600 p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full">
            <TrendingUp size={32} className="text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Métricas de Suscripciones</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Sistema de pagos y suscripciones próximamente disponible
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm">
          <Activity size={16} />
          En desarrollo
        </div>
      </div>
    </div>
  );
}
