"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar, Clock, Plus, ChevronRight, Filter, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'SCHOOL' | 'MEDICAL' | 'ACTIVITY' | 'FAMILY' | 'OTHER';
  description?: string;
}

interface CalendarPreviewProps {
  events: CalendarEvent[];
  className?: string;
  maxEvents?: number;
}

const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.4,
      delay: custom * 0.1,
      ease: "easeOut"
    }
  })
};

const eventCardVariants = {
  initial: { x: -5, opacity: 0 },
  animate: (custom: number) => ({
    x: 0,
    opacity: 1,
    transition: {
      delay: custom * 0.05,
      duration: 0.3
    }
  }),
  hover: {
    scale: 1.02,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    transition: { duration: 0.2 }
  },
  tap: { scale: 0.98 }
};

export function CalendarPreview({
  events,
  className,
  maxEvents = 5
}: CalendarPreviewProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Filtrar eventos por tipo y búsqueda
  const filteredEvents = events.filter(event => {
    const matchesFilter = activeFilter ? event.type === activeFilter : true;
    const matchesSearch = searchQuery 
      ? event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (event.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
      : true;
    return matchesFilter && matchesSearch;
  });
  
  // Ordenar eventos por fecha (más cercanos primero)
  const sortedEvents = filteredEvents ? [...filteredEvents].sort((a, b) => a.date.getTime() - b.date.getTime()) : [];
  const displayEvents = sortedEvents && sortedEvents.length ? sortedEvents.slice(0, maxEvents) : [];
  
  // Agrupar eventos por día
  const eventsByDay = displayEvents.reduce((acc, event) => {
    const dateStr = event.date.toDateString();
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);
  
  // Obtener días ordenados
  const orderedDays = Object.keys(eventsByDay).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  // Verificar si hay eventos después de filtrar
  const hasEvents = displayEvents.length > 0;
  
  // Obtener la fecha actual para destacar eventos de hoy
  const today = new Date().toDateString();
  
  return (
    <Card className={cn("h-full overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Próximos eventos</CardTitle>
            <CardDescription>
              Eventos programados para los próximos días
            </CardDescription>
          </div>
          <div className="flex space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Buscar eventos</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setActiveFilter(null)}>
                        Todos los eventos
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setActiveFilter('SCHOOL')}>
                        Eventos escolares
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setActiveFilter('MEDICAL')}>
                        Eventos médicos
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setActiveFilter('ACTIVITY')}>
                        Actividades
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setActiveFilter('FAMILY')}>
                        Eventos familiares
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setActiveFilter('OTHER')}>
                        Otros eventos
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filtrar por tipo</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-2 overflow-hidden"
            >
              <Input
                placeholder="Buscar eventos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 text-sm"
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {activeFilter && (
          <div className="flex items-center mt-2">
            <Badge 
              variant="outline" 
              className="flex items-center gap-1 px-2 py-1"
              style={{ 
                backgroundColor: getEventColor(activeFilter, 0.1),
                color: getEventColor(activeFilter),
                borderColor: getEventColor(activeFilter, 0.3)
              }}
            >
              {getEventTypeName(activeFilter)}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 ml-1 p-0" 
                onClick={() => setActiveFilter(null)}
              >
                ×
              </Button>
            </Badge>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pb-2 overflow-y-auto" style={{ maxHeight: "350px" }}>
        <AnimatePresence mode="wait">
          {hasEvents ? (
            <motion.div 
              key="events-list"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="space-y-6"
            >
              {orderedDays.map((dayStr, dayIndex) => (
                <motion.div 
                  key={dayStr} 
                  custom={dayIndex}
                  variants={fadeIn}
                  className="space-y-2"
                >
                  <motion.div 
                    className={cn(
                      "flex items-center",
                      dayStr === today ? "bg-primary/5 -mx-4 px-4 py-1 rounded-md" : ""
                    )}
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-3 relative overflow-hidden">
                      {dayStr === today && (
                        <motion.div 
                          className="absolute inset-0 bg-primary/20"
                          initial={{ y: '100%' }}
                          animate={{ y: 0 }}
                          transition={{ duration: 0.5 }}
                        />
                      )}
                      <div className="text-center leading-none relative">
                        <div className="text-xs font-medium text-muted-foreground">
                          {formatDayName(new Date(dayStr))}
                        </div>
                        <div className="text-xl font-bold text-primary">
                          {new Date(dayStr).getDate()}
                        </div>
                      </div>
                    </div>
                    <div className="font-medium flex items-center">
                      <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                      {formatMonthYear(new Date(dayStr))}
                      {dayStr === today && (
                        <Badge variant="outline" className="ml-2 text-xs bg-primary/10 text-primary border-primary/20">
                          Hoy
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                  
                  <div className="pl-16 space-y-2">
                    {eventsByDay[dayStr].map((event, eventIndex) => (
                      <motion.div 
                        key={event.id}
                        custom={eventIndex}
                        variants={eventCardVariants}
                        initial="initial"
                        animate="animate"
                        whileHover="hover"
                        whileTap="tap"
                        className={cn(
                          "border-l-2 pl-3 py-2 -ml-0.5 hover:bg-muted/50 rounded-r-md transition-colors",
                          "cursor-pointer"
                        )}
                        style={{ borderColor: getEventColor(event.type) }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{event.title}</span>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTime(event.date)}
                          </div>
                        </div>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <div 
                            className="text-xs inline-block px-2 py-0.5 rounded-full"
                            style={{ 
                              backgroundColor: getEventColor(event.type, 0.1),
                              color: getEventColor(event.type)
                            }}
                          >
                            {getEventTypeName(event.type)}
                          </div>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <ChevronRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="no-events"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-10 text-center"
            >
              <Calendar className="h-12 w-12 text-muted-foreground mb-2 opacity-20" />
              <p className="text-muted-foreground mb-4">
                {searchQuery || activeFilter 
                  ? "No se encontraron eventos con los filtros actuales" 
                  : "No hay eventos próximos"}
              </p>
              {(searchQuery || activeFilter) && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setSearchQuery('');
                    setActiveFilter(null);
                  }}
                >
                  Limpiar filtros
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" asChild>
          <a href="/dashboard/calendario">Ver calendario completo</a>
        </Button>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700" asChild>
          <a href="/dashboard/calendario/nuevo">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo evento
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}

// Funciones auxiliares
function formatDayName(date: Date): string {
  return date.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase();
}

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function getEventColor(type: string, opacity: number = 1): string {
  const colors = {
    SCHOOL: `rgba(59, 130, 246, ${opacity})`,
    MEDICAL: `rgba(239, 68, 68, ${opacity})`,
    ACTIVITY: `rgba(16, 185, 129, ${opacity})`,
    FAMILY: `rgba(245, 158, 11, ${opacity})`,
    OTHER: `rgba(107, 114, 128, ${opacity})`,
  };
  
  return colors[type as keyof typeof colors] || colors.OTHER;
}

function getEventTypeName(type: string): string {
  const names = {
    SCHOOL: 'Escolar',
    MEDICAL: 'Médico',
    ACTIVITY: 'Actividad',
    FAMILY: 'Familiar',
    OTHER: 'Otro',
  };
  
  return names[type as keyof typeof names] || names.OTHER;
} 