const express = require("express");

const db = require("./models/db.js");

require("dotenv").config();

const port = process.env.PORT || 3000;
const app = express();

app.use(express.static("public"));

db.connect();

app.listen(port, function() {
	console.log("Listening at port " + port);
});
