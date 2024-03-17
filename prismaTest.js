const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

//For Password Hashing
const prisma = new PrismaClient().$extends({
  query: {
    department: {
      $allOperations({ operation, args, query }) {
        if (['create', 'update'].includes(operation) && args.data['pswdDept']) {
          args.data['pswdDept'] = bcrypt.hashSync(args.data['pswdDept'], 10)
        }
        return query(args)
      }
    }
  }
});

async function main() {
    //Searching
    const dept = await prisma.department.findUnique({
        where:{
            deptId:'Lib',
        },
    })

    //For Checking if the Password is valid or not

    const stored_hash = dept.pswdDept
    console.log(stored_hash)
    guess="abcdef"
    bcrypt.compare(guess, stored_hash, function(err, res) {
      if (err) {
        // Handle error
        console.error('Error comparing passwords:', err);
        return;
      }
    
      if (res) {
        console.log('Password is correct');
      } else {
        console.log('Password is incorrect');
      }
    });

    //Delete
    await prisma.admin.deleteMany()

    //Create
    const fine=await prisma.fines.create({
        data:{
            studentRollNumber:"2101CS88",
            departmentDeptId:"Lib",
            reason:"Random reason",
            deadline:new Date('2024-05-25T12:00:00Z')//YYYY-MM-DD
        },
    })
    console.log(fine)
  }

  
  
  main()
  .catch(e => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect();
  });