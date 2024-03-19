const express = require("express");
require("dotenv").config();
const PORT = process.env.PORT || 5000;
const { PrismaClient } = require('@prisma/client');
const csvParser = require('csv-parser');
const fs = require('fs');
const prisma = new PrismaClient();


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//SUPER ADMIN ROUTE 
// only one route having post request

app.post('/admin/create-admin', async(req,res)=>{
    try{
        const {username , password }= req.body ;

        const requestingAdmin = await prisma.Admin.findUnique({
            where :{
                username : req.headers.username // assuming we pass the username 

            }
        });

        if(!requestingAdmin || !requestingAdmin.IsSuperAdmin)
        {
            return res.status(403).json({error : "Only super admins are allowed to create admin"});
        }

        //creating admin 

        const newAdmin = await prisma.Admin.create(
            {
                data : {
                    username ,
                    password,
                    IsSuperAdmin: false , // the admin created now will not be superadmin
                    // we will have only one superadmin
                }

            }
        );

        res.status(201).json(newAdmin);

    }catch(error)
    {
        console.error("Error creating the admin", error);
        res.status(500).json({error:"Internal server issue"});


    }
});

//ADMIN ROUTES 
//____________________


// Api to add departments 

app.post('/admin/add-departments', async (req, res) => {
    try {
        const { deptName, username, password } = req.body;

        // if the department with the given name already exists, then error 
        const existingDepartment = await prisma.Department.findFirst({
            where: {
                deptName
            }
        });

        if (existingDepartment) {
            return res.status(400).json({ error: "Department with this name already exists." });
        }

        // Create the new department
        const newDepartment = await prisma.Department.create({
            data: {
                deptName,
                username,
                password
            }
        });

        res.status(201).json(newDepartment);
    } catch (error) {
        console.error("Error adding department:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


//Api to add students via bulk registration thorugh CSV file 
app.post('/admin/bulk-registration', async (req, res) => {
    try {
        // Check if a CSV file was uploaded
        if (!req.file) {
            return res.status(400).json({ error: "No CSV file uploaded" });
        }

        //I initialised and array to store the student data 
        // and then to push it to db
        
        const students = [];

        // Read the uploaded CSV file
        fs.createReadStream(req.file.path)
            .pipe(csvParser())
            .on('data', (row) => {

                let assignedDepartments=[];

                switch(row.role)
                {
                    case 'BTech':
                        assignedDepartments.push('Hostel', 'Sports', 'TPC', 'Academic section', 'Admin section', 'Accounts section', 'Computer Center','Civil Workshop','Electrical Workshop','Mechanical Workshop');
                        break;
                    case 'MTech':
                    case 'PhD':
                        assignedDepartments.push('Hostel', 'Sports', 'TPC', 'Academic section', 'Admin section', 'Accounts section', 'Computer Center');
                        break;
                    default:
                        break;
                    
                }
                if(row.role != 'BTech'){
                switch(row.branch)
                {
                    case 'Electrical':
                        assignedDepartments.push('Electrical Workshop');
                        break ;
                    case 'Civil':
                        assignedDepartments.push('Civil Workshop');
                        break ;
                    case 'Mechanical':
                        assignedDepartments.push('Mechanical Workshop');
                        break ;

                    default :
                        break;
                }}
                // Process each row of the CSV file
                students.push({
                    rollNumber: row.rollNumber,
                    name: row.name,
                    email: row.email,
                    branch: row.branch,
                    batch: parseInt(row.batch), // converting batch to an integer cauz year 
                    //role: row.role || "BTech" Default role to BTech if not provided
                    role: (row.role)? row.role: "BTech",

                    //doubt , what to do of the array assigned departments ? do I need to create a new field 
                    // to push that here ?


                });
            })
            .on('end', async () => {
                // Create multiple student records in the database
                const createdStudents = await prisma.Student.createMany({
                    data: students
                });

                // Remove the uploaded CSV file
                fs.unlinkSync(req.file.path);

                res.status(201).json(createdStudents);
            });
    } catch (error) {
        console.error("Error in bulk registration:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// register students 
// here i thought to connect them with department ids 

app.post('/admin/register-students', async (req, res) => {
    try {
        const { students } = req.body; // Assuming the request body contains an array of student objects

        // Process each student and assign them to departments based on their role
        const registrations = await Promise.all(students.map(async (student) => {
            const { rollNumber, name, email, branch, batch, role } = student;

            let assignedDepartments=[];
            switch(role)
                {
                    case 'BTech':
                        assignedDepartments.push('Hostel', 'Sports', 'TPC', 'Academic section', 'Admin section', 'Accounts section', 'Computer Center','Civil Workshop','Electrical Workshop','Mechanical Workshop');
                        break;
                    case 'MTech':
                    case 'PhD':
                        assignedDepartments.push('Hostel', 'Sports', 'TPC', 'Academic section', 'Admin section', 'Accounts section', 'Computer Center');
                        break;
                    default:
                        break;
                    
                }
                if(role != 'BTech'){
                switch(role)
                {
                    case 'Electrical':
                        assignedDepartments.push('Electrical Workshop');
                        break ;
                    case 'Civil':
                        assignedDepartments.push('Civil Workshop');
                        break ;
                    case 'Mechanical':
                        assignedDepartments.push('Mechanical Workshop');
                        break ;

                    default :
                        break;
                }}
            // If a department is assigned, create the student record and associate them with the department
            if (departmentId) {
                const createdStudent = await prisma.Student.create({
                    data: {
                        rollNumber,
                        name,
                        email,
                        branch,
                        batch,
                        role,
                        department: {
                            connect: { deptId: departmentId } // Connect the student to the department
                        }
                    }
                });
                return createdStudent;
            } else {
                // Handle cases where the role is not recognized or a department is not assigned
                return null;
            }
        }));

        res.status(201).json(registrations.filter(Boolean)); // Filter out null values and return the successful registrations
    } catch (error) {
        console.error("Error registering students:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});



//adding bulk fines 


app.post('/admin/add-fines-bulk', async (req, res) => {
    try {
        const { fines } = req.body;

        const createdFines = await prisma.Fines.createMany({
            data: fines.map(fine =>({
                Student: {connect : {rollNumber: fine.studentRollNumber }},
                Department: {connect : {deptId: fine.departmentDeptId}},
                dateOfCreation : new Date(),
                deadline: fine.deadline,
                reason: fine.reason,
                damageProof:fine.damageProof,
                status:"Outstanding"// set the default status to outstanding as said 
            }))
        });

        res.status(201).json(createdFines);
    } catch (error) {
        console.error("Error adding fine in bulk:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});



//updating the database as per which only the final year students can ask for the generation of No dues 
//certificates

app.put('/admin/make-final-year-eligible', async(req,res)=>{
    try{
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();

        //what should be finalYearBatchYear? as session starts in july of batch-1 year uptil june of batch year 

        let finalYearBatchYear;
        if (currentMonth >= 6) {
            // After July of current year, final year students are from batch year x+1
            finalYearBatchYear = currentYear;
        } else {
            // Before July of current year, final year students are from batch year x
            finalYearBatchYear = currentYear - 1;
        }



        const finalYearStudents = await prisma.Student.findMany({
            where :{
                batch: finalYearBatchYear,
            }
        });
        const updatedStudent= await prisma.Student.updateMany({
            where:{
                rollNumber:{
                    in: finalYearStudents.map(student=> student.rollNumber)
                }
            },
            data:{
                CanRequest: true 
            }
        });
        res.status(200).json({message:"FINAL YEAR STUDENTS ARE MADE ELIGIBLE FINALLY"});


    }catch(error)
    {
        console.error("Error making final year students eligible:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


// next adding post request which auto approve rows 

app.post('/admin/auto-approve', async(req, res)=>{
    try{
        const students= await prisma.Student.findMany();
        const departments = await prisma.Department.findMany();

        // need to create requests for each combinationss of students and departmenst 

        const requests=[];
        students.forEach(student=>{
            departments.forEach(department=>{
                requests.push({
                    Student: { connect: { rollNumber: Student.rollNumber } },
                    Department: { connect: { deptId: Department.deptId } },
                    dateOfRequest: new Date(),
                    approved: false
                })
            })
        });

        await prisma.Requests.createMany({data: requests});

        res.status(200).json({message:"Request for Auto Approval has been initiated successfully!"});

    }catch(error)
    {
        console.error("Error initiating auto approval:", error);
        res.status(500).json({ error: "Internal server error" });
    }
})


//-----------------------
// STUDENT API S 
//-----------------------


app.get('/student/fines/:rollNumber', async(req,res)=>{
    try{
        const {rollNumber}= req.params;

        const fines= await prisma.Fines.findMany({
            where :{
                studentRollNumber: rollNumber
            }
        });

        res.status(200).json(fines);


    }catch(error)
    {
        console.error("Error fetching fines:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// initiating requests '

app.post('/student/initiateRequest/:rollNumber', async (req, res) => {
    try {
        const { rollNumber } = req.params;

        // doubt- ye wala click nahi kar raha kaise kare- will update tomorrow

        res.status(200).json({ message: "Request initiated successfully." });
    } catch (error) {
        console.error("Error initiating request:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


//adding payment proof (which is said to be a string as of now -)

app.post('/student/addPaymentProof/:fineId/:studentRollNumber', async (req, res) => {
    try {
        const { fineId, studentRollNumber } = req.params;
        const { paymentProof } = req.body;

        // Update the payment proof for the specified fine
        const updatedFine = await prisma.fines.update({
            where: {
                fineId
            },
            data: {
                paymentProof,
                student: {
                    connect: {
                        studentRollNumber
                    }
                }
            }
        });

        res.status(200).json({ message: "Payment proof added successfully.", updatedFine });
    } catch (error) {
        console.error("Error adding payment proof:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});



app.listen(PORT, () => {
    `[+] Server listening on PORT: ${PORT}`;
});
