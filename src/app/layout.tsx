import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { PostProvider } from '../context/PostContext';
import { AlertProvider } from '../context/AlertContext';
import Nav from '../components/nav/Nav';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'somosHenry - Conectá. Aprendé. Crecé.',
  description: 'La comunidad educativa donde estudiantes y docentes se conectan, comparten conocimiento y construyen el futuro de la tecnología juntos.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} antialiased bg-white text-black dark:bg-black dark:text-white`}>
        <AlertProvider>
          <AuthProvider>
            <PostProvider>
              <Nav />
              {children}
            </PostProvider>
          </AuthProvider>
        </AlertProvider>
      </body>
    </html>
  );
}
