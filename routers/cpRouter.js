const express = require("express");
const router = express();
const cpController = require("./controllers/cpController");

// sandboxing routes


// GET routes
router.get("/", cpController.getHome);
router.get("/api", cpController.getAPI);


// POST routes


// error route
router.get("*", function(req, res) {
	res.send("404 not found! this is an error");
});

module.exports = router;
