import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDynamicPrismaClient } from "@/lib/db";

// GET /api/events - Obtener todos los eventos
export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener cliente de Prisma
    const prisma = await getDynamicPrismaClient();

    // Obtener familias del usuario
    const userFamilies = await prisma.familyMember.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        familyId: true,
      },
    });

    const familyIds = userFamilies.map((member) => member.familyId);

    // Obtener eventos de las familias del usuario
    const events = await prisma.event.findMany({
      where: {
        familyId: {
          in: familyIds,
        },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        startDate: "asc",
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error al obtener eventos:", error);
    return NextResponse.json(
      { error: "Error al obtener eventos" },
      { status: 500 }
    );
  }
}

// POST /api/events - Crear un nuevo evento
export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener datos del cuerpo de la solicitud
    const data = await req.json();

    // Validar datos requeridos
    if (!data.title || !data.startDate || !data.endDate || !data.type) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Obtener cliente de Prisma
    const prisma = await getDynamicPrismaClient();

    // Obtener la familia principal del usuario
    const userFamily = await prisma.familyMember.findFirst({
      where: {
        userId: session.user.id,
        isPrimary: true,
      },
      select: {
        familyId: true,
      },
    });

    if (!userFamily) {
      return NextResponse.json(
        { error: "Usuario no pertenece a ninguna familia" },
        { status: 400 }
      );
    }

    // Crear evento
    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        location: data.location,
        type: data.type,
        createdById: session.user.id,
        familyId: userFamily.familyId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error al crear evento:", error);
    return NextResponse.json(
      { error: "Error al crear evento" },
      { status: 500 }
    );
  }
} 