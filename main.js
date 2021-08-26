const express = require("express");
const port = process.env.PORT || 3000;
const app = express();

require("dotenv").config();

const router = require("./routers/cpRouter");
const db = require("./models/db.js");
db.connect();

app.use(express.static(__dirname + "/"));

app.listen(port, function() {
	console.log("Listening at port " + port);
});
