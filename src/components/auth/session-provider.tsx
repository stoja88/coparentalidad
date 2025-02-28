"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

interface SessionProviderProps {
  children: React.ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  
  // Verificar sesión al cargar
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Intentar obtener la sesión del servidor
        const response = await fetch("/api/auth/session");
        if (response.ok) {
          const sessionData = await response.json();
          
          // Si hay una sesión activa
          if (sessionData && sessionData.user) {
            console.log("Sesión activa detectada");
            
            // Guardar información básica de la sesión en localStorage para referencia
            localStorage.setItem("sessionActive", "true");
            localStorage.setItem("sessionExpiry", new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
            
            // Si estamos en la página de login y hay una sesión activa, redirigir al dashboard
            if (pathname === "/login") {
              router.push("/dashboard");
            }
          } else {
            // No hay sesión activa
            localStorage.removeItem("sessionActive");
            localStorage.removeItem("sessionExpiry");
            
            // Si estamos en una ruta protegida, redirigir al login
            if (pathname.includes("/dashboard") && pathname !== "/dashboard/login") {
              router.push("/login?callbackUrl=" + encodeURIComponent(pathname));
            }
          }
        } else {
          // Error al obtener la sesión
          console.error("Error al verificar la sesión:", response.statusText);
          
          // Si estamos en una ruta protegida, redirigir al login
          if (pathname.includes("/dashboard") && pathname !== "/dashboard/login") {
            router.push("/login?callbackUrl=" + encodeURIComponent(pathname));
          }
        }
      } catch (error) {
        console.error("Error al verificar la sesión:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
  }, [pathname, router]);
  
  // Interceptar errores de red que podrían afectar a la sesión
  useEffect(() => {
    // Manejar cuando el navegador se pone online
    const handleOnline = () => {
      console.log("Conexión restablecida, verificando sesión...");
      
      // Verificar si había una sesión activa antes de perder la conexión
      const wasSessionActive = localStorage.getItem("sessionActive") === "true";
      const sessionExpiry = localStorage.getItem("sessionExpiry");
      
      if (wasSessionActive && sessionExpiry) {
        // Verificar si la sesión no ha expirado
        if (new Date(sessionExpiry) > new Date()) {
          // Verificar la sesión en el servidor
          fetch("/api/auth/session")
            .then(response => {
              if (!response.ok) {
                // Si hay un error, redirigir al login
                localStorage.removeItem("sessionActive");
                localStorage.removeItem("sessionExpiry");
                if (pathname.includes("/dashboard")) {
                  router.push("/login?callbackUrl=" + encodeURIComponent(pathname));
                }
              }
            })
            .catch(error => {
              console.error("Error al verificar la sesión después de reconexión:", error);
            });
        } else {
          // La sesión ha expirado
          localStorage.removeItem("sessionActive");
          localStorage.removeItem("sessionExpiry");
          if (pathname.includes("/dashboard")) {
            router.push("/login");
          }
        }
      }
    };
    
    // Manejar cuando el navegador se pone offline
    const handleOffline = () => {
      console.log("Conexión perdida, guardando estado de sesión...");
      
      // No hacemos nada especial, solo registramos el evento
      // La sesión ya debería estar guardada en localStorage
    };
    
    // Manejar cuando la pestaña se vuelve visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("Pestaña visible, verificando sesión...");
        
        // Verificar si había una sesión activa
        const wasSessionActive = localStorage.getItem("sessionActive") === "true";
        const sessionExpiry = localStorage.getItem("sessionExpiry");
        
        if (wasSessionActive && sessionExpiry) {
          // Verificar si la sesión no ha expirado
          if (new Date(sessionExpiry) > new Date()) {
            // Verificar la sesión en el servidor
            fetch("/api/auth/session")
              .then(response => response.json())
              .then(data => {
                if (!data || !data.user) {
                  // Si no hay sesión, redirigir al login
                  localStorage.removeItem("sessionActive");
                  localStorage.removeItem("sessionExpiry");
                  if (pathname.includes("/dashboard")) {
                    router.push("/login");
                  }
                }
              })
              .catch(error => {
                console.error("Error al verificar la sesión después de cambio de visibilidad:", error);
              });
          } else {
            // La sesión ha expirado
            localStorage.removeItem("sessionActive");
            localStorage.removeItem("sessionExpiry");
            if (pathname.includes("/dashboard")) {
              router.push("/login");
            }
          }
        }
      }
    };
    
    // Registrar eventos
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    // Limpiar eventos al desmontar
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pathname, router]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Cargando sesión...</span>
      </div>
    );
  }
  
  return (
    <NextAuthSessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
      {children}
    </NextAuthSessionProvider>
  );
} 