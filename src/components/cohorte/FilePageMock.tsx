// Mock version of FilePage for cohorte-mock (no backend dependencies)

import IFileCardProps from '@/interfaces/cohorte/IFileCardProps';
import { useState } from 'react';
import FileCard from './FileCard';
import FilePageReal from './FilePageReal';

const fileMocks: IFileCardProps[] = [
  {
    name: 'Guía de Inicio Rápido de React',
    description: 'Documento PDF para configurar un proyecto React.',
    uploadedAt: '28/10/2025',
    type: 'application/pdf',
    url: 'https://ejemplos.com/files/react-quickstart-guide.pdf',
  },
  {
    name: 'Informe Trimestral Q3 2025',
    description: 'Detalle de métricas y resultados del tercer trimestre. Editable.',
    uploadedAt: '01/11/2025',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    url: 'https://ejemplos.com/files/reporte-q3-2025.docx',
  },
  {
    name: 'Introducción a TypeScript',
    description: 'Video explicativo.',
    uploadedAt: '15/10/2025',
    type: 'video/mp4',
    url: 'https://ejemplos.com/videos/ts-intro.mp4',
  },
  {
    name: 'Diseño de Landing Page V2',
    description: 'Prototipo final en formato PNG.',
    uploadedAt: '05/11/2025',
    type: 'image/png',
    url: 'https://ejemplos.com/images/landing-v2-final.png',
  },
  {
    name: 'Módulo de Autenticación',
    description: 'Lógica de sesiones.',
    uploadedAt: '06/11/2025',
    type: 'text/typescript',
    url: 'https://ejemplos.com/src/auth/auth.service.ts',
  },
  {
    name: 'Documento PDF de Prueba',
    description: 'Ejemplo de PDF público para verificación del visor.',
    uploadedAt: '28/10/2025',
    type: 'application/pdf',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    name: 'Imagen de Prueba',
    description: 'Ejemplo de JPG para verificar el visor.',
    uploadedAt: '05/11/2025',
    type: 'image/png',
    url: 'https://picsum.photos/800/600',
  },
  {
    name: 'Recursos Gráficos del Proyecto',
    description: 'Carpeta con íconos.',
    uploadedAt: '01/09/2025',
    type: 'folder',
    url: 'https://ejemplos.com/assets/graphics/',
  },
];

export default function FilePageMock() {
  const [filesList, setFilesList] = useState<IFileCardProps[]>(fileMocks);
  // Simular que el usuario es TEACHER para el mock
  const isUploader = true;

  return (
    <>
      {/* Uploader solo para el mock */}
      {isUploader && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">Subir Nuevo Material</h3>
          <FilePageReal setFilesList={setFilesList} />
        </div>
      )}
      {isUploader && <hr className="my-6 border-gray-300 dark:border-gray-600" />}

      {/* Lista de archivos */}
      <div className="min-h-screen grow rounded-lg grid grid-cols-1 md:grid-cols-2 place-items-center">
        {filesList.map((file) => (
          <FileCard key={file.url} {...file} />
        ))}
      </div>
    </>
  );
}
