const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { expressjwt: jwt } = require("express-jwt");
const config = require("../config.json");

const getToken = req => req.cookies.idtoken;

router.use(
    jwt({
        secret: config.secret,
        getToken,
        algorithms: ["HS256"],
    }).unless({ path: ["/admin/login"] })
);

router.use((req, res, next) => {
	if (req.auth === undefined || req.auth.type === "admin") next();
	else res.sendStatus(401);
});

router.post("/create-admin", adminController.createAdmin);
router.post("/add-departments", adminController.addDepartments);
router.post("/bulk-registration", adminController.bulkRegistration);
router.post("/register-students", adminController.registerStudents);
router.post("/add-fines-bulk", adminController.addFinesBulk);
router.put("/make-final-year-eligible", adminController.makeFinalYearEligible);
router.post("/auto-approve", adminController.autoApprove);
router.post("/login", adminController.login);

module.exports = router;
