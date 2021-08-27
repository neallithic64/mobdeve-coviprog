const express = require("express");
const router = express();
const cpController = require("../controllers/cpController");

// sandboxing routes


// GET routes
router.get("/", cpController.getHome);
router.get("/api", cpController.getHome);

router.get("/api/covid/", cpController.getCovHome);
router.get("/api/covid/test", cpController.getCovTest);

router.get("/api/progp/", cpController.getProHome);
router.get("/api/progp/getProgs", cpController.getProProgList);


// POST routes
// router.post("/api/covid/something", cpController.post...);

router.post("/api/progp/adduser", cpController.postProAddUser);

// error route
router.get("*", function(req, res) {
	res.send("404 not found! this is an error");
});

module.exports = router;
