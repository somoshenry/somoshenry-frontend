import Link from 'next/link';

export default function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-8 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <p className="text-gray-600 text-sm">© {currentYear} somosHenry. Todos los derechos reservados.</p>

          {/* Links */}
          <div className="flex gap-6">
            <Link href="/support" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
              Soporte
            </Link>
            <Link href="/terms" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
              Términos
            </Link>
            <Link href="/privacy" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
              Privacidad
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
              Sobre Henry
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
