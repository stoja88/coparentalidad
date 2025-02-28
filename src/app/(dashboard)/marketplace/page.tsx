"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, Search, Filter, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string | null;
  featured: boolean;
}

export default function MarketplacePage() {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { value: "legal", label: "Servicios Legales" },
    { value: "mediation", label: "Mediación" },
    { value: "coaching", label: "Coaching Familiar" },
    { value: "therapy", label: "Terapia" },
    { value: "education", label: "Educación" },
    { value: "other", label: "Otros Servicios" }
  ];

  useEffect(() => {
    fetchMarketplaceItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchTerm, selectedCategory, items]);

  const fetchMarketplaceItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/marketplace');
      if (!response.ok) throw new Error('Error al cargar productos/servicios');
      const data = await response.json();
      
      // Verificar que data sea un array antes de asignarlo
      if (Array.isArray(data)) {
        setItems(data);
        setFilteredItems(data);
      } else {
        console.error("La respuesta no es un array:", data);
        setItems([]);
        setFilteredItems([]);
        toast({
          title: "Error",
          description: "Formato de datos incorrecto",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error al cargar marketplace:", error);
      setItems([]);
      setFilteredItems([]);
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos y servicios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = [...items];
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrar por categoría
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    setFilteredItems(filtered);
  };

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  const handleContactClick = (item: MarketplaceItem) => {
    // Aquí se implementaría la lógica para contactar al proveedor
    toast({
      title: "Contacto",
      description: `Has solicitado información sobre: ${item.title}`,
    });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-gray-600">Encuentra servicios y productos para familias</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
          
          <div className="relative">
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtrar
            </Button>
          </div>
        </div>
      </div>
      
      {/* Categorías */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => handleCategorySelect(category.value)}
            className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
              selectedCategory === category.value
                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            <Tag className="h-3 w-3" />
            {category.label}
          </button>
        ))}
        {selectedCategory && (
          <button
            onClick={() => setSelectedCategory(null)}
            className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-800 border border-red-300 flex items-center gap-1"
          >
            Limpiar filtros
          </button>
        )}
      </div>
      
      {/* Productos destacados */}
      {!selectedCategory && !searchTerm && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Destacados</h2>
          
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.filter(item => item.featured).length === 0 ? (
                <p className="text-center text-gray-500 p-4 col-span-3">No hay productos destacados</p>
              ) : (
                items
                  .filter(item => item.featured)
                  .map((item) => (
                    <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-yellow-200">
                      <div className="relative">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.title}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                            <ShoppingBag className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                        <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-800 text-xs px-2 py-1 rounded-full">
                          Destacado
                        </span>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-3">{item.description}</p>
                        
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-green-600 text-lg">{item.price.toFixed(2)} €</span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {categories.find(c => c.value === item.category)?.label || item.category}
                          </span>
                        </div>
                        
                        <Button 
                          className="w-full mt-4"
                          onClick={() => handleContactClick(item)}
                        >
                          Solicitar información
                        </Button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Lista de productos */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          {searchTerm || selectedCategory ? 'Resultados' : 'Todos los productos y servicios'}
        </h2>
        
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.length === 0 ? (
              <p className="text-center text-gray-500 p-4 col-span-4">
                No se encontraron productos o servicios
                {searchTerm && ` para "${searchTerm}"`}
                {selectedCategory && ` en la categoría seleccionada`}
              </p>
            ) : (
              filteredItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                        <ShoppingBag className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    {item.featured && (
                      <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-800 text-xs px-2 py-1 rounded-full">
                        Destacado
                      </span>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{item.description}</p>
                    
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-green-600">{item.price.toFixed(2)} €</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {categories.find(c => c.value === item.category)?.label || item.category}
                      </span>
                    </div>
                    
                    <Button 
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => handleContactClick(item)}
                    >
                      Solicitar información
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
} 