export default function ProfileFiles() {
  const files = [
    { name: 'apuntes-react.pdf', uploaded: 'Hace 1 hora' },
    { name: 'proyecto-final.pdf', uploaded: 'Hace 2 horas' },
    { name: 'algoritmos-ordenamiento.pdf', uploaded: 'Hace 3 horas' },
  ];

  return (
    <div className="flex flex-col gap-3">
      {files.map((file, i) => (
        <div key={i} className="flex items-center justify-between p-3 bg-white border rounded-md shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-red-500 text-2xl">📄</span>
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-gray-500">{file.uploaded}</p>
            </div>
          </div>
          <button className="bg-[#FFFF00] font-semibold hover:underline">Descargar</button>
        </div>
      ))}
    </div>
  );
}
