import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Puedes añadir otras opciones de configuración de Next.js aquí
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images-ext-1.discordapp.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.freepik.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'e0.pxfuel.com',
        pathname: '/**',
      },
      // Dominio añadido previamente para resolver el error de Avatar.tsx
      {
        protocol: 'https',
        hostname: 'nubecolectiva.com',
        pathname: '/**',
      },
      // Nuevo dominio de Bing añadido para resolver el error de next/image
      {
        protocol: 'https',
        hostname: 'tse2.mm.bing.net',
        pathname: '/**',
      },
      // Dominio genérico cdn.com
      {
        protocol: 'https',
        hostname: 'cdn.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
