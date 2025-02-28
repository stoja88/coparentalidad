"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, TrendingUp, Download, Filter, Calendar, BarChart3, PieChart, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ExpenseData {
  month: string;
  education: number;
  health: number;
  clothing: number;
  activities: number;
  other: number;
}

interface ExpenseChartProps {
  data: ExpenseData[];
  className?: string;
  period?: 'monthly' | 'yearly';
  currency?: string;
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

const barVariants = {
  hidden: { width: 0 },
  visible: (custom: number) => ({
    width: `${custom}%`,
    transition: { 
      duration: 0.8,
      delay: 0.2,
      ease: "easeOut"
    }
  })
};

export function ExpenseChart({
  data,
  className,
  period = 'monthly',
  currency = '€'
}: ExpenseChartProps) {
  const [activeTab, setActiveTab] = useState<'chart' | 'details'>('chart');
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'yearly' | '3months' | '6months'>(period);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  
  // Verificar que data es un array antes de usar reduce
  const isValidData = Array.isArray(data) && data.length > 0;
  
  // Calcular totales por categoría
  const totals = isValidData ? data.reduce(
    (acc, item) => {
      acc.education += item.education;
      acc.health += item.health;
      acc.clothing += item.clothing;
      acc.activities += item.activities;
      acc.other += item.other;
      acc.total += item.education + item.health + item.clothing + item.activities + item.other;
      return acc;
    },
    { education: 0, health: 0, clothing: 0, activities: 0, other: 0, total: 0 }
  ) : { education: 0, health: 0, clothing: 0, activities: 0, other: 0, total: 0 };
  
  // Calcular porcentajes
  const percentages = {
    education: totals.total > 0 ? (totals.education / totals.total) * 100 : 0,
    health: totals.total > 0 ? (totals.health / totals.total) * 100 : 0,
    clothing: totals.total > 0 ? (totals.clothing / totals.total) * 100 : 0,
    activities: totals.total > 0 ? (totals.activities / totals.total) * 100 : 0,
    other: totals.total > 0 ? (totals.other / totals.total) * 100 : 0,
  };

  // Datos para comparación (simulados)
  const previousPeriodData = {
    education: totals.education * 0.85,
    health: totals.health * 1.2,
    clothing: totals.clothing * 0.9,
    activities: totals.activities * 1.1,
    other: totals.other * 0.95,
    total: 0
  };
  previousPeriodData.total = previousPeriodData.education + previousPeriodData.health + 
                             previousPeriodData.clothing + previousPeriodData.activities + 
                             previousPeriodData.other;

  // Calcular diferencias porcentuales para comparación
  const differences = {
    education: previousPeriodData.total > 0 ? ((totals.education - previousPeriodData.education) / previousPeriodData.education) * 100 : 0,
    health: previousPeriodData.total > 0 ? ((totals.health - previousPeriodData.health) / previousPeriodData.health) * 100 : 0,
    clothing: previousPeriodData.total > 0 ? ((totals.clothing - previousPeriodData.clothing) / previousPeriodData.clothing) * 100 : 0,
    activities: previousPeriodData.total > 0 ? ((totals.activities - previousPeriodData.activities) / previousPeriodData.activities) * 100 : 0,
    other: previousPeriodData.total > 0 ? ((totals.other - previousPeriodData.other) / previousPeriodData.other) * 100 : 0,
    total: previousPeriodData.total > 0 ? ((totals.total - previousPeriodData.total) / previousPeriodData.total) * 100 : 0
  };

  // Simular carga de datos
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Función para renderizar el indicador de tendencia
  const renderTrend = (value: number) => {
    if (value > 0) {
      return (
        <Badge variant="outline" className="ml-2 text-xs bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800">
          <TrendingUp className="h-3 w-3 mr-1 rotate-45" />
          +{value.toFixed(1)}%
        </Badge>
      );
    } else if (value < 0) {
      return (
        <Badge variant="outline" className="ml-2 text-xs bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800">
          <TrendingUp className="h-3 w-3 mr-1 rotate-135" />
          {value.toFixed(1)}%
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="ml-2 text-xs bg-gray-50 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800">
        0%
      </Badge>
    );
  };

  // Función para renderizar el gráfico circular
  const renderPieChart = () => {
    const categories = [
      { name: 'Educación', value: percentages.education, color: 'bg-blue-500' },
      { name: 'Salud', value: percentages.health, color: 'bg-red-500' },
      { name: 'Ropa', value: percentages.clothing, color: 'bg-purple-500' },
      { name: 'Actividades', value: percentages.activities, color: 'bg-green-500' },
      { name: 'Otros', value: percentages.other, color: 'bg-gray-500' }
    ];

    let cumulativePercentage = 0;

    return (
      <div className="relative w-48 h-48 mx-auto my-4">
        {categories.map((category, index) => {
          const startPercentage = cumulativePercentage;
          cumulativePercentage += category.value;
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`absolute inset-0 ${category.color}`}
              style={{
                clipPath: `conic-gradient(from ${startPercentage * 3.6}deg, transparent ${startPercentage * 3.6}deg, currentColor ${startPercentage * 3.6}deg ${cumulativePercentage * 3.6}deg, transparent ${cumulativePercentage * 3.6}deg)`,
                opacity: 0.8
              }}
            />
          );
        })}
        <div className="absolute inset-4 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
          <span className="font-bold text-lg">{currency}{totals.total.toFixed(0)}</span>
        </div>
      </div>
    );
  };

  // Función para obtener el texto del período seleccionado
  const getPeriodText = () => {
    switch (selectedPeriod) {
      case 'monthly': return 'mensuales';
      case 'yearly': return 'anuales';
      case '3months': return 'del último trimestre';
      case '6months': return 'del último semestre';
      default: return 'mensuales';
    }
  };

  return (
    <Card className={cn("h-full overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Resumen de gastos</CardTitle>
            <CardDescription>
              Distribución de gastos {getPeriodText()}
            </CardDescription>
          </div>
          <div className="flex space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowComparison(!showComparison)}>
                    <Filter className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mostrar/ocultar comparación</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Exportar datos</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4 space-x-2">
          <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
            <SelectTrigger className="w-[180px] h-8">
              <SelectValue placeholder="Seleccionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Mensual</SelectItem>
              <SelectItem value="3months">Último trimestre</SelectItem>
              <SelectItem value="6months">Último semestre</SelectItem>
              <SelectItem value="yearly">Anual</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex border rounded-md overflow-hidden">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`px-3 py-1 h-8 ${chartType === 'bar' ? 'bg-muted' : ''}`}
              onClick={() => setChartType('bar')}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`px-3 py-1 h-8 ${chartType === 'pie' ? 'bg-muted' : ''}`}
              onClick={() => setChartType('pie')}
            >
              <PieChart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="w-full">
        <div className="px-6">
          <TabsList className="w-full">
            <TabsTrigger value="chart" className="flex-1">Gráfico</TabsTrigger>
            <TabsTrigger value="details" className="flex-1">Detalles</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="chart" className="m-0">
          <CardContent className="pt-4">
            <AnimatePresence mode="wait">
              {!isLoaded ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-48 text-center"
                >
                  <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-muted-foreground">Cargando datos...</p>
                </motion.div>
              ) : !isValidData ? (
                <motion.div 
                  key="no-data"
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                  className="flex flex-col items-center justify-center h-48 text-center"
                >
                  <DollarSign className="h-12 w-12 text-muted-foreground mb-2 opacity-20" />
                  <p className="text-muted-foreground mb-4">No hay datos de gastos disponibles</p>
                  <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                    <a href="/dashboard/gastos/nuevo">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Registrar un gasto
                    </a>
                  </Button>
                </motion.div>
              ) : (
                <motion.div 
                  key="chart-data"
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                  className="space-y-6"
                >
                  {chartType === 'bar' ? (
                    <div className="space-y-4">
                      {/* Gráfico de barras */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                            <span>Educación</span>
                          </div>
                          <div className="flex items-center">
                            <span>{currency}{totals.education.toFixed(2)}</span>
                            {showComparison && renderTrend(differences.education)}
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                          <motion.div 
                            className="bg-blue-500 h-3 rounded-full" 
                            custom={percentages.education}
                            variants={barVariants}
                            initial="hidden"
                            animate="visible"
                          ></motion.div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                            <span>Salud</span>
                          </div>
                          <div className="flex items-center">
                            <span>{currency}{totals.health.toFixed(2)}</span>
                            {showComparison && renderTrend(differences.health)}
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                          <motion.div 
                            className="bg-red-500 h-3 rounded-full" 
                            custom={percentages.health}
                            variants={barVariants}
                            initial="hidden"
                            animate="visible"
                          ></motion.div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                            <span>Ropa</span>
                          </div>
                          <div className="flex items-center">
                            <span>{currency}{totals.clothing.toFixed(2)}</span>
                            {showComparison && renderTrend(differences.clothing)}
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                          <motion.div 
                            className="bg-purple-500 h-3 rounded-full" 
                            custom={percentages.clothing}
                            variants={barVariants}
                            initial="hidden"
                            animate="visible"
                          ></motion.div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                            <span>Actividades</span>
                          </div>
                          <div className="flex items-center">
                            <span>{currency}{totals.activities.toFixed(2)}</span>
                            {showComparison && renderTrend(differences.activities)}
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                          <motion.div 
                            className="bg-green-500 h-3 rounded-full" 
                            custom={percentages.activities}
                            variants={barVariants}
                            initial="hidden"
                            animate="visible"
                          ></motion.div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
                            <span>Otros</span>
                          </div>
                          <div className="flex items-center">
                            <span>{currency}{totals.other.toFixed(2)}</span>
                            {showComparison && renderTrend(differences.other)}
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                          <motion.div 
                            className="bg-gray-500 h-3 rounded-full" 
                            custom={percentages.other}
                            variants={barVariants}
                            initial="hidden"
                            animate="visible"
                          ></motion.div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    renderPieChart()
                  )}
                  
                  {/* Total */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex items-center justify-between pt-4 border-t"
                  >
                    <span className="font-medium">Total</span>
                    <div className="flex items-center">
                      <span className="font-bold">{currency}{totals.total.toFixed(2)}</span>
                      {showComparison && renderTrend(differences.total)}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="details" className="m-0">
          <CardContent className="pt-4">
            <AnimatePresence>
              {!isValidData ? (
                <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                  className="flex flex-col items-center justify-center h-48 text-center"
                >
                  <p className="text-muted-foreground mb-2">No hay datos de gastos disponibles</p>
                  <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                    <a href="/dashboard/gastos/nuevo">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Registrar un gasto
                    </a>
                  </Button>
                </motion.div>
              ) : (
                <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium">Gasto medio</h3>
                        <Calendar className="h-4 w-4 text-blue-500" />
                      </div>
                      <p className="text-2xl font-bold">{currency}{(totals.total / (data.length || 1)).toFixed(2)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">por mes</p>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-100 dark:border-green-800">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium">Mayor categoría</h3>
                        <BarChart3 className="h-4 w-4 text-green-500" />
                      </div>
                      <p className="text-2xl font-bold">
                        {(() => {
                          // Verificar que hay datos para evitar undefined
                          const entries = Object.entries(percentages || {});
                          if (entries.length === 0) return 'Sin datos';
                          
                          const maxCategory = entries.reduce((a, b) => a[1] > b[1] ? a : b, ['Sin datos', 0]);
                          // Verificar que maxCategory[0] existe antes de usar charAt y slice
                          if (!maxCategory || !maxCategory[0] || typeof maxCategory[0] !== 'string') return 'Sin datos';
                          
                          return maxCategory[0].charAt(0).toUpperCase() + maxCategory[0].slice(1);
                        })()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {Object.values(percentages || {}).length > 0 
                          ? Math.max(...Object.values(percentages || {})).toFixed(1) + '% del total' 
                          : '0% del total'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium mb-3">Distribución detallada</h3>
                    <div className="space-y-2">
                      {Object.entries(percentages).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between text-xs">
                          <span className="capitalize">{key}</span>
                          <span>{value.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {showComparison && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800"
                    >
                      <h3 className="text-sm font-medium mb-3">Comparativa con período anterior</h3>
                      <div className="space-y-2">
                        {Object.entries(differences).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between text-xs">
                            <span className="capitalize">{key}</span>
                            <div className={`flex items-center ${value > 0 ? 'text-red-500' : value < 0 ? 'text-green-500' : 'text-gray-500'}`}>
                              {value > 0 ? '↑' : value < 0 ? '↓' : '–'}
                              <span className="ml-1">{Math.abs(value).toFixed(1)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </TabsContent>
      </Tabs>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" asChild>
          <a href="/dashboard/gastos">Ver todos los gastos</a>
        </Button>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700" asChild>
          <a href="/dashboard/gastos/nuevo">
            <PlusCircle className="h-4 w-4 mr-2" />
            Nuevo gasto
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
} 