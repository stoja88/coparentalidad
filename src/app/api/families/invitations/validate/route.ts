import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token no proporcionado" },
        { status: 400 }
      );
    }

    // Buscar la invitación por token
    const invitation = await db.invitation.findUnique({
      where: {
        token,
        status: "PENDING",
      },
      include: {
        family: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitación no encontrada o ya utilizada" },
        { status: 404 }
      );
    }

    // Verificar si la invitación ha expirado
    if (invitation.expiresAt && new Date() > invitation.expiresAt) {
      return NextResponse.json(
        { error: "La invitación ha expirado" },
        { status: 410 }
      );
    }

    // Devolver los detalles de la invitación
    return NextResponse.json({
      id: invitation.id,
      familyId: invitation.familyId,
      email: invitation.email,
      role: invitation.role,
      family: {
        id: invitation.family.id,
        name: invitation.family.name,
      },
      createdBy: invitation.createdBy,
    });
  } catch (error) {
    console.error("Error al validar invitación:", error);
    return NextResponse.json(
      { error: "Error al validar la invitación" },
      { status: 500 }
    );
  }
} 