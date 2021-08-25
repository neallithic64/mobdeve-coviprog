const express = require("express");
const router = express();
const coproController = require("./controllers/coproController");

// sandboxing routes


// GET routes
router.get("/", coproController.getHome);


// POST routes


// error route
router.get("*", function(req, res) {
	res.send("404 not found! this is an error");
});

module.exports = router;
