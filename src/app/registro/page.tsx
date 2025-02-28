"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Por favor, introduce un email válido.",
  }),
  password: z.string().min(8, {
    message: "La contraseña debe tener al menos 8 caracteres.",
  }),
});

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [invitationToken, setInvitationToken] = useState<string | null>(null);
  const [invitationDetails, setInvitationDetails] = useState<{
    familyName: string;
    invitedBy: string;
    email?: string;
  } | null>(null);
  const [invitationStatus, setInvitationStatus] = useState<"loading" | "valid" | "invalid" | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setInvitationToken(token);
      validateInvitation(token);
    }
  }, [searchParams]);

  const validateInvitation = async (token: string) => {
    setInvitationStatus("loading");
    try {
      const response = await fetch(`/api/families/invitations/validate?token=${token}`);
      if (response.ok) {
        const data = await response.json();
        setInvitationDetails({
          familyName: data.family.name,
          invitedBy: data.createdBy.name,
          email: data.email,
        });
        
        // Pre-rellenar el email si está disponible
        if (data.email) {
          form.setValue("email", data.email);
        }
        
        setInvitationStatus("valid");
      } else {
        setInvitationStatus("invalid");
      }
    } catch (error) {
      console.error("Error validando invitación:", error);
      setInvitationStatus("invalid");
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      // Registrar al usuario
      const registerResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          invitationToken,
        }),
      });

      if (!registerResponse.ok) {
        const error = await registerResponse.json();
        throw new Error(error.message || "Error al registrar usuario");
      }

      // Iniciar sesión automáticamente
      const signInResult = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (signInResult?.error) {
        throw new Error("Error al iniciar sesión");
      }

      toast({
        title: "Registro completado",
        description: "Tu cuenta ha sido creada correctamente.",
        variant: "default",
      });

      // Redirigir al dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Error en el registro:", error);
      toast({
        title: "Error en el registro",
        description: error instanceof Error ? error.message : "Ha ocurrido un error al crear tu cuenta.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {invitationToken && invitationStatus === "loading" && (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                <h3 className="text-xl font-semibold mb-2">Verificando invitación</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Estamos validando tu invitación. Por favor, espera un momento...
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {invitationToken && invitationStatus === "invalid" && (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="flex flex-col items-center justify-center py-8">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Invitación no válida</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                  La invitación ha expirado o no es válida. Por favor, solicita una nueva invitación.
                </p>
                <Button onClick={() => router.push("/login")} className="bg-blue-600 hover:bg-blue-700">
                  Ir al inicio de sesión
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {(!invitationToken || (invitationToken && invitationStatus === "valid")) && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-1 pb-2">
              <CardTitle className="text-2xl font-bold">
                {invitationDetails 
                  ? "Completa tu registro" 
                  : "Crea tu cuenta"}
              </CardTitle>
              <CardDescription>
                {invitationDetails 
                  ? `Has sido invitado a unirte a la familia "${invitationDetails.familyName}" por ${invitationDetails.invitedBy}` 
                  : "Introduce tus datos para crear una cuenta"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Tu nombre y apellidos" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="tu@email.com" 
                            {...field} 
                            disabled={!!invitationDetails?.email}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="********" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        {invitationDetails ? "Aceptar invitación" : "Crear cuenta"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-0">
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Al registrarte, aceptas nuestros <a href="/terminos" className="text-blue-600 hover:underline">Términos de servicio</a> y <a href="/privacidad" className="text-blue-600 hover:underline">Política de privacidad</a>.
              </div>
              <div className="text-center">
                <Button variant="link" onClick={() => router.push("/login")}>
                  ¿Ya tienes cuenta? Inicia sesión
                </Button>
              </div>
            </CardFooter>
          </Card>
        )}
      </motion.div>
    </div>
  );
} 