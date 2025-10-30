import Link from 'next/link';

export function LandingHero() {
  return (
    <section className="py-20 px-6 md:px-12 transition-colors">
      <div className="max-w-4xl mx-auto">
        {/* Contenedor con sombra y fondo */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 text-center border border-gray-100 dark:border-gray-700">
          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">Conectá. Aprendé. Crecé.</h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">La comunidad educativa donde estudiantes y docentes se conectan, comparten conocimiento y construyen el futuro de la tecnología juntos.</p>

          {/* CTA Button */}
          <Link href="/register" className="inline-block bg-[#FFFF00] text-black font-semibold px-8 py-4 rounded-lg text-lg hover:bg-yellow-500 transition-colors shadow-lg hover:shadow-xl">
            Unirte a la comunidad
          </Link>
        </div>
      </div>
    </section>
  );
}
