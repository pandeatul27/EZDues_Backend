const express = require("express");
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const { expressjwt: jwt } = require("express-jwt");
const config = require("./config.json");
const adminRoutes = require("./routes/adminRoutes");
const studentRoutes = require("./routes/studentRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
var cors = require("cors");
const jwkToPem = require("jwk-to-pem");
require("dotenv").config();
const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.locals.pems = [];
fetch("https://login.microsoftonline.com/a57f7d92-038e-4d4c-8265-7cd2beb33b34/discovery/v2.0/keys")
    .then(response => response.json())
    .then(jwks => jwks.keys)
    .then(keys => {
        app.locals.keys = keys;
        keys.forEach((jwk) => app.locals.pems.push(jwkToPem(jwk)));
    });

app.use(fileUpload({ useTempFiles: true, tempFileDir: "/tmp/" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const getToken = (req) => req.cookies.idtoken;

app.use(
    jwt({
        secret: config.secret,
        getToken,
        algorithms: ["HS256"],
    }).unless({ path: ["/admin/login", "/department/login"] })
);

=======
>>>>>>> 58c83be (student: verify JWTs received from frontend)
app.use("/admin", adminRoutes);
app.use("/student", studentRoutes);
app.use("/department", departmentRoutes);

app.listen(PORT, () => {
    console.log(`[+] Server listening on PORT: ${PORT}`);
});
/* vi: set et sw=4: */
