// Script para restablecer la contraseña del administrador en PRODUCCIÓN
// Ejecutar con: DATABASE_URL="URL_DE_PRODUCCIÓN" node scripts/reset-admin-password-prod.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('=== INICIANDO RESTABLECIMIENTO DE CONTRASEÑA EN PRODUCCIÓN ===');
  
  const newPassword = 'Admin123!'; // Nueva contraseña segura
  
  try {
    // Verificar que estamos usando la URL de producción
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.error('❌ No se ha especificado DATABASE_URL. Usa: DATABASE_URL="URL_DE_PRODUCCIÓN" node scripts/reset-admin-password-prod.js');
      process.exit(1);
    }
    
    console.log(`Conectando a la base de datos de producción: ${dbUrl.substring(0, 30)}...`);
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: dbUrl,
        },
      },
      log: ['query', 'error', 'warn'],
    });

    // Testear conexión
    await prisma.$connect();
    console.log('✅ Conexión establecida correctamente a la base de datos de PRODUCCIÓN');

    // Buscar usuario administrador
    console.log('Buscando usuario administrador...');
    const admin = await prisma.user.findFirst({
      where: {
        role: 'ADMIN',
      },
    });

    if (!admin) {
      console.log('❌ No se encontró ningún usuario administrador');
      return;
    }
    
    console.log(`✅ Usuario administrador encontrado: ${admin.email}`);
    
    // Generar hash de la nueva contraseña
    console.log('Generando hash de la nueva contraseña...');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Actualizar contraseña
    console.log('Actualizando contraseña...');
    await prisma.user.update({
      where: {
        id: admin.id,
      },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });
    
    console.log('✅ Contraseña restablecida con éxito en PRODUCCIÓN');
    console.log(`Nueva contraseña: ${newPassword}`);
    
    // Desconectar
    await prisma.$disconnect();
    console.log('Base de datos desconectada');
    
  } catch (error) {
    console.error('❌ ERROR durante el restablecimiento:', error);
    process.exit(1);
  }

  console.log('=== RESTABLECIMIENTO COMPLETADO ===');
}

main(); 