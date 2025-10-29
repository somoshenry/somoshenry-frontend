import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Nav from '../components/landing/LandingNavbar';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'somosHenry - Conectá. Aprendé. Crecé.',
  description: 'La comunidad educativa donde estudiantes y docentes se conectan, comparten conocimiento y construyen el futuro de la tecnología juntos.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} antialiased bg-white text-black dark:bg-black dark:text-white`}>
        <Nav />
        {children}
      </body>
    </html>
  );
}
