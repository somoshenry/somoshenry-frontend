import {Participant} from "@/app/chat/page";

interface GroupInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupName: string;
  groupImage?: string;
  participants: Participant[];
}

export default function GroupInfoModal({isOpen, onClose, groupName, groupImage, participants}: GroupInfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#ffff00] to-yellow-500 p-6 text-white">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Imagen del grupo */}
          <div className="flex flex-col items-center">
            {groupImage ? (
              <img
                src={groupImage}
                alt={groupName}
                className="w-32 h-32 rounded-full object-cover border-4 border-white/30 shadow-xl mb-4"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30 shadow-xl mb-4">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            )}
            <h2 className="text-2xl font-bold">{groupName}</h2>
            <p className="text-white/80 text-sm mt-1">{participants.length} miembros</p>
          </div>
        </div>

        {/* Lista de miembros */}
        <div className="p-6 flex-1 overflow-y-auto">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
            Miembros del grupo
          </h3>

          <div className="space-y-3">
            {participants.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {member.avatar ? (
                  <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ffff00] to-yellow-500 flex items-center justify-center text-white font-bold text-lg">
                    {member.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">{member.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
