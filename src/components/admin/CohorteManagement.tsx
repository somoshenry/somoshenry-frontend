'use client';

import { useEffect, useState } from 'react';
import { Plus, Users, Calendar, Clock, Edit, Trash2, UserPlus, X } from 'lucide-react';
import { getAllCohortes, createCohorte, deleteCohorte, addMemberToCohorte, Cohorte, CreateCohorteDto, CohorteStatusEnum, CohorteModalityEnum, CohorteRoleEnum, translateStatus, translateModality, translateRole, getStatusColor, getRoleColor } from '@/services/cohorteService';
import { api } from '@/services/api';

interface UserForSelection {
  id: string;
  email: string;
  name?: string;
  lastName?: string;
  username?: string;
  profilePicture?: string;
  role?: string; // Rol del usuario en el sistema (ADMIN, TEACHER, MEMBER, TA)
}

export default function CohorteManagement() {
  const [cohortes, setCohortes] = useState<Cohorte[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedCohorte, setSelectedCohorte] = useState<Cohorte | null>(null);
  const [users, setUsers] = useState<UserForSelection[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state para crear cohorte
  const [formData, setFormData] = useState<CreateCohorteDto>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: CohorteStatusEnum.UPCOMING,
    schedule: '',
    modality: CohorteModalityEnum.FULL_TIME,
    maxStudents: undefined,
  });

  // Form state para agregar miembro (ya no necesitamos role aquí)
  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    fetchCohortes();
    fetchUsers();
  }, []);

  const fetchCohortes = async () => {
    try {
      setLoading(true);
      const data = await getAllCohortes();
      setCohortes(data);
    } catch (error) {
      console.error('Error al obtener cohortes:', error);
      alert('Error al cargar cohortes');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      // Obtener TODOS los usuarios (límite alto para admin)
      const { data } = await api.get('/users', {
        params: {
          limit: 1000, // Límite alto para obtener todos
          status: 'ACTIVE', // Solo usuarios activos
        },
      });

      let usersList = data?.users || data?.data || [];

      // Si viene paginado, extraer el array correcto
      if (Array.isArray(data)) {
        usersList = data;
      }

      setUsers(usersList);
    } catch (error) {
      console.error('❌ Error al obtener usuarios:', error);
      alert('Error al cargar la lista de usuarios. Verifica tu conexión.');
    }
  };

  const handleCreateCohorte = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCohorte(formData);
      alert('Cohorte creada exitosamente');
      setShowCreateModal(false);
      resetForm();
      fetchCohortes();
    } catch (error) {
      console.error('Error al crear cohorte:', error);
      alert('Error al crear cohorte');
    }
  };

  const handleDeleteCohorte = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta cohorte?')) return;
    try {
      await deleteCohorte(id);
      alert('Cohorte eliminada exitosamente');
      fetchCohortes();
    } catch (error) {
      console.error('Error al eliminar cohorte:', error);
      alert('Error al eliminar cohorte');
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCohorte || !selectedUserId) return;

    try {
      // Obtener el usuario seleccionado para usar su rol del sistema
      const selectedUser = users.find((u) => u.id === selectedUserId);
      if (!selectedUser) {
        alert('Usuario no encontrado');
        return;
      }

      // Mapear el rol del usuario del sistema al rol de la cohorte
      let cohorteRole: CohorteRoleEnum;
      switch (selectedUser.role) {
        case 'ADMIN':
          cohorteRole = CohorteRoleEnum.ADMIN;
          break;
        case 'TEACHER':
          cohorteRole = CohorteRoleEnum.TEACHER;
          break;
        case 'TA':
          cohorteRole = CohorteRoleEnum.TA;
          break;
        default:
          cohorteRole = CohorteRoleEnum.STUDENT; // MEMBER -> STUDENT en cohorte
      }

      await addMemberToCohorte(selectedCohorte.id, selectedUserId, cohorteRole);
      alert(`Miembro agregado exitosamente como ${cohorteRole}`);
      setShowAddMemberModal(false);
      setSelectedCohorte(null);
      setSelectedUserId('');
      setSearchTerm('');
      fetchCohortes();
    } catch (error) {
      console.error('Error al agregar miembro:', error);
      alert('Error al agregar miembro. Verifica que no esté ya en la cohorte.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      status: CohorteStatusEnum.UPCOMING,
      schedule: '',
      modality: CohorteModalityEnum.FULL_TIME,
      maxStudents: undefined,
    });
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return user.email.toLowerCase().includes(searchLower) || user.name?.toLowerCase().includes(searchLower) || user.lastName?.toLowerCase().includes(searchLower) || user.username?.toLowerCase().includes(searchLower);
  });

  const getUserName = (user: UserForSelection): string => {
    if (user.name && user.lastName) return `${user.name} ${user.lastName}`;
    if (user.username) return user.username;
    return user.email;
  };

  const getRoleBadge = (role: string): string => {
    const badges: Record<string, string> = {
      ADMIN: '👑 Admin',
      TEACHER: '📚 Docente',
      TA: '🎓 TA',
      MEMBER: '👤 Estudiante',
    };
    return badges[role] || '👤 Estudiante';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Cohortes</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total: {cohortes.length} cohortes</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
          <Plus size={20} />
          Nueva Cohorte
        </button>
      </div>

      {/* Lista de cohortes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {cohortes.map((cohorte) => (
          <div key={cohorte.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            {/* Header de la cohorte */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{cohorte.name}</h3>
                <div className="flex gap-2 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(cohorte.status)}`}>{translateStatus(cohorte.status)}</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">{translateModality(cohorte.modality)}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedCohorte(cohorte);
                    setShowAddMemberModal(true);
                  }}
                  className="p-2 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800 rounded-lg transition-colors"
                  title="Agregar miembro"
                >
                  <UserPlus size={18} />
                </button>
                <button onClick={() => handleDeleteCohorte(cohorte.id)} className="p-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 rounded-lg transition-colors" title="Eliminar cohorte">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Descripción */}
            {cohorte.description && <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{cohorte.description}</p>}

            {/* Información de fechas */}
            <div className="space-y-2 mb-4">
              {cohorte.startDate && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar size={16} />
                  <span>Inicio: {new Date(cohorte.startDate).toLocaleDateString()}</span>
                </div>
              )}
              {cohorte.endDate && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar size={16} />
                  <span>Fin: {new Date(cohorte.endDate).toLocaleDateString()}</span>
                </div>
              )}
              {cohorte.schedule && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock size={16} />
                  <span>{cohorte.schedule}</span>
                </div>
              )}
            </div>

            {/* Miembros */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Users size={18} className="text-gray-600 dark:text-gray-400" />
                <span className="font-semibold text-gray-900 dark:text-white">Miembros ({cohorte.members?.length || 0})</span>
              </div>
              {cohorte.members && cohorte.members.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {cohorte.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">{member.user.name?.[0] || member.user.email[0].toUpperCase()}</div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{member.user.name && member.user.lastName ? `${member.user.name} ${member.user.lastName}` : member.user.username || member.user.email}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{member.user.email}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleColor(member.role)}`}>{translateRole(member.role)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No hay miembros aún</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {cohortes.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No hay cohortes creadas</p>
          <button onClick={() => setShowCreateModal(true)} className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
            Crear primera cohorte
          </button>
        </div>
      )}

      {/* Modal: Crear Cohorte */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Nueva Cohorte</h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateCohorte} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre *</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="ej: Cohorte 68" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descripción</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" rows={3} placeholder="Descripción de la cohorte" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha de Inicio</label>
                    <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha de Fin</label>
                    <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Horario</label>
                  <input type="text" value={formData.schedule} onChange={(e) => setFormData({ ...formData, schedule: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="ej: Lun-Vie 9:00-17:00" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estado</label>
                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as CohorteStatusEnum })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option value={CohorteStatusEnum.UPCOMING}>Próxima</option>
                      <option value={CohorteStatusEnum.ACTIVE}>Activa</option>
                      <option value={CohorteStatusEnum.COMPLETED}>Completada</option>
                      <option value={CohorteStatusEnum.CANCELLED}>Cancelada</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Modalidad</label>
                    <select value={formData.modality} onChange={(e) => setFormData({ ...formData, modality: e.target.value as CohorteModalityEnum })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option value={CohorteModalityEnum.FULL_TIME}>Tiempo Completo</option>
                      <option value={CohorteModalityEnum.PART_TIME}>Medio Tiempo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Máximo de Estudiantes</label>
                  <input type="number" value={formData.maxStudents || ''} onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value ? parseInt(e.target.value) : undefined })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="ej: 30" />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors">
                    Crear Cohorte
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Agregar Miembro */}
      {showAddMemberModal && selectedCohorte && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Agregar Miembro a {selectedCohorte.name}</h3>
                <button
                  onClick={() => {
                    setShowAddMemberModal(false);
                    setSelectedCohorte(null);
                    setSelectedUserId('');
                    setSearchTerm('');
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddMember} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Buscar Usuario</label>
                  <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-3" placeholder="Buscar por nombre, email o username..." />

                  <select required value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" size={10}>
                    <option value="">Selecciona un usuario</option>
                    {filteredUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {getRoleBadge(user.role || 'MEMBER')} | {getUserName(user)} - {user.email}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedUserId && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      <strong>ℹ️ Nota:</strong> El usuario será agregado con el rol que tiene en el sistema: <span className="font-bold">{getRoleBadge(users.find((u) => u.id === selectedUserId)?.role || 'MEMBER')}</span>
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors">
                    Agregar Miembro
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddMemberModal(false);
                      setSelectedCohorte(null);
                      setSelectedUserId('');
                      setSearchTerm('');
                    }}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
