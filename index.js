const express = require("express");
const fileUpload = require("express-fileupload");
const { expressjwt: jwt } = require("express-jwt");
const cookieParser = require("cookie-parser");
const config = require("./config.json");
const adminRoutes = require("./routes/adminRoutes");
const studentRoutes = require("./routes/studentRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
var cors = require("cors");
require("dotenv").config();
const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

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

app.use("/admin", adminRoutes);
app.use("/student", studentRoutes);
app.use("/department", departmentRoutes);

app.listen(PORT, () => {
    console.log(`[+] Server listening on PORT: ${PORT}`);
});
/* vi: set et sw=4: */
