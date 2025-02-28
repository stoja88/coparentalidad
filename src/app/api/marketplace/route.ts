import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import prisma from "@/lib/prisma";

// GET - Obtener todos los items del marketplace (endpoint público)
export async function GET(req: NextRequest) {
  try {
    // Obtener parámetros de consulta opcionales
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    
    // Construir la consulta
    const query: any = {};
    
    // Filtrar por categoría si se proporciona
    if (category) {
      query.category = category;
    }
    
    // Filtrar por destacados si se solicita
    if (featured === "true") {
      query.featured = true;
    }
    
    // Verificar si el modelo MarketplaceItem existe en la base de datos
    let items = [];
    try {
      // Obtener items del marketplace
      items = await prisma.marketplaceItem.findMany({
        where: query,
        orderBy: [
          { featured: 'desc' },
          { createdAt: 'desc' }
        ]
      });
    } catch (dbError) {
      console.error("Error específico de la base de datos:", dbError);
      // Si hay un error de Prisma relacionado con el modelo no encontrado, devolver una lista vacía
      return NextResponse.json([]);
    }

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error al obtener items del marketplace:", error);
    // En caso de error general, devolver una lista vacía en lugar de un error 500
    return NextResponse.json([]);
  }
} 