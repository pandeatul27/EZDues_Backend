const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function getFines(req, res) {
    try {
        const { rollNumber } = req.params;

        const fines = await prisma.Fines.findMany({
            where: {
                studentRollNumber: rollNumber,
            },
        });

        res.status(200).json(fines);
    } catch (error) {
        console.error("Error fetching fines:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

async function initiateRequest(req, res) {
    try {
        const { rollNumber } = req.params;

        const fines = await prisma.Fines.findMany({
            where: {
                studentRollNumber: rollNumber,
            },
        });

        const requests = [];
        fines.forEach((fine) => {
            requests.push({
                    Student: { connect: { rollNumber } },
                    studentRollNumber: rollNumber,
                    Department: { connect: { deptId: fine.departmentDeptId } },
                    departmentDeptId: fine.departmentDeptId,
                    dateOfRequest: new Date(),
                    isApproved: false,
                    dateOfApproval: null,
            });
        });
        await prisma.Requests.createMany({ data: requests });
        res.status(200).json({ message: "Request initiated successfully." });
    } catch (error) {
        console.error("Error initiating request:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

async function addPaymentProof(req, res) {
    try {
        const { fineId, studentRollNumber } = req.params;
        const { paymentProof } = req.body;

        // Update the payment proof for the specified fine
        const updatedFine = await prisma.Fines.update({
            where: {
                fineId,
            },
            data: {
                paymentProof,
                student: {
                    connect: {
                        studentRollNumber,
                    },
                },
            },
        });

        res.status(200).json({
            message: "Payment proof added successfully.",
            updatedFine,
        });
    } catch (error) {
        console.error("Error adding payment proof:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = {
    getFines,
    initiateRequest,
    addPaymentProof,
};
/* vim: set et sw=4: */
