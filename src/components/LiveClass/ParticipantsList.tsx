// src/components/LiveClass/ParticipantsList.tsx

"use client";

import {Participant} from "@/types/webrtc.types";

interface ParticipantsListProps {
  participants: Participant[];
}

export const ParticipantsList: React.FC<ParticipantsListProps> = ({participants}) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Participantes</h3>
        <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
          {participants.length}
        </span>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {participants.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No hay participantes aún</p>
        ) : (
          participants.map((participant) => (
            <div
              key={participant.userId}
              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {/* Avatar */}
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                  {participant.name?.charAt(0).toUpperCase() || participant.userId.charAt(0).toUpperCase()}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {participant.name || participant.userId.substring(0, 8)}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {/* Indicador Audio */}
                  {participant.audio ? (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                          clipRule="evenodd"
                        />
                      </svg>
                      ON
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-500">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      OFF
                    </span>
                  )}

                  <span>|</span>

                  {/* Indicador Video */}
                  {participant.video ? (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                      ON
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-500">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A2 2 0 0018 13.5V6.5a1 1 0 00-1.447-.894l-2 1A1 1 0 0014 7.5v2.293l-3-3V5.5A2 2 0 009 3.5H6.707l-3-3zM7.414 6L11 9.586V13.5a2 2 0 01-2 2H4a2 2 0 01-2-2V7.5a2 2 0 012-2h3.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      OFF
                    </span>
                  )}
                </div>
              </div>

              {/* Indicador de compartir pantalla */}
              {participant.screen && (
                <div className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-medium">🖥️</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
