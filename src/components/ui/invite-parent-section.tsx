"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, Copy, Check, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

export function InviteParentSection() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [families, setFamilies] = useState<{id: string, name: string}[]>([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState("");
  const { toast } = useToast();

  // Cargar las familias del usuario
  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        const response = await fetch('/api/families');
        if (response.ok) {
          const data = await response.json();
          setFamilies(data);
          if (data.length > 0) {
            setSelectedFamilyId(data[0].id);
          }
        }
      } catch (error) {
        console.error("Error al cargar familias:", error);
      }
    };

    if (session?.user) {
      fetchFamilies();
    }
  }, [session]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast({
      title: "Enlace copiado",
      description: "El enlace de invitación ha sido copiado al portapapeles",
      variant: "default",
    });
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleGenerateLink = async () => {
    if (!selectedFamilyId) {
      setError("Debes seleccionar una familia para generar el enlace");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      // Generar un token único para la invitación
      const response = await fetch('/api/families/invitations/link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          familyId: selectedFamilyId,
          role: "PARENT"
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al generar enlace");
      }
      
      const data = await response.json();
      const baseUrl = window.location.origin;
      setInviteLink(`${baseUrl}/registro?token=${data.token}`);
      setSent(true);
      
      toast({
        title: "Enlace generado",
        description: "Se ha generado un enlace de invitación",
        variant: "default",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al generar el enlace de invitación");
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async () => {
    if (!selectedFamilyId) {
      setError("Debes seleccionar una familia para enviar la invitación");
      return;
    }

    setLoading(true);
    setError("");
    setSent(false);
    
    try {
      const response = await fetch('/api/families/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          familyId: selectedFamilyId,
          email: activeTab === "email" ? email : phone,
          role: "PARENT"
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al enviar invitación");
      }
      
      setSent(true);
      
      if (activeTab === "email") {
        setEmail("");
        toast({
          title: "Invitación enviada",
          description: `Se ha enviado una invitación a ${email}`,
          variant: "default",
        });
      } else {
        setPhone("");
        toast({
          title: "Invitación enviada",
          description: `Se ha enviado una invitación a ${phone}`,
          variant: "default",
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ha ocurrido un error al enviar la invitación");
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    return /^\+?[0-9]{9,15}$/.test(phone);
  };

  const isValidInput = () => {
    if (activeTab === "email") {
      return validateEmail(email);
    } else if (activeTab === "sms") {
      return validatePhone(phone);
    } else {
      return inviteLink !== "";
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container px-4 mx-auto">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Invita al otro progenitor
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Para aprovechar al máximo la plataforma, invita al otro progenitor a unirse. 
            Ambos podréis gestionar la coparentalidad de forma más eficiente.
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {families.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 md:p-8">
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No tienes familias creadas</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Debes crear una familia antes de poder invitar a otros progenitores.
                    </p>
                    <Button 
                      onClick={() => window.location.href = "/dashboard/familia/nueva"}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Crear familia
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 md:p-8">
                  <div className="mb-6">
                    <label htmlFor="family" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Selecciona la familia
                    </label>
                    <select
                      id="family"
                      value={selectedFamilyId}
                      onChange={(e) => setSelectedFamilyId(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {families.map((family) => (
                        <option key={family.id} value={family.id}>
                          {family.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <Tabs 
                    defaultValue="email" 
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <TabsList className="grid grid-cols-3 mb-8">
                      <TabsTrigger value="email" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </TabsTrigger>
                      <TabsTrigger value="sms" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                        <Phone className="h-4 w-4 mr-2" />
                        SMS
                      </TabsTrigger>
                      <TabsTrigger value="link" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                        <Copy className="h-4 w-4 mr-2" />
                        Enlace
                      </TabsTrigger>
                    </TabsList>

                    <motion.div
                      variants={itemVariant}
                      className="space-y-6"
                    >
                      {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md flex items-start">
                          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                          <p className="text-sm">{error}</p>
                        </div>
                      )}

                      {sent && (
                        <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-md flex items-start">
                          <Check className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                          <p className="text-sm">
                            {activeTab === "email" 
                              ? "Se ha enviado un correo electrónico con la invitación." 
                              : activeTab === "sms" 
                                ? "Se ha enviado un SMS con la invitación." 
                                : "Enlace de invitación generado correctamente."}
                          </p>
                        </div>
                      )}

                      <TabsContent value="email" className="mt-0">
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Correo electrónico del otro progenitor
                            </label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="ejemplo@correo.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full"
                            />
                          </div>
                          
                          <Button 
                            onClick={handleSendInvite} 
                            disabled={!validateEmail(email) || loading}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            {loading ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Enviando...
                              </>
                            ) : (
                              <>
                                Enviar invitación por email
                                <ArrowRight className="h-4 w-4 ml-1" />
                              </>
                            )}
                          </Button>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="sms" className="mt-0">
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Número de teléfono del otro progenitor
                            </label>
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="+34 600 000 000"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="w-full"
                            />
                          </div>
                          
                          <Button 
                            onClick={handleSendInvite} 
                            disabled={!validatePhone(phone) || loading}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            {loading ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Enviando...
                              </>
                            ) : (
                              <>
                                Enviar invitación por SMS
                                <ArrowRight className="h-4 w-4 ml-1" />
                              </>
                            )}
                          </Button>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="link" className="mt-0">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Enlace de invitación
                            </label>
                            <div className="flex">
                              <Input
                                value={inviteLink}
                                readOnly
                                placeholder="Genera un enlace de invitación"
                                className="flex-grow rounded-r-none"
                              />
                              <Button
                                onClick={handleCopyLink}
                                disabled={!inviteLink}
                                className={`rounded-l-none ${copied ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                              >
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                              </Button>
                            </div>
                          </div>
                          
                          <Button 
                            onClick={handleGenerateLink} 
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            {loading ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generando...
                              </>
                            ) : (
                              <>
                                Generar nuevo enlace
                                <ArrowRight className="h-4 w-4 ml-1" />
                              </>
                            )}
                          </Button>
                        </div>
                      </TabsContent>
                    </motion.div>
                  </Tabs>
                </CardContent>
              </Card>
            )}
            
            <motion.div 
              variants={itemVariant}
              className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800"
            >
              <h3 className="font-bold text-lg mb-2">¿Qué ocurre cuando invitas al otro progenitor?</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Recibirán un enlace para registrarse en la plataforma</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Se vincularán automáticamente a tu cuenta para gestionar la coparentalidad</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Podrán acceder al calendario, mensajes y documentos compartidos</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Ambos mantendréis la privacidad de vuestras cuentas personales</span>
                </li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 