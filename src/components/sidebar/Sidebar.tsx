// 'use client';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { Home, LayoutDashboard, Settings } from 'lucide-react';
// import clsx from 'clsx';
// import { motion } from 'framer-motion';

// export default function Sidebar({ isOpen }: { isOpen: boolean }) {
//   const pathname = usePathname();
  
//   const links = [
//     { name: 'Inicio', href: '/', icon: <Home size={20} /> },
//     { name: 'Mi Tablero', href: '/tablero', icon: <LayoutDashboard size={20} /> },
//     { name: 'Configuración', href: '/configuracion', icon: <Settings size={20} /> },
//   ];
  
//   return (
//     <motion.aside
//       initial={{ x: -200 }}
//       animate={{ x: isOpen ? 0 : -200 }}
//       transition={{ type: 'spring', stiffness: 200, damping: 25 }}
//       className="fixed md:static z-40 w-64 h-screen bg-gray-900 text-white flex flex-col p-4"
//     >
//       <h1 className="text-2xl font-bold mb-8 text-yellow-400">Mi Red Social</h1>
//       <nav className="space-y-2">
//         {links.map((link) => (
//           <Link
//             key={link.name}
//             href={link.href}
//             className={clsx(
//               'flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition',
//               pathname === link.href && 'bg-gray-800 text-yellow-400'
//             )}
//           >
//             {link.icon}
//             <span>{link.name}</span>
//           </Link>
//         ))}
//       </nav>
//     </motion.aside>
//   );
// }

