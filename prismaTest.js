const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    //Searching
    // const users = await prisma.student.findMany({
    //     where:{
    //         name:{startsWith:"Atul"},
    //         email:{contains : "cs"}
    //     },
    // })
    
    // console.log(users)

    //creation
    // const dept = await prisma.department.create({
    //     data:{  
    //         deptId:"Lib",
    //         deptName:"Library"
    //     },
    // })

    // console.log(dept)

    // const fine=await prisma.fines.create({
    //     data:{
    //         studentRollNumber:"2101CS88",
    //         departmentDeptId:"Lib",
    //         reason:"Random reason",
    //         deadline:new Date('2024-05-25T12:00:00Z')//YYYY-MM-DD
    //     },
    // })
    // console.log(fine)
  }

  
  
  main()
  .catch(e => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect();
  });