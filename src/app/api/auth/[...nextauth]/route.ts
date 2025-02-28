import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { CredentialsProvider } from "@next-auth/credentials";
import bcrypt from "bcrypt";
import { NextAuthOptions } from "next-auth";

console.log("Inicializando NextAuth con las siguientes opciones:", {
  providers: authOptions.providers.map(p => p.id),
  session: authOptions.session,
  pages: authOptions.pages,
  debug: authOptions.debug
});

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 