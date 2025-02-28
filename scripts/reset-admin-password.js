// Script para restablecer la contraseña del administrador
// Ejecutar con: node scripts/reset-admin-password.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Conectando a la base de datos...');
    
    // Buscar si ya existe el administrador
    const adminEmail = 'superadmin@coparentalidad.com';
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    // Generar hash del password
    const password = 'Admin123!';
    const hashedPassword = await bcrypt.hash(password, 12);

    if (existingAdmin) {
      // Actualizar la contraseña del admin existente
      await prisma.user.update({
        where: { email: adminEmail },
        data: { 
          password: hashedPassword,
          role: 'ADMIN'
        }
      });
      console.log(`Se ha actualizado la contraseña del usuario admin: ${adminEmail}`);
    } else {
      // Crear un nuevo usuario administrador
      await prisma.user.create({
        data: {
          email: adminEmail,
          name: 'Administrador',
          password: hashedPassword,
          role: 'ADMIN'
        }
      });
      console.log(`Se ha creado el usuario administrador: ${adminEmail}`);
    }

    console.log(`Contraseña establecida: ${password}`);
    console.log('¡Operación completada con éxito!');
  } catch (error) {
    console.error('Error al ejecutar el script:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Conexión a la base de datos cerrada.');
  }
}

main(); 