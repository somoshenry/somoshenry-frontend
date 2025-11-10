import React, { Suspense } from 'react';
import SubscriptionRedirectClient from '@/components/redirect/SubscriptionRedirectClient';

export default function SubscriptionRedirectPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Verificando...</div>}>
      <SubscriptionRedirectClient />
    </Suspense>
  );
}
