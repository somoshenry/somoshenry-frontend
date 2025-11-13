"use client";
import {useState} from "react";
import {AlertTriangle, X} from "lucide-react";
import {reportPost, reportComment, getReportReasons} from "@/services/reportService";
import {ReportReason} from "@/services/adminService";
import Swal from "sweetalert2";

interface ReportModalProps {
  type: "post" | "comment";
  targetId: string;
  targetTitle?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ReportModal({type, targetId, targetTitle, onClose, onSuccess}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<ReportReason | "">("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const reasons = getReportReasons();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedReason) {
      Swal.fire("Por favor selecciona un motivo");
      return;
    }

    setLoading(true);
    try {
      if (type === "post") {
        await reportPost(targetId, selectedReason as ReportReason, description || undefined);
      } else {
        await reportComment(targetId, selectedReason as ReportReason, description || undefined);
      }
      Swal.fire("Reporte enviado correctamente. Será revisado por los administradores.");

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Error al crear reporte:", error);
      Swal.fire({
        icon: "error",
        title: "¡Error!",
        text: error.response?.data?.message || "Error al enviar el reporte. Por favor intenta nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-orange-500" size={24} />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Reportar {type === "post" ? "Publicación" : "Comentario"}
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {targetTitle && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Reportando:</p>
              <p className="text-gray-900 dark:text-white font-medium">{targetTitle}</p>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Motivo del reporte *
            </label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value as ReportReason)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Selecciona un motivo</option>
              {reasons.map((reason) => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </select>
            {selectedReason && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {reasons.find((r) => r.value === selectedReason)?.description}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción adicional (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="Proporciona más detalles sobre el problema..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white resize-none"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
              {description.length}/1000 caracteres
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || !selectedReason}
              className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Enviando..." : "Enviar Reporte"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>

          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
            Los reportes son revisados por nuestro equipo de moderación. El mal uso de esta función puede resultar en
            sanciones.
          </p>
        </form>
      </div>
    </div>
  );
}
