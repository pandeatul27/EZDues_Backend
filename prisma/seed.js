const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient().$extends({
  query: {
    admin: {
      $allOperations({ operation, args, query }) {
        if (['create', 'update'].includes(operation) && args.data['pswdAdmin']) {
          args.data['pswdAdmin'] = bcrypt.hashSync(args.data['pswdAdmin'], 10)
        }
        return query(args)
      }
    }
  }
});

async function main() {
    //Creation of super Admin
    const admin = await prisma.admin.create({
        data:{  
            username:"SuperAdmin",
            pswdAdmin:"password101",
            isSuperAdmin:true
        },
    })
}

  main()
  .catch(e => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect();
  });