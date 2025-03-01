import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.hashedPassword!
        );

        if (!passwordMatch) {
          return null;
        }

        return user;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
    updateAge: 24 * 60 * 60, // 24 horas
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Cuando el usuario inicia sesión por primera vez
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.iat = Math.floor(Date.now() / 1000);
        token.exp = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 días
      }

      // Verificar si el token está por expirar (menos de 1 día)
      const tokenExpiry = token.exp as number;
      const currentTime = Math.floor(Date.now() / 1000);
      const oneDayInSeconds = 24 * 60 * 60;

      if (tokenExpiry - currentTime < oneDayInSeconds) {
        // Renovar el token por otros 30 días
        token.exp = currentTime + 30 * 24 * 60 * 60;
        console.log("Token renovado por 30 días más");
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
      } else if (!session.user) {
        // Si session.user es undefined, inicializarlo con valores por defecto
        session.user = {
          id: '',
          name: '',
          email: '',
          role: '',
          image: null
        };
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
};

// Función para verificar si un usuario está autenticado en el cliente
export const isAuthenticated = () => {
  if (typeof window === "undefined") return false;
  
  const storedSession = localStorage.getItem("userSession");
  const sessionExpiry = localStorage.getItem("sessionExpiry");
  
  if (!storedSession || !sessionExpiry) return false;
  
  // Verificar si la sesión ha expirado
  const expiryDate = new Date(sessionExpiry);
  if (expiryDate < new Date()) {
    localStorage.removeItem("userSession");
    localStorage.removeItem("sessionExpiry");
    return false;
  }
  
  return true;
};

// Función para obtener el rol del usuario actual
export const getCurrentUserRole = () => {
  if (typeof window === "undefined") return null;
  
  const storedSession = localStorage.getItem("userSession");
  if (!storedSession) return null;
  
  try {
    const session = JSON.parse(storedSession);
    return session.user?.role || null;
  } catch (error) {
    console.error("Error al obtener el rol del usuario:", error);
    return null;
  }
};

// Tipos para extender las sesiones de NextAuth
declare module "next-auth" {
  interface User {
    id: string;
    role: string;
  }

  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
} 