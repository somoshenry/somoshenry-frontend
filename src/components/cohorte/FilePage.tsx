// En: /components/cohorte/FilePage.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Download, Upload, Filter, Search, Eye, EyeOff, Trash2 } from 'lucide-react';
import { getMaterials, createMaterial, deleteMaterial, registerDownload, toggleVisibility, uploadMaterialFile, type CohorteMaterial, type CreateMaterialDto, MaterialCategory, FileType, translateCategory, translateFileType, getCategoryColor, getFileTypeIcon, formatFileSize } from '@/services/materialService';

interface FilePageProps {
  readonly cohorteId: string;
  readonly canUpload: boolean;
  readonly currentUserId: string;
}

export default function FilePage({ cohorteId, canUpload, currentUserId }: FilePageProps) {
  const [materials, setMaterials] = useState<CohorteMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MaterialCategory | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form para subir nuevo material
  const [uploadForm, setUploadForm] = useState<CreateMaterialDto>({
    fileType: FileType.DOCUMENT,
    title: '',
    description: '',
    category: MaterialCategory.GENERAL,
    isVisible: true,
    tags: [],
  });

  useEffect(() => {
    fetchMaterials();
  }, [cohorteId]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await getMaterials(cohorteId);

      // El backend devuelve un array directamente
      const materialsData = Array.isArray(response) ? response : [];

      console.log('📦 Materiales cargados:', materialsData);
      console.log('📊 Total de materiales:', materialsData.length);

      setMaterials(materialsData);
    } catch (error) {
      console.error('Error al cargar materiales:', error);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    // Si hay archivo seleccionado, usar upload automático
    if (selectedFile) {
      try {
        setUploading(true);

        console.log('📤 Subiendo material con archivo:', selectedFile.name);

        // 1. Crear material vacío (solo metadatos básicos)
        // WORKAROUND: Backend tiene bug - fileUrl no es opcional en TS aunque tenga @IsOptional()
        const materialDto: any = {
          fileName: '', // Backend requiere estos campos aunque sean opcionales
          fileUrl: 'https://placeholder.com', // Se actualizará al subir archivo
          fileType: 'DOCUMENT', // Backend requiere fileType
          category: uploadForm.category,
          isVisible: uploadForm.isVisible,
        };

        // Solo incluir campos opcionales si tienen valor real
        if (uploadForm.title?.trim()) {
          materialDto.title = uploadForm.title.trim();
        }
        if (uploadForm.description?.trim()) {
          materialDto.description = uploadForm.description.trim();
        }
        if (uploadForm.tags && uploadForm.tags.length > 0) {
          materialDto.tags = uploadForm.tags;
        }

        console.log('DTO a enviar:', materialDto);

        const newMaterial = await createMaterial(cohorteId, materialDto);

        console.log('✅ Material creado:', newMaterial.id);

        // 2. Subir archivo (el backend actualiza automáticamente fileName, fileUrl, fileSize, mimeType)
        const uploadedMaterial = await uploadMaterialFile(newMaterial.id, selectedFile);

        console.log('✅ Archivo subido exitosamente:', uploadedMaterial);

        // Reset form
        setUploadForm({
          fileType: FileType.DOCUMENT,
          title: '',
          description: '',
          category: MaterialCategory.GENERAL,
          isVisible: true,
          tags: [],
        });
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = ''; // Resetear input de archivo
        }

        // Esperar un poco antes de recargar para que el backend procese
        setTimeout(async () => {
          await fetchMaterials();
          alert('✅ Material subido y visible en la lista');
        }, 500);
      } catch (error: any) {
        console.error('❌ Error al subir material:', error);
        console.error('Response:', error.response?.data);

        const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
        alert(`Error al subir el material: ${errorMessage}`);
      } finally {
        setUploading(false);
      }
    } else {
      alert('Por favor selecciona un archivo para subir');
    }
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño (20MB máx)
      if (file.size > 20 * 1024 * 1024) {
        alert('El archivo debe pesar máximo 20 MB');
        return;
      }

      // Extraer solo el nombre del archivo (sin path) y truncar si es muy largo
      let cleanFileName = file.name;
      if (cleanFileName.length > 230) {
        const ext = cleanFileName.split('.').pop();
        cleanFileName = cleanFileName.substring(0, 225) + '...' + ext;
      }

      setSelectedFile(file);
      // Auto-completar título con nombre truncado
      if (!uploadForm.title) {
        setUploadForm((prev) => ({ ...prev, title: cleanFileName }));
      }
    }
  };

  const handleDownload = async (material: CohorteMaterial) => {
    // Mostrar mensaje de funcionalidad en desarrollo
    alert('🚧 Función en desarrollo\n\nLa descarga de archivos estará disponible próximamente.\n\nArchivo: ' + material.fileName);

    // Registrar intento de descarga
    try {
      await registerDownload(cohorteId, material.id);
      setMaterials(materials.map((m) => (m.id === material.id ? { ...m, downloadCount: m.downloadCount + 1 } : m)));
    } catch (error) {
      console.error('Error al registrar descarga:', error);
    }
  };
  const handleDelete = async (materialId: string) => {
    if (!confirm('¿Estás seguro de eliminar este material?')) return;

    try {
      await deleteMaterial(cohorteId, materialId);
      setMaterials(materials.filter((m) => m.id !== materialId));
    } catch (error) {
      console.error('Error al eliminar material:', error);
      alert('Error al eliminar el material');
    }
  };

  const handleToggleVisibility = async (material: CohorteMaterial) => {
    try {
      const updated = await toggleVisibility(cohorteId, material.id);
      setMaterials(materials.map((m) => (m.id === material.id ? updated : m)));
    } catch (error) {
      console.error('Error al cambiar visibilidad:', error);
    }
  };

  // Filtrar materiales (asegurar que materials sea array)
  const filteredMaterials = (Array.isArray(materials) ? materials : []).filter((material) => {
    const matchesCategory = selectedCategory === 'ALL' || material.category === selectedCategory;
    const matchesSearch = material.title?.toLowerCase().includes(searchTerm.toLowerCase()) || material.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) || material.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  console.log('🔍 Materiales filtrados:', filteredMaterials.length, '/', materials.length);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-600 dark:text-gray-400">Cargando materiales...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Formulario de subida (solo para profesores/admin) */}
      {canUpload && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Upload size={24} className="text-blue-500" />
            Subir Nuevo Material
          </h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Selector de archivo */}
              <div className="md:col-span-2">
                <label htmlFor="fileInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Archivo * (máx 20MB)
                </label>
                <div className="flex items-center gap-3">
                  <input ref={fileInputRef} id="fileInput" type="file" onChange={handleFileSelect} className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  {selectedFile && (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <span>✓</span>
                      <span>{selectedFile.name}</span>
                      <span className="text-gray-500">({formatFileSize(selectedFile.size)})</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Título
                </label>
                <input id="title" type="text" value={uploadForm.title} onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })} placeholder="Título descriptivo" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Categoría
                </label>
                <select id="category" value={uploadForm.category} onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value as MaterialCategory })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                  {Object.values(MaterialCategory).map((cat) => (
                    <option key={cat} value={cat}>
                      {translateCategory(cat)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descripción
              </label>
              <textarea id="description" value={uploadForm.description} onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })} placeholder="Descripción del material..." rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isVisible" checked={uploadForm.isVisible} onChange={(e) => setUploadForm({ ...uploadForm, isVisible: e.target.checked })} className="w-4 h-4" />
              <label htmlFor="isVisible" className="text-sm text-gray-700 dark:text-gray-300">
                Visible para estudiantes
              </label>
            </div>
            <button type="submit" disabled={uploading || !selectedFile} className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Subir Material
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Filtros y búsqueda */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar materiales..." className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
            </div>
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
            <Filter size={20} />
            Filtros
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Categoría:</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setSelectedCategory('ALL')} className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedCategory === 'ALL' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                Todas
              </button>
              {Object.values(MaterialCategory).map((cat) => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat ? getCategoryColor(cat) : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                  {translateCategory(cat)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lista de materiales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMaterials.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No hay materiales disponibles</p>
          </div>
        ) : (
          filteredMaterials.map((material) => (
            <div key={material.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-xl transition-shadow">
              {/* Header con ícono y categoría */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{getFileTypeIcon(material.fileType)}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCategoryColor(material.category)}`}>{translateCategory(material.category)}</span>
                </div>
                {canUpload && material.uploadedBy === currentUserId && (
                  <button onClick={() => handleDelete(material.id)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Eliminar">
                    <Trash2 size={18} className="text-red-600" />
                  </button>
                )}
              </div>

              {/* Título y nombre de archivo */}
              <h4 className="font-bold text-gray-900 dark:text-white mb-1">{material.title || material.fileName}</h4>
              {material.title && <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{material.fileName}</p>}

              {/* Descripción */}
              {material.description && <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{material.description}</p>}

              {/* Metadata */}
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                <span>{translateFileType(material.fileType)}</span>
                {material.fileSize && <span>{formatFileSize(material.fileSize)}</span>}
              </div>

              {/* Footer con descargas y fecha */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-400">{material.downloadCount} descargas</span>
                <button onClick={() => handleDownload(material)} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                  <Download size={16} />
                  Descargar
                </button>
              </div>

              {/* Uploader info */}
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">Subido por: {material.uploader.name || material.uploader.email}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/*
========================================
MOCK DATA - COMENTADO PARA REFERENCIA
========================================

import IFileCardProps from '@/interfaces/cohorte/IFileCardProps';
import FileCard from './FileCard';
import FilePageReal from './FilePageReal';

// Mock inicial de archivos
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

// COMPONENTE MOCK ORIGINAL:
export default function FilePage({ cohorteId, canUpload }: FilePageProps) {
  const [filesList, setFilesList] = useState<IFileCardProps[]>(fileMocks);

  return (
    <>
      {canUpload && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">Subir Nuevo Material</h3>
          <FilePageReal setFilesList={setFilesList} />
        </div>
      )}
      {canUpload && <hr className="my-6 border-gray-300 dark:border-gray-600" />}
      <div className="min-h-screen grow rounded-lg grid grid-cols-1 md:grid-cols-2 place-items-center">
        {filesList.map((file, index) => (
          <FileCard key={file.url} {...file} />
        ))}
      </div>
    </>
  );
}
*/
