import Link from 'next/link';

export default function LandingCTA() {
  return (
    <section className="py-16 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        {/* Yellow CTA Box */}
        <div className="bg-[#FFFF00] rounded-2xl p-12 text-center shadow-xl">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">¿Listo para comenzar?</h2>
          <p className="text-black text-lg mb-8">Unirte a miles de estudiantes y docentes que ya forman parte de somosHenry</p>
          <Link href="/register" className="inline-block bg-black text-white font-semibold px-8 py-4 rounded-lg text-lg hover:bg-gray-800 transition-colors">
            Crear cuenta gratis
          </Link>
        </div>
      </div>
    </section>
  );
}
