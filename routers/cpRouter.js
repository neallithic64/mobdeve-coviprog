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
router.get("/api/progp/getprogs", cpController.getProProgList);
router.get("/api/progp/getprogs*", cpController.getProFilterProgs);


// POST routes
router.post("/api/covid/login", cpController.postCovLogin);
router.post("/api/covid/addpubuser", cpController.postCovAddPubUser);

router.post("/api/progp/login", cpController.postProLogin);
router.post("/api/progp/adduser", cpController.postProAddUser);
router.post("/api/progp/addprog", cpController.postProCreateProg);
router.post("/api/progp/editprog", cpController.postProEditProg);

// error route
router.get("*", function(req, res) {
	res.send("404 not found! this is an error");
});

module.exports = router;
