'use client';

import { useState } from 'react';
import { X, Users, GraduationCap, BookOpen } from 'lucide-react';
import { UserResult } from '@/components/ui/GenericList';

interface MembersListProps {
  students: UserResult[];
  teachers: UserResult[];
  tas: UserResult[];
  onClose: () => void;
}

export default function MembersList({ students, teachers, tas, onClose }: MembersListProps) {
  const [activeTab, setActiveTab] = useState<'teachers' | 'tas' | 'students'>('teachers');

  const getUserName = (user: UserResult) => {
    if (user.name && user.lastName) return `${user.name} ${user.lastName}`;
    return user.email;
  };

  const getUserInitials = (user: UserResult) => {
    if (user.name && user.lastName) {
      return `${user.name[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.email.substring(0, 2).toUpperCase();
  };

  const renderMembers = (members: UserResult[], emptyMessage: string) => {
    if (members.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <div key={member.id} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            {member.profilePicture ? <img src={member.profilePicture} alt={getUserName(member)} className="w-12 h-12 rounded-full object-cover" /> : <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">{getUserInitials(member)}</div>}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white truncate">{getUserName(member)}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{member.email}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Miembros de la Cohorte</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X size={24} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
          <button onClick={() => setActiveTab('teachers')} className={`flex-1 py-4 px-6 font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'teachers' ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
            <GraduationCap size={20} />
            Docentes ({teachers.length})
          </button>

          {tas.length > 0 && (
            <button onClick={() => setActiveTab('tas')} className={`flex-1 py-4 px-6 font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'tas' ? 'bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 border-b-2 border-green-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              <BookOpen size={20} />
              Asistentes ({tas.length})
            </button>
          )}

          <button onClick={() => setActiveTab('students')} className={`flex-1 py-4 px-6 font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'students' ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 border-b-2 border-purple-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
            <Users size={20} />
            Estudiantes ({students.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'teachers' && renderMembers(teachers, 'No hay docentes asignados')}
          {activeTab === 'tas' && renderMembers(tas, 'No hay asistentes asignados')}
          {activeTab === 'students' && renderMembers(students, 'No hay estudiantes inscritos')}
        </div>

        {/* Footer con estadísticas */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-750">
          <div className="flex justify-around text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{teachers.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Docentes</p>
            </div>
            {tas.length > 0 && (
              <div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{tas.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Asistentes</p>
              </div>
            )}
            <div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{students.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Estudiantes</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{teachers.length + tas.length + students.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
