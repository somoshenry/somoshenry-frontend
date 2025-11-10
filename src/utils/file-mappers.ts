export const mapMimeToCategory = (mimeType: string): string => {
  if (!mimeType) return "default";

  const type = mimeType.toLowerCase();

  // 1. IMAGEN
  if (type.startsWith("image/")) {
    return "image";
  }

  // 2. VIDEO
  if (type.startsWith("video/")) {
    return "video";
  }

  // 3. DOCUMENTOS (Aseguramos que capture Word, PDF, Excel, etc. PRIMERO)
  // Usamos las claves de los formatos de Microsoft Office y PDF.
  if (
    type.includes("pdf") ||
    type.includes("wordprocessingml") || // <-- Específico para .docx (Word)
    type.includes("spreadsheetml") || // <-- Específico para .xlsx (Excel)
    type.includes("presentationml") || // <-- Específico para .pptx (PowerPoint)
    type.includes("text/plain")
  ) {
    return "doc";
  }

  // 4. CÓDIGO/SCRIPT/MARCADO (Debe ir después de los documentos para evitar conflictos)
  if (
    type.includes("javascript") ||
    type.includes("typescript") ||
    type.includes("html") ||
    type.includes("css") ||
    type.includes("json") ||
    type.includes("xml") ||
    type.includes("python")
  ) {
    return "code";
  }

  // 5. POR DEFECTO
  return "default";
};
