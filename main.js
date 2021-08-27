const express = require("express");
const bodyParser = require('body-parser');
const app = express();

const port = process.env.PORT || 3000;
require("dotenv").config();

const db = require("./models/db.js");
db.connect();

const router = require("./routers/cpRouter");
app.use('/', router);

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/"));

app.listen(port, function() {
	console.log("Listening at port " + port);
});
