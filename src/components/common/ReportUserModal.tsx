"use client";
import {useState} from "react";
import {api} from "@/services/api";
import {X} from "lucide-react";
import Swal from "sweetalert2";

interface ReportUserModalProps {
  userId: string;
  userName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ReportUserModal({userId, userName, onClose, onSuccess}: ReportUserModalProps) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reasons = [
    {value: "SPAM", label: "🚫 Spam o contenido no deseado"},
    {value: "HARASSMENT", label: "😡 Acoso o intimidación"},
    {value: "HATE_SPEECH", label: "💢 Discurso de odio"},
    {value: "INAPPROPRIATE", label: "⚠️ Contenido inapropiado"},
    {value: "IMPERSONATION", label: "👤 Suplantación de identidad"},
    {value: "OTHER", label: "📝 Otro motivo"},
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason) {
      Swal.fire("Por favor selecciona un motivo de reporte");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post("/report/user", {
        userId,
        reason,
        description: description.trim() || undefined,
      });

      //alert('✅ Usuario reportado correctamente. Revisaremos tu reporte.');
      Swal.fire({
        title: "Exitoso",
        text: "El usuario ha sido reportado correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
      });
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Error al reportar usuario:", error);

      if (error?.response?.status === 404) {
        //alert('⚠️ Funcionalidad de reportes no disponible en el backend');
      } else {
        //alert('❌ Error al reportar usuario. Intenta nuevamente.');
        Swal.fire({
          title: "Error",
          text: "Error al reportar usuario. Intenta nuevamente.",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 relative">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-black cursor-pointer bg-red-500 p-1 hover:text-white rounded-xl dark:hover:text-gray-200 transition"
          title="Cerrar"
        >
          <X size={24} />
        </button>

        {/* Título */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Reportar usuario</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Estás reportando a <span className="font-semibold">{userName}</span>
        </p>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Motivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Motivo del reporte *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ffff00]"
              required
            >
              <option value="">Selecciona un motivo</option>
              {reasons.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Descripción opcional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción adicional (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Proporciona más detalles sobre el reporte..."
              rows={4}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ffff00] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description.length}/500 caracteres</p>
          </div>

          {/* Botones */}
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 cursor-pointer dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg cursor-pointer hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || !reason}
            >
              {isSubmitting ? "Reportando..." : "Reportar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
