import Link from 'next/link';

export default function LandingCTA() {
  return (
    <section className="py-16 px-6 bg-white dark:bg-black">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#FFFF00] rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-black mb-3">¿Listo para comenzar?</h2>
          <p className="text-base text-black mb-8 max-w-xl mx-auto">Únete a miles de estudiantes y docentes que ya forman parte de somosHenry</p>
          <Link href="/signup" className="inline-block bg-black text-white px-8 py-3 rounded-md font-semibold text-base hover:bg-gray-800">
            Crear cuenta gratis
          </Link>
        </div>
      </div>
    </section>
  );
}
