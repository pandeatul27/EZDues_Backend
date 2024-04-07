const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { makeFinalYearEligible } = require("../controllers/adminController");
const { autoApprove } = require("../controllers/adminController");

router.post("/create-admin", adminController.createAdmin);
router.post("/add-departments", adminController.addDepartments);
router.post("/bulk-registration", adminController.bulkRegistration);
router.post("/register-students", adminController.registerStudents);
router.post("/add-fines-bulk", adminController.addFinesBulk);
router.put("/make-final-year-eligible", makeFinalYearEligible);
router.post("/auto-approve", adminController.autoApprove);

module.exports = router;
