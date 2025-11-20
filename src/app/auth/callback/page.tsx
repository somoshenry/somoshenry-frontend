"use client";
import React, {useEffect, Suspense} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {useAuth} from "@/hook/useAuth";
import Swal from "sweetalert2";

const TailwindSpinner = () => (
  <div className="flex items-center justify-center space-x-2">
    <div
      className="w-10 h-10 border-4 border-t-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin"
      role="status"
      aria-label="Cargando"
    >
      <span className="sr-only">Cargando...</span>
    </div>
  </div>
);

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {handleUrlTokenLogin, loading} = useAuth();

  useEffect(() => {
    if (loading) {
      return;
    }

    const token = searchParams.get("token");

    const processTokenLogin = async (urlToken: string) => {
      try {
        console.log("Token de URL encontrado. Intentando inicio de sesión...");

        // 1. Ejecutar el método que guarda el token en localStorage y obtiene el usuario
        await handleUrlTokenLogin(urlToken);

        // 2. Redirigir a /home
        console.log("Inicio de sesión con token de URL exitoso. Redirigiendo a /home");
        router.push("/home");
      } catch (error) {
        console.error("Fallo al procesar el token de URL:", error);

        Swal.fire({
          title: "Error",
          text: "El enlace de inicio de sesión ha expirado o es inválido.",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
        router.push("/login");
      }
    };

    if (token) {
      processTokenLogin(token);
    } else {
      console.log("No se encontró token en la URL.");
      router.push("/login");
    }
  }, [searchParams, router, handleUrlTokenLogin, loading]);

  return (
    // Contenedor principal: Centra el contenido en toda la pantalla (100vh)
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="flex flex-col items-center p-10 bg-white rounded-xl shadow-2xl max-w-sm w-full">
        <TailwindSpinner />
        <h1 className="text-2xl font-semibold text-gray-800 mt-4 mb-2">Cargando Sesión</h1>
        <p className="text-gray-500 text-center">Estamos validando tu acceso seguro. Redirigiendo...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<TailwindSpinner />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
