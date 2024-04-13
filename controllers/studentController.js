const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function getFines(req, res) {
    try {
        const { email } = req.auth.preferred_username;

        const fines = await prisma.Fines.findMany({
            where: {
                studentEmail: email,
            },
        });

        res.status(200).json(fines);
    } catch (error) {
        console.error("Error fetching fines:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

async function getRequests(req, res) {
    try {
        const { email } = req.auth.preferred_username;

        const requests = await prisma.Requests.findMany({
            where: {
                studentEmail: email,
            },
        });

        res.status(200).json(requests);
    } catch (error) {
        console.error("Error fetching requests:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

async function initiateRequest(req, res) {
    try {
        const { email } = req.auth.preferred_username;
        const { deptId } = req.body.deptId;

        const fines = await prisma.Fines.findMany({
            where: {
                studentEmail: email,
            },
        });

        const requests = [];

        requests.push({
            studentRollNumber: rollNumber,
            departmentDeptId: deptId,
            dateOfRequest: new Date(),
            isApproved: false,
            dateOfApproval: null,
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
        const { email } = req.auth.preferred_username;
        const { fineId } = req.params;
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
                        email,
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
    getRequests,
    initiateRequest,
    addPaymentProof,
};
/* vi: set et sw=4: */
