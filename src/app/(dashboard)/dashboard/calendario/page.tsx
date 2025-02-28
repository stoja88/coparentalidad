"use client";

import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Calendar as CalendarIcon,
  X,
  Edit,
  Trash2,
  User,
  AlertCircle
} from "lucide-react";
import { format, addDays, isSameDay } from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

// Estilos personalizados para react-calendar
import "react-calendar/dist/Calendar.css";
import "./calendar.css";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

// Tipos para eventos
type EventType = "PERSONAL" | "SCHOOL" | "MEDICAL" | "ACTIVITY" | "FAMILY" | "OTHER";

interface Event {
  id: string;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  location: string | null;
  type: EventType;
  createdById: string;
  familyId: string;
  createdAt: Date;
  createdBy: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

// Tipos de eventos con colores y etiquetas
const eventTypes = [
  { value: "PERSONAL", label: "Personal", color: "bg-purple-500" },
  { value: "SCHOOL", label: "Escolar", color: "bg-blue-500" },
  { value: "MEDICAL", label: "Médico", color: "bg-red-500" },
  { value: "ACTIVITY", label: "Actividad", color: "bg-green-500" },
  { value: "FAMILY", label: "Familiar", color: "bg-amber-500" },
  { value: "OTHER", label: "Otro", color: "bg-gray-500" },
];

export default function CalendarioPage() {
  const [date, setDate] = useState<Value>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<"month" | "day" | "event" | "form">("month");
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado para el formulario de nuevo evento
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    startDate: format(new Date(), "yyyy-MM-dd"),
    startTime: "09:00",
    endDate: format(new Date(), "yyyy-MM-dd"),
    endTime: "10:00",
    location: "",
    type: "OTHER" as EventType,
  });

  // Efecto para cargar eventos desde la API
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/events');
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        // Convertir las fechas de string a objetos Date
        const eventsWithDates = data.map((event: any) => ({
          ...event,
          startDate: new Date(event.startDate),
          endDate: new Date(event.endDate),
          createdAt: new Date(event.createdAt)
        }));
        setEvents(eventsWithDates);
      } catch (error) {
        console.error("Error al cargar eventos:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los eventos. Por favor, intenta nuevamente.",
          variant: "destructive",
        });
        // Si falla, usar eventos vacíos en lugar de mockEvents
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Filtrar eventos para la fecha seleccionada
  const eventsForSelectedDate = events.filter((event) => 
    isSameDay(event.startDate, selectedDate)
  );

  // Filtrar próximos eventos (próximos 30 días)
  const upcomingEvents = events
    .filter((event) => event.startDate >= new Date())
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
    .slice(0, 5);

  // Función para verificar si una fecha tiene eventos
  const hasEvents = (date: Date) => {
    return events.some((event) => isSameDay(event.startDate, date));
  };

  // Renderizar contenido del tile del calendario
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month" && hasEvents(date)) {
      return <div className="event-dot"></div>;
    }
    return null;
  };

  // Manejar cambio de fecha en el calendario
  const handleDateChange = (value: Value) => {
    setDate(value);
    if (value instanceof Date) {
      setSelectedDate(value);
      setView("day");
    }
  };

  // Manejar navegación
  const handleBackToMonth = () => {
    setView("month");
  };

  const handleBackToDay = () => {
    setView("day");
  };

  const handlePrevDay = () => {
    const prevDay = new Date(selectedDate);
    prevDay.setDate(prevDay.getDate() - 1);
    setSelectedDate(prevDay);
  };

  const handleNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setSelectedDate(nextDay);
  };

  // Manejar vista de evento
  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event);
    setView("event");
  };

  // Manejar creación de evento
  const handleNewEvent = () => {
    setNewEvent({
      ...newEvent,
      startDate: format(selectedDate, "yyyy-MM-dd"),
      endDate: format(selectedDate, "yyyy-MM-dd"),
    });
    setView("form");
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: value }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Crear fechas completas a partir de fecha y hora
      const startDateTime = new Date(`${newEvent.startDate}T${newEvent.startTime}`);
      const endDateTime = new Date(`${newEvent.endDate}T${newEvent.endTime}`);
      
      // Validar fechas
      if (endDateTime <= startDateTime) {
        throw new Error("La fecha de fin debe ser posterior a la fecha de inicio");
      }
      
      // Enviar datos a la API
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newEvent.title,
          description: newEvent.description || null,
          startDate: startDateTime.toISOString(),
          endDate: endDateTime.toISOString(),
          location: newEvent.location || null,
          type: newEvent.type,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }
      
      const createdEvent = await response.json();
      
      // Convertir las fechas de string a objetos Date
      const newEventData: Event = {
        ...createdEvent,
        startDate: new Date(createdEvent.startDate),
        endDate: new Date(createdEvent.endDate),
        createdAt: new Date(createdEvent.createdAt)
      };
      
      // Actualizar la lista de eventos
      setEvents((prev) => [...prev, newEventData]);
      
      // Mostrar mensaje de éxito
      toast({
        title: "Evento creado",
        description: "El evento se ha creado correctamente",
      });
      
      // Resetear el formulario y volver a la vista del día
      setNewEvent({
        title: "",
        description: "",
        startDate: format(new Date(), "yyyy-MM-dd"),
        startTime: "09:00",
        endDate: format(new Date(), "yyyy-MM-dd"),
        endTime: "10:00",
        location: "",
        type: "OTHER",
      });
      
      setView("day");
    } catch (error) {
      console.error("Error al crear evento:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear el evento",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar eliminación de evento
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este evento?")) {
      return;
    }
    
    setIsLoading(true);
    try {
      // Enviar solicitud a la API
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }
      
      // Actualizar la lista de eventos
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
      
      // Mostrar mensaje de éxito
      toast({
        title: "Evento eliminado",
        description: "El evento se ha eliminado correctamente",
      });
      
      // Volver a la vista del día
      setView("day");
    } catch (error) {
      console.error("Error al eliminar evento:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar el evento",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener color según tipo de evento
  const getEventTypeColor = (type: EventType) => {
    return eventTypes.find((t) => t.value === type)?.color || "bg-gray-500";
  };

  // Obtener etiqueta según tipo de evento
  const getEventTypeLabel = (type: EventType) => {
    return eventTypes.find((t) => t.value === type)?.label || "Otro";
  };

  return (
    <div className="container-custom py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Calendario</h1>
        <Button onClick={handleNewEvent}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo evento
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendario o Formulario */}
        <div className="lg:col-span-2">
          {view === "month" && (
            <Card>
              <CardContent className="p-6">
                <Calendar
                  onChange={handleDateChange}
                  value={date}
                  locale="es-ES"
                  className="w-full border-none"
                  tileContent={tileContent}
                />
              </CardContent>
            </Card>
          )}

          {view === "day" && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <Button variant="ghost" onClick={handleBackToMonth}>
                    Volver al mes
                  </Button>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon" onClick={handlePrevDay}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-xl font-semibold">
                      {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
                    </h2>
                    <Button variant="outline" size="icon" onClick={handleNextDay}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mt-4">
                  {eventsForSelectedDate.length > 0 ? (
                    eventsForSelectedDate.map((event) => (
                      <Card 
                        key={event.id} 
                        className="card-hover cursor-pointer"
                        onClick={() => handleViewEvent(event)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.type)} mr-2`}></div>
                                <h3 className="font-medium">{event.title}</h3>
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground mt-1">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>
                                  {formatTime(event.startDate)} - {formatTime(event.endDate)}
                                </span>
                              </div>
                              {event.location && (
                                <div className="flex items-center text-sm text-muted-foreground mt-1">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  <span>{event.location}</span>
                                </div>
                              )}
                            </div>
                            <Badge variant="outline" className={`${getEventTypeColor(event.type)} text-white`}>
                              {getEventTypeLabel(event.type)}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No hay eventos para este día</p>
                      <Button className="mt-4" onClick={handleNewEvent}>
                        <Plus className="mr-2 h-4 w-4" /> Añadir evento
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {view === "event" && selectedEvent && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <Button variant="ghost" onClick={handleBackToDay}>
                    Volver al día
                  </Button>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="icon" title="Editar evento">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      title="Eliminar evento"
                      onClick={() => handleDeleteEvent(selectedEvent.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                <div className="mt-4">
                  <Badge className={`${getEventTypeColor(selectedEvent.type)} text-white mb-2`}>
                    {getEventTypeLabel(selectedEvent.type)}
                  </Badge>
                  <CardTitle className="text-2xl">{selectedEvent.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-muted-foreground mr-2" />
                    <div>
                      <p className="font-medium">{format(selectedEvent.startDate, "EEEE, d 'de' MMMM", { locale: es })}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(selectedEvent.startDate)} - {formatTime(selectedEvent.endDate)}
                      </p>
                    </div>
                  </div>
                  
                  {selectedEvent.location && (
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-muted-foreground mr-2" />
                      <p>{selectedEvent.location}</p>
                    </div>
                  )}
                  
                  {selectedEvent.description && (
                    <div className="mt-4">
                      <h3 className="font-medium mb-2">Descripción</h3>
                      <p className="text-sm">{selectedEvent.description}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center mt-6 pt-4 border-t">
                    <User className="h-5 w-5 text-muted-foreground mr-2" />
                    <div>
                      <p className="text-sm">Creado por {selectedEvent.createdBy.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(selectedEvent.createdAt, "d MMM yyyy", { locale: es })}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {view === "form" && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <Button variant="ghost" onClick={handleBackToDay}>
                    Cancelar
                  </Button>
                  <CardTitle>Nuevo evento</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      name="title"
                      value={newEvent.title}
                      onChange={handleInputChange}
                      placeholder="Título del evento"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Fecha de inicio</Label>
                      <Input
                        id="startDate"
                        name="startDate"
                        type="date"
                        value={newEvent.startDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Hora de inicio</Label>
                      <Input
                        id="startTime"
                        name="startTime"
                        type="time"
                        value={newEvent.startTime}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="endDate">Fecha de fin</Label>
                      <Input
                        id="endDate"
                        name="endDate"
                        type="date"
                        value={newEvent.endDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime">Hora de fin</Label>
                      <Input
                        id="endTime"
                        name="endTime"
                        type="time"
                        value={newEvent.endTime}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de evento</Label>
                    <select
                      id="type"
                      name="type"
                      value={newEvent.type}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      {eventTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Ubicación (opcional)</Label>
                    <Input
                      id="location"
                      name="location"
                      value={newEvent.location}
                      onChange={handleInputChange}
                      placeholder="Ubicación del evento"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción (opcional)</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={newEvent.description}
                      onChange={handleInputChange}
                      placeholder="Descripción del evento"
                      rows={3}
                    />
                  </div>
                  
                  <div className="pt-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Guardando..." : "Guardar evento"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Próximos eventos */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Próximos eventos</CardTitle>
              <CardDescription>Eventos en los próximos 30 días</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`border-l-4 ${getEventTypeColor(event.type)} pl-4 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-r`}
                      onClick={() => {
                        setSelectedDate(event.startDate);
                        setSelectedEvent(event);
                        setView("event");
                      }}
                    >
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(event.startDate)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(event.startDate)} - {formatTime(event.endDate)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No hay eventos próximos</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={handleBackToMonth}>
                Ver calendario completo
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Leyenda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {eventTypes.map((type) => (
                  <div key={type.value} className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${type.color} mr-2`}></div>
                    <span>{type.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
                Recordatorio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Los eventos creados son visibles para todos los miembros de la familia. Recuerda mantener actualizado el calendario para una mejor coordinación.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 