'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface AvatarProps {
  src?: string | null;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

export default function Avatar({ src, alt, width, height, className }: AvatarProps) {
  // Validar URL antes de usarla
  const isValidUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    // Si es una URL local, es válida
    if (url.startsWith('/')) return true;
    // Rechazar URLs genéricas inválidas
    if (url.includes('cdn.com/avatar.jpg')) return false;
    // Verificar que sea una URL HTTPS válida de un dominio real
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:' && urlObj.hostname.includes('.');
    } catch {
      return false;
    }
  };

  const [imgSrc, setImgSrc] = useState<string>(isValidUrl(src) ? src! : '/avatars/default.svg');

  // Si cambia la fuente externa (p. ej., el usuario actualiza su foto), sincronizamos y evitamos caché
  useEffect(() => {
    if (!isValidUrl(src)) {
      setImgSrc('/avatars/default.svg');
      return;
    }
    const next = src!;
    // Cache-busting suave para evitar imagen vieja servida del navegador/CDN
    const hasQuery = next.includes('?');
    const busted = next.startsWith('/avatars/') ? next : `${next}${hasQuery ? '&' : '?'}t=${Date.now()}`;
    setImgSrc(busted);
  }, [src]);

  return <Image src={imgSrc} alt={alt} width={width} height={height} className={className} onError={() => setImgSrc('/avatars/default.svg')} />;
}
