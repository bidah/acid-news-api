const bodyParser = require("body-parser");
const app = require("express")();
const fetch = require("node-fetch");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(process.env.NODEMON ? 8080 : 80, () => console.log("Server ready"));

var mongo = require("./mongo");

