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
  const [imgSrc, setImgSrc] = useState<string>(src || '/avatars/default.svg');

  // Si cambia la fuente externa (p. ej., el usuario actualiza su foto), sincronizamos y evitamos caché
  useEffect(() => {
    const next = src || '/avatars/default.svg';
    if (!next) {
      setImgSrc('/avatars/default.svg');
      return;
    }
    // Cache-busting suave para evitar imagen vieja servida del navegador/CDN
    const hasQuery = next.includes('?');
    const busted = next.startsWith('/avatars/') ? next : `${next}${hasQuery ? '&' : '?'}t=${Date.now()}`;
    setImgSrc(busted);
  }, [src]);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setImgSrc('/avatars/default.svg')}
    />
  );
}
