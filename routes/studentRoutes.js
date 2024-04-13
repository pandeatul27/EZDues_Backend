const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const jwt = require("jsonwebtoken");

router.use(async (req, res, next) => {
    const token = req.get("X-EZDues-IDToken");
    if (token == undefined) {
        res.sendStatus(401);
    }

    const keys = req.app.locals.keys;
    const pems = req.app.locals.pems;
    const kid = jwt.decode(token, { complete: true }).header.kid;
    let i;
    for (i = 0; i < keys.length; i++) {
        if (keys[i].kid == kid) break;
    }
    try {
        req.auth = jwt.verify(token, pems[i], {
            algorithms: "RS256",
            /* TODO: add these to config.json - pranjal */
            audience: "b46e9d78-e60d-4088-b89d-3bacc2699876",
            issuer: "https://login.microsoftonline.com/a57f7d92-038e-4d4c-8265-7cd2beb33b34/v2.0",
        });
        next();
    } catch (e) {
        console.error(e);
        res.sendStatus(401);
    }
});

router.get("/fines", studentController.getFines);
router.get("/requests", studentController.getRequests);
router.post("/initiate-request", studentController.initiateRequest);
router.post("/:fineId/addPaymentProof", studentController.addPaymentProof);

module.exports = router;
/* vi: set et sw=4: */
