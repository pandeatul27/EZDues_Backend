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

async function getRequests(req, res) {
    try {
        const { rollNumber } = req.params;

        const requests = await prisma.Requests.findMany({
            where: {
                studentRollNumber: rollNumber,
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
        const { rollNumber } = req.params;

        // ****!!! doubt- ye wala click nahi kar raha kaise kare- will update tomorrow

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
    getRequests,
    initiateRequest,
    addPaymentProof,
};
