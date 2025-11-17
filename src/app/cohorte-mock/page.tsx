import CP from '@/components/cohorte/Cohorte';
import { Suspense } from 'react';

export default function CohorteMockPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Cargando cohorte...</div>}>
      <CP />
    </Suspense>
  );
}
