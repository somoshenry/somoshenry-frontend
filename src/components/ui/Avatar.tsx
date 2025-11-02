'use client';
import Image from 'next/image';
import { useState } from 'react';

interface AvatarProps {
  src?: string | null;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

export default function Avatar({ src, alt, width, height, className }: AvatarProps) {
  const [imgSrc, setImgSrc] = useState<string>(src || '/avatars/default.svg');
  return <Image src={imgSrc} alt={alt} width={width} height={height} className={className} onError={() => setImgSrc('/avatars/default.svg')} />;
}
