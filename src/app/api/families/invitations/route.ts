import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { sendEmail } from "@/lib/email";

// Obtener invitaciones del usuario actual
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado. Debes iniciar sesión." },
        { status: 401 }
      );
    }

    // Obtener invitaciones enviadas por el usuario
    const sentInvitations = await prisma.invitation.findMany({
      where: {
        createdById: session.user.id,
      },
      include: {
        family: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Obtener invitaciones recibidas por el usuario (por email)
    const receivedInvitations = await prisma.invitation.findMany({
      where: {
        email: session.user.email,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      sent: sentInvitations,
      received: receivedInvitations,
    });
  } catch (error) {
    console.error("Error al obtener invitaciones:", error);
    return NextResponse.json(
      { error: "Error al obtener las invitaciones" },
      { status: 500 }
    );
  }
}

// Crear una nueva invitación
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado. Debes iniciar sesión." },
        { status: 401 }
      );
    }

    const { familyId, email, role } = await req.json();

    if (!familyId) {
      return NextResponse.json(
        { error: "Se requiere el ID de la familia" },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: "Se requiere un email o número de teléfono" },
        { status: 400 }
      );
    }

    // Verificar que el usuario pertenece a la familia
    const userFamily = await prisma.userFamily.findFirst({
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

    // Verificar si ya existe una invitación pendiente para este email y familia
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        familyId,
        email,
        status: "PENDING",
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: "Ya existe una invitación pendiente para este destinatario" },
        { status: 409 }
      );
    }

    // Obtener información de la familia
    const family = await prisma.family.findUnique({
      where: { id: familyId },
    });

    if (!family) {
      return NextResponse.json(
        { error: "Familia no encontrada" },
        { status: 404 }
      );
    }

    // Generar un token único
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // La invitación expira en 7 días

    // Crear la invitación en la base de datos
    const invitation = await prisma.invitation.create({
      data: {
        token,
        familyId,
        email,
        role: role || "PARENT",
        status: "PENDING",
        expiresAt,
        createdById: session.user.id,
      },
    });

    // Determinar si es un email o un número de teléfono
    const isEmail = email.includes('@');
    
    if (isEmail) {
      // Enviar email de invitación
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const inviteUrl = `${baseUrl}/registro?token=${token}`;
      
      await sendEmail({
        to: email,
        subject: `Invitación a unirse a la familia ${family.name} en Coparentalidad`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Invitación a Coparentalidad</h2>
            <p>Hola,</p>
            <p>${session.user.name || 'Un usuario'} te ha invitado a unirte a la familia "${family.name}" en la plataforma Coparentalidad.</p>
            <p>Coparentalidad es una aplicación que facilita la gestión compartida de la crianza de los hijos entre progenitores.</p>
            <p>Para aceptar esta invitación, haz clic en el siguiente enlace:</p>
            <p>
              <a href="${inviteUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Aceptar invitación
              </a>
            </p>
            <p>Este enlace expirará en 7 días.</p>
            <p>Si no esperabas esta invitación, puedes ignorar este mensaje.</p>
            <p>Saludos,<br>El equipo de Coparentalidad</p>
          </div>
        `,
      });
    } else {
      // En una implementación real, aquí se enviaría un SMS
      // Esto requeriría integración con un servicio como Twilio, MessageBird, etc.
      console.log(`Simulando envío de SMS a ${email} con token ${token}`);
      
      // Para una implementación completa, se necesitaría:
      // 1. Configurar un servicio de SMS
      // 2. Implementar la función de envío
      // 3. Enviar un mensaje con el enlace de invitación
    }

    return NextResponse.json({ success: true, invitation });
  } catch (error) {
    console.error("Error al crear invitación:", error);
    return NextResponse.json(
      { error: "Error al crear la invitación" },
      { status: 500 }
    );
  }
}

// Aceptar o rechazar una invitación
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { invitationId, action } = body;

    if (!invitationId || !action || !["ACCEPT", "REJECT"].includes(action)) {
      return NextResponse.json(
        { error: "Se requieren todos los campos: invitationId y action (ACCEPT o REJECT)" },
        { status: 400 }
      );
    }

    // Obtener la invitación
    const invitation = await prisma.familyInvitation.findUnique({
      where: {
        id: invitationId,
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitación no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que la invitación es para el usuario actual
    if (invitation.email !== session.user.email) {
      return NextResponse.json(
        { error: "Esta invitación no es para ti" },
        { status: 403 }
      );
    }

    // Verificar que la invitación está pendiente
    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        { error: "Esta invitación ya ha sido procesada" },
        { status: 400 }
      );
    }

    // Verificar que la invitación no ha expirado
    if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
      await prisma.familyInvitation.update({
        where: {
          id: invitationId,
        },
        data: {
          status: "EXPIRED",
        },
      });

      return NextResponse.json(
        { error: "Esta invitación ha expirado" },
        { status: 400 }
      );
    }

    if (action === "ACCEPT") {
      // Añadir al usuario como miembro de la familia
      await prisma.familyMember.create({
        data: {
          userId: session.user.id,
          familyId: invitation.familyId,
          role: invitation.role,
        },
      });

      // Actualizar el estado de la invitación
      await prisma.familyInvitation.update({
        where: {
          id: invitationId,
        },
        data: {
          status: "ACCEPTED",
        },
      });

      return NextResponse.json({ success: true, message: "Invitación aceptada" });
    } else {
      // Rechazar la invitación
      await prisma.familyInvitation.update({
        where: {
          id: invitationId,
        },
        data: {
          status: "REJECTED",
        },
      });

      return NextResponse.json({ success: true, message: "Invitación rechazada" });
    }
  } catch (error) {
    console.error("Error al procesar invitación:", error);
    return NextResponse.json(
      { error: "Error al procesar invitación" },
      { status: 500 }
    );
  }
} 