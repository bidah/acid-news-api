const bodyParser = require("body-parser");
const app = require("express")();
const fetch = require("node-fetch");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(3001, () => console.log("Server ready"));

// var mongo = require("./mongo");

app.get("*/health", (req, res) => res.sendStatus(200));

