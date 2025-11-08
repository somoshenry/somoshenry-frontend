import CP from "@/components/cohorte/CP";
import {Suspense} from "react";

export default function CohortePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Cargando cohorte...</div>}>
      <CP />
    </Suspense>
  );
}
