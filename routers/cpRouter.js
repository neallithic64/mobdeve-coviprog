const express = require("express");
const router = express();
const cpController = require("../controllers/cpController");

// sandboxing routes


/* router.get("/api", cpController.getAPI);
	API path formatting:
	/api/covid/...
	/api/progp/...
*/

// GET routes
router.get("/", cpController.getHome);
router.get("/api", cpController.getHome);

router.get("/api/covid/", cpController.getCovHome);
router.get("/api/covid/test", cpController.getCovTest);

router.get("/api/progp/", cpController.getProHome);


// POST routes


// error route
router.get("*", function(req, res) {
	res.send("404 not found! this is an error");
});

module.exports = router;
