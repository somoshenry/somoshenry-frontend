import Link from 'next/link';

export default function LandingHero() {
  return (
    <section className="pt-28 pb-16 px-6 bg-white dark:bg-black">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl sm:text-6xl font-bold text-black dark:text-white mb-5">Conectá. Aprendé. Crecé.</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">La comunidad educativa donde estudiantes y docentes se conectan, comparten conocimiento y construyen el futuro de la tecnología juntos.</p>
        <Link href="/join" className="inline-block bg-[#FFFF00] text-black px-8 py-3 rounded-md font-semibold text-base hover:bg-yellow-400">
          Únete a la comunidad
        </Link>
      </div>
    </section>
  );
}
