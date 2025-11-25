import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Criar permissões
  const permissions = [
    // Permissões de INC
    { code: 'inc.create', name: 'Criar INC', module: 'inc', description: 'Permite criar novos registros de INC' },
    { code: 'inc.read', name: 'Visualizar INC', module: 'inc', description: 'Permite visualizar registros de INC' },
    { code: 'inc.update', name: 'Editar INC', module: 'inc', description: 'Permite editar registros de INC' },
    { code: 'inc.delete', name: 'Deletar INC', module: 'inc', description: 'Permite deletar registros de INC' },

    // Permissões de Fornecedores
    { code: 'fornecedores.create', name: 'Criar Fornecedores', module: 'fornecedores', description: 'Permite criar novos fornecedores' },
    { code: 'fornecedores.read', name: 'Visualizar Fornecedores', module: 'fornecedores', description: 'Permite visualizar fornecedores' },
    { code: 'fornecedores.update', name: 'Atualizar Fornecedores', module: 'fornecedores', description: 'Permite atualizar fornecedores' },
    { code: 'fornecedores.delete', name: 'Deletar Fornecedores', module: 'fornecedores', description: 'Permite deletar fornecedores' },

    // Permissões de RNC
    { code: 'rnc.create', name: 'Criar RNC', module: 'rnc', description: 'Permite criar novos relatórios de não conformidade' },
    { code: 'rnc.read', name: 'Visualizar RNC', module: 'rnc', description: 'Permite visualizar relatórios de não conformidade' },
    { code: 'rnc.update', name: 'Editar RNC', module: 'rnc', description: 'Permite editar relatórios de não conformidade' },
    { code: 'rnc.delete', name: 'Deletar RNC', module: 'rnc', description: 'Permite deletar relatórios de não conformidade' },
    { code: 'rnc.approve', name: 'Aprovar por Concessão', module: 'rnc', description: 'Permite aprovar INC por concessão' },

    // Permissões de Usuários
    { code: 'users.create', name: 'Criar Usuário', module: 'users', description: 'Permite criar novos usuários' },
    { code: 'users.read', name: 'Visualizar Usuários', module: 'users', description: 'Permite visualizar usuários' },
    { code: 'users.update', name: 'Editar Usuário', module: 'users', description: 'Permite editar usuários' },
    { code: 'users.delete', name: 'Deletar Usuário', module: 'users', description: 'Permite deletar usuários' },
    { code: 'users.manage_permissions', name: 'Gerenciar Permissões', module: 'users', description: 'Permite gerenciar permissões de usuários' },

    // Permissões de Notificações
    { code: 'notifications.read', name: 'Visualizar Notificações', module: 'notifications', description: 'Permite visualizar próprias notificações' },
    { code: 'notifications.manage_types', name: 'Gerenciar Tipos', module: 'notifications', description: 'Admin: criar/editar tipos de notificação' },
    { code: 'notifications.manage_settings', name: 'Gerenciar Configurações de Usuários', module: 'notifications', description: 'Admin: configurar notificações de outros usuários' },

    // Permissão Admin
    { code: 'admin.all', name: 'Administrador Total', module: 'admin', description: 'Acesso total ao sistema' },
  ];

  console.log('📋 Criando permissões...');
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { code: permission.code },
      update: {},
      create: permission,
    });
  }

  // Criar usuário admin
  console.log('👤 Criando usuário administrador...');
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@qmanager.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@qmanager.com',
      senha: hashedPassword,
    },
  });

  // Atribuir todas as permissões ao admin
  console.log('🔐 Atribuindo permissões ao administrador...');
  const allPermissions = await prisma.permission.findMany();

  for (const permission of allPermissions) {
    await prisma.userPermission.upsert({
      where: {
        userId_permissionId: {
          userId: adminUser.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        userId: adminUser.id,
        permissionId: permission.id,
      },
    });
  }

  // Criar usuário comum para testes
  console.log('👤 Criando usuário de teste...');
  const testUser = await prisma.user.upsert({
    where: { email: 'user@qmanager.com' },
    update: {},
    create: {
      nome: 'Usuário Teste',
      email: 'user@qmanager.com',
      senha: hashedPassword,
    },
  });

  // Dar permissões de leitura, criação de INC, RNC e notificações ao usuário teste
  const testUserPermissions = [
    'inc.read',
    'inc.create',
    'rnc.read',
    'rnc.create',
    'notifications.read',
  ];

  for (const permCode of testUserPermissions) {
    const permission = allPermissions.find(p => p.code === permCode);
    if (permission) {
      await prisma.userPermission.upsert({
        where: {
          userId_permissionId: {
            userId: testUser.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          userId: testUser.id,
          permissionId: permission.id,
        },
      });
    }
  }

  console.log('✅ Seed concluído com sucesso!');
  console.log('\n📧 Credenciais:');
  console.log('Admin: admin@qmanager.com / admin123');
  console.log('User:  user@qmanager.com / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
