const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/departmentController");
const { expressjwt: jwt } = require("express-jwt");
const config = require("../config.json");
const getToken = req => req.cookies.idtoken;

router.use(
    jwt({
        secret: config.secret,
        getToken,
        algorithms: ["HS256"],
    }).unless({ path: ["/department/login"] })
);

router.use((req, res, next) => {
    if (req.auth === undefined || req.auth.type === "department") next();
    else res.sendStatus(401);
});

router.get("/get-fines", departmentController.getFines);
router.get("/get-students", departmentController.getStudent);
router.get("/get-students/:rollNo", departmentController.getSpecificStudent);
router.post("/add-fine", departmentController.addFine);
router.put(
    "/fine-approval/:studentRoll/:fineId",
    departmentController.fineApproval
);
router.get("/get-requests", departmentController.getRequests);
router.put(
    "/request-approval/:studentRoll/:reqId",
    departmentController.requestApproval
);
router.put("/approval-bulk", departmentController.approvalBulk);
router.post(
    "/request-approval/set-auto-approve",
    departmentController.setAutoApprove
);
router.post("/login", departmentController.login);

module.exports = router;
