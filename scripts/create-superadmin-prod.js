const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

// URL directa a la base de datos de producción
const DATABASE_URL = "postgresql://neondb_owner:npg_XCgzkY4ZUt5w@ep-soft-poetry-a86rag2g-pooler.eastus2.azure.neon.tech/neondb?sslmode=require";

// Crear un cliente Prisma con la URL directa
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
});

async function main() {
  console.log('Iniciando creación de usuario superadmin en producción...');
  
  try {
    const email = 'superadmin@coparentalidad.com';
    const password = 'Admin123!';
    const name = 'Super Administrador';
    
    // Verificar si ya existe un usuario con este email
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email
      }
    });
    
    if (existingUser) {
      console.log('El usuario superadmin ya existe, actualizando contraseña...');
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const updatedUser = await prisma.user.update({
        where: {
          email: email
        },
        data: {
          password: hashedPassword,
          role: 'ADMIN'
        }
      });
      
      console.log(`Usuario superadmin actualizado con ID: ${updatedUser.id}`);
    } else {
      console.log('Creando nuevo usuario superadmin...');
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const newAdmin = await prisma.user.create({
        data: {
          email: email,
          name: name,
          password: hashedPassword,
          role: 'ADMIN'
        }
      });
      
      console.log(`Usuario superadmin creado con ID: ${newAdmin.id}`);
    }
    
    console.log('Proceso completado con éxito.');
  } catch (error) {
    console.error('Error al crear superadmin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 