import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDynamicPrismaClient } from "@/lib/db";

// DELETE /api/events/[id] - Eliminar un evento
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener cliente de Prisma
    const prisma = await getDynamicPrismaClient();

    // Verificar que el evento exista y pertenezca al usuario
    const event = await prisma.event.findUnique({
      where: {
        id,
      },
      include: {
        family: {
          include: {
            members: {
              where: {
                userId: session.user.id,
              },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el usuario pertenezca a la familia del evento o sea el creador
    const isCreator = event.createdById === session.user.id;
    const isFamilyMember = event.family.members.length > 0;

    if (!isCreator && !isFamilyMember && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No tienes permiso para eliminar este evento" },
        { status: 403 }
      );
    }

    // Eliminar evento
    await prisma.event.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar evento:", error);
    return NextResponse.json(
      { error: "Error al eliminar evento" },
      { status: 500 }
    );
  }
} 