import Link from 'next/link';

export default function LandingFooter() {
  return (
    <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <p className="text-gray-600 dark:text-gray-400">© 2025 somosHenry. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <Link href="/soporte" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
              Soporte
            </Link>
            <Link href="/terminos" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
              Términos
            </Link>
            <Link href="/privacidad" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
              Privacidad
            </Link>
            <Link href="/sobre-henry" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
              Sobre Henry
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
