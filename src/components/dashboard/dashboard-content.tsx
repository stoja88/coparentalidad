"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, AlertCircle, MessageSquare, Calendar, DollarSign, FileText, ChevronRight, Search, Filter, Plus, Settings, User, Home } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Importar los nuevos componentes
import { StatsCard } from "@/components/dashboard/stats-card";
import { ActivityCard } from "@/components/dashboard/activity-card";
import { CalendarPreview } from "@/components/dashboard/calendar-preview";
import { ExpenseChart } from "@/components/dashboard/expense-chart";
import { SubscriptionCard } from "@/components/dashboard/subscription-card";
import { FamilyProgress } from "@/components/dashboard/family-progress";
import { FamilyMembers } from "@/components/dashboard/family-members";
import { TasksList } from "@/components/dashboard/tasks-list";
import { RecentMessages } from "@/components/dashboard/recent-messages";
import { RecentDocuments } from "@/components/dashboard/recent-documents";
import { RecentExpenses } from "@/components/dashboard/recent-expenses";

// Datos de ejemplo
const mockData = {
  upcomingEvents: [
    {
      id: "1",
      title: "Reunión escolar",
      date: new Date(Date.now() + 86400000 * 2), // 2 días después
      type: "SCHOOL",
      description: "Reunión con el tutor para hablar del progreso académico",
    },
    {
      id: "2",
      title: "Cita médica - Pediatra",
      date: new Date(Date.now() + 86400000 * 3), // 3 días después
      type: "MEDICAL",
      description: "Revisión anual con el Dr. Martínez",
    },
    {
      id: "3",
      title: "Clase de natación",
      date: new Date(Date.now() + 86400000 * 5), // 5 días después
      type: "ACTIVITY",
      description: "Llevar bañador y toalla",
    },
    {
      id: "4",
      title: "Cumpleaños de Lucía",
      date: new Date(Date.now() + 86400000 * 7), // 7 días después
      type: "FAMILY",
      description: "Comprar regalo y preparar la fiesta",
    },
  ],
  recentMessages: [
    {
      id: "1",
      sender: {
        id: "2",
        name: "Carlos Rodríguez",
        avatar: null,
      },
      content: "He programado la cita con el dentista para el próximo martes a las 16:00. ¿Puedes llevar a los niños?",
      timestamp: new Date(Date.now() - 1800000), // 30 minutos atrás
      isRead: false,
      hasAttachments: false,
      category: "importante",
    },
    {
      id: "2",
      sender: {
        id: "3",
        name: "María López",
        avatar: null,
      },
      content: "Adjunto las fotos del cumpleaños de Lucía. Fue un día maravilloso.",
      timestamp: new Date(Date.now() - 86400000), // 1 día atrás
      isRead: true,
      hasAttachments: true,
    },
    {
      id: "3",
      sender: {
        id: "2",
        name: "Carlos Rodríguez",
        avatar: null,
      },
      content: "Recordatorio: mañana hay reunión de padres en el colegio a las 18:00.",
      timestamp: new Date(Date.now() - 172800000), // 2 días atrás
      isRead: true,
      hasAttachments: false,
      category: "recordatorio",
    },
  ],
  recentExpenses: [
    {
      id: "1",
      title: "Material escolar",
      description: "€35.50 - Pagado por Carlos",
      timestamp: new Date(Date.now() - 259200000), // 3 días atrás
      icon: "receipt",
      status: "pending",
    },
    {
      id: "2",
      title: "Clases de natación",
      description: "€60.00 - Pagado por Ana",
      timestamp: new Date(Date.now() - 604800000), // 7 días atrás
      icon: "receipt",
      status: "approved",
    },
  ],
  recentDocuments: [
    {
      id: "1",
      title: "Informe escolar - Primer trimestre",
      description: "PDF - Subido por Ana",
      timestamp: new Date(Date.now() - 172800000), // 2 días atrás
      icon: "file",
      status: "new",
    },
    {
      id: "2",
      title: "Calendario vacunas",
      description: "PDF - Subido por Carlos",
      timestamp: new Date(Date.now() - 432000000), // 5 días atrás
      icon: "file",
      status: "viewed",
    },
  ],
  tasks: [
    {
      id: "1",
      title: "Pagar matrícula escolar",
      description: "Vence en 3 días",
      timestamp: new Date(Date.now() + 86400000 * 3), // 3 días después
      icon: "task",
      status: "high",
    },
    {
      id: "2",
      title: "Programar revisión médica anual",
      description: "Vence en 7 días",
      timestamp: new Date(Date.now() + 86400000 * 7), // 7 días después
      icon: "task",
      status: "medium",
    },
  ],
  expenseData: [
    {
      month: "Enero",
      education: 250,
      health: 120,
      clothing: 80,
      activities: 150,
      other: 50,
    },
    {
      month: "Febrero",
      education: 220,
      health: 150,
      clothing: 60,
      activities: 180,
      other: 40,
    },
  ],
};

// Variantes de animación
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

export default function DashboardContent() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [greeting, setGreeting] = useState("Hola");
  const [subscription, setSubscription] = useState(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [stripeEnabled, setStripeEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState("general");
  const [dashboardLayout, setDashboardLayout] = useState("grid");
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [familyData, setFamilyData] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);

  // Establecer el saludo según la hora del día
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Buenos días");
    } else if (hour >= 12 && hour < 20) {
      setGreeting("Buenas tardes");
    } else {
      setGreeting("Buenas noches");
    }
  }, []);

  // Obtener información de la suscripción y datos del usuario
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Obtener datos de suscripción
        const subscriptionResponse = await fetch("/api/subscription");
        if (subscriptionResponse.ok) {
          const subscriptionData = await subscriptionResponse.json();
          setSubscription(subscriptionData);
          setHasActiveSubscription(subscriptionData.status === "active");
        } else if (subscriptionResponse.status === 404) {
          setStripeEnabled(false);
        }
        
        // Obtener datos del usuario
        const userResponse = await fetch("/api/user/profile");
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserData(userData);
        }
        
        // Obtener datos de la familia
        const familyResponse = await fetch("/api/family");
        if (familyResponse.ok) {
          const familyData = await familyResponse.json();
          setFamilyData(familyData);
        }
        
        // Obtener actividad reciente
        const activityResponse = await fetch("/api/activity");
        if (activityResponse.ok) {
          const activityData = await activityResponse.json();
          setRecentActivity(activityData);
        }
        
      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar algunos datos del dashboard.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setIsLoadingSubscription(false);
      }
    };

    fetchData();
  }, [toast]);

  // Manejar la gestión de la suscripción
  const handleManageSubscription = async () => {
    try {
      const response = await fetch("/api/subscription", {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error('Error al gestionar la suscripción');
      }
      
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'No se pudo gestionar la suscripción.',
        variant: 'destructive',
      });
    }
  };

  // Manejar la actualización de plan
  const handleUpgrade = () => {
    window.location.href = '/dashboard/subscription';
  };

  // Obtener el nombre del usuario de forma segura
  const getUserFirstName = () => {
    if (session?.user?.name) {
      return session.user.name.split(" ")[0];
    }
    return "Usuario";
  };

  // Verificar si el usuario es administrador
  const isAdmin = () => {
    return session?.user?.role === "ADMIN" || session?.user?.role === "SUPERADMIN";
  };

  if (isLoading) {
    return (
      <div className="container-custom py-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Cargando tu dashboard</h2>
        <p className="text-muted-foreground">Estamos preparando toda tu información...</p>
      </div>
    );
  }

  // Reemplazar la redirección automática con un banner de administrador
  const AdminBanner = () => {
    if (!isAdmin()) return null;
    
    return (
      <motion.div 
        className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-md"
        variants={itemVariants}
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-blue-800">Modo Administrador</h3>
            <p className="text-blue-600 text-sm">Tienes acceso al panel de administración</p>
          </div>
          <Button 
            onClick={() => window.location.href = '/dashboard/admin'}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Ir al Panel de Admin
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div 
      className="container-custom py-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Mostrar el banner de administrador si corresponde */}
      <AdminBanner />
      
      <motion.div className="mb-8" variants={itemVariants}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {greeting}, {getUserFirstName()}
            </h1>
            <p className="text-muted-foreground">
              Bienvenido a tu panel de co-parentalidad. Aquí tienes un resumen de la actividad reciente.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9 relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">3</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Notificaciones</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setDashboardLayout(dashboardLayout === "grid" ? "list" : "grid")}>
                  Cambiar vista
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = '/dashboard/settings'}>
                  Configuración
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = '/dashboard/profile'}>
                  Perfil
                </DropdownMenuItem>
                {isAdmin() && (
                  <DropdownMenuItem onClick={() => window.location.href = '/dashboard/admin'}>
                    Panel de Administración
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>

      <motion.div className="mb-6" variants={itemVariants}>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full max-w-md mx-auto mb-6 grid grid-cols-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <TabsTrigger value="general" className="flex-1 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">General</TabsTrigger>
            <TabsTrigger value="familia" className="flex-1 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">Familia</TabsTrigger>
            <TabsTrigger value="finanzas" className="flex-1 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">Finanzas</TabsTrigger>
            <TabsTrigger value="documentos" className="flex-1 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">Documentos</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-0">
            {/* Sección de estadísticas */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
              variants={itemVariants}
            >
              <StatsCard
                title="Mensajes sin leer"
                value="2"
                description="Tienes 2 mensajes sin leer"
                icon={<MessageSquare className="h-5 w-5 text-blue-600" />}
                trend={{ value: 10, isPositive: false }}
                onClick={() => window.location.href = '/dashboard/mensajes'}
              />
              <StatsCard
                title="Eventos próximos"
                value="4"
                description="En los próximos 7 días"
                icon={<Calendar className="h-5 w-5 text-green-600" />}
                trend={{ value: 5, isPositive: true }}
                onClick={() => window.location.href = '/dashboard/calendario'}
              />
              <StatsCard
                title="Gastos pendientes"
                value="€35.50"
                description="1 gasto por aprobar"
                icon={<DollarSign className="h-5 w-5 text-amber-600" />}
                trend={{ value: 12, isPositive: false }}
                onClick={() => window.location.href = '/dashboard/gastos'}
              />
              <StatsCard
                title="Documentos nuevos"
                value="1"
                description="Subido hace 2 días"
                icon={<FileText className="h-5 w-5 text-purple-600" />}
                trend={{ value: 0, isPositive: true }}
                onClick={() => window.location.href = '/dashboard/documentos'}
              />
            </motion.div>

            {/* Sección principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Columna izquierda */}
              <motion.div className="lg:col-span-2 space-y-6" variants={itemVariants}>
                {/* Calendario y eventos */}
                <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <CalendarPreview events={mockData.upcomingEvents} className="h-full" />
                </motion.div>
                
                {/* Mensajes recientes */}
                <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <RecentMessages />
                </motion.div>
              </motion.div>

              {/* Columna derecha */}
              <motion.div className="space-y-6" variants={itemVariants}>
                {/* Suscripción */}
                <motion.div variants={itemVariants} className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl shadow-sm border border-blue-100 dark:border-blue-800 overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <SubscriptionCard
                    isLoading={isLoadingSubscription}
                    subscription={subscription}
                    hasActiveSubscription={hasActiveSubscription}
                    onManageSubscription={handleManageSubscription}
                    onUpgrade={handleUpgrade}
                    stripeEnabled={stripeEnabled}
                  />
                </motion.div>
                
                {/* Tareas pendientes */}
                <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <TasksList tasks={mockData.tasks} />
                </motion.div>
                
                {/* Actividad reciente */}
                <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <ActivityCard />
                </motion.div>

                {/* Acceso rápido */}
                <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <Card className="border-0 shadow-none">
                    <CardHeader className="pb-3">
                      <CardTitle>Acceso rápido</CardTitle>
                      <CardDescription>Accede rápidamente a las funciones más utilizadas</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" className="flex flex-col items-center justify-center h-20 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" onClick={() => window.location.href = '/dashboard/mensajes/nuevo'}>
                          <MessageSquare className="h-6 w-6 mb-1 text-blue-600" />
                          <span className="text-xs">Nuevo mensaje</span>
                        </Button>
                        <Button variant="outline" className="flex flex-col items-center justify-center h-20 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" onClick={() => window.location.href = '/dashboard/calendario/nuevo'}>
                          <Calendar className="h-6 w-6 mb-1 text-green-600" />
                          <span className="text-xs">Nuevo evento</span>
                        </Button>
                        <Button variant="outline" className="flex flex-col items-center justify-center h-20 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" onClick={() => window.location.href = '/dashboard/gastos/nuevo'}>
                          <DollarSign className="h-6 w-6 mb-1 text-amber-600" />
                          <span className="text-xs">Registrar gasto</span>
                        </Button>
                        <Button variant="outline" className="flex flex-col items-center justify-center h-20 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" onClick={() => window.location.href = '/dashboard/documentos/nuevo'}>
                          <FileText className="h-6 w-6 mb-1 text-purple-600" />
                          <span className="text-xs">Subir documento</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="familia" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <FamilyMembers />
                </motion.div>
                <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <FamilyProgress />
                </motion.div>
                <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <Card className="border-0 shadow-none">
                    <CardHeader>
                      <CardTitle className="text-indigo-700 dark:text-indigo-400">Comunicación familiar</CardTitle>
                      <CardDescription>Estadísticas de comunicación entre los miembros de la familia</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <span>Mensajes intercambiados este mes</span>
                          <span className="font-semibold">24</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <span>Tiempo promedio de respuesta</span>
                          <span className="font-semibold">4 horas</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <span>Acuerdos alcanzados</span>
                          <span className="font-semibold">8</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <span>Temas pendientes</span>
                          <span className="font-semibold">3</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
              <div className="space-y-6">
                <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <CalendarPreview events={mockData.upcomingEvents.filter(e => e.type === "FAMILY")} className="h-full" maxEvents={3} />
                </motion.div>
                <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <Card className="border-0 shadow-none">
                    <CardHeader>
                      <CardTitle className="text-indigo-700 dark:text-indigo-400">Miembros de la familia</CardTitle>
                      <CardDescription>Información de contacto</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-medium">Ana García</p>
                            <p className="text-sm text-muted-foreground">ana@ejemplo.com</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-medium">Carlos Rodríguez</p>
                            <p className="text-sm text-muted-foreground">carlos@ejemplo.com</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="finanzas" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <ExpenseChart data={mockData.expenseData} className="h-full" />
                </motion.div>
                <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <Card className="border-0 shadow-none">
                    <CardHeader>
                      <CardTitle className="text-green-700 dark:text-green-400">Resumen de gastos</CardTitle>
                      <CardDescription>Distribución de gastos por categoría</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span>Educación</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">€470</span>
                            <span className="text-xs text-muted-foreground">(42%)</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span>Salud</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">€270</span>
                            <span className="text-xs text-muted-foreground">(24%)</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <span>Actividades</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">€330</span>
                            <span className="text-xs text-muted-foreground">(29%)</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                            <span>Otros</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">€90</span>
                            <span className="text-xs text-muted-foreground">(5%)</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
              <div className="space-y-6">
                <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <RecentExpenses expenses={mockData.recentExpenses} />
                </motion.div>
                <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <Card className="border-0 shadow-none">
                    <CardHeader>
                      <CardTitle className="text-green-700 dark:text-green-400">Balance de gastos</CardTitle>
                      <CardDescription>Estado actual de los pagos compartidos</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <span>Total gastos compartidos</span>
                          <span className="font-semibold">€1,160</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <span>Pagado por Ana</span>
                          <span className="font-semibold">€580</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <span>Pagado por Carlos</span>
                          <span className="font-semibold">€580</span>
                        </div>
                        <div className="flex justify-between items-center p-2 pt-3 border-t rounded-lg">
                          <span className="font-medium">Balance actual</span>
                          <span className="font-semibold text-green-600">€0</span>
                        </div>
                      </div>
                      <Button className="w-full mt-4 bg-green-600 hover:bg-green-700 transition-colors" onClick={() => window.location.href = '/dashboard/gastos/balance'}>
                        Ver detalles del balance
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documentos" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <RecentDocuments documents={mockData.recentDocuments} />
                </motion.div>
                <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <Card className="border-0 shadow-none">
                    <CardHeader>
                      <CardTitle className="text-purple-700 dark:text-purple-400">Documentos importantes</CardTitle>
                      <CardDescription>Documentos esenciales para la co-parentalidad</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <FileText className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium">Acuerdo de custodia</p>
                              <p className="text-xs text-muted-foreground">Actualizado: 12/03/2023</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-900/20 dark:hover:text-purple-400">Ver</Button>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <FileText className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium">Calendario escolar</p>
                              <p className="text-xs text-muted-foreground">Actualizado: 05/09/2023</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-900/20 dark:hover:text-purple-400">Ver</Button>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <FileText className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium">Información médica</p>
                              <p className="text-xs text-muted-foreground">Actualizado: 18/01/2024</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-900/20 dark:hover:text-purple-400">Ver</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
              <div className="space-y-6">
                <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <Card className="border-0 shadow-none">
                    <CardHeader>
                      <CardTitle className="text-purple-700 dark:text-purple-400">Subir documento</CardTitle>
                      <CardDescription>Comparte documentos importantes con el otro progenitor</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full bg-purple-600 hover:bg-purple-700 transition-colors" onClick={() => window.location.href = '/dashboard/documentos/nuevo'}>
                        <Plus className="h-4 w-4 mr-2" />
                        Subir nuevo documento
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <Card className="border-0 shadow-none">
                    <CardHeader>
                      <CardTitle className="text-purple-700 dark:text-purple-400">Categorías</CardTitle>
                      <CardDescription>Organiza tus documentos por categorías</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <span>Legales</span>
                          <Badge className="bg-purple-600 hover:bg-purple-700">4</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <span>Médicos</span>
                          <Badge className="bg-purple-600 hover:bg-purple-700">3</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <span>Escolares</span>
                          <Badge className="bg-purple-600 hover:bg-purple-700">6</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <span>Financieros</span>
                          <Badge className="bg-purple-600 hover:bg-purple-700">2</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <span>Otros</span>
                          <Badge className="bg-purple-600 hover:bg-purple-700">1</Badge>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full mt-4 text-purple-700 border-purple-200 hover:bg-purple-50 hover:border-purple-300 dark:text-purple-400 dark:border-purple-800 dark:hover:bg-purple-900/20" onClick={() => window.location.href = '/dashboard/documentos/categorias'}>
                        Gestionar categorías
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
} 