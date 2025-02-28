import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { db } from "@/lib/db";
import { z } from "zod";

// Esquema de validación para el registro
const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email no válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  invitationToken: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, invitationToken } = registerSchema.parse(body);

    // Verificar si el usuario ya existe
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Ya existe un usuario con este email" },
        { status: 409 }
      );
    }

    // Encriptar la contraseña
    const hashedPassword = await hash(password, 10);

    // Crear el usuario
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Si hay un token de invitación, procesar la invitación
    if (invitationToken) {
      const invitation = await db.invitation.findUnique({
        where: {
          token: invitationToken,
          status: "PENDING",
        },
        include: {
          family: true,
        },
      });

      if (invitation) {
        // Verificar si la invitación ha expirado
        if (invitation.expiresAt && new Date() > invitation.expiresAt) {
          return NextResponse.json(
            { message: "La invitación ha expirado" },
            { status: 410 }
          );
        }

        // Verificar que el email coincide si la invitación tiene un email específico
        if (invitation.email && invitation.email !== email) {
          return NextResponse.json(
            { message: "El email no coincide con la invitación" },
            { status: 400 }
          );
        }

        // Añadir el usuario a la familia
        await db.userFamily.create({
          data: {
            userId: user.id,
            familyId: invitation.familyId,
            role: invitation.role,
          },
        });

        // Marcar la invitación como aceptada
        await db.invitation.update({
          where: { id: invitation.id },
          data: { status: "ACCEPTED", acceptedAt: new Date() },
        });
      }
    }

    // Devolver el usuario creado (sin la contraseña)
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Error en el registro:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Datos de registro inválidos", errors: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Error al registrar el usuario" },
      { status: 500 }
    );
  }
} 