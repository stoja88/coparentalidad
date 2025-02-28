import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado. Debes iniciar sesión." },
        { status: 401 }
      );
    }

    const { familyId, role } = await req.json();

    if (!familyId) {
      return NextResponse.json(
        { error: "Se requiere el ID de la familia" },
        { status: 400 }
      );
    }

    // Verificar que el usuario pertenece a la familia
    const userFamily = await db.userFamily.findFirst({
      where: {
        userId: session.user.id,
        familyId: familyId,
      },
    });

    if (!userFamily) {
      return NextResponse.json(
        { error: "No tienes permiso para invitar a esta familia" },
        { status: 403 }
      );
    }

    // Generar un token único
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // El enlace expira en 7 días

    // Guardar la invitación en la base de datos
    const invitation = await db.invitation.create({
      data: {
        token,
        familyId,
        role: role || "PARENT",
        status: "PENDING",
        expiresAt,
        createdById: session.user.id,
      },
    });

    return NextResponse.json({ token: invitation.token });
  } catch (error) {
    console.error("Error al generar enlace de invitación:", error);
    return NextResponse.json(
      { error: "Error al generar el enlace de invitación" },
      { status: 500 }
    );
  }
} 