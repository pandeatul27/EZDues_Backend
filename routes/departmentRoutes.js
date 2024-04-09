const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/departmentController");

router.get("/:deptId/get-fines", departmentController.getFines);
router.get("/:deptId/get-students", departmentController.getStudent);
router.get(
    "/:deptId/get-students/:rollNo",
    departmentController.getSpecificStudent
);
router.post("/:deptId/add-fine", departmentController.addFine);
router.put(
    "/:deptId/fine-approval/:studentRoll/:fineId",
    departmentController.fineApproval
);
router.get("/:deptId/get-requests", departmentController.getRequests);
router.put(
    "/:deptId/request-approval/:studentRoll/:reqId",
    departmentController.requestApproval
);
router.put("/:deptId/approval-bulk", departmentController.approvalBulk);
router.post(
    "/:deptId/request-approval/set-auto-approve",
    departmentController.setAutoApprove
);

module.exports = router;
