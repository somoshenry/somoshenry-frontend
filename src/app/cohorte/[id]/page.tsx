import CohorteView from '@/components/cohorte/CohorteView';
import { Suspense } from 'react';

export default async function CohorteDynamicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <Suspense fallback={<div className="p-10 text-center">Cargando cohorte...</div>}>
      <CohorteView cohorteId={id} />
    </Suspense>
  );
}
