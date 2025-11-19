"use client";
import {
  Users,
  Ban,
  Shield,
  Trash2,
  User,
  Search,
  Edit2,
  RotateCcw,
  Trash,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {useEffect, useState} from "react";
import {getUsers, deleteUser, AdminUser, updateUser, restoreUser, hardDeleteUser} from "@/services/adminService";
import {useAuth} from "@/hook/useAuth";
import Swal from "sweetalert2";

type ModalType = "edit" | "delete" | "restore" | "hardDelete" | null;

export default function UserManagement() {
  const {user: currentUser} = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ADMIN" | "TEACHER" | "MEMBER" | "">("");
  const [statusFilter, setStatusFilter] = useState<"ACTIVE" | "SUSPENDED" | "DELETED" | "">("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  // Modal states
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({role: "", status: ""});
  const [actionLoading, setActionLoading] = useState(false);

  // Cargar usuarios
  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter, currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = {page: currentPage, limit};
      if (searchTerm) params.name = searchTerm;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;

      const {users: fetchedUsers, total: totalUsers} = await getUsers(params);
      setUsers(fetchedUsers);
      setTotal(totalUsers);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers();
  };

  const openModal = (type: ModalType, user: AdminUser) => {
    setSelectedUser(user);
    setModalType(type);
    if (type === "edit") {
      setEditForm({role: user.role, status: user.status});
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedUser(null);
    setEditForm({role: "", status: ""});
  };

  const handleEditUser = async () => {
    if (!selectedUser || !currentUser) return;
    setActionLoading(true);
    try {
      await updateUser(selectedUser.id, {
        role: editForm.role as "ADMIN" | "TEACHER" | "MEMBER",
        status: editForm.status as "ACTIVE" | "SUSPENDED" | "DELETED",
      });
      fetchUsers();

      closeModal();
    } catch (error) {
      Swal.fire("Error al actualizar usuario");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser || !currentUser) return;
    setActionLoading(true);
    try {
      await deleteUser(selectedUser.id);
      fetchUsers(); // Recargar para ver el cambio de estado

      closeModal();
    } catch (error) {
      Swal.fire("Error al eliminar usuario");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestoreUser = async () => {
    if (!selectedUser || !currentUser) return;
    setActionLoading(true);
    try {
      await restoreUser(selectedUser.id);
      fetchUsers();

      closeModal();
    } catch (error) {
      Swal.fire("Error al restaurar usuario");
    } finally {
      setActionLoading(false);
    }
  };

  const handleHardDeleteUser = async () => {
    if (!selectedUser || !currentUser) return;
    setActionLoading(true);
    try {
      await hardDeleteUser(selectedUser.id);
      setUsers(users.filter((u) => u.id !== selectedUser.id));

      closeModal();
    } catch (error) {
      Swal.fire("Error al eliminar permanentemente");
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      ADMIN: "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200",
      TEACHER: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
      MEMBER: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
    };
    return styles[role as keyof typeof styles] || styles.MEMBER;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
      SUSPENDED: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
      DELETED: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400",
    };
    return styles[status as keyof typeof styles] || styles.ACTIVE;
  };

  const getDisplayName = (user: AdminUser) => {
    if (user.name && user.lastName) return `${user.name} ${user.lastName}`;
    if (user.name) return user.name;
    if (user.username) return user.username;
    return user.email.split("@")[0];
  };

  const getInitials = (user: AdminUser) => {
    if (user.name) return user.name.charAt(0).toUpperCase();
    if (user.username) return user.username.charAt(0).toUpperCase();
    return user.email.charAt(0).toUpperCase();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Users className="text-blue-500" size={24} />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gestión de Usuarios</h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">({total} usuarios)</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {/* Filtro por rol */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Todos los roles</option>
                <option value="ADMIN">Admin</option>
                <option value="TEACHER">Teacher</option>
                <option value="MEMBER">Member</option>
              </select>
              {/* Filtro por estado */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Todos los estados</option>
                <option value="ACTIVE">Activo</option>
                <option value="SUSPENDED">Suspendido</option>
                <option value="DELETED">Eliminado</option>
              </select>
              {/* Búsqueda */}
              <div className="relative flex">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  onClick={handleSearch}
                  className="ml-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 cursor-pointer text-white rounded-lg transition cursor-pointer"
                >
                  Buscar
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">Cargando usuarios...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">No se encontraron usuarios</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Fecha Registro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-linear-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                            {getInitials(user)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {getDisplayName(user)}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadge(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                            user.status
                          )}`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString("es-ES")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal("edit", user)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Editar usuario"
                          >
                            <Edit2 size={18} />
                          </button>
                          {user.status === "DELETED" ? (
                            <>
                              <button
                                onClick={() => openModal("restore", user)}
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                title="Restaurar usuario"
                              >
                                <RotateCcw size={18} />
                              </button>
                              <button
                                onClick={() => openModal("hardDelete", user)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                title="Eliminar permanentemente"
                              >
                                <Trash size={18} />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => openModal("delete", user)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="Eliminar usuario"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Mostrando {(currentPage - 1) * limit + 1} - {Math.min(currentPage * limit, total)} de {total} usuarios
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    Anterior
                  </button>
                  <span className="px-3 py-1 text-gray-700 dark:text-gray-300">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Edición */}
      {modalType === "edit" && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Editar Usuario</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{getDisplayName(selectedUser)}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rol</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="MEMBER">Member</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estado</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="ACTIVE">Activo</option>
                  <option value="SUSPENDED">Suspendido</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
              <button
                onClick={closeModal}
                disabled={actionLoading}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditUser}
                disabled={actionLoading}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
              >
                {actionLoading ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Eliminación Suave */}
      {modalType === "delete" && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 dark:bg-red-900 p-3 rounded-full">
                  <AlertCircle className="text-red-600 dark:text-red-400" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Eliminar Usuario</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{getDisplayName(selectedUser)}</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                ¿Estás seguro de que deseas eliminar este usuario? Esta acción es reversible (soft delete).
              </p>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  El usuario será marcado como DELETED pero podrá ser restaurado posteriormente.
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
              <button
                onClick={closeModal}
                disabled={actionLoading}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg disabled:opacity-50"
              >
                {actionLoading ? "Eliminando..." : "Eliminar Usuario"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Restauración */}
      {modalType === "restore" && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                  <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Restaurar Usuario</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{getDisplayName(selectedUser)}</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                ¿Deseas restaurar este usuario? Volverá a tener acceso a la plataforma.
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
              <button
                onClick={closeModal}
                disabled={actionLoading}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleRestoreUser}
                disabled={actionLoading}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg disabled:opacity-50"
              >
                {actionLoading ? "Restaurando..." : "Restaurar Usuario"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Eliminación Permanente */}
      {modalType === "hardDelete" && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 dark:bg-red-900 p-3 rounded-full">
                  <XCircle className="text-red-600 dark:text-red-400" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Eliminar Permanentemente</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{getDisplayName(selectedUser)}</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                ¿Estás seguro? Esta acción <strong>NO se puede deshacer</strong>. El usuario será eliminado
                permanentemente de la base de datos.
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-800 dark:text-red-300 font-semibold">
                  ⚠️ ADVERTENCIA: Esta es una acción IRREVERSIBLE
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
              <button
                onClick={closeModal}
                disabled={actionLoading}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleHardDeleteUser}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
              >
                {actionLoading ? "Eliminando..." : "Eliminar Permanentemente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
