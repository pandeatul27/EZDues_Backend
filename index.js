const express = require("express");
require("dotenv").config();
const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    console.log(`[+] Received a GET request at /, with queries:`);
    console.table(req.query);

    return res.send("<pre>Hello World!\nThis is how you create a route.</pre>");
});

app.listen(PORT, () => {
    `[+] Server listening on PORT: ${PORT}`;
});
