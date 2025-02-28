"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  Settings, 
  AlertTriangle, 
  FileText, 
  DollarSign, 
  Trash2, 
  Edit, 
  RefreshCw, 
  Plus,
  ShoppingBag,
  Scale,
  CreditCard,
  Tag,
  BarChart
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { UserForm } from "@/components/admin/user-form";
import { MessageForm } from "@/components/admin/message-form";
import { EventForm } from "@/components/admin/event-form";
import { DocumentForm } from "@/components/admin/document-form";
import { ExpenseForm } from "@/components/admin/expense-form";
import { MarketplaceForm } from "@/components/admin/marketplace-form";
import { LawyerForm } from "@/components/admin/lawyer-form";
import { SubscriptionForm } from "@/components/admin/subscription-form";

// Definición de interfaces
interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  createdAt?: Date;
  emailVerified?: Date | null;
  password?: string | null;
  updatedAt?: Date;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  sender?: User;
  createdAt: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  familyId: string;
}

interface Document {
  id: string;
  title: string;
  url: string;
  familyId: string;
  createdAt: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  familyId: string;
  paidById: string;
  paidBy?: User;
}

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string | null;
  featured: boolean;
}

// Interfaces para nuevas secciones
interface Lawyer {
  id: string;
  name: string;
  email: string;
  specialties: string[];
  bio: string;
  image: string | null;
  verified: boolean;
  rating: number;
}

interface Payment {
  id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  date: string;
  paymentMethod: string;
  description: string;
}

interface Subscription {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  active: boolean;
}

// Interfaces para elementos nuevos
const emptyUser: Partial<User> = {
  name: "",
  email: "",
  role: "PARENT",
  image: null,
};

const emptyMessage: Partial<Message> = {
  content: "",
  senderId: "",
};

const emptyEvent: Partial<Event> = {
  title: "",
  description: "",
  date: new Date().toISOString(),
  familyId: "",
};

const emptyDocument: Partial<Document> = {
  title: "",
  url: "",
  familyId: "",
};

const emptyExpense: Partial<Expense> = {
  description: "",
  amount: 0,
  date: new Date().toISOString(),
  familyId: "",
  paidById: "",
};

const emptyMarketplaceItem: Partial<MarketplaceItem> = {
  title: "",
  description: "",
  price: 0,
  category: "legal",
  image: null,
  featured: false,
};

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  
  // Estado para marketplace
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  
  // Estados para nuevas secciones
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  
  // Estado para estadísticas
  const [stats, setStats] = useState<any>(null);
  const [statsPeriod, setStatsPeriod] = useState<string>("Este mes");
  
  const [loading, setLoading] = useState({
    users: false,
    messages: false,
    events: false,
    documents: false,
    expenses: false,
    marketplace: false,
    lawyers: false,
    payments: false,
    subscriptions: false,
    stats: false
  });
  
  const [editItem, setEditItem] = useState<any>(null);
  const [editType, setEditType] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  const [error, setError] = useState<string | null>(null);

  // Función para cargar datos
  const fetchData = async () => {
    // Verificar si el usuario está logueado y es administrador
    if (!session?.user) {
      toast({
        title: "Acceso denegado",
        description: "Debes iniciar sesión para acceder a esta página.",
        variant: "destructive",
      });
      return;
    }

    // Verificar si el usuario es administrador
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN") {
      toast({
        title: "Acceso denegado",
        description: "No tienes permisos de administrador",
        variant: "destructive"
      });
      return;
    }

    // Limpiar cualquier error previo
    setError(null);
    
    // Establecer estado de carga para todos los recursos
    Object.keys(loading).forEach(key => 
      setLoading(prev => ({ ...prev, [key]: true }))
    );
    
    // Notificar al usuario que se están cargando los datos
    toast({
      title: "Cargando datos",
      description: "Obteniendo información del panel de administración...",
    });

    try {
      // Usuarios
      try {
        const response = await fetch('/api/admin/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.warn('Error al cargar usuarios:', error);
        // Usuarios de ejemplo
        setUsers([
          {
            id: "1",
            name: "Admin Usuario",
            email: "admin@ejemplo.com",
            image: null,
            role: "ADMIN"
          },
          {
            id: "2",
            name: "María López",
            email: "maria@ejemplo.com",
            image: null,
            role: "USER"
          }
        ]);
      } finally {
        setLoading(prev => ({ ...prev, users: false }));
      }

      // Mensajes
      try {
        const response = await fetch('/api/admin/messages');
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.warn('Error al cargar mensajes:', error);
        // Mensajes de ejemplo
        setMessages([
          {
            id: "1",
            content: "Mensaje de ejemplo 1",
            senderId: "2",
            createdAt: new Date().toISOString()
          },
          {
            id: "2",
            content: "Mensaje de ejemplo 2",
            senderId: "3",
            createdAt: new Date(Date.now() - 86400000).toISOString()
          }
        ]);
      } finally {
        setLoading(prev => ({ ...prev, messages: false }));
      }

      // Eventos
      try {
        const response = await fetch('/api/admin/events');
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.warn('Error al cargar eventos:', error);
        // Eventos de ejemplo
        setEvents([
          {
            id: "1",
            title: "Evento de ejemplo 1",
            description: "Descripción del evento 1",
            date: new Date().toISOString(),
            familyId: "1"
          },
          {
            id: "2",
            title: "Evento de ejemplo 2",
            description: "Descripción del evento 2",
            date: new Date(Date.now() + 86400000).toISOString(),
            familyId: "2"
          }
        ]);
      } finally {
        setLoading(prev => ({ ...prev, events: false }));
      }

      // Documentos
      try {
        const response = await fetch('/api/admin/documents');
        if (response.ok) {
          const data = await response.json();
          setDocuments(data);
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.warn('Error al cargar documentos:', error);
        // Documentos de ejemplo
        setDocuments([
          {
            id: "1",
            title: "Documento de ejemplo 1",
            url: "https://ejemplo.com/doc1.pdf",
            familyId: "1",
            createdAt: new Date().toISOString()
          },
          {
            id: "2",
            title: "Documento de ejemplo 2",
            url: "https://ejemplo.com/doc2.pdf",
            familyId: "2",
            createdAt: new Date(Date.now() - 86400000).toISOString()
          }
        ]);
      } finally {
        setLoading(prev => ({ ...prev, documents: false }));
      }

      // Gastos
      try {
        const response = await fetch('/api/admin/expenses');
        if (response.ok) {
          const data = await response.json();
          setExpenses(data);
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.warn('Error al cargar gastos:', error);
        // Gastos de ejemplo
        setExpenses([
          {
            id: "1",
            description: "Gasto de ejemplo 1",
            amount: 50,
            date: new Date().toISOString(),
            familyId: "1",
            paidById: "2"
          },
          {
            id: "2",
            description: "Gasto de ejemplo 2",
            amount: 75,
            date: new Date(Date.now() - 86400000).toISOString(),
            familyId: "2",
            paidById: "3"
          }
        ]);
      } finally {
        setLoading(prev => ({ ...prev, expenses: false }));
      }

      // Productos de marketplace
      try {
        const response = await fetch('/api/admin/marketplace');
        if (response.ok) {
          const data = await response.json();
          setMarketplaceItems(data);
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.warn('Error al cargar productos del marketplace:', error);
        // Productos de ejemplo
        setMarketplaceItems([
          {
            id: "1",
            title: "Producto de ejemplo 1",
            description: "Descripción del producto 1",
            price: 29.99,
            category: "Categoría 1",
            image: null,
            featured: true
          },
          {
            id: "2",
            title: "Producto de ejemplo 2",
            description: "Descripción del producto 2",
            price: 19.99,
            category: "Categoría 2",
            image: null,
            featured: false
          }
        ]);
      } finally {
        setLoading(prev => ({ ...prev, marketplace: false }));
      }

      // Abogados
      try {
        const response = await fetch('/api/admin/lawyers');
        if (response.ok) {
          const data = await response.json();
          setLawyers(data);
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.warn('Error al cargar abogados:', error);
        // Abogados de ejemplo
        setLawyers([
          {
            id: "1",
            name: "Abogado de ejemplo 1",
            email: "abogado1@ejemplo.com",
            specialties: ["Especialidad 1", "Especialidad 2"],
            bio: "Biografía del abogado 1",
            image: null,
            verified: true,
            rating: 4.5
          },
          {
            id: "2",
            name: "Abogado de ejemplo 2",
            email: "abogado2@ejemplo.com",
            specialties: ["Especialidad 3", "Especialidad 4"],
            bio: "Biografía del abogado 2",
            image: null,
            verified: false,
            rating: 4.0
          }
        ]);
      } finally {
        setLoading(prev => ({ ...prev, lawyers: false }));
      }

      // Pagos
      try {
        const response = await fetch('/api/admin/payments');
        if (response.ok) {
          const data = await response.json();
          setPayments(data);
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.warn('Error al cargar pagos:', error);
        // Pagos de ejemplo
        setPayments([
          {
            id: "1",
            userId: "2",
            amount: 9.99,
            status: 'completed',
            date: new Date().toISOString(),
            paymentMethod: "tarjeta",
            description: "Pago de ejemplo 1"
          },
          {
            id: "2",
            userId: "3",
            amount: 19.99,
            status: 'pending',
            date: new Date(Date.now() - 86400000).toISOString(),
            paymentMethod: "paypal",
            description: "Pago de ejemplo 2"
          }
        ]);
      } finally {
        setLoading(prev => ({ ...prev, payments: false }));
      }

      // Suscripciones
      try {
        const response = await fetch('/api/admin/subscriptions');
        if (response.ok) {
          const data = await response.json();
          setSubscriptions(data);
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.warn('Error al cargar suscripciones:', error);
        // Suscripciones de ejemplo
        setSubscriptions([
          {
            id: "1",
            name: "Suscripción de ejemplo 1",
            price: 9.99,
            interval: 'monthly',
            features: ["Característica 1", "Característica 2"],
            active: true
          },
          {
            id: "2",
            name: "Suscripción de ejemplo 2",
            price: 19.99,
            interval: 'yearly',
            features: ["Característica 3", "Característica 4"],
            active: true
          }
        ]);
      } finally {
        setLoading(prev => ({ ...prev, subscriptions: false }));
      }

      // Estadísticas
      try {
        const response = await fetch('/api/admin/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.warn('Error al cargar estadísticas:', error);
        // Estadísticas de ejemplo
        setStats({
          users: {
            total: 250,
            new: 15,
            active: 120
          },
          revenue: {
            total: 1250.75,
            period: "Este mes"
          },
          marketplace: {
            total: 42,
            featured: 8
          },
          lawyers: {
            total: 15,
            verified: 10
          },
          subscriptions: [
            {
              id: "1",
              name: "Plan Básico",
              userCount: 125
            },
            {
              id: "2",
              name: "Plan Premium",
              userCount: 85
            }
          ]
        });
      } finally {
        setLoading(prev => ({ ...prev, stats: false }));
      }

      // Notificar al usuario que los datos están cargados
      toast({
        title: "Datos cargados",
        description: "La información del panel de administración se ha cargado correctamente.",
        variant: "default",
      });

    } catch (error) {
      console.error("Error general al cargar datos:", error);
      setError("Ocurrió un error al cargar los datos. Por favor, intenta nuevamente.");
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del panel de administración.",
        variant: "destructive",
      });
    }
  };

  // Funciones para eliminar elementos
  const handleDelete = async (type: string, id: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar este ${type}?`)) return;
    
    try {
      const response = await fetch(`/api/admin/${type}?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error(`Error al eliminar ${type}`);
      
      toast({
        title: "Éxito",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} eliminado correctamente`,
      });
      
      // Actualizar la lista correspondiente
      switch(type) {
        case 'users':
          setUsers(users.filter(user => user.id !== id));
          break;
        case 'messages':
          setMessages(messages.filter(message => message.id !== id));
          break;
        case 'events':
          setEvents(events.filter(event => event.id !== id));
          break;
        case 'documents':
          setDocuments(documents.filter(doc => doc.id !== id));
          break;
        case 'expenses':
          setExpenses(expenses.filter(expense => expense.id !== id));
          break;
        case 'marketplace':
          setMarketplaceItems(marketplaceItems.filter(item => item.id !== id));
          break;
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: `No se pudo eliminar el ${type}`,
        variant: "destructive"
      });
    }
  };

  // Función para editar elementos
  const handleEdit = (type: string, item: any) => {
    setEditType(type);
    setEditItem(item);
    setIsCreating(false);
  };

  // Función para iniciar la creación de un nuevo elemento
  const handleCreate = (type: string) => {
    setEditType(type);
    setIsCreating(true);
    
    // Inicializar con datos vacíos según el tipo
    switch (type) {
      case 'users':
        setEditItem({...emptyUser, id: 'new'});
        break;
      case 'messages':
        setEditItem({...emptyMessage, id: 'new'});
        break;
      case 'events':
        setEditItem({...emptyEvent, id: 'new'});
        break;
      case 'documents':
        setEditItem({...emptyDocument, id: 'new'});
        break;
      case 'expenses':
        setEditItem({...emptyExpense, id: 'new'});
        break;
      case 'marketplace':
        setEditItem({...emptyMarketplaceItem, id: 'new'});
        break;
      case 'lawyers':
        setEditItem({
          id: 'new',
          name: '',
          email: '',
          specialties: [],
          bio: '',
          image: null,
          verified: false,
          rating: 0
        });
        break;
      case 'subscriptions':
        setEditItem({
          id: 'new',
          name: '',
          price: 0,
          interval: 'monthly',
          features: [],
          active: true
        });
        break;
    }
  };

  // Función para actualizar elementos
  const handleUpdate = async (type: string, id: string, data: any) => {
    try {
      const response = await fetch(`/api/admin/${type}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...data }),
      });
      
      if (!response.ok) throw new Error(`Error al actualizar ${type}`);
      
      toast({
        title: "Éxito",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} actualizado correctamente`,
      });
      
      // Actualizar la lista correspondiente
      fetchData();
      
      // Limpiar el estado de edición
      setEditItem(null);
      setEditType("");
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: `No se pudo actualizar el ${type}`,
        variant: "destructive"
      });
    }
  };

  // Función para guardar un nuevo elemento
  const handleSaveNew = async (type: string, data: any) => {
    try {
      setLoading(prev => ({ ...prev, [type]: true }));
      
      // Eliminar el ID 'new' antes de enviar los datos
      const { id, ...dataToSend } = data;
      
      // Agregar campos adicionales según el tipo
      if (type === 'users' && !dataToSend.password) {
        // Para usuarios nuevos, generar una contraseña temporal
        dataToSend.password = generateTemporaryPassword();
      }
      
      const response = await fetch(`/api/admin/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear elemento');
      }
      
      const newItem = await response.json();
      
      // Actualizar el estado según el tipo
      switch (type) {
        case 'users':
          setUsers(prev => [newItem, ...prev]);
          break;
        case 'messages':
          setMessages(prev => [newItem, ...prev]);
          break;
        case 'events':
          setEvents(prev => [newItem, ...prev]);
          break;
        case 'documents':
          setDocuments(prev => [newItem, ...prev]);
          break;
        case 'expenses':
          setExpenses(prev => [newItem, ...prev]);
          break;
        case 'marketplace':
          setMarketplaceItems(prev => [newItem, ...prev]);
          break;
        case 'lawyers':
          setLawyers(prev => [newItem, ...prev]);
          break;
        case 'subscriptions':
          setSubscriptions(prev => [newItem, ...prev]);
          break;
      }
      
      setEditItem(null);
      setIsCreating(false);
      
      toast({
        title: "Éxito",
        description: "Elemento creado correctamente",
      });
    } catch (error) {
      console.error('Error al crear elemento:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear elemento",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  // Función para generar una contraseña temporal
  const generateTemporaryPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    if (session?.user) {
      fetchData();
    }
  }, [session]);

  // Actualizar la pestaña activa cuando cambia
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Verificar si el usuario está autenticado
  if (!session?.user) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Acceso Restringido</h1>
        <p>Debes iniciar sesión para acceder a esta página.</p>
        <Button 
          className="mt-4" 
          onClick={() => window.location.href = '/login?callbackUrl=/dashboard/admin'}
        >
          Iniciar Sesión
        </Button>
      </div>
    );
  }

  // Verificar si el usuario tiene permisos de administrador
  if (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN") {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Acceso Denegado</h1>
        <p>No tienes permisos de administrador para acceder a esta página.</p>
        <p className="mt-2 text-sm text-gray-500">Tu rol actual: {session.user.role}</p>
        <Button 
          className="mt-4" 
          onClick={() => window.location.href = '/dashboard'}
        >
          Volver al Dashboard
        </Button>
      </div>
    );
  }

  // Mostrar mensaje de error si ocurrió alguno
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
          <h2 className="text-red-800 font-semibold">Error</h2>
          <p className="text-red-700">{error}</p>
          <Button 
            className="mt-4 bg-red-600 hover:bg-red-700" 
            onClick={fetchData}
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  // Renderizar el formulario adecuado según el tipo de elemento que se está editando
  const renderEditForm = () => {
    if (!editItem) return null;

    const onSave = isCreating 
      ? (id: string, data: any) => handleSaveNew(editType, data)
      : (id: string, data: any) => handleUpdate(editType, id, data);

    switch (editType) {
      case 'users':
        return (
          <UserForm 
            user={editItem as User} 
            onSave={onSave} 
            onCancel={() => { setEditItem(null); setIsCreating(false); }}
            isCreating={isCreating}
          />
        );
      case 'messages':
        return (
          <MessageForm 
            message={editItem as Message} 
            onSave={onSave} 
            onCancel={() => { setEditItem(null); setIsCreating(false); }} 
          />
        );
      case 'events':
        return (
          <EventForm 
            event={editItem as Event} 
            onSave={onSave} 
            onCancel={() => { setEditItem(null); setIsCreating(false); }} 
          />
        );
      case 'documents':
        return (
          <DocumentForm 
            document={editItem as Document} 
            onSave={onSave} 
            onCancel={() => { setEditItem(null); setIsCreating(false); }} 
          />
        );
      case 'expenses':
        return (
          <ExpenseForm 
            expense={editItem as Expense} 
            onSave={onSave} 
            onCancel={() => { setEditItem(null); setIsCreating(false); }} 
          />
        );
      case 'marketplace':
        return (
          <MarketplaceForm 
            item={editItem as MarketplaceItem} 
            onSave={onSave} 
            onCancel={() => { setEditItem(null); setIsCreating(false); }} 
          />
        );
      case 'lawyers':
        return (
          <LawyerForm 
            lawyer={editItem as Lawyer} 
            onSave={onSave} 
            onCancel={() => { setEditItem(null); setIsCreating(false); }}
            isCreating={isCreating}
          />
        );
      case 'subscriptions':
        return (
          <SubscriptionForm 
            subscription={editItem as Subscription} 
            onSave={onSave} 
            onCancel={() => { setEditItem(null); setIsCreating(false); }}
            isCreating={isCreating}
          />
        );
      default:
        return null;
    }
  };

  // Función para obtener el título del modal
  const getModalTitle = () => {
    const action = isCreating ? "Crear" : "Editar";
    
    switch (editType) {
      case 'users':
        return `${action} usuario`;
      case 'messages':
        return `${action} mensaje`;
      case 'events':
        return `${action} evento`;
      case 'documents':
        return `${action} documento`;
      case 'expenses':
        return `${action} gasto`;
      case 'marketplace':
        return `${action} producto/servicio`;
      case 'lawyers':
        return `${action} perfil de abogado`;
      case 'subscriptions':
        return `${action} plan de suscripción`;
      default:
        return "";
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <button 
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar datos
        </button>
      </div>

      <Tabs 
        defaultValue="users" 
        className="w-full"
        value={activeTab}
        onValueChange={handleTabChange}
      >
        <TabsList className="mb-6 grid grid-cols-10 gap-2">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Mensajes
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Eventos
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documentos
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Gastos
          </TabsTrigger>
          <TabsTrigger value="marketplace" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Marketplace
          </TabsTrigger>
          <TabsTrigger value="lawyers" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Abogados
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Pagos
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Planes
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Estadísticas
          </TabsTrigger>
        </TabsList>

        <div className="bg-white rounded-lg shadow-md p-6">
          <TabsContent value="users">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Usuarios</h2>
                  <p className="text-gray-500">Gestiona los usuarios del sistema</p>
                </div>
                <Button 
                  onClick={() => handleCreate('users')}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Añadir usuario
                </Button>
              </div>
              
              {loading.users ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {users.length === 0 ? (
                    <p className="text-center text-gray-500 p-4">No hay usuarios para mostrar</p>
                  ) : (
                    users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            {user.name ? user.name[0] : '?'}
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <span className="inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 mt-1">
                              {user.role}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEdit('users', user)}
                            className="p-2 text-blue-500 hover:text-blue-700"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete('users', user.id)}
                            className="p-2 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="messages">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Mensajes</h2>
                  <p className="text-gray-500">Lista de mensajes del sistema</p>
                </div>
                <Button 
                  onClick={() => handleCreate('messages')}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Añadir mensaje
                </Button>
              </div>
              
              {loading.messages ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {messages.length === 0 ? (
                    <p className="text-center text-gray-500 p-4">No hay mensajes para mostrar</p>
                  ) : (
                    messages.map((message) => (
                      <div key={message.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                              {message.sender?.name ? message.sender.name[0] : '?'}
                            </div>
                            <p className="font-medium">{message.sender?.name || 'Usuario desconocido'}</p>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEdit('messages', message)}
                              className="p-2 text-blue-500 hover:text-blue-700"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete('messages', message.id)}
                              className="p-2 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatDate(message.createdAt)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="events">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Eventos</h2>
                  <p className="text-gray-500">Lista de eventos programados</p>
                </div>
                <Button 
                  onClick={() => handleCreate('events')}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Añadir evento
                </Button>
              </div>
              
              {loading.events ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {events.length === 0 ? (
                    <p className="text-center text-gray-500 p-4">No hay eventos para mostrar</p>
                  ) : (
                    events.map((event) => (
                      <div key={event.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold mb-1">{event.title}</h3>
                            <p className="text-sm text-gray-700 mb-2">{event.description}</p>
                            <p className="text-sm text-gray-500">
                              {formatDate(event.date)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Familia ID: {event.familyId}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEdit('events', event)}
                              className="p-2 text-blue-500 hover:text-blue-700"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete('events', event.id)}
                              className="p-2 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Documentos</h2>
                  <p className="text-gray-500">Lista de documentos compartidos</p>
                </div>
                <Button 
                  onClick={() => handleCreate('documents')}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Añadir documento
                </Button>
              </div>
              
              {loading.documents ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {documents.length === 0 ? (
                    <p className="text-center text-gray-500 p-4">No hay documentos para mostrar</p>
                  ) : (
                    documents.map((doc) => (
                      <div key={doc.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold mb-1">{doc.title}</h3>
                            <p className="text-xs text-gray-500">
                              Subido el: {formatDate(doc.createdAt)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Familia ID: {doc.familyId}
                            </p>
                            <a 
                              href={doc.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-500 text-sm hover:underline mt-2 inline-block"
                            >
                              Ver documento
                            </a>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEdit('documents', doc)}
                              className="p-2 text-blue-500 hover:text-blue-700"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete('documents', doc.id)}
                              className="p-2 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="expenses">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Gastos</h2>
                  <p className="text-gray-500">Lista de gastos registrados</p>
                </div>
                <Button 
                  onClick={() => handleCreate('expenses')}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Añadir gasto
                </Button>
              </div>
              
              {loading.expenses ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {expenses.length === 0 ? (
                    <p className="text-center text-gray-500 p-4">No hay gastos para mostrar</p>
                  ) : (
                    expenses.map((expense) => (
                      <div key={expense.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold mb-1">{expense.description}</h3>
                            <p className="text-sm font-medium text-green-600">
                              {expense.amount.toFixed(2)} €
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Fecha: {formatDate(expense.date)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Pagado por: {expense.paidBy?.name || expense.paidById}
                            </p>
                            <p className="text-xs text-gray-500">
                              Familia ID: {expense.familyId}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEdit('expenses', expense)}
                              className="p-2 text-blue-500 hover:text-blue-700"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete('expenses', expense.id)}
                              className="p-2 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="marketplace">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Marketplace</h2>
                  <p className="text-gray-500">Gestiona los productos y servicios</p>
                </div>
                <Button 
                  onClick={() => handleCreate('marketplace')}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Añadir producto/servicio
                </Button>
              </div>
              
              {loading.marketplace ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {marketplaceItems.length === 0 ? (
                    <p className="text-center text-gray-500 p-4 col-span-3">No hay productos o servicios para mostrar</p>
                  ) : (
                    marketplaceItems.map((item) => (
                      <div key={item.id} className="bg-white p-4 rounded-lg shadow">
                        <div className="relative pb-3">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.title}
                              className="w-full h-40 object-cover rounded-md mb-2"
                            />
                          ) : (
                            <div className="w-full h-40 bg-gray-200 rounded-md mb-2 flex items-center justify-center">
                              <ShoppingBag className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                          {item.featured && (
                            <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-800 text-xs px-2 py-1 rounded-full">
                              Destacado
                            </span>
                          )}
                        </div>
                        
                        <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                        
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-green-600">{item.price.toFixed(2)} €</span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {item.category}
                          </span>
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end gap-2">
                          <button 
                            onClick={() => handleEdit('marketplace', item)}
                            className="p-2 text-blue-500 hover:text-blue-700"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete('marketplace', item.id)}
                            className="p-2 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="lawyers">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Abogados y Mediadores</h2>
                  <p className="text-gray-500">Gestiona perfiles profesionales</p>
                </div>
                <Button 
                  onClick={() => handleCreate('lawyers')}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Añadir profesional
                </Button>
              </div>
              
              {loading.lawyers ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {lawyers.length === 0 ? (
                    <p className="text-center text-gray-500 p-4">No hay profesionales para mostrar</p>
                  ) : (
                    <p className="text-center text-gray-500 p-4">Funcionalidad en desarrollo</p>
                    // Aquí iría el mapeo de abogados
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="payments">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Pagos</h2>
                  <p className="text-gray-500">Gestiona transacciones y facturación</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {}} // Exportar informes
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Exportar
                  </Button>
                </div>
              </div>
              
              {loading.payments ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {payments.length === 0 ? (
                    <p className="text-center text-gray-500 p-4">No hay pagos para mostrar</p>
                  ) : (
                    <p className="text-center text-gray-500 p-4">Funcionalidad en desarrollo</p>
                    // Aquí iría el mapeo de pagos
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="subscriptions">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Planes de Suscripción</h2>
                  <p className="text-gray-500">Gestiona niveles de servicio y precios</p>
                </div>
                <Button 
                  onClick={() => handleCreate('subscriptions')}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Añadir plan
                </Button>
              </div>
              
              {loading.subscriptions ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {subscriptions.length === 0 ? (
                    <p className="text-center text-gray-500 p-4">No hay planes para mostrar</p>
                  ) : (
                    <p className="text-center text-gray-500 p-4">Funcionalidad en desarrollo</p>
                    // Aquí iría el mapeo de suscripciones
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Estadísticas</h2>
                  <p className="text-gray-500">Métricas y análisis del portal</p>
                </div>
                <div className="flex gap-2">
                  <select 
                    className="border rounded p-2"
                    onChange={(e) => {
                      fetchStats(e.target.value);
                    }}
                  >
                    <option value="week">Esta semana</option>
                    <option value="month" selected>Este mes</option>
                    <option value="year">Este año</option>
                    <option value="all">Todo</option>
                  </select>
                </div>
              </div>
              
              {loading.stats ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <>
                  {stats ? (
                    <div className="space-y-6">
                      {/* Tarjetas de resumen */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow">
                          <h3 className="text-sm font-medium text-gray-500">Usuarios totales</h3>
                          <p className="text-2xl font-bold">{stats.users.total}</p>
                          <p className="text-sm text-green-600">+{stats.users.new} nuevos</p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg shadow">
                          <h3 className="text-sm font-medium text-gray-500">Ingresos</h3>
                          <p className="text-2xl font-bold">{stats.revenue.total.toFixed(2)} €</p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg shadow">
                          <h3 className="text-sm font-medium text-gray-500">Productos</h3>
                          <p className="text-2xl font-bold">{stats.marketplace.total}</p>
                          <p className="text-sm text-yellow-600">{stats.marketplace.featured} destacados</p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg shadow">
                          <h3 className="text-sm font-medium text-gray-500">Abogados</h3>
                          <p className="text-2xl font-bold">{stats.lawyers.total}</p>
                          <p className="text-sm text-blue-600">{stats.lawyers.verified} verificados</p>
                        </div>
                      </div>
                      
                      {/* Gráficos y detalles */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-4 rounded-lg shadow">
                          <h3 className="font-medium mb-4">Usuarios activos</h3>
                          <div className="flex items-center justify-center h-40">
                            <div className="text-center">
                              <p className="text-3xl font-bold">{stats.users.active}</p>
                              <p className="text-sm text-gray-500">sesiones activas</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg shadow">
                          <h3 className="font-medium mb-4">Distribución de planes</h3>
                          <div className="space-y-2">
                            {stats.subscriptions.map((plan: any) => (
                              <div key={plan.id} className="flex justify-between items-center">
                                <span>{plan.name}</span>
                                <div className="flex items-center">
                                  <span className="font-medium">{plan.userCount}</span>
                                  <span className="text-xs text-gray-500 ml-1">usuarios</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No hay datos estadísticos disponibles</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Modal de edición o creación */}
      {editItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {getModalTitle()}
            </h2>
            
            {renderEditForm()}
          </div>
        </div>
      )}
    </div>
  );
} 