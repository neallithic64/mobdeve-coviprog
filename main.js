const express = require("express");
const db = require("./models/db.js");
const router = require("./routers/coproRouter");

const port = process.env.PORT || 3000;
const app = express();

require("dotenv").config();

app.use(express.static(__dirname + "/"));

db.connect();

app.listen(port, function() {
	console.log("Listening at port " + port);
});
