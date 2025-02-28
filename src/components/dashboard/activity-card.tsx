import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  title: string;
  description?: string;
  timestamp: Date;
  icon?: React.ReactNode;
  status?: 'pending' | 'completed' | 'overdue' | 'info';
}

interface ActivityCardProps {
  title: string;
  description?: string;
  items: ActivityItem[];
  emptyMessage?: string;
  viewAllHref?: string;
  className?: string;
  maxItems?: number;
}

export function ActivityCard({
  title,
  description,
  items,
  emptyMessage = "No hay actividades recientes",
  viewAllHref,
  className,
  maxItems = 3
}: ActivityCardProps) {
  const displayItems = items && Array.isArray(items) ? items.slice(0, maxItems) : [];
  
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pb-2">
        {displayItems.length > 0 ? (
          <div className="space-y-4">
            {displayItems.map((item) => (
              <div key={item.id} className="flex items-start space-x-3">
                {item.icon && (
                  <div className="mt-0.5">
                    {item.icon}
                  </div>
                )}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium leading-none">{item.title}</p>
                    <div className="flex items-center">
                      {item.status && (
                        <span 
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium mr-2",
                            item.status === 'pending' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500",
                            item.status === 'completed' && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500",
                            item.status === 'overdue' && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500",
                            item.status === 'info' && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500"
                          )}
                        >
                          {item.status === 'pending' && 'Pendiente'}
                          {item.status === 'completed' && 'Completado'}
                          {item.status === 'overdue' && 'Vencido'}
                          {item.status === 'info' && 'Info'}
                        </span>
                      )}
                      <time className="text-xs text-muted-foreground">
                        {formatRelativeTime(item.timestamp)}
                      </time>
                    </div>
                  </div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-6">{emptyMessage}</p>
        )}
      </CardContent>
      {viewAllHref && (
        <CardFooter>
          <Button variant="outline" size="sm" className="w-full" asChild>
            <a href={viewAllHref}>Ver todos</a>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

// Función para formatear tiempo relativo
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'hace un momento';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `hace ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `hace ${diffInMonths} ${diffInMonths === 1 ? 'mes' : 'meses'}`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `hace ${diffInYears} ${diffInYears === 1 ? 'año' : 'años'}`;
} 