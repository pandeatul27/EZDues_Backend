const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const config = require("../config.json");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient().$extends({
    query: {
        department: {
            $allOperations({ operation, args, query }) {
                if (
                    ["create", "update"].includes(operation) &&
                    args.data["pswdDept"]
                ) {
                    args.data["pswdDept"] = bcrypt.hashSync(
                        args.data["pswdDept"],
                        config.saltRounds
                    );
                }
                return query(args);
            },
        },
    },
});

async function getFines(req, res) {
    const deptId = req.auth.deptId;
    try {
        const fines = await prisma.Fines.findMany({
            where: {
                departmentDeptId: deptId,
            },
        });
        console.log(fines);
        const requests = await prisma.Requests.findMany({
            where: {
                departmentDeptId: deptId,
            },
        });

        // for this we need  amount of that fine in the Fines table right?
        //next we also need to relate the db of requests with db of fines ?
        // i am assuming yes to both and doing it

        const totalFine = fines.reduce((acc, fine) => acc + fine.amount, 0);
        console.log(totalFine);
        const settledFine = fines
            .filter((fine) => fine.status === "Approved")
            .reduce((acc, fine) => acc + fine.amount, 0);
        const unsettledFine = fines
            .filter((fine) => fine.status !== "Approved")
            .reduce((acc, fine) => acc + fine.amount, 0);
        const settledNumberOfFines = fines.filter(
            (fine) => fine.status === "Approved"
        ).length; // this is a length as count hai paymentoffine given matlab pending needs to be approved
        const pendingNoDues = requests.filter(
            (request) => !request.isApproved
        ).length;
        const pendingFines = fines.filter(
            (fine) => fine.status === "Pending"
        ).length;
        const numberOfFines = fines.length;
        console.log(pendingNoDues, pendingFines);
        res.json({
            totalFine,
            settledFine,
            unsettledFine,
            numberOfFines,
            settledNumberOfFines,
            pendingNoDues,
            pendingFines,
            fines,
        });
    } catch (error) {
        res.status(500).json({ error: "cannot render fines" });
    }
}

async function getStudent(req, res) {
    try {
        const students = await prisma.Student.findMany();
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}
async function getSpecificStudent(req, res) {
    const id = req.params.rollNo;
    try {
        const student = await prisma.Student.findUnique({
            where: {
                rollNumber: id,
            },
        });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        res.json(student);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async function addFine(req, res) {
    const newFine = req.body;
    try {
        const createdFine = await prisma.Fines.create({
            data: newFine,
        });
        res.status(201).json(createdFine);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}
async function fineApproval(req, res) {
    const { studentRoll, fineId } = req.params;
    const deptId = req.auth.deptId;
    try {
        const payments = await prisma.Payments.findMany({
            where: {
                finesFineId: fineId,
            },
        });

        const status = payments.length > 0 ? "Approved" : "Rejected";

        const updatedFine = await prisma.Fines.update({
            where: {
                fineId: fineId,
            },
            data: {
                status: status,
            },
        });
        res.json(updatedFine);
    } catch (error) {
        res.status(500).json({
            error: "Internal Server Error while approving fines",
        });
    }
}
async function getRequests(req, res) {
    const deptId = req.auth.deptId;
    try {
        const requests = await prisma.Requests.findMany({
            where: {
                departmentDeptId: deptId, // corresponding to that department we opened
            },
        });
        res.json(requests);
    } catch (error) {
        console.error("Error fetching requests:", error);
        res.status(500).json({
            error: "Internal Server Error while fetching requests",
        });
    }
}
async function requestApproval(req, res) {
    const { studentRoll, reqId } = req.params;
    const deptId = req.auth.deptId;

    try {
        const requests = await prisma.Requests.findMany({
            where: {
                requestId: reqId,
            },
        });

        const fines = await prisma.Fines.findMany({
            where: {
                studentRollNumber: studentRoll,
                departmentDeptId: deptId,
            },
        });

        const allFinesApproved = fines.every(
            (fine) => fine.status === "Approved"
        );
        if (allFinesApproved) {
            //updating
            const updatedRequest = await prisma.Requests.updateMany({
                where: {
                    studentRollNumber: studentRoll,
                },
                data: {
                    isApproved: true,
                    dateOfApproval: new Date(),
                },
            });
            res.json({ message: "Request table updated successfully" });
        }
    } catch (error) {
        res.status(500).json({
            error: "Internal Server Error while approving fines",
        });
    }
}
async function approvalBulk(req, res) {
    const deptId = req.auth.deptId;
    try {
        const requests = await prisma.Requests.findMany({
            where: {
                departmentDeptId: deptId,
            },
        });
        requests.forEach(async (request) => {
            const student = await prisma.Student.findUnique({
                where: {
                    rollNumber: request.studentRollNumber,
                },
            });
            const fines = await prisma.Fines.findMany({
                where: {
                    departmentDeptId: deptId,
                    studentRollNumber: student.rollNumber,
                },
            });
            let allFinesPaid;
            if (fines.length == 0) {
                allFinesPaid = true;
            } else {
                allFinesPaid = fines.every(
                    (fine) => fine.status === "Approved"
                );
            }
            console.log(fines.length, allFinesPaid);
            if (allFinesPaid) {
                //all requests
                //will be approved via todays
                const updatedRequest = await prisma.Requests.updateMany({
                    where: {
                        requestId: request.requestId,
                    },
                    data: {
                        isApproved: true,
                        dateOfApproval: new Date(),
                    },
                });
            }
        });
        res.json({ message: "Bulk approval successful" });
    } catch (error) {
        console.error("Error approving requests in bulk:", error);
        res.status(500).json({
            error: "Internal Server Error while approving requests in bulk",
        });
    }
}
async function setAutoApprove(req, res) {
    const deptId = req.auth.deptId;
    try {
        let department = await prisma.Department.findMany({
            where: {
                deptId: deptId,
            },
        });
        department = await prisma.Department.update({
            where: {
                deptId: deptId,
            },
            data: {
                autoApprove: !department.autoApprove,
            },
        });
        if (department.autoApprove) {
            await approvalBulk(req, res);
        } else {
            res.json({ message: "Auto-approval turned off" });
        }
    } catch (error) {
        console.log("Internal server error : ", error);
        res.status(500).json({
            error: "Internal Server Error while setting auto-approve",
        });
    }
}

async function login(req, res) {
    const { deptName, username, password } = req.body;
    if (username === undefined || password === undefined) {
        res.status(422).json("Enter username and password");
        return;
    }
    console.log(username, password);
    const department = await prisma.Department.findUnique({
        where: {
            username,
        },
    });

    if (!department) {
        res.status(422).json("No such username found");
        return;
    }
    await bcrypt.compare(password, department.pswdDept, (err, result) => {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        } else if (result) {
            const token = jwt.sign(
                { deptId: department.deptId, type: "department" },
                config.secret,
                {
                    expiresIn: "24h",
                }
            );
            res.cookie("idtoken", token, { httpOnly: true, sameSite: "Lax"  });
            res.sendStatus(200);
        } else {
            res.status(401).json("Incorrect password");
        }
    });
}

module.exports = {
    getFines,
    getStudent,
    getSpecificStudent,
    addFine,
    fineApproval,
    getRequests,
    requestApproval,
    approvalBulk,
    setAutoApprove,
    login,
};
/* vi: set et sw=4: */
