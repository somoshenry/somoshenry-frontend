export default function ProfileHeader() {
  return (
    <div className="w-full flex flex-col items-center bg-white border-b pb-4">
      <div className="w-full h-32 bg-[#FFFF00]" />

      <div className="w-11/12 -mt-10 flex flex-col items-center">
        <div className="bg-[#FFFF00] w-20 h-20 rounded-full flex items-center justify-center text-lg font-bold border-4 border-white">JP</div>
        <h1 className="text-xl font-semibold mt-2">Juan Pérez</h1>
        <p className="text-gray-600">@somoshenry</p>
        <p className="text-sm text-gray-500 text-center max-w-md">Apasionado por la tecnología y el aprendizaje continuo. Full Stack Developer en formación.</p>

        <div className="flex gap-4 text-sm text-gray-600 mt-2">
          <span>📍 Buenos Aires, Argentina</span>
          <span>🎂 Se unió en Octubre 2024</span>
          <span>📧 juan@somoshenry.com</span>
        </div>

        <div className="flex gap-4 mt-3 text-sm">
          <span>42 Publicaciones</span>
          <span>326 Me gusta</span>
          <span>156 Seguidores</span>
          <span>89 Siguiendo</span>
        </div>
      </div>
    </div>
  );
}
